import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMembershipDto } from '@memberships/dto/create-membership.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Membership } from '@memberships/entities/membership.entity';
import { Repository } from 'typeorm';
import { GroupsService } from '@groups/groups.service';

@Injectable()
export class MembershipsService {
  constructor(
    @InjectRepository(Membership)
    private repository: Repository<Membership>,
    private readonly groupService: GroupsService,
  ) {}

  async create(createMembershipDto: CreateMembershipDto, userId: string) {
    await this.groupService.findOne(createMembershipDto.group, userId); // throw exception

    const memberships = createMembershipDto.users.map((id) => ({
      group: { id: createMembershipDto.group },
      user: { id },
    }));

    return await this.repository.save(memberships);
  }

  async findAll(userId: string) {
    return await this.repository.find({
      select: {
        group: { id: true, name: true },
        user: { id: true, firstName: true, lastName: true },
      },
      where: { group: { user: { id: userId } } },
      relations: { user: true, group: true },
    });
  }

  async findOne(id: string, userId: string) {
    const membership = await this.repository.findOneBy({
      id,
      group: { user: { id: userId } },
    });

    if (!membership) throw new NotFoundException('Membership not found');

    return membership;
  }

  async remove(id: string, userId: string) {
    const membership = await this.findOne(id, userId);
    return await this.repository.softDelete(membership.id);
  }
}
