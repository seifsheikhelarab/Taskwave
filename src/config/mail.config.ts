//Configuration for sending mail using Nodemailer

import dotenv from "dotenv";
dotenv.config();
import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport/index.js';
import { __dirname } from '../app.js';
import ejs from 'ejs';
import { logger } from './logger.config.js';

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

interface MailConfig {
    host: string;
    port: number;
    secure: boolean;
    auth: {
        user: string;
        pass: string;
    };
    from: string;
}

const requiredEnvVars = [
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_USER',
    'SMTP_PASS',
    'SMTP_FROM',
    'APP_URL'
] as const;

for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        logger.error(`Missing required environment variable: ${envVar}`);
        throw new Error(`Missing required environment variable: ${envVar}`);
    }
}

// Type assertion for environment variables
const env = {
    SMTP_HOST: process.env.SMTP_HOST!,
    SMTP_PORT: parseInt(process.env.SMTP_PORT!),
    SMTP_SECURE: process.env.SMTP_SECURE === 'true',
    SMTP_USER: process.env.SMTP_USER!,
    SMTP_PASS: process.env.SMTP_PASS!,
    SMTP_FROM: process.env.SMTP_FROM!,
    APP_URL: process.env.APP_URL!
};

export const mailConfig: MailConfig = {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS
    },
    from: env.SMTP_FROM
};

// Email templates
export const emailTemplates = {
    welcome: (firstName: string) => ({
        subject: 'Welcome to TaskWave!',
        html: `
            <h2>Welcome to TaskWave!</h2>
            <p>Hi ${firstName},</p>
            <p>Thank you for joining TaskWave. We're excited to help you manage your projects and tasks more efficiently.</p>
            <p>Get started by:</p>
            <ul>
                <li>Creating your first project</li>
                <li>Inviting team members</li>
                <li>Adding tasks to your project</li>
            </ul>
            <p>Visit your dashboard: <a href="${env.APP_URL}/dashboard">Click here</a></p>
        `
    }),

    taskAssignment: (task: any, project: any) => ({
        subject: `You've been assigned to a task: ${task.title}`,
        html: `
            <h2>Task Assignment</h2>
            <p>You have been assigned to a task in ${project.name}.</p>
            <h3>Task Details:</h3>
            <ul>
                <li><strong>Title:</strong> ${task.title}</li>
                <li><strong>Description:</strong> ${task.description || 'No description'}</li>
                <li><strong>Priority:</strong> ${task.priority}</li>
                <li><strong>Due Date:</strong> ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</li>
            </ul>
            <p>View the task: <a href="${env.APP_URL}/tasks/${task._id}">Click here</a></p>
        `
    }),

    taskStatusUpdate: (task: any, project: any) => ({
        subject: `Task status updated: ${task.title}`,
        html: `
            <h2>Task Status Update</h2>
            <p>A task in ${project.name} has been updated.</p>
            <h3>Task Details:</h3>
            <ul>
                <li><strong>Title:</strong> ${task.title}</li>
                <li><strong>New Status:</strong> ${task.status}</li>
                <li><strong>Priority:</strong> ${task.priority}</li>
                <li><strong>Due Date:</strong> ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</li>
            </ul>
            <p>View the task: <a href="${env.APP_URL}/tasks/${task._id}">Click here</a></p>
        `
    }),

    projectInvitation: (project: any, inviter: any, joinLink: string) => ({
        subject: `You've been invited to join ${project.name}`,
        html: `
            <h2>Project Invitation</h2>
            <p>${inviter.firstName} ${inviter.lastName} has invited you to join their project.</p>
            <h3>Project Details:</h3>
            <ul>
                <li><strong>Name:</strong> ${project.name}</li>
                <li><strong>Description:</strong> ${project.description || 'No description'}</li>
            </ul>
            <p>Join the project: <a href="${joinLink}">Click here</a></p>
        `
    }),

    passwordReset: (resetToken: string) => ({
        subject: 'Reset Your TaskWave Password',
        html: `
            <h2>Password Reset Request</h2>
            <p>You have requested to reset your password.</p>
            <p>Click the link below to reset your password:</p>
            <p><a href="${env.APP_URL}/auth/reset-password/${resetToken}">Reset Password</a></p>
            <p>If you didn't request this, please ignore this email.</p>
            <p>This link will expire in 1 hour.</p>
        `
    }),

    emailVerification: (verificationToken: string) => ({
        subject: 'Verify Your TaskWave Email',
        html: `
            <h2>Email Verification</h2>
            <p>Please verify your email address by clicking the link below:</p>
            <p><a href="${env.APP_URL}/auth/verify-email/${verificationToken}">Verify Email</a></p>
            <p>If you didn't create an account, please ignore this email.</p>
        `
    })
};