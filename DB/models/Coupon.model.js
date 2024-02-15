import mongoose, { Types } from "mongoose";
const { Schema } = mongoose;
const couponSchema = new Schema(
	{
		name: {
			type: String,
			unique: [true, "name must be a unique value"],
			trim: true,
			required: [true, "name must be a required value"],
			min: [2, "too short name"],
            max: [20, "max length 20 name"],
			lowerCase:true

		},
		amount:{
			type:Number,
			required: [true, "amount must be a required value"],
		},
		image: {
			type: Object,
		},
		createdBy: {
			type: mongoose.Schema.Types.ObjectId, // Use mongoose.Schema.Types.ObjectId
			ref: "User",
			required: [true, "UserId is required"],
		},
		updatedBy: {
			type: mongoose.Schema.Types.ObjectId, // Use mongoose.Schema.Types.ObjectId
			ref: "User",
		},
		expireIn:{
          type: Date,
		  required:true
		},
		usedBy:[{
			type:Types.ObjectId,
			ref:'User'
		}],
		isDeleted: {
			type: Boolean,
			default: false,
		},
	},
	{ timestamps: true,
   },
);

const couponModel = mongoose.model("Coupon", couponSchema);

export default couponModel;