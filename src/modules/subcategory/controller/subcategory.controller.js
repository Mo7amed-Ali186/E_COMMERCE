import categoryModel from "../../../../DB/models/Category.model.js";
import subCategoryModel from "../../../../DB/models/SubCategory.model.js";
import cloudinary from "../../../utils/cloudinary.js";
import slugify from "slugify";
import { asyncHandler } from "../../../utils/errorHandler.js";

export const createSubCategory = asyncHandler(async (req, res, next) => {
	const { categoryId } = req.params;

	// Check if category exists
	const foundCategory = await categoryModel.findById({ _id: categoryId });
	if (!foundCategory) {
		return next(new Error("Category Not Found", { cause: 404 }));
	}

	const { name } = req.body;

	// Check if subcategory name already exists
	const subCategoryExists = await subCategoryModel.findOne({ name });
	if (subCategoryExists) {
		return next(new Error("Name already exists", { cause: 409 }));
	}

	const { secure_url, public_id } = await cloudinary.uploader.upload(
		req.file.path,
		{ folder: `${process.env.APP_NAME}/category/${categoryId}/subcategory` },
	);
	if (!secure_url) {
		return next(new Error("Image not found", { cause: 400 }));
	}

	req.body.categoryId = categoryId;
	req.body.image = { public_id, secure_url };
	req.body.slug = slugify(name);
	req.body.createdBy = req.user._id;
	const newSubCategory = await subCategoryModel.create(req.body);
	return res.status(201).json({ message: "Done", subCategory: newSubCategory });
});

//get all subCategory
export const allSubCategories = asyncHandler(async (req, res, next) => {
	const { categoryId } = req.params;
	const subCategories = await subCategoryModel.find({ categoryId }).populate([
		{
			path: "categoryId",
		},
	]);
	return res.status(200).json({ message: "Done", subCategories });
});
//getSubCategories by id
export const getSubCategories = asyncHandler(async (req, res, next) => {
	const { subcategoryId } = req.params;

	const subCategory = await subCategoryModel.findById(subcategoryId).populate([
		{
			path: "categoryId",
		},
	]);

	if (!subCategory) {
		return next(new Error("Category not found", { cause: 404 }));
	}

	return res.status(200).json({ message: "Done", subCategory });
});

//update updateSubCategory
export const updateSubCategory = asyncHandler(async (req, res, next) => {
	const { subCategoryId } = req.params;
	const subCategory = await subCategoryModel.findById({ _id: subCategoryId });
	if (!subCategory) {
		return next(new Error("subCategory No Found", { cause: 404 }));
	}

	if (req.body.name) {
		if (await subCategoryModel.findOne({ name: req.body.name })) {
			return next(new Error("Name Already Exist", { cause: 409 }));
		}
		req.body.slug = slugify(req.body.name);
	}

	if (req.file) {
		const { secure_url, public_id } = await cloudinary.uploader.upload(
			req.file.path,
			{
				folder: `${process.env.APP_NAME}/category/${req.params.categoryId}/subCategory`,
			},
		);
		if (!secure_url) {
			return next(new Error("Image Not Found", { cause: 400 }));
		}
		req.body.image = { secure_url, public_id };
		await cloudinary.uploader.destroy(subCategory.image.public_id);
	}

	req.body.updatedBy = req.user._id;
	const updatedSubCategory = await subCategoryModel.findOneAndUpdate(
		{ _id: subCategoryId },
		req.body,
		{ new: true },
	);
	return res
		.status(200)
		.json({ message: "Done", Subcategory: updatedSubCategory });
});
//     const { subcategoryId } = req.params;
//     const { name } = req.body;
//     // Check if subCategory exists
//     const subCategory = await subCategoryModel.findById({ _id: subcategoryId });

//     if (!subCategory) {
//         return next(new Error("Invalid SubCategory id", { cause: 404 }));
//     }

//     // Check if new name already exists
//     if (subCategory.name) {
//         if (name !== subCategory.name && (await subCategoryModel.findOne({ name }))) {
//             return next(new Error("Name already exists", { cause: 400 }));
//         }
// 		subCategory.slug = slugify(name);
// 	  }
//     // Upload the new image to Cloudinary
//     if (req.file) {
//     const { secure_url, public_id } = await cloudinary.uploader.upload(
//         req.file.path,
//         {
//             folder: `${process.env.APP_NAME}/category/${req.params.categoryId}/subCategory`,
//         },
//     );

//     if (!secure_url) {
//         return next(new Error("Image not found", { cause: 400 }));
//     }
//         subCategory.image = { public_id, secure_url };
// 		await cloudinary.uploader.destroy(subCategory.image.public_id);

// }
// 	subCategory.updatedBy = req.user._id

//     // Save the updated category
//     const newSubCategory = await subCategory.save();

//     return res.status(200).json({ message: "Done", subCategory: newSubCategory });
// });
