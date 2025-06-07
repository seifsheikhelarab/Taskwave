import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as TwitterStrategy } from 'passport-twitter';
import { User } from '../models/user.model.js';
import { logger } from './logger.config.js';

export function configurePassport() {
    passport.serializeUser((user: any, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id: string, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (error) {
            done(error, null);
        }
    });

    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: `${process.env.BASE_URL}/auth/google/callback`,
        scope: ['profile', 'email']
    }, async (accessToken: string, refreshToken: string, profile: any, done: (error: Error | null, user?: any) => void) => {
        try {
            const user = await User.findOne({ 
                oauthProvider: 'google',
                oauthId: profile.id 
            });

            if (user) {
                return done(null, user);
            }

            // Check if user exists with same email
            const existingUser = await User.findOne({ 
                email: profile.emails?.[0]?.value 
            });

            if (existingUser) {
                existingUser.oauthProvider = 'google';
                existingUser.oauthId = profile.id;
                await existingUser.save();
                return done(null, existingUser);
            }

            // Create new user
            const newUser = await User.create({
                firstName: profile.name?.givenName || '',
                lastName: profile.name?.familyName || '',
                email: profile.emails?.[0]?.value,
                oauthProvider: 'google',
                oauthId: profile.id,
                avatar: profile.photos?.[0]?.value,
                isEmailVerified: true
            });

            return done(null, newUser);
        } catch (error) {
            logger.error('Google OAuth error:', error);
            return done(error as Error, undefined);
        }
    }));

    // Twitter OAuth Strategy
    passport.use(new TwitterStrategy({
        consumerKey: process.env.TWITTER_API_KEY!,
        consumerSecret: process.env.TWITTER_API_SECRET!,
        callbackURL: `${process.env.BASE_URL}/auth/twitter/callback`,
        proxy: true,
        includeEmail: true
    }, async (
        req: any,
        token: string,
        tokenSecret: string,
        profile: any,
        done: (error: Error | null, user?: any) => void
    ) => {
        try {
            // Check if user already exists
            let user = await User.findOne({ 
                oauthProvider: 'twitter',
                oauthId: profile.id 
            });

            if (user) {
                return done(null, user);
            }

            // Create new user
            const nameParts = profile.displayName.split(' ');
            user = await User.create({
                firstName: nameParts[0] || 'Twitter',
                lastName: nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'User',
                email: `${profile.username}@twitter.com`, // Twitter doesn't provide email
                oauthProvider: 'twitter',
                oauthId: profile.id,
                avatar: profile.photos?.[0]?.value,
                isEmailVerified: true
            });

            return done(null, user);
        } catch (error) {
            logger.error('Twitter OAuth error:', error);
            return done(error as Error);
        }
    }));
} 