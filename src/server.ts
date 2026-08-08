
import { Request, Response } from "express";
import express from "express";

const app = express();

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, TypeScript + Express!');
});

const bootStrap = () =>{
    try{
        app.listen(8000, ()=>{
            console.log(`server is running  on http://localhost:8000`);
        })
        
    }catch(error){
        console.log("Failed to start server:", error);
    }
}

bootStrap()