import userModel from "../../../../DB/models/User.model.js";
import { sendEmail } from "../../../utils/Email.js";
import { asyncHandler } from "../../../utils/errorHandler.js";
import {
	generateToken,
	verifyToken,
} from "../../../utils/generateAndVerifyToken.js";
import {
	comparePassword,
	hashPassword,
} from "../../../utils/hashAndCompare.js";
import { customAlphabet } from "nanoid";

/* create signup contain 
gain data ,
check if email exist ,
create token & refresh token and send link,
send Email,
hash password 
create user*/
export const signUp = asyncHandler(async (req, res, next) => {
	const { email } = req.body;
	// Check if email already exists
	const emailExists = await userModel.findOne({ email });
	if (emailExists) {
		return next(new Error("Email already exists", { cause: 409 }));
	}
	// Create token and refresh token
	const token = generateToken({
		payload: { email },
		signature: process.env.SIGN_UP_SIGNATURE,
		expiresIn: 60 * 30,
	});
	const rf_token = generateToken({
		payload: { email },
		signature: process.env.SIGN_UP_SIGNATURE,
		expiresIn: 60 * 60 * 24,
	});

	const link = `${req.protocol}://${req.headers.host}/auth/confirmEmail/${token}`;
	const rf_link = `${req.protocol}://${req.headers.host}/auth/refreshToken/${rf_token}`;
	// Send email
	const html = `
		<a href ='${link}'>confirm email</a>
		<br/>
		<br/>
		<a href ='${rf_link}'>refresh email</a>
		`;

	if (!sendEmail({ to: email, subject: "Message of confirm email", html })) {
		return next(new Error("Invalid Email", { cause: 404 }));
	}
	// Hash password
	req.body.password = hashPassword({ plaintext: req.body.password });
	const newUser = await userModel.create(req.body);
	return res.status(201).json({ message: "Done", user: newUser._id });
});
/*
1-get email and password
2-check if email exist
3-check if email confirmed
4-compare password
5-generate token and refresh token
6-update status of user
*/
export const logIn = asyncHandler(async (req, res, next) => {
	const { email, password } = req.body;
	const emailExists = await userModel.findOne({ email });
	if (!emailExists) {
		return next(new Error("Email or password not valid", { cause: 400 }));
	}
	if (!emailExists.confirmEmail) {
		return next(new Error("please confirm email first", { cause: 400 }));
	}
	if (
		!comparePassword({ plaintext: password, hashValue: emailExists.password })
	) {
		return next(new Error("Email or password not valid", { cause: 400 }));
	}
	const token = generateToken({
		payload: { email, id: emailExists._id },
		signature: process.env.TOKEN_SIGNATURE,
		expiresIn: 60 * 30,
	});
	const rf_token = generateToken({
		payload: { email, id: emailExists._id },
		signature: process.env.TOKEN_SIGNATURE,
		expiresIn: 60 * 60 * 24 * 30,
	});
	await userModel.updateOne({ email }, { status: "Online" });
	return res.json({ message: "Done", token, rf_token });
});
/*
1-get token from params
2-verify token
3-check if email exist
4-check if user confirmed or not --> login
5-create token and newLink to confirmEmail
6-send email --> redirect to page
*/
export const confirmEmail = asyncHandler(async (req, res, next) => {
	const { token } = req.params;
	const { email } = verifyToken({
		token,
		signature: process.env.SIGN_UP_SIGNATURE,
	});

	if (!email) {
		return res.redirect("https://www.google.com.eg/?hl=ar");
	}

	const user = await userModel.findOne({ email });

	if (!user) {
		return res.redirect("https://www.google.com.eg/?hl=ar");
	}

	if (user.confirmEmail) {
		return res.redirect("https://www.youtube.com/");
	}

	await userModel.updateOne({ email }, { confirmEmail: true });
	return res.redirect("https://www.youtube.com/");
});

/*
1-get token from params
2-verify token
3-check if email exist
4-check if user confirmed or not --> login
5-create token and newLink to confirmEmail
6-send email --> redirect to page
*/
export const refreshToken = asyncHandler(async (req, res, next) => {
	const { token } = req.params;
	const { email } = verifyToken({
		token,
		signature: process.env.SIGN_UP_SIGNATURE,
	});
	if (!email) {
		return res.redirect("https://www.google.com.eg/?hl=ar");
	}
	const user = await userModel.findOneAndUpdate({ email });
	if (!user) {
		return res.redirect("https://www.google.com.eg/?hl=ar");
	}
	if (user.confirmEmail) {
		return res.redirect("https://www.youtube.com/");
	}
	const newToken = generateToken({
		payload: { email },
		signature: process.env.SIGN_UP_SIGNATURE,
		expiresIn: 60 * 10,
	});
	const link = `${req.protocol}://${req.headers.host}/auth/confirmEmail/${newToken}`;
	const html = `
    <a href ='${link}'>confirm email</a>
    <br/>
    `;
	if (!sendEmail({ to: email, subject: "confirm Email", html })) {
		return next(new Error("Invalid Email", { cause: 404 })); //redirect to front
	}

	return res.send("<h1>check email</h1>");
});

/*
1-get mail
2-if email exists
3-if confirmEmail
4-create code unique
5-update user by new code
*/

export const sendCode = asyncHandler(async (req, res, next) => {
	const { email } = req.body;
	const emailExists = await userModel.findOne({ email });
	if (!emailExists) {
		return next(new Error("email not exist", { cause: 404 }));
	}
	if (!emailExists.confirmEmail) {
		return next(new Error("please confirm email", { cause: 400 }));
	}
	const nanoid = customAlphabet("0123456789", 5);
	const code = nanoid();
	if (
		!sendEmail({
			to: email,
			subject: "forget password",
			html: `<p>${code}</p>`,
		})
	) {
		return next(new Error("fail to send email", { cause: 400 }));
	}
	await userModel.updateOne({ email }, { code });
	return res.status(200).json({ message: "check your email" });
});

//1-get email and code
//2- check email exists
//3-check code exists
//4- password -->hash -->update user (password ,code,.....)
export const forgetPassword = asyncHandler(async (req, res, next) => {
	const { email } = req.params;
	const { code, password } = req.body;
	const user = await userModel.findOne({ email });
	if (!user) {
		return next(new Error("user not exist", { cause: 404 }));
	}
	if (code != user.code) {
		return next(new Error("invalid code", { cause: 404 }));
	}
	const newPassword = hashPassword({ plaintext: password });
	await userModel.updateOne(
		{ email },
		{ password: newPassword, code: null, status: "Offline" },
	);
	return res.status(200).json({ message: "Done" });
});
