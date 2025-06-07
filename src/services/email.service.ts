import nodemailer from 'nodemailer';
import { logger } from '../config/logger.config.js';
import { mailConfig, emailTemplates } from '../config/mail.config.js';

class EmailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: mailConfig.host,
            port: mailConfig.port,
            secure: mailConfig.secure,
            auth: mailConfig.auth
        });

        // Verify connection configuration
        this.transporter.verify((error, success) => {
            if (error) {
                logger.error('SMTP connection error:', error);
            } else {
                logger.info('SMTP server is ready to take our messages');
            }
        });
    }

    async sendEmail(to: string, subject: string, html: string) {
        try {
            logger.info(`Preparing to send email to ${to} with subject: ${subject}`);
            const info = await this.transporter.sendMail({
                from: `"TaskWave" <${mailConfig.from}>`,
                to,
                subject,
                html
            });
            logger.info(`Email sent successfully to ${to} (Message ID: ${info.messageId})`);
            return info;
        } catch (error) {
            logger.error(`Failed to send email to ${to}:`, error);
            throw error;
        }
    }

    // Task assignment email
    async sendTaskAssignmentEmail(to: string, task: any, project: any) {
        logger.info(`Sending task assignment email to ${to} for task: ${task.title}`);
        const { subject, html } = emailTemplates.taskAssignment(task, project);
        return this.sendEmail(to, subject, html);
    }

    // Task status update email
    async sendTaskStatusUpdateEmail(to: string, task: any, project: any) {
        logger.info(`Sending task status update email to ${to} for task: ${task.title}`);
        const { subject, html } = emailTemplates.taskStatusUpdate(task, project);
        return this.sendEmail(to, subject, html);
    }

    // Project invitation email
    async sendProjectInvitationEmail(to: string, project: any, inviter: any, joinLink: string) {
        logger.info(`Sending project invitation email to ${to} for project: ${project.name}`);
        const { subject, html } = emailTemplates.projectInvitation(project, inviter, joinLink);
        return this.sendEmail(to, subject, html);
    }

    // Welcome email
    async sendWelcomeEmail(to: string, firstName: string) {
        logger.info(`Sending welcome email to ${to} (${firstName})`);
        const { subject, html } = emailTemplates.welcome(firstName);
        return this.sendEmail(to, subject, html);
    }

    // Password reset email
    async sendPasswordResetEmail(to: string, resetToken: string) {
        logger.info(`Sending password reset email to ${to}`);
        const { subject, html } = emailTemplates.passwordReset(resetToken);
        return this.sendEmail(to, subject, html);
    }

    // Email verification
    async sendEmailVerification(to: string, verificationToken: string) {
        logger.info(`Sending email verification to ${to}`);
        const { subject, html } = emailTemplates.emailVerification(verificationToken);
        return this.sendEmail(to, subject, html);
    }
}

export const emailService = new EmailService(); 