import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

export const authMiddleware = (req, res, next) => {
    try {
        if(!req.headers.authorization || !req.headers.authorization.startsWith("Bearer ")){
            return res.status(403).send({ message: "Access denied" });
        }

        let token = req.headers.authorization.split(" ")[1];

        if(!token){
            return res.status(403).send({ message: "Access denied" });
        }

        jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, decoded) => {
            if(err) return res.status(403).send({ message: `Access denied` });

            const user = await User.findById(decoded._id);
            const loggedToken = user.tokens.filter(t => t.token === token);

            if(!loggedToken.length){
                return res.status(403).send({ message: `Access denied` });
            }
            req.user = decoded;
            next();
        });

    } catch (error) {
        res.status(403).send({ message: `${error.message}` });
    }
};