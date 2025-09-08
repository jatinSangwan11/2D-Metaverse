import { Router } from "express"
import userRouter from "./user.js"
import { adminRouter } from "./admin.js"
import { spaceRouter } from "./space.js"
import { SigninSchema, SignupSchema } from "../../types/index.js"
import client from "@repo/db/client"
import bcrypt from 'bcrypt'
import jwt from "jsonwebtoken"
import { JWT_PASSWORD } from "../../config.js"

export const router = Router()

//   ***** NOTES ******
// res.status(422).json({...}) sends the response.

// return res.status(422).json({...}) sends the response and exits the function so no code below runs.

router.post("/signup", async (req, res) => { // express automatically sets the content/type to json and stringify the json object before sending 
    // check using the runtime checker zod whether the data recieved is of correct format or not
    const parsedData = SignupSchema.safeParse(req.body);
    if(!parsedData.success){
        return res.status(400).json({
            message : "validation failed"
        })
    }
    // now add data into the db and also hash the password

    const hashedPassword = await bcrypt.hash(parsedData.data.password, 10)

    try {
        const user = await client.user.create({
            data: {
                username: parsedData.data.username,
                password: hashedPassword,
                role: parsedData.data.type==='admin'? "Admin": "User",
            }
        })

        res.json({
            userId: user.id
        })

    } catch (error) {
        console.log("signup error:::", error);
        return res.status(400).json({
            message : "validation failed"
        })
    }
})

router.post("/signin", async(req, res) => { // express automatically sets the content/type to json and stringify the json object before sending 
    // payload validation

    const parsedData = SigninSchema.safeParse(req.body);
    if(!parsedData.success){
        return res.status(400).json({
            message: "Sigin Failed"
        })
    }
 try {
        const user = await client.user.findUnique({
            where: {
                username: parsedData.data.username
            }
        })
        
        if (!user) {
            res.status(403).json({message: "User not found"})
            return
        }
        const isValid = await bcrypt.compare(parsedData.data.password, user.password)

        if (!isValid) {
            res.status(403).json({message: "Invalid password"})
            return
        }

        const token = jwt.sign({
            userId: user.id,
            role: user.role
        }, JWT_PASSWORD);

        res.json({
            token
        })
    } catch(e) {
        res.status(400).json({message: "Internal server error"})
    }
})

router.get("/elements", async (req, res) => {
    const elements = await client.element.findMany()

    res.json({elements: elements.map(e => ({
        id: e.id,
        imageUrl: e.imageUrl,
        width: e.width,
        height: e.height,
        static: e.static
    }))})
})

router.get("/avatars", async (req, res) => {
    const avatars = await client.avatar.findMany()
    res.json({avatars: avatars.map(x => ({
        id: x.id,
        imageUrl: x.imageUrl,
        name: x.name
    }))})
})

router.use('/user', userRouter)
router.use('/space', spaceRouter)
router.use('/admin', adminRouter)