import brandModel from "../../../../DB/models/Brand.model.js";
import cloudinary from "../../../utils/cloudinary.js";
import slugify from "slugify";
import { asyncHandler } from "../../../utils/errorHandler.js";
//createCategory
export const createBrand = asyncHandler(async (req, res, next) => {
    const { name } = req.body;
    
    // Check if name exists
    if (await brandModel.findOne({ name })) {
        return next(new Error("Name already exists", { cause: 400 }));
    }

    // Initialize image object
    let image = {};

    // Upload image if req.file exists
    if (req.file) {
        const { secure_url, public_id } = await cloudinary.uploader.upload(
            req.file.path,
            { folder: `${process.env.APP_NAME}/Brands` },
        );

        if (!secure_url) {
            return next(new Error("Image not found", { cause: 400 }));
        }

        // Assign uploaded image details to image object
        image = { public_id, secure_url };
    }

    req.body.image = image;
    req.body.slug = slugify(name);
    req.body.createdBy = req.user._id;

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
export const updateBrand = asyncHandler(async (req, res, next) => {
    const { brandId } = req.params;
    const brand = await brandModel.findById({ _id: brandId });
    if (!brand) {
      return next(new Error("Brand Not Found",{cause:404}))
    }

    if (req.body.name) {
      if (await brandModel.findOne({ name: req.body.name })) {
        return next(new Error("Name Already Exist",{cause:409}))
      }
      req.body.slug = slugify(req.body.name);
    }

    if (req.file) {
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        req.file.path,        
         { folder: `${process.env.APP_NAME}/Brands` },
);
      if (!secure_url) {
        return next(new Error("Image not found", { cause: 400 }));
      }
      req.body.image = { secure_url, public_id };
      await cloudinary.uploader.destroy(brand.image.public_id);
    }

    req.body.updatedBy=req.user._id
    const updatedBrand = await brandModel.findOneAndUpdate(
      { _id: brandId },
      req.body,
      { new: true }
    );
    return res.status(200).json({ message: "Done", updatedBrand });
  }
)
