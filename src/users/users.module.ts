import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from '@/users/users.service';
import { UsersController } from '@/users/users.controller';
import { User } from '@/users/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), forwardRef(() => AuthModule)],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
