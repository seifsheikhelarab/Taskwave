import { User } from '../models/user.model.js';
import { logger } from '../config/logger.config.js';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

interface OAuthProfile {
    id: string;
    displayName: string;
    name?: {
        givenName?: string;
        familyName?: string;
    };
    emails?: Array<{ value: string }>;
    photos?: Array<{ value: string }>;
}

class OAuthService {
    constructor() {
        if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_REDIRECT_URI) {
            throw new Error('Missing required Google OAuth environment variables');
        }
    }

    async downloadAndSaveAvatar(url: string, filename: string): Promise<string | null> {
        try {
            const avatarDir = path.join(process.cwd(), 'public', 'avatars');
            const avatarPath = path.join(avatarDir, filename);

            fs.mkdirSync(avatarDir, { recursive: true });
            const response = await axios.get(url, { responseType: 'arraybuffer' });
            fs.writeFileSync(avatarPath, Buffer.from(response.data as Buffer));

            return `/avatars/${filename}`;
        } catch (error) {
            logger.error('Failed to download avatar:', error);
            return null;
        }
    }

    async findOrCreateUser(profile: OAuthProfile, provider: 'google') {
        try {
            let user = await User.findOne({
                oauthProvider: provider,
                oauthId: profile.id
            });

            if (user) return user;

            if (profile.emails?.[0]?.value) {
                user = await User.findOne({ email: profile.emails[0].value });

                if (user) {
                    user.oauthProvider = provider;
                    user.oauthId = profile.id;
                    await user.save();
                    return user;
                }
            }

            let avatar = null;
            const avatarUrl = profile.photos?.[0]?.value;
            if (avatarUrl) {
                const filename = `${profile.id}-avatar.jpg`;
                avatar = await this.downloadAndSaveAvatar(avatarUrl, filename);
            }

            const userData = {
                oauthProvider: provider,
                oauthId: profile.id,
                avatar,
                firstName: profile.name?.givenName || '',
                lastName: profile.name?.familyName || '',
                email: profile.emails![0].value,
                isEmailVerified: true
            };

            user = await User.create(userData);
            return user;
        } catch (error) {
            logger.error('Error finding/creating user:', error);
            throw error;
        }
    }
}

export const oauthService = new OAuthService();
