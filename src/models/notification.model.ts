import mongoose, { Schema, Document, Model, Query } from 'mongoose';

export interface INotification extends Document {
type: 'task_assigned' | 'task_due' | 'task_completed' |
    'project_invite' | 'mention' | 'status_change';
recipient: mongoose.Types.ObjectId;
sender?: mongoose.Types.ObjectId;
project?: mongoose.Types.ObjectId;
task?: mongoose.Types.ObjectId;
message: string;
isRead: boolean;
readAt?: Date;
metadata?: any;
createdAt: Date;
updatedAt: Date;
}

const notificationSchema = new Schema<INotification>({
type: {
    type: String,
    required: true,
    enum: [
        'task_assigned', 'task_due', 'task_completed',
        'project_invite', 'mention', 'status_change'
    ]
},
recipient: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
},
sender: {
    type: Schema.Types.ObjectId,
    ref: 'User'
},
project: {
    type: Schema.Types.ObjectId,
    ref: 'Project'
},
task: {
    type: Schema.Types.ObjectId,
    ref: 'Task'
},
message: {
    type: String,
    required: true
},
isRead: {
    type: Boolean,
    default: false
},
readAt: Date,
metadata: Schema.Types.Mixed
}, {
timestamps: true,
toJSON: { virtuals: true },
toObject: { virtuals: true }
});

notificationSchema.index({ recipient: 1 });
notificationSchema.index({ isRead: 1 });
notificationSchema.index({ createdAt: -1 });

notificationSchema.pre(/^find/, function (next) {
const query = this as Query<INotification[], INotification>;
query
    .populate({
        path: 'sender',
        select: 'firstName lastName email avatar'
    })
    .populate({
        path: 'project',
        select: 'name'
    })
    .populate({
        path: 'task',
        select: 'title taskId'
    });
    next();
});

const Notification: Model<INotification> = mongoose.model<INotification>('Notification', notificationSchema);
export default Notification;