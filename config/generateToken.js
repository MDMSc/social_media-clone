import jwt from "jsonwebtoken";

export const generateToken = (data, expiresIn) => {
  return jwt.sign(data, process.env.JWT_SECRET_KEY, { expiresIn });
};
