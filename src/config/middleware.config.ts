//Configuration for various Middleware used
//needs fixing

import { Application } from "express";
import express from "express";
import { rateLimit } from "express-rate-limit";
import MongoRateStore from "rate-limit-mongo";
import path from "path";
import { __dirname } from "../app.js";
import morgan from "morgan";


export default function middlewareSetup(app: Application){

    app.use(morgan("dev"));
    app.set("view engine","ejs");
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(express.urlencoded({ extended: false }));
    app.set('views', path.join(__dirname, 'views'));
    app.use(express.json());
    app.use(rateLimit({
        windowMs: 15 * 60 * 1000,
        limit: 50,
        message: "rate limit reached, try again in 15 minutes",
        store: new MongoRateStore(
            {
                uri: process.env.MONGO_URI,
                collectionName: "rateRecords",
                expireTimeMs: 15 * 60 * 1000,
            }
        ),
    })
    )
}