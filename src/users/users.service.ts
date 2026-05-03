import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from '@users/dto/create-user.dto';
import { UpdateUserDto } from '@users/dto/update-user.dto';
import { User } from '@users/entities/user.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private repository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.repository.create(createUserDto);
    const salt = await bcrypt.genSalt();

    user.password = await bcrypt.hash(createUserDto.password, salt);

    return await this.repository.save(user);
  }

  async findAll(): Promise<User[]> {
    return await this.repository.find();
  }

  async findOne(id: string): Promise<User | null> {
    return await this.repository.findOneBy({ id });
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
  ): Promise<UpdateResult> {
    return await this.repository.update(id, updateUserDto);
  }

  async remove(id: string): Promise<DeleteResult> {
    return await this.repository.softDelete(id);
  }
}
