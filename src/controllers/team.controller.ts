import { Request, Response } from "express";
import { Types } from "mongoose";
import User, { IUser } from "../models/user.model.js";
import Project, { IProject, IProjectMember } from "../models/project.model.js";
import Invitation from "../models/invitation.model.js";
import { emailService } from "../services/email.service.js";
import { logger } from '../config/logger.config.js';
import crypto from 'crypto';

interface TeamMember {
    _id: Types.ObjectId;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
    role: string;
}

// Get team members
export async function teamGetController(req: Request, res: Response): Promise<void> {
    try {
        const userId = req.session.userId;

        // Get current user
        const currentUser = await User.findById(userId).select('firstName lastName email avatar').lean();
        if (!currentUser) {
            res.redirect('/auth/login');
            return;
        }

        // Get all users who are members of projects with the current user
        const projects = await Project.find({
            $or: [
                { createdBy: userId },
                { 'members.user': userId }
            ]
        }).select('members').lean();

        // If no projects found, return empty team
        if (!projects || projects.length === 0) {
            res.render("team/index", {
                team: [],
                currentUser
            });
            return;
        }

        const memberIds = new Set<Types.ObjectId>();
        projects.forEach(project => {
            project.members.forEach(member => {
                memberIds.add(new Types.ObjectId(member.user.toString()));
            });
        });

        const team = await User.find({
            _id: { $in: Array.from(memberIds) }
        })
        .select('firstName lastName email avatar')
        .lean();

        // Add role information
        const teamWithRoles: TeamMember[] = team.map(member => {
            const project = projects.find(p => 
                p.members.some(m => m.user.toString() === member._id.toString())
            );
            const role = project?.members.find(m => 
                m.user.toString() === member._id.toString()
            )?.role || 'member';

            return {
                _id: new Types.ObjectId(member._id.toString()),
                firstName: member.firstName,
                lastName: member.lastName,
                email: member.email,
                avatar: member.avatar,
                role
            };
        });

        res.render("team/index", {
            team: teamWithRoles,
            currentUser
        });
    } catch (error) {
        logger.error('Error fetching team:', error);
        res.status(500).render("error", {
            message: "An error occurred while fetching team members"
        });
    }
}

// Invite team member
export async function inviteTeamPostController(req: Request, res: Response): Promise<void> {
    try {
        const { email, role } = req.body;
        const userId = req.session.userId;


        // Get current user (inviter)
        const inviter = await User.findById(userId).select('firstName lastName email').lean();
        if (!inviter) {
            res.redirect('/auth/login');
            return;
        }

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            res.render("team/index", {
                errors: [{ msg: "User not found" }],
                oldInput: req.body
            });
            return;
        }

        // Add user to project
        const project = await Project.findOne({
            createdBy: userId
        });

        if (!project) {
            res.render("team/index", {
                errors: [{ msg: "Project not found" }],
                oldInput: req.body
            });
            return;
        }

        // Check if user is already a member
        if (project.members.some(m => m.user.toString() === user._id.toString())) {
            res.render("team/index", {
                errors: [{ msg: "User is already a team member" }],
                oldInput: req.body
            });
            return;
        }

        // Create invitation
        const token = crypto.randomBytes(32).toString('hex');
        await Invitation.create({
            project: project._id,
            email: user.email,
            role: role || 'member',
            token,
            invitedBy: userId,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });

        // Send invitation email
        const joinLink = `${process.env.BASE_URL}/projects/${project._id}/join/${token}`;
        await emailService.sendProjectInvitationEmail(user.email, project, inviter, joinLink);

        res.redirect('/team');
    } catch (error) {
        logger.error('Error inviting team member:', error);
        res.status(500).render("error", {
            message: "An error occurred while inviting team member"
        });
    }
}

// Remove team member
export async function removeTeamMemberPostController(req: Request, res: Response): Promise<void> {
    try {
        const { memberId } = req.params;
        const userId = req.session.userId;


        const project = await Project.findOne({
            createdBy: userId
        });

        if (!project) {
            res.status(404).render("error", {
                message: "Project not found"
            });
            return;
        }

        // Remove member from project
        project.members = project.members.filter(
            m => m.user.toString() !== memberId
        );

        await project.save();

        res.redirect('/team');
    } catch (error) {
        logger.error('Error removing team member:', error);
        res.status(500).render("error", {
            message: "An error occurred while removing team member"
        });
    }
}

// Change team member role
export async function changeRolePostController(req: Request, res: Response): Promise<void> {
    try {
        const { memberId, newRole } = req.body;
        const userId = req.session.userId;


        const project = await Project.findOne({
            createdBy: userId
        });

        if (!project) {
            res.status(404).render("error", {
                message: "Project not found"
            });
            return;
        }

        // Update member role
        const member = project.members.find(
            m => m.user.toString() === memberId
        );

        if (!member) {
            res.status(404).render("error", {
                message: "Team member not found"
            });
            return;
        }

        member.role = newRole as IProjectMember['role'];
        await project.save();

        res.redirect('/team');
    } catch (error) {
        logger.error('Error changing team member role:', error);
        res.status(500).render("error", {
            message: "An error occurred while changing team member role"
        });
    }
} 