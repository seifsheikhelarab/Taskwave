//Configuration for Pino-Pretty Logger
import dotenv from "dotenv";
dotenv.config();

const isDev = process.env.NODE_ENV !== 'production';

import {pino} from "pino";
export const logger = isDev
    ? pino({
    transport: {
        target: 'pino-pretty',
        options: {
            colorize: true,
            hideObjects: false
        }
    }
}) : {};