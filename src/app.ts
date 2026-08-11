import express, { Application} from "express";

import { indexRoutes } from "./routes/routes";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import { notFound } from "./app/middleware/notFound";
import cookieParser from "cookie-parser";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./app/lib/auth";
import path from "node:path";
import cors from "cors"
import { envVars } from "./config/env";



const app: Application = express();


app.set("view engine", "ejs")
app.set("views", path.resolve(process.cwd(), `src/app/templates`))


app.use(cors({
    origin:[envVars.FRONTEND_URL, envVars.BETTER_AUTH_URL, "http://localhost:3000","http://localhost:8000"],
    credentials: true,
    methods:["GET","POST","DELETE","PUT","PATCH"],
    allowedHeaders:["Content-Type", "Authorization"]
}))

app.use("/api/auth", toNodeHandler(auth))

//Middleware to parse JSON bodies
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended:true}))

app.use("/api/v1", indexRoutes)


//basic route
app.get("/", (req, res) => {
  res.send("API is running");
});


app.use(globalErrorHandler)
app.use(notFound)

export default app;