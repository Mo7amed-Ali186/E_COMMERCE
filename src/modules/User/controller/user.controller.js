import productModel from "../../../../DB/models/Product.model.js";
import userModel from "../../../../DB/models/User.model.js";
import { asyncHandler } from "../../../utils/errorHandler.js";
import { hashPassword } from "../../../utils/hashAndCompare.js";

export const createAdminAccount = asyncHandler(async (req, res, next) => {
    const { email} = req.body;
        // Check if email already exists
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return next(new Error("Email is already in use", { cause: 400 }));
        }
        // Create new user
        req.body.password = hashPassword({ plaintext: req.body.password });
        req.body.confirmEmail= true 
        const newUser = await userModel.create(req.body);
        return res.status(201).json({ message: "Done", user: newUser});
});


//update account.- you can update ( email , mobileNumber , DOB , )- if user update the email , mobileNumber make sure that the new data doesn’t conflict with any existing data in your  database
export const updateAccount = asyncHandler(async (req, res, next) => {
	// Get the user ID and role from the authenticated user
	const { _id, role } = req.user;

	// Check if user exists and is not deleted
	const user = await userModel.findOne({ _id, isDeleted: false });
	if (!user) {
		return next(new Error("User not found or deleted", { cause: 404 }));
	}
	// Ensure that the user's role is either User
	if (role !== "Admin") {
		return next(
			new Error("You are not authorized to update this account", {
				cause: 403,
			}),
		);
	}
	// Destructure the allowed fields from the request body
	const { email, mobileNumber } = req.body;
	// Check if the updated email conflicts with existing data
	if (email) {
		const existingUserWithEmail = await userModel.findOne({ email });
		if (
			existingUserWithEmail &&
			existingUserWithEmail._id.toString() !== req.user._id
		) {
			return next(new Error("Email is already in use", { cause: 400 }));
		}
	}
	// Check if the updated mobile number conflicts with existing data
	if (mobileNumber) {
		const existingUserWithMobileNumber = await userModel.findOne({
			mobileNumber,
		});
		if (
			existingUserWithMobileNumber &&
			existingUserWithMobileNumber._id.toString() !== req.user._id
		) {
			return next(new Error("Mobile number is already in use", { cause: 400 }));
		}
	}

	// Update the user account fields including the username
	const updatedUser = await userModel.findByIdAndUpdate(
		_id,
		{ ...req.body },
		{ new: true },
	);
	return res.status(200).json({ message: "Done", user: updatedUser });
});

//Delete account
export const softDelete = asyncHandler(async (req, res, next) => {
	const { _id } = req.user;
	const emailDelete = await userModel.findOne({ _id });
	emailDelete.isDeleted = true;
	await userModel.findOneAndUpdate({ _id, isDeleted: true, status: "Offline" });
	return res.status(201).json({ message: "Done" });
});
//Get user account data
export const getUserAccountData = asyncHandler(async (req, res, next) => {
	const { _id } = req.user;
	const user = await userModel.findOne({ _id, isDeleted: false });
	if (!user) {
		return next(new Error("email is deleted", { cause: 404 }));
	}
	return res.status(200).json({ message: "Done", user });
});
//Get profile data for another user - send the userId or username in params or query or body
export const getProfileData = asyncHandler(async (req, res, next) => {
	// Change from req.params to req.query
	const { userId, email, userName } = req.query;

	// Define the filter for querying the user profile data
	const filter = {
		$or: [{ _id: userId }, { email }, { userName }],
	};

	// Query the user profile data based on the provided userId, email, or username
	const userProfile = await userModel.findOne(filter);
	if (!userProfile) {
		return res.status(404).json({ message: "Account not found" });
	}

	return res.status(200).json({ message: "Profile data found", userProfile });
});

//Delete account
export const deleteAccount = asyncHandler(async (req, res, next) => {
	// Get the user ID and role from the authenticated user
	const { _id, role } = req.user;
	// Ensure that the user's role is either User
	if (role !== "User" && role !== "Admin") {
		return next(
			new Error("You are not authorized to delete this account", {
				cause: 403,
			}),
		);
	}
	// Delete the user account
	await userModel.findByIdAndDelete(_id);
	return res.status(200).json({ message: "Done" });
});

export const addToWishList = asyncHandler(async (req, res, next) => {
	const { productId } = req.params;

	const product = await productModel.findById({ _id: productId });
	if (!product) {
		return next(new Error("Product Not Found", { cause: 404 }));
	}

	const user = await userModel
		.findByIdAndUpdate(
			{ _id: req.user._id },
			{ $addToSet: { wishList: product._id } },
			{ new: true },
		)
		.select("userName email status wishList")
		.populate([
			{
				path: "wishList",
			},
		]);
	return res.status(200).json({ message: "Added to Wishlist", user });
});
export const removeFromWishList = asyncHandler(async (req, res, next) => {
	const { productId } = req.params;

	const product = await productModel.findById({ _id: productId });
	if (!product) {
		return next(new Error("Product Not Found", { cause: 404 }));
	}

	const user = await userModel
		.findByIdAndUpdate(
			{ _id: req.user._id },
			{ $pull: { wishList: product._id } },
			{ new: true },
		)
		.select("userName email status wishList")
		.populate([
			{
				path: "wishList",
			},
		]);
	return res.status(200).json({ message: "remove to Wishlist", user });
});
