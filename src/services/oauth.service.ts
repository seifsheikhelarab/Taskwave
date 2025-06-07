import { User } from '../models/user.model.js';
import { logger } from '../config/logger.config.js';

interface OAuthProfile {
    id: string;
    displayName: string;
    name?: {
        givenName?: string;
        familyName?: string;
    };
    emails?: Array<{ value: string }>;
    photos?: Array<{ value: string }>;
    username?: string;
}

class OAuthService {
    constructor() {
        if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_REDIRECT_URI) {
            throw new Error('Missing required Google OAuth environment variables');
        }
    }

    async findOrCreateUser(profile: OAuthProfile, provider: 'google' | 'twitter') {
        try {
            // Check if user already exists with OAuth provider
            let user = await User.findOne({ 
                oauthProvider: provider,
                oauthId: profile.id 
            });

            if (user) {
                return user;
            }

            // For Google, check if user exists with same email
            if (provider === 'google' && profile.emails?.[0]?.value) {
                user = await User.findOne({ email: profile.emails[0].value });

                if (user) {
                    // Link OAuth account to existing user
                    user.oauthProvider = provider;
                    user.oauthId = profile.id;
                    await user.save();
                    return user;
                }
            }

            // Create new user
            const userData: any = {
                oauthProvider: provider,
                oauthId: profile.id,
                avatar: profile.photos?.[0]?.value
            };

            if (provider === 'google') {
                userData.firstName = profile.name?.givenName || '';
                userData.lastName = profile.name?.familyName || '';
                userData.email = profile.emails![0].value;
            } else if (provider === 'twitter') {
                const nameParts = profile.displayName.split(' ');
                userData.firstName = nameParts[0] || '';
                userData.lastName = nameParts.slice(1).join(' ') || '';
                userData.email = `${profile.username}@twitter.com`; // Twitter doesn't provide email
            }

            user = await User.create(userData);
            return user;
        } catch (error) {
            logger.error('Error finding/creating user:', error);
            throw error;
        }
    }
}

export const oauthService = new OAuthService(); 