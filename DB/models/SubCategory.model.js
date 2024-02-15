import mongoose from "mongoose";
const { Schema, Types, model } = mongoose;

const subCategorySchema = new Schema(
	{
		name: {
			type: String,
			unique: [true, "name must be a unique value"],
			trim: true,
			required: [true, "name must be a required value"],
			min: [2, "too short name"],
			max: [20, "max length 20 name"],
			lowerCase: true,
		},
		slug: {
			type: String,
			unique: [true, "slug must be a unique value"],
			required: [true, "slug is required"],
			lowerCase: true,
		},
		image: {
			type: Object,
			required: [true, "image is required"],
		},
		isDeleted: {
			type: Boolean,
			default: false,
		},
		categoryId: {
			type: Types.ObjectId,
			ref: "category",
			required: [true, "categoryId is required"],
		},
		createdBy: {
			type: Types.ObjectId, // Use mongoose.Schema.Types.ObjectId
			ref: "User",
			required: [true, "UserId is required"],
		},
		updatedBy: {
			type: Types.ObjectId, // Use mongoose.Schema.Types.ObjectId
			ref: "User",
		},
	},
	{ timestamps: true },
);

const subCategoryModel = model("subcategory", subCategorySchema);

export default subCategoryModel;
