import slugify from "slugify";
import { nanoid } from "nanoid";
import { asyncHandler } from "../../../utils/errorHandler.js";
import brandModel from "../../../../DB/models/Brand.model.js";
import categoryModel from "../../../../DB/models/Category.model.js";
import subCategoryModel from "../../../../DB/models/SubCategory.model.js";
import productModel from "../../../../DB/models/Product.model.js";
import cloudinary from "../../../utils/cloudinary.js";

//1- get categoryId ,subcategoryId ,brandId
//2-create slug
//3-finalPrice calc
//4-create customId
//5-upload mainImage
//6-check if subImage already exists
//7-req.body-->createdBy
export const createProduct = asyncHandler(async (req, res, next) => {
	const { categoryId, subCategoryId, brandId } = req.body;
	if (!(await categoryModel.findById({ _id: categoryId }))) {
		return next(new Error("Invalid Category Id", { cause: 404 }));
	}
	if (!(await subCategoryModel.findById({ _id: subCategoryId, categoryId }))) {
		return next(new Error("Invalid subCategory Id", { cause: 404 }));
	}
	if (!(await brandModel.findById({ _id: brandId }))) {
		return next(new Error("Invalid brand Id", { cause: 404 }));
	}
	req.body.slug = slugify(req.body.name, {
		trim: true,
		lower: true,
	});

	req.body.finalPrice =
		req.body.price - (req.body.price * req.body.discount || 0) / 100;

	req.body.customId = nanoid();
	const { secure_url, public_id } = await cloudinary.uploader.upload(
		req.files.mainImage[0].path,
		{
			folder: `${process.env.APP_NAME}/Product/${req.body.customId}/mainImage`,
		},
	);

	if (!secure_url) {
		return next(new Error("Image not found", { cause: 400 }));
	}
	req.body.mainImage = { public_id, secure_url };

	if (req.files.subImage.length) {
		let images = [];
		for (const image of req.files.subImage) {
			const { secure_url, public_id } = await cloudinary.uploader.upload(
				image.path,
				{
					folder: `${process.env.APP_NAME}/Product/${req.body.customId}/subImage`,
				},
			);

			if (!secure_url) {
				return next(new Error("Image not found", { cause: 400 }));
			}
			images.push({ secure_url, public_id });
		}
		req.body.subImage = images;
	}
	req.body.createdBy = req.user._id;
	const product = await productModel.create(req.body);
	return res.status(200).json({ message: "Done", product });
});

//getProduct
export const getProduct = asyncHandler(async (req, res, next) => {
	const { productId } = req.params;

	const product = await productModel.findById({ _id: productId });

	if (!product) {
		return next(new Error("product not found", { cause: 404 }));
	}

	return res.status(200).json({ message: "Done", product });
});

//allProducts
export const allProducts = asyncHandler(async (req, res, next) => {
	const products = await productModel.find();
	return res.status(200).json({ message: "Done", products });
});

//1-productId --> find product existing
//2-subcategoryId-->find if subcategory exists
//3-brandId-->find if brand exists
//4-name -->slug
//5-(price || discount || (price and discount))--> finalPrice --
//6-mainImage
//7-subImage
//8-updatedBy
export const updateProduct = asyncHandler(async (req, res, next) => {
	const { productId } = req.params;
	const product = await productModel.findById({ _id: productId });
	if (!product) {
		return next(new Error("Invalid product Id", { cause: 404 }));
	}

	if (
		req.body.subCategoryId &&
		!(await subCategoryModel.findById({ _id: req.body.subCategoryId }))
	) {
		return next(new Error("Invalid subCategory Id", { cause: 404 }));
	}
	if (
		req.body.brandId &&
		!(await brandModel.findById({ _id: req.body.brandId }))
	) {
		return next(new Error("Invalid brand Id", { cause: 404 }));
	}
	if (req.body.name) {
		req.body.slug = slugify(req.body.name, {
			trim: true,
			lower: true,
		});
	}

	req.body.finalPrice =
		req.body.price ||
		product.price -
			(req.body.price ||
				product.price * req.body.discount ||
				product.discount ||
				0) /
				100;

	if (req.files?.mainImage?.length) {
		const { secure_url, public_id } = await cloudinary.uploader.upload(
			req.files.mainImage[0].path,
			{
				folder: `${process.env.APP_NAME}/Product/${product.customId}/mainImage`,
			},
		);
		if (!secure_url) {
			return next(new Error("Image not found", { cause: 400 }));
		}
		await cloudinary.uploader.destroy(product.mainImage.public_id);
		req.body.mainImage = { public_id, secure_url };
	}

	if (req.files?.subImage?.length) {
		for (const image of req.files.subImage) {
			const { secure_url, public_id } = await cloudinary.uploader.upload(
				image.path,
				{
					folder: `${process.env.APP_NAME}/Product/${product.customId}/subImage`,
				},
			);

			if (!secure_url) {
				return next(new Error("Image not found", { cause: 400 }));
			}
			product.subImage.push({ secure_url, public_id });
		}
		req.body.subImage = product.subImage;
	}
	req.body.updatedBy = req.user._id;
	const newProduct = await productModel.findByIdAndUpdate(
		{ _id: productId },
		req.body,
		{ new: true },
	);
	return res.status(200).json({ message: "Done", newProduct });
});

/*
Finds the product by its ID.
Checks if the product exists.
Deletes the main image from Cloudinary if it exists.
Deletes the sub images from Cloudinary if they exist.
Deletes the product from the database.
*/
export const deleteProduct = asyncHandler(async (req, res, next) => {
	const { productId } = req.params;

	// Step 1: Find the product by its ID
	const product = await productModel.findById(productId);

	// Step 2: Check if the product exists
	if (!product) {
		return next(new Error("Product not found", { cause: 404 }));
	}

	// Step 3: Delete the main image from Cloudinary if it exists
	if (product.mainImage?.public_id) {
		await cloudinary.uploader.destroy(product.mainImage.public_id);
	}

	// Step 4: Delete the sub images from Cloudinary if they exist
	if (product.subImage && product.subImage.length > 0) {
		for (const image of product.subImage) {
			if (image.public_id) {
				await cloudinary.uploader.destroy(image.public_id);
			}
		}
	}

	// Step 5: Delete the product from the database
	await productModel.findByIdAndDelete(productId);

	return res.status(200).json({ message: "Product deleted successfully" });
});
