import joi from "joi";
import { generalFields } from "../../utils/generalFields.js";

export const getCouponSchema = joi
	.object({
		couponId: generalFields.id.required(),
	})
	.required();

export const createCouponSchema = joi
	.object({
		name: joi.string().max(20).min(3).trim().required(),
		file: generalFields.file,
		amount: joi.number().positive().min(1).max(100).required(),
		expireIn: joi.string().required(),
	})
	.required();

export const updateCouponSchema = joi
	.object({
		couponId: generalFields.id.required(),
		name: joi.string().max(20).min(3).trim(),
		file: generalFields.file,
		amount: joi.number().positive().min(1).max(100),
		expireIn: joi.string(),
	})
	.required();
export const tokenSchema = joi
	.object({
		authorization: joi.string().required(),
	})
	.required();
