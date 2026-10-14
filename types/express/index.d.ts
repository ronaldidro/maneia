import { User } from '@/users/entities/user.entity';
import 'multer';

declare global {
  namespace Express {
    interface Request {
      user: User;
    }
  }
}
