import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMembershipDto } from '@memberships/dto/create-membership.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Membership } from '@memberships/entities/membership.entity';
import { DeleteResult, Repository } from 'typeorm';
import { GroupsService } from '@groups/groups.service';
import { User } from '@users/entities/user.entity';

@Injectable()
export class MembershipsService {
  constructor(
    @InjectRepository(Membership)
    private readonly repository: Repository<Membership>,
    private readonly groupService: GroupsService,
  ) {}

  async create(
    createMembershipDto: CreateMembershipDto,
    user: User,
  ): Promise<Membership[]> {
    await this.groupService.findOne(createMembershipDto.group, user);

    const memberships = createMembershipDto.users.map((id) => ({
      group: { id: createMembershipDto.group },
      user: { id },
    }));

    return await this.repository.save(memberships);
  }

  async findAll(user: User): Promise<Membership[]> {
    return await this.repository.find({
      select: {
        id: true,
        createdAt: true,
        group: { name: true },
        user: { firstName: true, lastName: true },
      },
      where: this.userFilter(user),
      relations: { user: true, group: true },
    });
  }

  async findOne(id: string, user: User): Promise<Membership> {
    const membership = await this.repository.findOne({
      select: {
        id: true,
        createdAt: true,
        group: { name: true },
        user: { firstName: true, lastName: true },
      },
      where: { id, ...this.userFilter(user) },
      relations: { user: true, group: true },
    });

    if (!membership) throw new NotFoundException('Membership not found');

    return membership;
  }

  async remove(id: string, user: User): Promise<DeleteResult> {
    await this.findOne(id, user);

    return await this.repository.softDelete(id);
  }

  private userFilter(user: User) {
    return user.isAdmin ? {} : { group: { user: { id: user.id } } };
  }
}
