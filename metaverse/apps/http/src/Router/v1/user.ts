import { Router, type Request, type Response } from "express";
import { UpdateMetadataSchema } from "../../types/index.js";
import client from "@repo/db/client"
import { userMiddleware } from "../../middleware/user.js";

const userRouter = Router();

userRouter.post('/metadata', userMiddleware ,async(req,res) => {
 const parsedData = UpdateMetadataSchema.safeParse(req.body)       
    if (!parsedData.success) {
        console.log("parsed data incorrect")
        res.status(400).json({message: "Validation failed"})
        return
    }
    try {
        if (!req.userId) {
            return res.status(400).json({ message: "User ID missing" });
        }
        await client.user.update({
            where: {
                id: req.userId,
            },
            data: {
                avatarId: parsedData.data.avatarId
            }
        })
        res.json({message: "Metadata updated"})
    } catch(e) {
        console.log("error")
        res.status(400).json({message: "Internal server error"})
    }
})

userRouter.get('/metadata/bulk', async(req: Request,res: Response) => {
    const userIdsString = req.query.ids as string;
    console.log(userIdsString[userIdsString.length-1])
    const userIds = userIdsString.slice(1,userIdsString.length -1).split(",");  
    // convert string to array slice(begin,end)- end is exclusive and then split to get the arrray
    console.log(typeof userIds)
    console.log(userIds)
    try {
        const users = await client.user.findMany({
            where : {
                id: {
                    in: userIds
                }
            }, select: {
                avatar : true,
                id : true
            }
        })
        console.log("users:::", users)
        res.status(200).json({
            avatars: users.map((value, key) => ({
                userId: value.id,
                imageUrl: value.avatar?.imageUrl
            }))
    })
    } catch(error){
       return res.status(400).json({
            message: "error fetching user data"
       })
    }

})

export default userRouter;