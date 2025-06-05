import mongoose, { Document, Model, Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

export interface IUser extends Document {
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
    passwordChangedAt?: Date;
    passwordResetToken?: string;
    passwordResetExpires?: Date;
    role: 'admin' | 'member' | 'guest';
    avatar: string;
    isActive: boolean;
    oauthProvider?: 'google' | 'twitter' | null;
    oauthId?: string;
    lastActive?: Date;
    createdAt: Date;
    updatedAt: Date;

    fullName: string;

    correctPassword(candidatePassword: string): Promise<boolean>;
    changedPasswordAfter(JWTTimestamp: number): boolean;
    createPasswordResetToken(): string;
}

export interface IUserModel extends Model<IUser> {
}

const userSchema = new Schema<IUser, IUserModel>({
firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot be more than 50 characters']
},
lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot be more than 50 characters']
},
email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
},
password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
},
passwordChangedAt: Date,
passwordResetToken: String,
passwordResetExpires: Date,
role: {
    type: String,
    enum: ['admin', 'member', 'guest'],
    default: 'member'
},
avatar: {
    type: String,
    default: 'default.jpg'
},
isActive: {
    type: Boolean,
    default: true,
    select: false
},
oauthProvider: {
    type: String,
    enum: ['google', 'github', null],
    default: null
},
oauthId: String,
lastActive: Date
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

userSchema.index({ email: 1 });
userSchema.index({ oauthProvider: 1, oauthId: 1 });

userSchema.virtual('fullName').get(function(this: IUser) {
    return `${this.firstName} ${this.lastName}`;
});

userSchema.pre<IUser>('save', async function(next) {
    if (!this.isModified('password') || !this.password) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

userSchema.pre<IUser>('save', function(next) {
    if (!this.isModified('password') || this.isNew || !this.password) return next();
    this.passwordChangedAt = new Date(Date.now() - 1000);
    next();
});

userSchema.methods.correctPassword = async function(
    this: IUser,
    candidatePassword: string
): Promise<boolean> {
if (!this.password) {
    return false;
}
    return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.changedPasswordAfter = function(
    this: IUser,
    JWTTimestamp: number
): boolean {
    if (this.passwordChangedAt) {
    const changedTimestamp = Math.floor(this.passwordChangedAt.getTime() / 1000);
    return JWTTimestamp < changedTimestamp;
}
    return false;
};

userSchema.methods.createPasswordResetToken = function(this: IUser): string {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);

    return resetToken;
};

const User = mongoose.model<IUser, IUserModel>('User', userSchema);

export default User;
