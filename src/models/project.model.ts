import mongoose, { Schema, Document, PopulatedDoc, Query, Types } from 'mongoose';

interface IUser {
    _id: Types.ObjectId;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
    role?: string;
}

export interface IProjectMember {
    user: PopulatedDoc<IUser, Types.ObjectId>;
    role: 'owner' | 'admin' | 'member' | 'guest';
    joinedAt: Date;
}

interface IProjectSettings {
    taskPrefix: string;
    defaultTaskStatus: 'todo' | 'inProgress' | 'done';
}

export interface IProject extends Document {
    name: string;
    description?: string;
    status: 'active' | 'on-hold' | 'completed' | 'archived';
    startDate?: Date;
    dueDate?: Date;
    createdBy: PopulatedDoc<IUser, Types.ObjectId>;
    members: IProjectMember[];
    settings: IProjectSettings;
    createdAt: Date;
    updatedAt: Date;

    tasks?: any[];

    isMember(userId: Types.ObjectId): boolean;
    getMemberRole(userId: Types.ObjectId): 'owner' | 'admin' | 'member' | 'guest' | null;
}

const projectSchema: Schema<IProject> = new Schema({
name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
    maxlength: [100, 'Project name cannot be more than 100 characters']
},
description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
},
status: {
    type: String,
    enum: ['active', 'on-hold', 'completed', 'archived'],
    default: 'active'
},
startDate: Date,
dueDate: Date,
createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
},
members: [{
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    role: {
        type: String,
        enum: ['owner', 'admin', 'member', 'guest'],
        default: 'member'
    },
    joinedAt: {
        type: Date,
        default: Date.now
    }
}],
settings: {
    taskPrefix: {
        type: String,
        default: 'TASK',
        uppercase: true,
        maxlength: 5
    },
    defaultTaskStatus: {
        type: String,
        enum: ['todo', 'inProgress', 'done'],
        default: 'todo'
    }
}
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

projectSchema.index({ name: 'text', description: 'text' });
projectSchema.index({ createdBy: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ dueDate: 1 });

projectSchema.virtual('tasks', {
    ref: 'Task',
    foreignField: 'project',
    localField: '_id'
});


projectSchema.pre<Query<IProject[], IProject>>(/^find/, function(next) {
this.populate({
    path: 'createdBy',
    select: 'firstName lastName email avatar'
}).populate({
    path: 'members.user',
    select: 'firstName lastName email avatar role'
});
next();
});

projectSchema.methods.isMember = function(this: IProject, userId: Types.ObjectId): boolean {
return this.members.some(member => member.user._id.equals(userId));
};

projectSchema.methods.getMemberRole = function(this: IProject, userId: Types.ObjectId): 'owner' | 'admin' | 'member' | 'guest' | null {
const member = this.members.find(m => m.user._id.equals(userId));
return member ? member.role : null;
};

export default mongoose.model<IProject>('Project', projectSchema);
