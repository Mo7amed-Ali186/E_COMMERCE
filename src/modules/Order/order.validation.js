import joi from "joi";
import { generalFields } from "../../utils/generalFields.js";

export const createOrderSchema = joi.object({
	address: joi.string().min(20).max(100).required(),
	phone: joi.array().items(joi.string().required()).required(),
	paymentType: joi.string().valid("Card", "Cash"),
	note: joi.string().min(20),
	reason: joi.string(),
	couponName: joi.string().max(20).min(3).trim(),
	products: joi.array().items(
		joi.object({
			productId: generalFields._id,
			quantity: joi.number().min(1).positive().integer().required(),
		})
)
});

export const cancelOrderSchema = joi
	.object({
		orderId: generalFields.id.required(    )
	})
	.required();
export const tokenSchema = joi
	.object({
		authorization: joi.string().required(),
	})
	.required();
