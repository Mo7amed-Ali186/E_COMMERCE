import joi from "joi";
import { Types } from "mongoose";


export const validateObjectId = (value, helper) => {
    return Types.ObjectId.isValid(value) ? true : helper.message("Invalid Id");
};

export const generalFields = {
    email : joi.string().email({tlds:{allow:['com','net']}}).required(),
    password:joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
    token : joi.string().required(),
    id: joi.string().custom(validateObjectId).required(),
    _id: joi.string().custom(validateObjectId),
    file: joi.object({
        size: joi.number().positive().required(),
        path: joi.string().required(),
        filename: joi.string().required(),
        destination: joi.string().required(),
        mimetype: joi.string().required(),
        encoding: joi.string().required(),
        originalname: joi.string().required(),
        fieldname: joi.string().required(),
        // finalDest: joi.string().required(),
      }),

    files:joi.array().items(
        
        joi.object({
            size:joi.number().positive().required(),
            path:joi.string().required(),
            filename:joi.string().required(),
            destination:joi.string().required(),
            mimetype:joi.string().required(),
            encoding:joi.string().required(),
            originalname:joi.string().required(),
            fieldname:joi.string().required(),
            // finalDest:joi.string().required(),
        })
    )
    
    
}
