import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from '../models/user.model.js';
import { logger } from './logger.config.js';
import { oauthService } from '../services/oauth.service.js';

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
            const user = await oauthService.findOrCreateUser(profile, 'google');
            return done(null, user);
        } catch (error) {
            logger.error('Google OAuth error:', error);
            return done(error as Error, undefined);
        }
    }));
} 