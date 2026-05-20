import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from '@/users/dto/create-user.dto';
import { UpdateUserDto } from '@/users/dto/update-user.dto';
import { User } from '@/users/entities/user.entity';
import { DeleteResult, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private repository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.repository.create(createUserDto);

    user.password = await this.hashedPassword(createUserDto.password);

    return await this.repository.save(user);
  }

  async findAll(): Promise<User[]> {
    return await this.repository.find({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
      },
    });
  }

  async findOne(id: string): Promise<User | null> {
    return await this.repository.findOne({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
      },
      where: { id },
    });
  }

  async findBy(key: keyof User, value: string): Promise<User | null> {
    return await this.repository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where({ [key]: value })
      .getOne();
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    currentUser: User,
  ): Promise<User> {
    if (!currentUser.isAdmin && id !== currentUser.id)
      throw new ForbiddenException('Account invalid');

    const user = await this.repository.preload({ id, ...updateUserDto });

    if (!user) throw new NotFoundException('User not found');

    if (updateUserDto.password)
      user.password = await this.hashedPassword(updateUserDto.password);

    return await this.repository.save(user);
  }

  async remove(id: string): Promise<DeleteResult> {
    return await this.repository.softDelete(id);
  }

  private async hashedPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return await bcrypt.hash(password, salt);
  }
}
