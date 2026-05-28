const validateRequest = (schema, property = 'body') => {
  return (req, res, next) => {
    if (!schema) return next();
    
    try {
      const { error } = schema.validate(req[property], { abortEarly: false });
      if (error) {
        const errorMessage = error.details.map(detail => detail.message).join(', ');
        return res.status(400).json({ message: "Validation error", errors: errorMessage });
      }
      next();
    } catch (err) {
      next();
    }
  };
};

module.exports = validateRequest;
