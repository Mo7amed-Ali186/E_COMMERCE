import { asyncHandler } from "../../../utils/errorHandler.js";
import { sendEmail } from "../../../utils/Email.js";
import cartModel from "../../../../DB/models/Cart.model.js";
import productModel from "../../../../DB/models/Product.model.js";
import orderModel from "../../../../DB/models/Order.model.js";
import couponModel from "../../../../DB/models/Coupon.model.js";
import createInvoice from "../../../utils/pdfInvoice.js";
import payment from "../../../utils/payment.js";
import Stripe from "stripe";

export const createOrder = asyncHandler(async (req, res, next) => {
	let { products, couponName } = req.body;
	const { _id } = req.user;
	let amount = 0;
	let coupon = { amount: 0 };
	if (couponName) {
		coupon = await couponModel.findOne({
			name: couponName,
			usedBy: { $nin: _id },
		});
		if (!coupon) {
			return next(new Error("invalid coupon", { cause: 404 }));
		}
		if (coupon.expireIn && coupon.expireIn.getTime() < new Date().getTime()) {
			return next(new Error("expire coupon", { cause: 404 }));
		}
		amount = coupon.amount;
		req.body.couponId = coupon._id;
	}

	if (!products?.length) {
		const cart = await cartModel.findOne({ userId: _id });
		if (!cart?.products?.length) {
			return next(new Error("invalid cart", { cause: 404 }));
		}
		products = cart.products.toObject();
	}

	const allProducts = [];
	let subPrice = 0;
	for (const product of products) {
		const productExists = await productModel.findOne({
			_id: product.productId,
			isDeleted: false,
			stock: { $gte: product.quantity },
		});
		if (!productExists) {
			return next(new Error("invalid product", { cause: 400 }));
		}
		product.name = productExists.name;
		product.unitPrice = productExists.finalPrice;
		product.totalPrice = productExists.finalPrice * product.quantity;
		allProducts.push(product);
		subPrice += product.totalPrice;
	}
	for (const product of products) {
		await cartModel.updateOne(
			{ userId: _id },
			{
				$pull: {
					products: {
						productId: { $in: product.productId },
					},
				},
			},
		);
		await productModel.updateOne(
			{ _id: product.productId },
			{ $inc: { stock: -parseInt(product.quantity) } },
		);
	}
	req.body.userId = req.user._id;
	req.body.products = allProducts;
	req.body.subPrice = subPrice;
	req.body.finalPrice = subPrice - (subPrice * coupon?.amount || 0) / 100;
	req.body.status =
		req.body.paymentTypes == "cash" ? "placed" : "waitForPayment";
	const order = await orderModel.create(req.body);
	if (couponName) {
		await couponModel.updateOne(
			{ _id: coupon._id },
			{ $push: { usedBy: _id } },
		);
	}
	//create invoice
	const invoice = {
		shipping: {
			name: req.user.userName,
			address: order.address,
			city: "Cairo",
			state: "Africa",
			country: "Egypt",
			postal_code: 94111,
		},
		items: order.products,
		subtotal: req.body.finalPrice,
		paid: 0,
		invoice_nr: order._id.toString(),
		createdAt: order.createdAt,
	};

	createInvoice(invoice, "Order.pdf");
	await sendEmail({
		to: req.user.email,
		subject: "order",
		attachments: [
			{
				path: "Order.pdf",
				application: "application/pdf",
			},
		],
	});
	if (order.paymentTypes == "card") {
		const stripe = new Stripe(process.env.STRIPE_KEY);
		let couponStripe;
		if (couponName) {
			couponStripe = await stripe.coupons.create({
				percent_off: amount,
				duration: "once",
			});
		}

		const session = await payment({
			// stripe,
			metadata: {
				orderId: order._id.toString(),
			},
			discounts: amount ? [{ coupon: couponStripe.id }] : [],
			success_url: `${process.env.SUCCESS_URL}/${order._id}`,
			cancel_url: `${process.env.CANCEL_URL}/${order._id}`,
			customer_email: req.user.email,
			line_items: order.products.map((element) => {
				return {
					price_data: {
						currency: "USD",
						product_data: {
							name: element.name,
						},
						unit_amount: element.unitPrice * 100,
					},
					quantity: element.quantity,
				};
			}),
		});
		return res.json({ message: "Done", order, session });
	}

	return res.json({ message: "Done", order });
});

export const cancelOrder = asyncHandler(async (req, res, next) => {
	const { orderId } = req.params;

	// Check if user is authenticated
	if (!req.user || !req.user._id) {
		return next(new Error("User not authenticated", { cause: 401 }));
	}

	// Step 1: Find the order by its ID
	const order = await orderModel.findById(orderId);

	// Step 2: Check if the order exists and is cancellable
	if (!order) {
		return next(new Error("Order not found", { cause: 404 }));
	}

	if (order.status !== "placed" && order.status !== "waitForPayment") {
		// Assuming orders can only be cancelled if they are pending
		return next(new Error("Order cannot be cancelled", { cause: 400 }));
	}

	// Step 3: Revert stock changes for products
	for (const product of order.products) {
		await productModel.updateOne(
			{ _id: product.productId },
			{ $inc: { stock: parseInt(product.quantity) } },
		);
	}

	// Step 4: Revert any coupon usage
	if (order.couponId) {
		await couponModel.updateOne(
			{ _id: order.couponId },
			{ $pull: { usedBy: req.user._id } },
		);
	}

	// Step 5: Update order status to "cancel" and record who cancelled it
	const updateOrder = await orderModel.updateOne(
		{ _id: orderId },
		{ status: "cancel", updatedBy: req.user._id },
	);

	return res.status(200).json({ message: "Done", updateOrder });
});

export const deliveredOrder = asyncHandler(async (req, res, next) => {
	const { orderId } = req.params; // Assuming the orderId is passed in the request parameters

	// Step 1: Find the order by its ID
	const order = await orderModel.findById({ _id: orderId });

	// Step 2: Check if the order exists and is cancellable
	if (!order) {
		return next(new Error("Order not found", { cause: 404 }));
	}

	if (order.status !== "onway") {
		// Assuming orders can only be cancelled if they are pending
		return next(new Error("Order  delivered", { cause: 400 }));
	}
	// for (const product of order.products) {
	// 	await productModel.updateOne(
	// 		{ _id: product.productId },
	// 		{ $inc: { stock: parseInt(product.quantity) } },
	// 	);
	// }

	// if (order.couponId) {
	// 	await couponModel.updateOne(
	// 		{ _id: order.coupon._id },
	// 		{ $pull: { usedBy: req.user._id } },
	// 	);
	// }
	const updateOrder = await orderModel.updateOne(
		{ _id: orderId },
		{ status: "delivered", updatedBy: req.user._id },
	);

	return res.status(200).json({ message: "Done", updateOrder });
});

export const rejectOrder = asyncHandler(async (req, res, next) => {
	const { orderId } = req.params;
	const { _id } = req.user;

	// Step 1: Find the order by its ID
	const order = await orderModel.findOne({ _id: orderId, userId: _id });

	// Step 2: Check if the order exists and if it's in a state where rejection is allowed
	if (!order) {
		return next(new Error("Order not found", { cause: 404 }));
	}

	// Check if the order is in a state where rejection is allowed
	const allowedStatuses = ["onway", "cancel", "delivered"]; // Add more statuses if needed
	if (!allowedStatuses.includes(order.status)) {
		return next(new Error("Order cannot be rejected", { cause: 400 }));
	}

	// Step 3: Revert any changes made to the stock count of the products
	for (const product of order.products) {
		await productModel.updateOne(
			{ _id: product.productId },
			{ $inc: { stock: parseInt(product.quantity) } },
		);
	}

	// Step 4: Update the order status to 'rejected'
	const updatedOrder = await orderModel.updateOne(
		{ _id: orderId },
		{ status: "rejected", updatedBy: _id },
	);

	return res
		.status(200)
		.json({ message: "Order successfully rejected", updatedOrder });
});

export const webhook = asyncHandler(async (req, res, next) => {
	const stripe = new Stripe(process.env.STRIPE_KEY);
	const sig = req.headers["stripe-signature"];

	let event;

	try {
		event = stripe.webhooks.constructEvent(
			req.body,
			sig,
			process.env.END_POINT_SECRET,
		);
	} catch (err) {
		res.status(400).send(`Webhook Error: ${err.message}`);
		return;
	}

	// Handle the event
	if (event.type == "checkout.session.completed") {
		await orderModel.updateOne(
			{ _id: event.data.object.orderId },
			{ status: "placed" },
		);

		return res.json({ message: "Done" });
	} else {
		return next(new Error("failed to checkout please try again"));
	}
});
