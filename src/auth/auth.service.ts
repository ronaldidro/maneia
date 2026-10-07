import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import {
  AbilityBuilder,
  createMongoAbility,
  ExtractSubjectType,
  InferSubjects,
  MongoAbility,
  MongoQuery,
} from '@casl/ability';
import { UsersService } from '@/users/users.service';
import { User } from '@/users/entities/user.entity';
import { Group } from '@/groups/entities/group.entity';
import { Action } from '@/common/enum/action.enum';

type Subjects = InferSubjects<typeof Group> | 'all';

export type AppAbility = MongoAbility<[Action, Subjects]>;

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signIn(email: string, pass: string): Promise<{ accessToken: string }> {
    const user = await this.usersService.findBy('email', email);

    if (!user) throw new UnauthorizedException();

    const isMatch = await bcrypt.compare(pass, user.password);

    if (!isMatch) throw new UnauthorizedException();

    return { accessToken: await this.jwtService.signAsync({ sub: user.id }) };
  }

  createAbility(user: User) {
    const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

    if (user.isAdmin) can(Action.Manage, 'all');
    else can(Action.Read, 'all');

    can(Action.Update, Group, { 'user.id': user.id } as MongoQuery);
    can(Action.Delete, Group, { 'user.id': user.id } as MongoQuery);

    return build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }
}
