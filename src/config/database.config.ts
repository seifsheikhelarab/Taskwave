//Configuration for connecting to MongoDB database

import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { logger } from "./logger.config.js";

export default function databaseSetup(){

    mongoose.connect(process.env.MONGO_URI!)
    .then(()=>logger.info(`Connected to MongoDB at ${process.env.MONGO_URI}`))
    .catch(err => logger.error(err));

};