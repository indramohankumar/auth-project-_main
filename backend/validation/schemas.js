const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('admin', 'employee', 'security').optional()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const visitorSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().min(10).max(15).optional(),
  company: Joi.string().allow('', null).optional(),
  address: Joi.string().allow('', null).optional()
});

const appointmentSchema = Joi.object({
  visitor: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
  visitdate: Joi.date().iso().required(),
  purpose: Joi.string().min(3).max(200).required()
});

module.exports = { registerSchema, loginSchema, visitorSchema, appointmentSchema };
