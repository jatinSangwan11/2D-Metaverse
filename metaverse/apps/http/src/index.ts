import express from "express";
import { router } from "./Router/v1/index.js";
import client from "@repo/db/client"

const app = express();
app.use(express.json());

// make a prefix router
app.use("/api/v1",router)   // segregate all the different routers


app.listen(3000, ()=> {
    console.log('listening at port:3000')
})
