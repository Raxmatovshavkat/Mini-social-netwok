// src/express.d.ts

import { User } from './user.entity'; // Adjust the path to your User entity

declare global {
    namespace Express {
        interface Request {
            user?: User;
        }
    }
}
