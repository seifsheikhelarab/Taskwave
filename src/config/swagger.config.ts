//Configuration for Swagger to generate API documentation

import dotenv from "dotenv";
dotenv.config();

import { Application } from "express";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

export default function swaggerSetup(app: Application){
    const options = {
        definition: {
            openapi: '3.0.0',
            info: {
                title: 'Taskwave',
                version: '1.0.0',
                description: 'Team Project Management Application made using Node.js',
            },
            license: {
                name: 'Licensed Under MIT',
                url: 'https://spdx.org/licenses/MIT.html',
            },
            servers: [
                {
                    url: `${process.env.APP_URL}`,
                    description: 'Development localhost server',
                }
            ],
            components: {
                securitySchemes: {
                    sessionAuth: {
                        type: 'apiKey',
                        in: 'cookie',
                        name: 'connect.sid',
                        description: 'Session-based authentication using cookies'
                    }
                },
                responses: {
                    UnauthorizedError: {
                        description: 'Access token is missing or invalid',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        error: {
                                            type: 'string',
                                            example: 'Authentication required'
                                        }
                                    }
                                }
                            }
                        }
                    },
                    ForbiddenError: {
                        description: 'User does not have permission to access this resource',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        error: {
                                            type: 'string',
                                            example: 'Access denied'
                                        }
                                    }
                                }
                            }
                        }
                    },
                    NotFoundError: {
                        description: 'The requested resource was not found',
                        content: {
                            'text/html': {
                                schema: {
                                    type: 'string',
                                    description: '404 error page'
                                }
                            }
                        }
                    },
                    RateLimitError: {
                        description: 'Too many requests',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        error: {
                                            type: 'string',
                                            example: 'Too many requests'
                                        }
                                    }
                                }
                            }
                        }
                    },
                    ServerError: {
                        description: 'Internal server error',
                        content: {
                            'text/html': {
                                schema: {
                                    type: 'string',
                                    description: 'Error page'
                                }
                            }
                        }
                    }
                },
                schemas: {
                    User: {
                        type: 'object',
                        properties: {
                            _id: {
                                type: 'string',
                                example: '507f1f77bcf86cd799439011'
                            },
                            firstName: {
                                type: 'string',
                                example: 'John'
                            },
                            lastName: {
                                type: 'string',
                                example: 'Doe'
                            },
                            email: {
                                type: 'string',
                                format: 'email',
                                example: 'john.doe@example.com'
                            },
                            avatar: {
                                type: 'string',
                                example: 'https://example.com/avatars/john.jpg'
                            },
                            bio: {
                                type: 'string',
                                example: 'Software developer passionate about building great products'
                            }
                        }
                    },
                    Project: {
                        type: 'object',
                        properties: {
                            _id: {
                                type: 'string',
                                example: '507f1f77bcf86cd799439011'
                            },
                            name: {
                                type: 'string',
                                example: 'TaskWave Mobile App'
                            },
                            description: {
                                type: 'string',
                                example: 'A mobile application for task management'
                            },
                            status: {
                                type: 'string',
                                enum: ['active', 'completed', 'on-hold', 'cancelled'],
                                example: 'active'
                            },
                            visibility: {
                                type: 'string',
                                enum: ['public', 'private'],
                                example: 'public'
                            },
                            createdBy: {
                                type: 'string',
                                example: '507f1f77bcf86cd799439011'
                            },
                            members: {
                                type: 'array',
                                items: {
                                    $ref: '#/components/schemas/ProjectMember'
                                }
                            },
                            startDate: {
                                type: 'string',
                                format: 'date',
                                example: '2024-01-15'
                            },
                            dueDate: {
                                type: 'string',
                                format: 'date',
                                example: '2024-06-30'
                            }
                        }
                    },
                    ProjectMember: {
                        type: 'object',
                        properties: {
                            user: {
                                type: 'string',
                                example: '507f1f77bcf86cd799439011'
                            },
                            role: {
                                type: 'string',
                                enum: ['owner', 'admin', 'member'],
                                example: 'member'
                            },
                            joinedAt: {
                                type: 'string',
                                format: 'date-time',
                                example: '2024-01-15T10:30:00Z'
                            }
                        }
                    },
                    Task: {
                        type: 'object',
                        properties: {
                            _id: {
                                type: 'string',
                                example: '507f1f77bcf86cd799439014'
                            },
                            title: {
                                type: 'string',
                                example: 'Fix login bug'
                            },
                            description: {
                                type: 'string',
                                example: 'Users are unable to log in with valid credentials'
                            },
                            status: {
                                type: 'string',
                                enum: ['todo', 'inProgress', 'done', 'backlog', 'blocked'],
                                example: 'todo'
                            },
                            priority: {
                                type: 'string',
                                enum: ['low', 'medium', 'high'],
                                example: 'high'
                            },
                            dueDate: {
                                type: 'string',
                                format: 'date',
                                example: '2024-02-15'
                            },
                            project: {
                                type: 'string',
                                example: '507f1f77bcf86cd799439011'
                            },
                            createdBy: {
                                type: 'string',
                                example: '507f1f77bcf86cd799439011'
                            },
                            assignees: {
                                type: 'array',
                                items: {
                                    type: 'string'
                                },
                                example: ['507f1f77bcf86cd799439012', '507f1f77bcf86cd799439013']
                            },
                            isComplete: {
                                type: 'boolean',
                                example: false
                            },
                            completedAt: {
                                type: 'string',
                                format: 'date-time',
                                example: '2024-02-15T14:30:00Z'
                            },
                            taskNumber: {
                                type: 'number',
                                example: 1
                            },
                            taskId: {
                                type: 'string',
                                example: 'TASK-1'
                            }
                        }
                    },
                    TeamMember: {
                        type: 'object',
                        properties: {
                            _id: {
                                type: 'string',
                                example: '507f1f77bcf86cd799439011'
                            },
                            firstName: {
                                type: 'string',
                                example: 'John'
                            },
                            lastName: {
                                type: 'string',
                                example: 'Doe'
                            },
                            email: {
                                type: 'string',
                                format: 'email',
                                example: 'john.doe@example.com'
                            },
                            avatar: {
                                type: 'string',
                                example: 'https://example.com/avatars/john.jpg'
                            },
                            role: {
                                type: 'string',
                                enum: ['owner', 'admin', 'member'],
                                example: 'member'
                            }
                        }
                    },
                    Invitation: {
                        type: 'object',
                        properties: {
                            _id: {
                                type: 'string',
                                example: '507f1f77bcf86cd799439015'
                            },
                            project: {
                                type: 'string',
                                example: '507f1f77bcf86cd799439011'
                            },
                            email: {
                                type: 'string',
                                format: 'email',
                                example: 'john.doe@example.com'
                            },
                            role: {
                                type: 'string',
                                enum: ['member', 'admin'],
                                example: 'member'
                            },
                            token: {
                                type: 'string',
                                example: 'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456'
                            },
                            invitedBy: {
                                type: 'string',
                                example: '507f1f77bcf86cd799439011'
                            },
                            status: {
                                type: 'string',
                                enum: ['pending', 'accepted', 'expired'],
                                example: 'pending'
                            },
                            expiresAt: {
                                type: 'string',
                                format: 'date-time',
                                example: '2024-01-22T10:30:00Z'
                            }
                        }
                    }
                }
            }
        },
        apis: ['./src/**/*.ts'],
        //,'./dist/**/*.js' too
};

    const specs = swaggerJSDoc(options)
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs));
}