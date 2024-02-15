import mongoose from "mongoose";
const { Schema, Types, model } = mongoose;

const cartSchema = new Schema(
	{
userId:{
    type:Types.ObjectId,
    required:true,
    ref:'User',
    unique:true
},
products:[{
productId:{
    type:Types.ObjectId,
    required:true,
    ref:'Product',
    unique:true
},
quantity:{
    type:Number,
    required:true,
    min:1,

}
}]

	},
	{ timestamps: true },
);

const cartModel = mongoose.model.Cart||model("Cart", cartSchema);

export default cartModel;
