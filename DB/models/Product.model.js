import mongoose from "mongoose";
const { Schema, Types, model } = mongoose;

const productSchema = new Schema(
	{
		name: {
			type: String,
			trim: true,
			required: [true, "name must be a required value"],
			min: [2, "too short name"],
            max: [20, "max length 20 name"],
			lowerCase: true,
		},
		slug: {
			type: String,
			required: [true, "slug is required"],
			lowerCase: true,
		},
		mainImage: {
			type: Object,
			required: [true, "image is required"],
		},
		subImage: [
			{
				type: Object,
			},
		],
		description: String,
		colors:  [
			{
				type: String,
			},
		],
		size: [
			{
				type: String,
			},
		],
		finalPrice: {
			type: Number,
		},
		price: {
			type: Number,
			required:[true,"Price Is Required"],
            min:1
		},
		
		discount: {
			type: Number,
			default: 0,
		},
		stock: {
			type: Number,
			required: [true, "stock is required"],
		},
		isDeleted: {
			type: Boolean,
			default: false,
		},
		createdBy: {
			type: Types.ObjectId, // Use mongoose.Schema.Types.ObjectId
			ref: "User",
			required: [true, "UserId is required"],
		},
		brandId: {
			type: Types.ObjectId, // Use mongoose.Schema.Types.ObjectId
			ref: "Brand",
			required: [true, "BrandId is required"],
		},
		updatedBy: {
			type: Types.ObjectId, // Use mongoose.Schema.Types.ObjectId
			ref: "User",
		},
		
		categoryId: {
			type: Types.ObjectId,
			ref: "category",
			required: [true, "categoryId is required"],
		},subCategoryId: {
			type: Types.ObjectId,
			ref: "subcategory",
			required: [true, "subcategory is required"],
		},
        customId:{
            type:String,
            required:true,
        }
        ,
	},
	{ timestamps: true },
);

const productModel = model("Product", productSchema);

export default productModel;
