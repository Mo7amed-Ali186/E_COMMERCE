import { Router } from "express";
import { fileValidation, uploadFile } from "../../utils/multer.js";
import * as productController from "./controller/product.controller.js";
import * as productValidation from "./Product.validation.js";
import auth from "../../middleware/auth.js";
import productEndPoint from "./product.endPoint.js";
import validation from "../../middleware/validation.js";
const router = Router();
router
	.post(
		"/",
		validation(productValidation.tokenSchema, true),
		auth(productEndPoint.create),
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
		validation(productValidation.createProductSchema),
		productController.createProduct,
	)
	.put(
		"/:productId",
		validation(productValidation.tokenSchema, true),
		auth(productEndPoint.update),
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
		validation(productValidation.updateProductSchema),
		productController.updateProduct,
	)
	.get("/", productController.allProducts)
	.get(
		"/:productId",
		validation(productValidation.oneProductSchema),
		productController.getProduct,
	);

export default router;
