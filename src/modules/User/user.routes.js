import { Router } from "express";
import * as userController from "./controller/user.controller.js";
import * as userValidation from "./user.validation.js";
import validation from "../../middleware/validation.js";
import auth from "../../middleware/auth.js";
import userEndPoint from "./user.endPoint.js";

const router = Router();

router
.post(
	"/",
	validation(userValidation.tokenSchema, true),
	auth(userEndPoint.update),
	validation(userValidation.userCreateSchema),
    userController.createAdminAccount,
)
	//update account.
	.put(
		"/",
		validation(userValidation.tokenSchema, true),
		auth(userEndPoint.update),
		validation(userValidation.userUpdateSchema),
		userController.updateAccount,
	)
	//softDelete
	.patch(
		"/softDelete",
		validation(userValidation.tokenSchema, true),
		auth(userEndPoint.delete), //change to delete
		validation(userValidation.deleteSchema),
		userController.softDelete,
	)
	//Get profile data for another user
	.get(
		"/getProfileData",
		userController.getProfileData,
	)
	//Get user account data
	.get(
		"/getUserAccountData",
		validation(userValidation.tokenSchema, true),
		auth(userEndPoint.create),
		validation(userValidation.userAccountDataSchema),
		userController.getUserAccountData,
	)
	//delete Account
	.delete(
		"/deleteAccount",
		validation(userValidation.tokenSchema, true),
		auth(userEndPoint.delete),
		userController.deleteAccount,
	)
	.patch(
        '/addToWishList/:productId',
        auth(userEndPoint.create),
        validation(userValidation.userSchema),
        userController.addToWishList
    )
    .patch(
        '/removeFromWishList/:productId',
        auth(userEndPoint.delete),
        validation(userValidation.userSchema),
        userController.removeFromWishList
    )
export default router;
