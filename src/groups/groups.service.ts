import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateGroupDto } from '@/groups/dto/create-group.dto';
import { UpdateGroupDto } from '@/groups/dto/update-group.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Group } from '@/groups/entities/group.entity';
import { Membership } from '@/memberships/entities/membership.entity';
import { Repository } from 'typeorm';
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
    const { name, members } = createGroupDto;

    const memberships = this.membershipRepository.create(
      members.concat(userId).map((id) => ({ user: { id } })),
    );

    const group = this.repository.create({
      name,
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
      .addSelect(['membership.id', 'membership.budget'])
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
  ): Promise<Group> {
    const group = await this.findOne(id);

    this.checkOwner(group, user);

    const { name, members } = updateGroupDto;

    if (name) group.name = name;

    if (members) {
      group.memberships = members.concat(user.id).map((userId) => {
        const membership = group.memberships.find(
          (membership) => membership.user.id === userId,
        );

        if (membership) return membership;

        return this.membershipRepository.create({ user: { id: userId } });
      });
    }

    return await this.repository.save(group);
  }

  async remove(id: string, user: User): Promise<Group> {
    const group = await this.findOne(id);

    this.checkOwner(group, user);

    return await this.repository.softRemove(group); // softRemove apply soft deletes to entity and relations
  }

  private checkOwner(group: Group, user: User): void {
    if (group.user.id !== user.id)
      throw new ForbiddenException('Group invalid');
  }
}
