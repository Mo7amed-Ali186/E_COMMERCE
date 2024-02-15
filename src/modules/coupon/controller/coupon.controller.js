import cloudinary from "../../../utils/cloudinary.js";

import { asyncHandler } from "../../../utils/errorHandler.js";
import couponModel from "../../../../DB/models/Coupon.model.js";
//createCoupon
export const createCoupon = asyncHandler(async (req, res, next) => {
	const { name } = req.body;

	// Check if name exists
	if (await couponModel.findOne({ name })) {
		return next(new Error("Name already exists", { cause: 409 }));
	}
	if (req.file) {
		const { secure_url, public_id } = await cloudinary.uploader.upload(
			req.file.path,
			{ folder: `${process.env.APP_NAME}/Coupons` },
		);

		if (!secure_url) {
			return next(new Error("Image not found", { cause: 400 }));
		}
		req.body.image = { public_id, secure_url };
	}
	req.body.createdBy = req.user._id
	// req.body.usedBy = req.user._id
    
	const coupon = await couponModel.create(req.body);
	return res.status(201).json({ message: "Done", coupon });
});
//get all category
export const allCoupon = asyncHandler(async (req, res) => {
	const coupon = await couponModel.find();
	return res.status(200).json({ message: "Done", coupon });
});
//getCategories by id
export const getCoupon = asyncHandler(async (req, res) => {
	const { couponId } = req.params;

	const coupon = await couponModel.findById({ _id: couponId });

	if (!coupon) {
		return next(new Error("coupon not found", { cause: 404 }));
	}

	return res.status(200).json({ message: "Done", coupon });
});
//update Coupon
export const updateCoupon = asyncHandler(async (req, res) => {
	const { couponId } = req.params;
	const { name } = req.body;
	// Check if category exists
	const coupon = await couponModel.findById({ _id: brandId });

	if (!coupon) {
		return next(new Error("coupon not found", { cause: 404 }));
	}

	// Check if new name already exists
	if (name !== coupon.name && (await couponModel.findOne({ name }))) {
		return next(new Error("Name already exists", { cause: 400 }));
	}

	// Upload the new image to Cloudinary
	const { secure_url, public_id } = await cloudinary.uploader.upload(
		req.file.path,
		{ folder: `${process.env.APP_NAME}/Coupons` },
	);

	if (!secure_url) {
		return next(new Error("Image not found", { cause: 400 }));
	}
	if (coupon.image?.public_id) {
		// Delete the previous image from Cloudinary
		await cloudinary.uploader.destroy(coupon.image.public_id);
	}
	coupon.name = name;
	coupon.image = { public_id, secure_url };
	coupon.updatedBy = req.user._id

	// Save the updated category
	const newCoupon = await coupon.save();

	return res.status(200).json({ message: "Done", coupon: newCoupon });
});
