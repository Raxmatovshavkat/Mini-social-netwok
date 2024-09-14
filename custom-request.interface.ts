// custom-request.interface.ts
import { Request } from 'express';
import { User } from 'src/user/entities/user.entity';

export interface CustomRequest extends Request {
    user: User;
}
