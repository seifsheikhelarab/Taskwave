//Configuration for sending emails using Nodemailer

import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport/index.js';

dotenv.config();


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

export const mailConfig: MailConfig = {
    host: process.env.SMTP_HOST!,
    port: parseInt(process.env.SMTP_PORT!),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER!,
        pass: process.env.SMTP_PASS!
    },
    from: process.env.SMTP_FROM!
};

export const transporter = nodemailer.createTransport(mailConfig as SMTPTransport.Options);

export const emailTemplates = {
    welcome: (firstName: string) => ({
        subject: 'Welcome to TaskWave!',
        html: `
            <h2>Welcome to TaskWave!</h2>
            <p>Hi ${firstName},</p>
            <p>Thank you for joining TaskWave. We're excited to help you manage your projects and tasks more efficiently.</p>
            <p>Visit your dashboard: <a href="${process.env.APP_URL!}/dashboard">Click here</a></p>
        `
    }),

    taskAssignment: (task: any, project: any) => ({
        subject: `You've been assigned to a task: ${task.title}`,
        html: `
            <h2>Task Assignment</h2>
            <p>You have been assigned to a task in ${project.name}.</p>
            <ul>
                <li><strong>Title:</strong> ${task.title}</li>
                <li><strong>Description:</strong> ${task.description || 'No description'}</li>
                <li><strong>Priority:</strong> ${task.priority}</li>
                <li><strong>Due Date:</strong> ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</li>
            </ul>
            <p>View the task: <a href="${process.env.APP_URL!}/tasks/${task._id}">Click here</a></p>
        `
    }),

    taskStatusUpdate: (task: any, project: any) => ({
        subject: `Task status updated: ${task.title}`,
        html: `
            <h2>Task Status Update</h2>
            <p>A task in ${project.name} has been updated.</p>
            <ul>
                <li><strong>Title:</strong> ${task.title}</li>
                <li><strong>New Status:</strong> ${task.status}</li>
                <li><strong>Priority:</strong> ${task.priority}</li>
                <li><strong>Due Date:</strong> ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</li>
            </ul>
            <p>View the task: <a href="${process.env.APP_URL!}/tasks/${task._id}">Click here</a></p>
        `
    }),

    projectInvitation: (project: any, inviter: any, joinLink: string) => ({
        subject: `You've been invited to join ${project.name}`,
        html: `
            <h2>Project Invitation</h2>
            <p>${inviter.firstName} ${inviter.lastName} has invited you to join their project.</p>
            <ul>
                <li><strong>Name:</strong> ${project.name}</li>
                <li><strong>Description:</strong> ${project.description || 'No description'}</li>
            </ul>
            <p>Join the project: <a href="${joinLink}">Click here</a></p>
        `
    }),

    passwordReset: (resetUrl: string) => ({
        subject: 'Reset Your TaskWave Password',
        html: `
            <h1>Reset Your Password</h1>
                <p>Click the link below to reset your password:</p>
                <a href="${resetUrl}">${resetUrl}</a>
                <p>If you didn't request this, you can safely ignore this email.</p>
        `
    }),

    emailVerification: (verificationToken: string) => ({
        subject: 'Verify Your TaskWave Email',
        html: `
            <h2>Email Verification</h2>
            <p><a href="${process.env.APP_URL!}/auth/verify-email/${verificationToken}">Verify Email</a></p>
        `
    }),

    passwordResetConfirm: ()=>({
        subject: 'Password Reset Successful',
        html:`
                <h1>Password Reset Successful</h1>
                <p>Your password has been successfully reset.</p>
                <p>If you didn't make this change, please contact support immediately.</p>
        `
    })
};