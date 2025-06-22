//Configuration for Pino-Pretty Logger

import {pino} from "pino";
export const logger = pino({
    transport: {
        target: 'pino-pretty',
        options: {
            colorize: true,
            hideObjects: false
        }
    }
})