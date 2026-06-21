import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { UsersService } from '@/users/users.service';
import { CreateUserDto } from '@/users/dto/create-user.dto';
import { UpdateUserDto } from '@/users/dto/update-user.dto';
import { UsersQueryDto } from '@/users/dto/users-query.dto';
import { UpdatePasswordDto } from '@/users/dto/update-password.dto';
import { Roles } from '@/decorator/roles.decorator';
import { Role } from '@/common/enum/role.enum';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from '@/decorator/user.decorator';
import { User } from '@/users/entities/user.entity';

@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles(Role.Admin)
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll(@Query() usersQuery: UsersQueryDto) {
    return this.usersService.findAll(usersQuery);
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.usersService.findOne(id);
  }

  @Patch('password')
  updatePassword(
    @Body() updatePasswordDto: UpdatePasswordDto,
    @CurrentUser() currentUser: User,
  ) {
    return this.usersService.updatePassword(updatePasswordDto, currentUser);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: User,
  ) {
    return this.usersService.update(id, updateUserDto, currentUser);
  }

  @Roles(Role.Admin)
  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.usersService.remove(id);
  }
}
