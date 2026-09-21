import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository, UpdateResult } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Membership } from '@/memberships/entities/membership.entity';
import { UpdateMembershipDto } from '@/memberships/dto/update-membership.dto';

@Injectable()
export class MembershipsService {
  constructor(
    @InjectRepository(Membership)
    private readonly repository: Repository<Membership>,
  ) {}

  async findOne(id: string): Promise<Membership> {
    const membership = await this.repository.findOne({
      where: { id },
    });

    if (!membership) throw new NotFoundException('Membership not found');

    return membership;
  }

  async update(
    id: string,
    updateMembershipDto: UpdateMembershipDto,
  ): Promise<UpdateResult> {
    await this.findOne(id);

    return await this.repository.update(id, {
      budget: updateMembershipDto.budget?.toString() ?? null,
    });
  }
}
