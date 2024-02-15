// category.validation.js
import joi from 'joi';
import { generalFields } from '../../utils/generalFields.js';

export const getCategorySchema = joi.object({
  categoryId: generalFields.id.required(),
}).required();

export const createCategorySchema = joi.object({
    name:joi.string().max(20).min(3).trim().required(),
    file:generalFields.file.required()
  }).required();

  export const updateCategorySchema = joi.object({
    categoryId: generalFields.id.required(),
    name: joi.string().max(20).min(3).trim(),
    file: generalFields.file, 
  }).required();
  
  export const tokenSchema = joi.object({
    authorization:joi.string().required()
}).required()