import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateGroupDto } from '@groups/dto/create-group.dto';
import { UpdateGroupDto } from '@groups/dto/update-group.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Group } from '@groups/entities/group.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { User } from '@users/entities/user.entity';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group)
    private readonly repository: Repository<Group>,
  ) {}

  async create(createGroupDto: CreateGroupDto, userId: string): Promise<Group> {
    return await this.repository.save({
      ...createGroupDto,
      user: { id: userId },
    });
  }

  async findAll(user: User): Promise<Group[]> {
    const builder = this.repository
      .createQueryBuilder('group')
      .select(['group.id', 'group.name', 'group.createdAt'])
      .leftJoin('group.user', 'owner')
      .addSelect(['owner.firstName', 'owner.lastName'])
      .loadRelationCountAndMap('group.members', 'group.memberships');

    if (!user.isAdmin) builder.where('owner.id = :userId', { userId: user.id });

    return await builder.getMany();
  }

  async findOne(id: string, user: User): Promise<Group> {
    const builder = this.repository
      .createQueryBuilder('group')
      .select(['group.id', 'group.name'])
      .leftJoin('group.memberships', 'membership')
      .addSelect(['membership.id'])
      .leftJoin('membership.user', 'member')
      .addSelect(['member.id', 'member.firstName', 'member.lastName'])
      .where('group.id = :id', { id });

    if (!user.isAdmin)
      builder.andWhere('group.user_id = :userId', { userId: user.id });

    const group = await builder.getOne();

    if (!group) throw new NotFoundException('Group not found');

    return group;
  }

  async update(
    id: string,
    updateGroupDto: UpdateGroupDto,
    user: User,
  ): Promise<UpdateResult> {
    await this.findOne(id, user);

    return await this.repository.update(
      { id, ...this.userFilter(user) },
      updateGroupDto,
    );
  }

  async remove(id: string, user: User): Promise<DeleteResult> {
    await this.findOne(id, user);

    return await this.repository.softDelete({ id, ...this.userFilter(user) });
  }

  private userFilter(user: User) {
    return user.isAdmin ? {} : { user: { id: user.id } };
  }
}
