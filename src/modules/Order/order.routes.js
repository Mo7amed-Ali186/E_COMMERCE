import { Router } from "express";
import * as orderController from "./controller/order.controller.js";
import * as orderValidation from "./order.validation.js";
import validation from "../../middleware/validation.js";
import auth from "../../middleware/auth.js";
import orderEndPoint from "./order.endPoint.js";
import express from "express";

const router = Router();
router
	.post(
		"/",
		validation(orderValidation.tokenSchema, true),
		auth(orderEndPoint.create),
		validation(orderValidation.createOrderSchema),
		orderController.createOrder,
	)
	.patch(
		"/:orderId/canceled",
		validation(orderValidation.tokenSchema, true),
		auth(orderEndPoint.cancel),
		validation(orderValidation.cancelOrderSchema),
		orderController.cancelOrder,
	)
	.patch(
		"/:orderId/rejected",
		validation(orderValidation.tokenSchema, true),
		auth(orderEndPoint.rejected),
		validation(orderValidation.cancelOrderSchema),
		orderController.rejectOrder,
	)
	.patch(
		"/:orderId/delivered",
		validation(orderValidation.tokenSchema, true),
		auth(orderEndPoint.delivered),
		validation(orderValidation.cancelOrderSchema),
		orderController.deliveredOrder,
	)
	.post(
		"/webhook",
		express.raw({ type: "application/json" }),
		orderController.webhook,
	);

export default router;
