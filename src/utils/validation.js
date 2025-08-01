const validator = require('validator');

function validateSignup(req) {
  const { firstName, lastName, email, password } = req.body;

  if (!firstName) {
    throw new Error("First name is required");
  }
  if (!lastName) {
    throw new Error("Last name is required");
  }
  if (!email) {
    throw new Error("Email is required");
  }
  if (!password) {
    throw new Error("Password is required");
  }

  
}

module.exports = { validateSignup };
