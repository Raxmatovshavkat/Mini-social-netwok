// src/express.d.ts

import { User } from './user/entities/user.entity';

declare global {
  namespace Express {
    interface Request {
      user?: User; // Make sure this matches your application's User type
    }
  }
}
