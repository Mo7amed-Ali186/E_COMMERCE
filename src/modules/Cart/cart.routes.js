import { Router } from "express";
import { fileValidation, uploadFile } from "../../utils/multer.js";
import * as cartController from "./controller/cart.controller.js";
import * as cartValidation from "./cart.validation.js";
import cartEndPoint from "./cart.endPoint.js";
import auth from "../../middleware/auth.js";
import validation from "../../middleware/validation.js";
const router = Router();
router
	.post(
		"/",
		validation(cartValidation.tokenSchema, true),
		auth(cartEndPoint.create),
		uploadFile(fileValidation.image).fields([
			{
				name: "mainImage",
				maxCount: 1,
			},
			{
				name: "subImage",
				maxCount: 5,
			},
		]),
		validation(cartValidation.addToCartSchema),
		cartController.addToCart,
	)
	.patch(
		"/",
		validation(cartValidation.tokenSchema, true),
		auth(cartEndPoint.create),
		cartController.clearCart,
	)
	.patch(
		"/:productId",
		validation(cartValidation.tokenSchema, true),
		validation(cartValidation.deleteFromSchema),
		auth(cartEndPoint.create),
		cartController.deleteFromCart,
	);

export default router;
