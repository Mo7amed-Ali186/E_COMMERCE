import { Router } from "express";
import { fileValidation, uploadFile } from "../../utils/multer.js";
import * as subCategoryController from "./controller/subcategory.controller.js";
import * as subCategoryValidation from "./subcategory.validation.js";
import auth from "../../middleware/auth.js";
import subCategoryEndPoint from "./subCategory.endPoint.js";
import validation from "../../middleware/validation.js";
const router = Router({ mergeParams: true });

// Assuming createCategory is a function in your categoryController
router
	.post(
		"/",
		validation(subCategoryValidation.tokenSchema, true),
		auth(subCategoryEndPoint.create),
		uploadFile(fileValidation.image).single("image"),
		validation(subCategoryValidation.createSubCategorySchema),
		subCategoryController.createSubCategory,
	)
	.get("/", subCategoryController.allSubCategories)

	.get(
		"/:subcategoryId",
		validation(subCategoryValidation.getSubCategorySchema),
		subCategoryController.getSubCategories,
	)
	.put(
		"/:subcategoryId",
		validation(subCategoryValidation.tokenSchema, true),
		auth(subCategoryEndPoint.update),
		uploadFile(fileValidation.image).single("image"),
		validation(subCategoryValidation.updateSubCategorySchema),
		subCategoryController.updateSubCategory,
	);

export default router;
