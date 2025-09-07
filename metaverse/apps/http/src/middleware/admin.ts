import type { NextFunction, Request, Response } from "express";
import { JWT_PASSWORD } from "../config.js";
import jwt  from "jsonwebtoken";

enum Role {
    "Admin",
    "User"
}
interface Decoded {
    userId: string,
    role: Role
}
export const adminMiddleware = async (req: Request,res: Response,next: NextFunction) => {
    const header = req.headers['authorisation'] as string;
    const token = header?.split(" ")[1];
    if(!token){
        return res.status(403).json({
            message: "unauthorized"
        })
    }

    try{
        const decoded = jwt.verify(token, JWT_PASSWORD) as Decoded;
        if(decoded.role!== Role.Admin){
            return res.status(400).json({
                message: "unauthorized"
            })
        }
        req.userId = decoded.userId;
        next();

    } catch (error) {
        res.status(401).json({
            message: "unauthorized"
        })
    }
}