import mongoose, { Schema, Document, Model } from 'mongoose';


interface IProject extends Document {
settings: {
taskPrefix: string;
};
}

interface IUser extends Document {
    _id: mongoose.Types.ObjectId;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
}


interface IAttachment {
    url: string;
    name: string;
    type: string;
    size: number;
    uploadedBy?: mongoose.Types.ObjectId | IUser;
    uploadedAt: Date;
}

export interface ITask extends Document {
    title: string;
    description?: string;
    project: mongoose.Types.ObjectId | IProject;
    status: 'todo' | 'inProgress' | 'done' | 'backlog' | 'blocked';
    priority: 'low' | 'medium' | 'high' | 'critical';
    dueDate?: Date;
    assignees: (mongoose.Types.ObjectId | IUser)[];
    createdBy: mongoose.Types.ObjectId | IUser;
    labels: string[];
    attachments: IAttachment[];
    taskNumber: number;
    isComplete: boolean;
    completedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    isAssigned(userId: mongoose.Types.ObjectId): boolean;
    taskId?: string;
}

interface ITaskModel extends Model<ITask> {}

function isPopulatedUser(obj: any): obj is IUser {
    return obj && typeof obj === 'object' && '_id' in obj;
}

// --- Schema ---

const taskSchema: Schema<ITask, ITaskModel> = new Schema({
title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [200, 'Task title cannot be more than 200 characters']
},
description: {
    type: String,
    trim: true
},
project: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true
},
status: {
    type: String,
    enum: ['todo', 'inProgress', 'done', 'backlog', 'blocked'],
    default: 'todo'
},
priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
},
dueDate: Date,
assignees: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
}],
createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
},
labels: [{
    type: String,
    trim: true
}],
attachments: [{
    url: String,
    name: String,
    type: String,
    size: Number,
    uploadedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    uploadedAt: {
        type: Date,
        default: Date.now
    }
}],
taskNumber: {
    type: Number,
    required: true
},
isComplete: {
    type: Boolean,
    default: false
},
completedAt: Date
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});


taskSchema.index({ project: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ assignees: 1 });
taskSchema.index({ createdBy: 1 });
taskSchema.index({ isComplete: 1 });



taskSchema.pre<ITask>('save', async function (next) {
if (this.isNew && !this.taskNumber) {
    const Project = mongoose.model<IProject>('Project');
    const Task = mongoose.model<ITask>('Task');

    const project = await Project.findById(this.project);

    if (project) {
        const count = await Task.countDocuments({ project: this.project });
        this.taskNumber = count + 1;
        this.taskId = `${project.settings.taskPrefix}-${this.taskNumber}`;
    } else {
        console.warn(`Project with ID ${this.project} not found for task.`);
    }
}
next();
});

taskSchema.pre<mongoose.Query<ITask[], ITask>>(/^find/, function (next) {
this.populate({
    path: 'createdBy',
    select: 'firstName lastName email avatar'
}).populate({
    path: 'assignees',
    select: 'firstName lastName email avatar'
});
next();
});

taskSchema.methods.isAssigned = function (this: ITask, userId: mongoose.Types.ObjectId): boolean {
return this.assignees.some(assignee => {
    if (assignee instanceof mongoose.Types.ObjectId) {
        return assignee.equals(userId);
    } else if (isPopulatedUser(assignee)) {
        return assignee._id.equals(userId);
    }
    return false;
});
};

const Task = mongoose.model<ITask, ITaskModel>('Task', taskSchema);
export default Task;
