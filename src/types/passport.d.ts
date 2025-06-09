import { IUser } from '../models/user.model.js';

declare global {
    namespace Express {
        interface User extends IUser {}
    }
}

declare module 'passport-google-oauth20' {
    import { Strategy as PassportStrategy } from 'passport';
    
    export interface Profile {
        id: string;
        displayName: string;
        name?: {
            familyName?: string;
            givenName?: string;
        };
        emails?: Array<{
            value: string;
            verified?: boolean;
        }>;
        photos?: Array<{
            value: string;
        }>;
    }

    export interface StrategyOptions {
        clientID: string;
        clientSecret: string;
        callbackURL: string;
        proxy?: boolean;
        scope?: string[];
        prompt?: string;
    }

    export class Strategy extends PassportStrategy {
        constructor(
            options: StrategyOptions,
            verify: (
                accessToken: string,
                refreshToken: string,
                profile: Profile,
                done: (error: any, user?: any) => void
            ) => void
        );
    }
} 