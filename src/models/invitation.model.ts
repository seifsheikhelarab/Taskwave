import mongoose, { Schema, Document, Types } from 'mongoose';
import crypto from 'crypto';

export interface IInvitation extends Document {
    project: Types.ObjectId;
    email: string;
    role: 'admin' | 'member' | 'guest';
    token: string;
    status: 'pending' | 'accepted' | 'rejected' | 'expired';
    invitedBy: Types.ObjectId;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

const invitationSchema = new Schema<IInvitation>({
    project: {
        type: Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true
    },
    role: {
        type: String,
        enum: ['admin', 'member', 'guest'],
        default: 'member'
    },
    token: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'expired'],
        default: 'pending'
    },
    invitedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    expiresAt: {
        type: Date,
        required: true,
        default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    }
}, {
    timestamps: true
});

// Generate invitation token
invitationSchema.pre('save', function(next) {
    if (!this.token) {
        this.token = crypto.randomBytes(32).toString('hex');
    }
    next();
});

// Indexes
invitationSchema.index({ token: 1 });
invitationSchema.index({ email: 1, project: 1 }, { unique: true });
invitationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<IInvitation>('Invitation', invitationSchema);
