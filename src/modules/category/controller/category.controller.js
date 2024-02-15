import categoryModel from "../../../../DB/models/Category.model.js";
import cloudinary from "../../../utils/cloudinary.js";
import slugify from "slugify";
import { asyncHandler } from "../../../utils/errorHandler.js";
//createCategory
export const createCategory = asyncHandler(async (req, res, next) => {
	const { name } = req.body;

	// Check if name exists
	if (await categoryModel.findOne({ name })) {
		return next(new Error("Name already exists", { cause: 400 }));
	}
	const { secure_url, public_id } = await cloudinary.uploader.upload(
		req.file.path,
		{ folder: `${process.env.APP_NAME}/category` },
	);

	if (!secure_url) {
		return next(new Error("Image not found", { cause: 400 }));
	}
	req.body.image = { public_id, secure_url };
	req.body.slug = slugify(name);
	req.body.createdBy = req.user._id
	const category = await categoryModel.create(req.body);
	return res.status(201).json({ message: "Done", category });
});
//get all category
export const allCategory = asyncHandler(async (req, res,next) => {
	const categories = await categoryModel.find().populate([
		{
			path: "subCategory",
		},
	]);
	return res.status(200).json({ message: "Done", categories });
});
//getCategories by id
export const getCategory = asyncHandler(async (req, res ,next) => {
	const { categoryId } = req.params;

	const category = await categoryModel.findById({ _id: categoryId }).populate([
		{
			path: "subCategory",
		},
	]);

	if (!category) {
		 return next(new Error("Category not found", { cause: 404 }));

	}
	return res.status(200).json({ message: "Done", category });
});
//update category
export const updateCategory = asyncHandler(async (req, res,next) => {
	const { categoryId } = req.params;
	const { name } = req.body;
	// Check if category exists
	const category = await categoryModel.findById({ _id: categoryId });

	if (!category) {
		return next(new Error("Category not found", { cause: 404 }));
	}

	// Check if new name already exists
	if (name !== category.name && (await categoryModel.findOne({ name }))) {
		return next(new Error("Name already exists", { cause: 400 }));
	}

	// Upload the new image to Cloudinary
	const { secure_url, public_id } = await cloudinary.uploader.upload(
		req.file.path,
		{ folder: `${process.env.APP_NAME}/category` },
	);

	if (!secure_url) {
		return next(new Error("Image not found", { cause: 400 }));
	}
	if (category.image.public_id) {
		// Delete the previous image from Cloudinary
		await cloudinary.uploader.destroy(category.image.public_id);
	}
	category.name = name;
	category.image = { public_id, secure_url };
	category.slug = slugify(name);
	category.updatedBy = req.user._id

	// Save the updated category
	const updatedCategory = await category.save();

	return res.status(200).json({ message: "Done", category: updatedCategory });
});
