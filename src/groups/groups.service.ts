import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateGroupDto } from '@/groups/dto/create-group.dto';
import { UpdateGroupDto } from '@/groups/dto/update-group.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Group } from '@/groups/entities/group.entity';
import { Membership } from '@/memberships/entities/membership.entity';
import { Repository, UpdateResult } from 'typeorm';
import { User } from '@/users/entities/user.entity';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group)
    private readonly repository: Repository<Group>,

    @InjectRepository(Membership)
    private readonly membershipRepository: Repository<Membership>,
  ) {}

  async create(createGroupDto: CreateGroupDto, userId: string): Promise<Group> {
    const memberships = this.membershipRepository.create(
      createGroupDto.members.concat(userId).map((id) => ({
        user: { id },
      })),
    );

    const group = this.repository.create({
      name: createGroupDto.name,
      user: { id: userId },
      memberships,
    });

    return await this.repository.save(group);
  }

  async findAll(user: User): Promise<Group[]> {
    const builder = this.repository
      .createQueryBuilder('group')
      .select(['group.id', 'group.name', 'group.createdAt'])
      .leftJoin('group.user', 'owner')
      .addSelect(['owner.id', 'owner.firstName', 'owner.lastName'])
      .leftJoin('group.memberships', 'membership')
      .addSelect(['membership.id'])
      .leftJoin('membership.user', 'member')
      .addSelect(['member.id', 'member.firstName', 'member.lastName'])
      .loadRelationCountAndMap('group.members', 'group.memberships');

    if (!user.isAdmin)
      builder
        .where((qb) => {
          const sq = qb
            .subQuery()
            .select('membership.group')
            .from('memberships', 'membership')
            .where('membership.user = :userId')
            .getQuery();
          return `group.id IN ${sq}`;
        })
        .setParameter('userId', user.id);

    return await builder.getMany();
  }

  async findOne(id: string): Promise<Group> {
    const builder = this.repository
      .createQueryBuilder('group')
      .select(['group.id', 'group.name'])
      .leftJoin('group.user', 'owner')
      .addSelect(['owner.id', 'owner.firstName', 'owner.lastName'])
      .leftJoin('group.memberships', 'membership')
      .addSelect(['membership.id'])
      .leftJoin('membership.user', 'member')
      .addSelect(['member.id', 'member.firstName', 'member.lastName'])
      .where('group.id = :id', { id });

    const group = await builder.getOne();

    if (!group) throw new NotFoundException('Group not found');

    return group;
  }

  async update(
    id: string,
    updateGroupDto: UpdateGroupDto,
    user: User,
  ): Promise<UpdateResult> {
    await this.findOne(id);

    if (!updateGroupDto.members)
      throw new NotFoundException('Members not found');

    await this.membershipRepository.delete({ group: { id } });

    await this.membershipRepository.save(
      updateGroupDto.members.concat(user.id).map((userId) => ({
        user: { id: userId },
        group: { id },
      })),
    );

    return await this.repository.update({ id }, { name: updateGroupDto.name });
  }

  async remove(id: string): Promise<Group> {
    const group = await this.findOne(id);
    return await this.repository.softRemove(group); // softRemove apply soft deletes to group and relations
  }
}
