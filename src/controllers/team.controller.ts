import { Request, Response } from "express";
import User from "../models/user.model.js";
import Project from "../models/project.model.js";
import { Types } from "mongoose";

// Get team members
export async function teamGetController(req: Request, res: Response) {
    try {
        const userId = req.session.userId;
        if (!userId) {
            return res.redirect('/auth/login');
        }

        // Get all users who are members of projects with the current user
        const projects = await Project.find({
            $or: [
                { createdBy: userId },
                { 'members.user': userId }
            ]
        }).select('members');

        const memberIds = new Set<Types.ObjectId>();
        projects.forEach(project => {
            project.members.forEach(member => {
                memberIds.add(member.user);
            });
        });

        const team = await User.find({
            _id: { $in: Array.from(memberIds) }
        })
        .select('firstName lastName email avatar')
        .lean();

        // Add role information
        const teamWithRoles = team.map(member => {
            const project = projects.find(p => 
                p.members.some(m => m.user.toString() === member._id.toString())
            );
            const role = project?.members.find(m => 
                m.user.toString() === member._id.toString()
            )?.role || 'member';

            return {
                ...member,
                role
            };
        });

        res.render("team/index", {
            team: teamWithRoles,
            currentUser: res.locals.user
        });
    } catch (error) {
        console.error('Error fetching team:', error);
        res.status(500).render("error", {
            message: "An error occurred while fetching team members"
        });
    }
}

// Invite team member
export async function inviteTeamPostController(req: Request, res: Response) {
    try {
        const { email, role } = req.body;
        const userId = req.session.userId;

        if (!userId) {
            return res.redirect('/auth/login');
        }

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.render("team/index", {
                errors: [{ msg: "User not found" }],
                oldInput: req.body
            });
        }

        // Add user to project
        const project = await Project.findOne({
            createdBy: userId
        });

        if (!project) {
            return res.render("team/index", {
                errors: [{ msg: "Project not found" }],
                oldInput: req.body
            });
        }

        // Check if user is already a member
        if (project.members.some(m => m.user.toString() === user._id.toString())) {
            return res.render("team/index", {
                errors: [{ msg: "User is already a team member" }],
                oldInput: req.body
            });
        }

        project.members.push({
            user: user._id,
            role: role || 'member'
        });

        await project.save();

        res.redirect('/team');
    } catch (error) {
        console.error('Error inviting team member:', error);
        res.status(500).render("error", {
            message: "An error occurred while inviting team member"
        });
    }
}

// Remove team member
export async function removeTeamMemberPostController(req: Request, res: Response) {
    try {
        const { memberId } = req.params;
        const userId = req.session.userId;

        if (!userId) {
            return res.redirect('/auth/login');
        }

        const project = await Project.findOne({
            createdBy: userId
        });

        if (!project) {
            return res.status(404).render("error", {
                message: "Project not found"
            });
        }

        // Remove member from project
        project.members = project.members.filter(
            m => m.user.toString() !== memberId
        );

        await project.save();

        res.redirect('/team');
    } catch (error) {
        console.error('Error removing team member:', error);
        res.status(500).render("error", {
            message: "An error occurred while removing team member"
        });
    }
}

// Change team member role
export async function changeRolePostController(req: Request, res: Response) {
    try {
        const { memberId, newRole } = req.body;
        const userId = req.session.userId;

        if (!userId) {
            return res.redirect('/auth/login');
        }

        const project = await Project.findOne({
            createdBy: userId
        });

        if (!project) {
            return res.status(404).render("error", {
                message: "Project not found"
            });
        }

        // Update member role
        const member = project.members.find(
            m => m.user.toString() === memberId
        );

        if (!member) {
            return res.status(404).render("error", {
                message: "Team member not found"
            });
        }

        member.role = newRole;
        await project.save();

        res.redirect('/team');
    } catch (error) {
        console.error('Error changing team member role:', error);
        res.status(500).render("error", {
            message: "An error occurred while changing team member role"
        });
    }
} 