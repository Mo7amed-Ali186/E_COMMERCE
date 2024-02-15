import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/errorHandler.js";
import userModel from "../../DB/models/User.model.js";

export const roles = {
	Admin: "Admin",
	User: "User",
};
const auth = (role = Object.values) => {
	return async (req, res, next) => {
		const { authorization } = req.headers;
		if (!authorization) {
			return next(new Error("please login", { cause: 404 }));
		}
		if (!authorization?.startsWith(process.env.BEARER_KEY)) {
			return next(new Error("In_valid bearer key", { cause: 400 }));
		}
		const token = authorization.split(process.env.BEARER_KEY)[1];
		if (!token) {
			return next(new Error("In_valid token", { cause: 400 }));
		}
		const payload = jwt.verify(token, process.env.TOKEN_SIGNATURE);
		if (!payload?.id) {
			return next(new Error("Invalid payload", { cause: 400 }));
		}
		const authUser = await userModel
		.findById({ _id: payload.id })
		.select("userName email role status");
	
		if (!authUser) {
			return next(new Error("The User Doesn't Exist", { cause: 404 }));
		}
		if (authUser.status != "Online") {
			return next(new Error("invalid token please login", { cause: 400 }));
		}
		if (!role.includes(authUser.role)) {
			return next(new Error("Not authorization", { cause: 401 }));
		}
		req.user = authUser;
		next();
	};
};
export default auth;

// import jwt from 'jsonwebtoken'
// import userModel from '../../DB/models/User.model.js';

// export const roles={
//     Admin: "Admin",
//     User:"User"

// }

// const auth=(role=Object.values(roles))=>{

//     return async (req,res,next)=>{
//         const { authorization } = req.headers;

//         if(!authorization){
//             return next (new Error("Please Login",{cause:400}))
//         }
//         if(!authorization?.startsWith(process.env.BEARER_KEY)){
//             return next (new Error ("Invalid Bearer Token",{cause:404}))
//         }
//         const token=authorization.split(process.env.BEARER_KEY)[1]

//         const payload=jwt.verify(token,process.env.TOKEN_SIGNATURE)
//         if(!payload?.id){
//             return next (new Error("Invalid payload",{cause:404}))
//         }

//         const user=await userModel.findOne({_id:payload.id}).select('userName email role status')
//         if(!user){
//             return next ( new Error("The User Doesn't Exist",{cause:404}))
//         }

//         if(user.status!='Online'){
//             return next ( new Error("Invalid Token Please Login",{cause:404}))
//         }

//         if(!role.includes(user.role)){
//             return next ( new Error("Not Authorized",{cause:401}))
//         }
//         req.user=user
//         next()
//     }
// }

// export default auth
