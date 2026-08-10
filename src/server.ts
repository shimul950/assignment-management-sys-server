
import { toNodeHandler } from "better-auth/node";
import { Request, Response } from "express";
import express from "express";
import { auth } from "./app/lib/auth";
import { envVars } from "./config/env";

const app = express();
app.all('/api/auth/{*any}', toNodeHandler(auth));

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, TypeScript + Express!');
});

const bootStrap = () =>{
    try{
        app.listen(envVars.PORT, ()=>{
            console.log(`server is running  on http://localhost:${envVars.PORT}`);
        })
        
    }catch(error){
        console.log("Failed to start server:", error);
    }
}

bootStrap()