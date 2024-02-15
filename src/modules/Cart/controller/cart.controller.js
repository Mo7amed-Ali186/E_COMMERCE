import cartModel from "../../../../DB/models/Cart.model.js";
import productModel from "../../../../DB/models/Product.model.js";
import { asyncHandler } from "../../../utils/errorHandler.js";

export const addToCart = asyncHandler(async (req, res, next) => {
	const { _id } = req.user;
	const { productId, quantity } = req.body;
	const cart = await cartModel.findOne({ userId: _id });
	const product = await productModel.findOne({
		_id: productId,
		isDeleted: false,
		stock: { $gte: quantity },
	});
	if (!product) {
		return next(new Error("invalid ProductId", { cause: 404 }));
	}

	if (!cart) {
		const data = {
			userId: _id,
			products: [
				{
					productId: product._id,
					quantity,
				},
			],
		};

		const newCart = await cartModel.create(data);
		return res.status(201).json({ message: "Done", cart: newCart });
	}
	let exist = false;
	for (let product of cart.products) {
		//product exist
		if (product.productId.toString() == productId) {
			product.quantity = quantity;
			exist = true;
			break;
		}
	}
	if (!exist) {
		const add = await cartModel.findOneAndUpdate(
            { _id: cart._id },
            {
                $push: {
                    products: {
						 productId: product._id,
						  quantity
						 },
                },
            },
            { new: true },
        );
		return res.status(200).json({ message: "Done", cart: add });
	}
    const add = await cartModel.findByIdAndUpdate(
        { _id: cart._id },
        {
           products:cart.products,

        },
        { new: true },
    );
    return res.status(200).json({ message: "Done", cart: add });

})























// export const addToCart = asyncHandler(async (req, res, next) => {
//     const { _id } = req.user;
//     const { productId, quantity } = req.body;

//     // Find the user's cart
//     let cart = await cartModel.findOne({ userId: _id });

//     // Find the product to add to the cart
//     const product = await productModel.findOne({
//         _id: productId,
//         isDeleted: false,
//         stock: { $gte: quantity },
//     });

//     // Check if the product exists and has enough stock
//     if (!product) {
//         return next(new Error("Invalid product ID or insufficient stock", { status: 404 }));
//     }

//     // If the user doesn't have a cart, create a new one
//     if (!cart) {
//         const data = {
//             userId: _id,
//             products: [{ productId: product._id, quantity }],
//         };

//         cart = await cartModel.create(data);
//         return res.status(201).json({ message: "Cart created and product added", cart });
//     }

//     // Check if the product already exists in the cart
//     const existingProductIndex = cart.products.findIndex(p => p.productId.toString() === productId);

//     if (existingProductIndex !== -1) {
//         // If the product already exists, update its quantity
//         cart.products[existingProductIndex].quantity = quantity;
//     } else {
//         // If the product doesn't exist, add it to the cart
//         cart.products.push({ productId: product._id, quantity });
//     }

//     // Save the updated cart
//     const updatedCart = await cart.save();

//     return res.status(200).json({ message: "Product added to cart", cart: updatedCart });
// });
