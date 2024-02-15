import joi from 'joi';
import { generalFields } from '../../utils/generalFields.js';

export const getSubCategorySchema = joi.object({
  categoryId: generalFields.id,
    subcategoryId: generalFields.id,
}).required();

export const createSubCategorySchema = joi.object({
    name:joi.string().max(20).min(3).trim().required(),
    file:generalFields.file.required(),
    categoryId: generalFields.id,
  }).required();

  export const updateSubCategorySchema = joi.object({
    categoryId: generalFields.id,
    name: joi.string().max(20).min(3).trim(),
    file: generalFields.file, // Change "image" to "c"
  }).required();

  
  
  export const tokenSchema = joi.object({
    authorization:joi.string().required()
}).required()
  
  