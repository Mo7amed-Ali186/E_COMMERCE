import { Router } from "express";
import { fileValidation, uploadFile } from "../../utils/multer.js";
import * as categoryController from "./controller/category.controller.js";
import * as categoryValidation from "./category.validation.js";
import subCategoryRoutes from "../subcategory/subcategory.routes.js";
import validation from "../../middleware/validation.js";
import auth from "../../middleware/auth.js";
import categoryEndPoint from "./category.endpoint.js";

 
const router = Router();

// Assuming createCategory is a function in your categoryController
router.use("/:categoryId/subcategory", subCategoryRoutes);
router
	.post(
		"/",
        validation(categoryValidation.tokenSchema,true),
		auth(categoryEndPoint.create),
		uploadFile(fileValidation.image).single("image"),
		validation(categoryValidation.createCategorySchema),
		categoryController.createCategory,
	)
	.get("/", categoryController.allCategory)
	.get(
		"/:categoryId",
		validation(categoryValidation.getCategorySchema),
		categoryController.getCategory,
	)
	.put(
		"/:categoryId",
		validation(categoryValidation.tokenSchema,true),
        auth(categoryEndPoint.update),
		uploadFile(fileValidation.image).single("image"),
		 validation(categoryValidation.updateCategorySchema),
		categoryController.updateCategory,
	);

export default router;
