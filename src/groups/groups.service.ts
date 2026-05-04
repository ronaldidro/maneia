import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateGroupDto } from '@groups/dto/create-group.dto';
import { UpdateGroupDto } from '@groups/dto/update-group.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Group } from '@groups/entities/group.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group)
    private repository: Repository<Group>,
  ) {}

  async create(createGroupDto: CreateGroupDto, userId: string): Promise<Group> {
    return await this.repository.save({
      ...createGroupDto,
      user: { id: userId },
    });
  }

  async findAll(userId: string): Promise<Group[]> {
    return await this.repository.find({ where: { user: { id: userId } } });
  }

  async findOne(id: string, userId: string): Promise<Group | null> {
    const group = await this.repository.findOneBy({ id, user: { id: userId } });
    if (!group) throw new NotFoundException('Group not found');
    return group;
  }

  async update(
    id: string,
    updateGroupDto: UpdateGroupDto,
    userId: string,
  ): Promise<UpdateResult> {
    return await this.repository.update(
      { id, user: { id: userId } },
      updateGroupDto,
    );
  }

  async remove(id: string, userId: string): Promise<DeleteResult> {
    return await this.repository.softDelete({ id, user: { id: userId } });
  }
}
