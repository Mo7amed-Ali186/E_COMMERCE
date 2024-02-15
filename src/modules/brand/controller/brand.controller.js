import brandModel from "../../../../DB/models/Brand.model.js";
import cloudinary from "../../../utils/cloudinary.js";
import slugify from "slugify";
import { asyncHandler } from "../../../utils/errorHandler.js";
//createCategory
export const createBrand = asyncHandler(async (req, res, next) => {
	const { name } = req.body;
	console.log(req.file.path);
	// Check if name exists
	if (await brandModel.findOne({ name })) {
		return next(new Error("Name already exists", { cause: 400 }));
	}
	const { secure_url, public_id } = await cloudinary.uploader.upload(
		req.file.path,
		{ folder: `${process.env.APP_NAME}/Brands` },
	);

	if (!secure_url) {
		return next(new Error("Image not found", { cause: 400 }));
	}
	req.body.image = { public_id, secure_url };
	req.body.slug = slugify(name);
	req.body.createdBy = req.user._id

	const brand = await brandModel.create(req.body);
	return res.status(201).json({ message: "Done", brand });
});
//get all category
export const allBrand = asyncHandler(async (req, res) => {
	const brand = await brandModel.find();
	return res.status(200).json({ message: "Done", brand });
});
//getCategories by id
export const getBrand = asyncHandler(async (req, res) => {
	const { brandId } = req.params;

	const brand = await brandModel.findById({ _id: brandId });

	if (!brand) {
		return next(new Error("brand not found", { cause: 404 }));
	}

	return res.status(200).json({ message: "Done", brand });
});
//update category
export const updateBrand = asyncHandler(async (req, res) => {
	const { brandId } = req.params;
	const { name } = req.body;
	// Check if category exists
	const brand = await brandModel.findById({ _id: brandId });

	if (!brand) {
		return next(new Error("brand not found", { cause: 404 }));
	}

	// Check if new name already exists
	if (name !== brand.name && (await brandModel.findOne({ name }))) {
		return next(new Error("Name already exists", { cause: 400 }));
	}

	// Upload the new image to Cloudinary
	const { secure_url, public_id } = await cloudinary.uploader.upload(
		req.file.path,
		{ folder: `${process.env.APP_NAME}/Brands` },
	);

	if (!secure_url) {
		return next(new Error("Image not found", { cause: 400 }));
	}
	if (brand.image.public_id) {
		// Delete the previous image from Cloudinary
		await cloudinary.uploader.destroy(brand.image.public_id);
	}
	brand.name = name;
	brand.image = { public_id, secure_url };
	brand.slug = slugify(name);
	brand.updatedBy = req.user._id

	// Save the updated category
	const newBrand = await brand.save();

	return res.status(200).json({ message: "Done", brand: newBrand });
});
