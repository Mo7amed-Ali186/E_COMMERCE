import mongoose from "mongoose";
const { Schema, Types, model } = mongoose;
//userId , products , address ,phone , paymentTypes,totalPrice,subPrice,couponId,status,note
const orderSchema = new Schema(
	{
		userId: {
			type: Types.ObjectId,
			required: true,
			ref: "User",
		},
		products: [
			{
				name: {
					type: String,
					trim: true,
					required: [true, "name must be a required value"],
					min: [2, "too short name"],
					max: [20, "max length 20 name"],
					lowerCase: true,
				},
				unitPrice: {
					type: Number,
					required: true,
					min: 1,
				},
				totalPrice: {
					type: Number,
					required: true,
					min: 1,
				},
				productId: {
					type: Types.ObjectId,
					required: true,
					ref: "Product",
				},
				quantity: {
					type: Number,
					required: true,
					min: 1,
				},
			},
		],
		address: {
			type: String,
			required: true,
		},
		phone: {
			type: [String],
			required: true,
		},
		paymentTypes: {
			type: String,
			enum: ["card", "cash"],
			default: "cash",
		},
		finalPrice: {
			type: Number,
			required: true,
			min: 1,
		},
		subPrice: {
			type: Number,
			required: true,
			min: 1,
		},
		note: String,
		couponId: {
			type: Types.ObjectId,
			ref: "Coupon",
		},
		status: {
			type: String,
			enum: [
				"placed",
				"onway",
				"cancel",
				"rejected",
				"delivered",
				"waitForPayment",
			],
			default: "placed",
		},
		reason: String,
		updatedBy: {
			 type: Types.ObjectId,
			   ref: "User" 
			},
	},
	{ timestamps: true },
);

const orderModel = mongoose.model.Order || model("Order", orderSchema);

export default orderModel;
