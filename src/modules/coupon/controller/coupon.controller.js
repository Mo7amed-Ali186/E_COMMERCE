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
    
	const coupon = await couponModel.create(req.body);
	return res.status(201).json({ message: "Done", coupon });
});
//get all category
export const allCoupon = asyncHandler(async (req, res,next) => {
	const coupon = await couponModel.find();
	return res.status(200).json({ message: "Done", coupon });
});
//getCategories by id
export const getCoupon = asyncHandler(async (req, res,next) => {
	const { couponId } = req.params;

	const coupon = await couponModel.findById({ _id: couponId });

	if (!coupon) {
		return next(new Error("coupon not found", { cause: 404 }));
	}

	return res.status(200).json({ message: "Done", coupon });
});
//update Coupon
export const updateCoupon = asyncHandler(async (req, res,next) => {
	const { couponId } = req.params;
    const coupon = await couponModel.findById({ _id: couponId });
    if (!coupon) {
      return next(new Error("Coupon No Found",{cause:404}))
    }

    if (req.body.name) {
      if (await couponModel.findOne({ name: req.body.name })) {
        return next(new Error("Name Already Exist",{cause:409}))
      }
    }

    if (req.file) {
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        req.file.path,
	{ folder: `${process.env.APP_NAME}/Coupons` },
);
      if (!secure_url) {
        return next(new Error("image Not Found", { cause: 400 }));
      }
      if(coupon.image?.public_id){
        await cloudinary.uploader.destroy(coupon.image.public_id);
      }
      req.body.image = { secure_url, public_id };

    }

    req.body.updatedBy=req.user._id
    const updatedCOUPON = await couponModel.findOneAndUpdate(
      { _id: couponId },
      req.body,
      { new: true }
    );
    return res.status(200).json({ message: "Done", updatedCOUPON });
  }
)
