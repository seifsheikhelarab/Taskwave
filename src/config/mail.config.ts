//Configuration for sending mail using Nodemailer

import dotenv from "dotenv";
dotenv.config();
import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport/index.js';
import { __dirname } from '../app.js';
import ejs from 'ejs';

export const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT),
    secure: false,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
} as SMTPTransport.Options);

export function sendEmail(receiver:String, id:String){
    ejs.renderFile(__dirname + "/views/email.ejs",{id},(err,data)=>{
        if(err){console.error(err);
        }else{

            transporter.sendMail({
                from: `"FromName" <${process.env.MAIL_FROM}>`,
                to: receiver.toString(),
                subject: "Subject",
                html: data,
            },(err,info)=>{
                if(err){console.error(err)}
            })
        }
    })
}