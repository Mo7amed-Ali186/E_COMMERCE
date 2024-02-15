import { Router } from "express";
import { fileValidation, uploadFile } from "../../utils/multer.js";
import * as couponController from "./controller/coupon.controller.js";
import * as couponValidation from "./coupon.validation.js";
import validation from "../../middleware/validation.js";
import auth from "../../middleware/auth.js";
import couponEndPoint from "./coupon.endPoint.js";

const router = Router();

router
	.post(
		"/",
validation(couponValidation.tokenSchema,true),
		auth(couponEndPoint.create),
		uploadFile(fileValidation.image).single("image"),
		validation(couponValidation.createCouponSchema),
		couponController.createCoupon,
	)
	.get("/", couponController.allCoupon)
	.get(
		"/:couponId",
		validation(couponValidation.getCouponSchema),
		couponController.getCoupon,
	)
	.put(
		"/:couponId",
		validation(couponValidation.tokenSchema,true),
		auth(couponEndPoint.update),
		uploadFile(fileValidation.image).single("image"),
		validation(couponValidation.updateCouponSchema),
		couponController.updateCoupon,
	);

export default router;
