import joi from 'joi';
import { generalFields } from '../../utils/generalFields.js';
export const userCreateSchema = joi.object({
    userName:joi.string().min(2).max(20).required(),
    email:generalFields.email,
    password:generalFields.password,
    age:joi.number(),
    role:joi.string(),
    cPassword:joi.string().valid(joi.ref('password')).required()
}).required();
export const userUpdateSchema = joi.object({
    userName:joi.string().min(2).max(20),
    email:generalFields.email,
    mobileNumber:joi.string(),
    role:joi.string(),
    DOB: joi.string().pattern(new RegExp(/^\d{4}-\d{1,2}-\d{1,2}$/)),
}).required();
export const deleteSchema = joi.object({
    email:generalFields.email,
}).required()
export const userAccountDataSchema = joi.object({
    email:generalFields.email,
}).required()
export const profileDataSchema = joi.object({
    email:generalFields.email,
    userId: generalFields._id,
}).required()
export const accountSchema = joi.object({
    confirmEmail:generalFields.email,
}).required()
export const tokenSchema = joi.object({
    authorization:joi.string().required()
}).required()
export const userSchema=joi.object({
    productId:generalFields.id
}).required()

