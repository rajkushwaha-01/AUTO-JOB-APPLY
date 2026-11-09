const { validationResult } = require("express-validator");

/**
 * Reusable middleware that reads express-validator's result.
 * Place it AFTER the validation chain arrays in any route.
 * Returns 422 Unprocessable Entity with a structured errors array on failure.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  next();
};

module.exports = validate;

