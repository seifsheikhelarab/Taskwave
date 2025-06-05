import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as TwitterStrategy } from 'passport-twitter';
import User from '../models/user.model.js';

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

// Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: "/auth/google/callback",
    proxy: true
}, async (
    accessToken: string,
    refreshToken: string,
    profile: OAuthProfile,
    done: (error: Error | null, user?: any) => void
) => {
    try {
        // Check if user already exists
        let user = await User.findOne({ 
            oauthProvider: 'google',
            oauthId: profile.id 
        });

        if (user) {
            return done(null, user);
        }

        // Check if user exists with same email
        user = await User.findOne({ email: profile.emails![0].value });

        if (user) {
            // Link Google account to existing user
            user.oauthProvider = 'google';
            user.oauthId = profile.id;
            await user.save();
            return done(null, user);
        }

        // Create new user
        user = await User.create({
            firstName: profile.name?.givenName || '',
            lastName: profile.name?.familyName || '',
            email: profile.emails![0].value,
            oauthProvider: 'google',
            oauthId: profile.id,
            avatar: profile.photos?.[0]?.value
        });

        return done(null, user);
    } catch (error) {
        return done(error as Error);
    }
}));

// Twitter OAuth Strategy
passport.use(new TwitterStrategy({
    consumerKey: process.env.TWITTER_API_KEY!,
    consumerSecret: process.env.TWITTER_API_SECRET!,
    callbackURL: "/auth/twitter/callback",
    proxy: true
}, async (
    token: string,
    tokenSecret: string,
    profile: OAuthProfile,
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
        user = await User.create({
            firstName: profile.displayName.split(' ')[0] || '',
            lastName: profile.displayName.split(' ').slice(1).join(' ') || '',
            email: `${profile.username}@twitter.com`, // Twitter doesn't provide email
            oauthProvider: 'twitter',
            oauthId: profile.id,
            avatar: profile.photos?.[0]?.value
        });

        return done(null, user);
    } catch (error) {
        return done(error as Error);
    }
}));

// Serialize user
passport.serializeUser((user: any, done: (err: any, id?: string) => void) => {
    done(null, user.id);
});

// Deserialize user
passport.deserializeUser(async (id: string, done: (err: any, user?: any) => void) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error);
    }
});

export default passport; 