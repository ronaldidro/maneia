import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { ExpensesService } from '@expenses/expenses.service';
import { CreateExpenseDto } from '@expenses/dto/create-expense.dto';
import { User } from '@users/entities/user.entity';
import { CurrentUser } from '@decorator/user.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  create(
    @Body() createExpenseDto: CreateExpenseDto,
    @CurrentUser() user: User,
  ) {
    return this.expensesService.create(createExpenseDto, user.id);
  }

  @Get()
  findAll(@CurrentUser() user: User) {
    return this.expensesService.findAll(user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.expensesService.findOne(id, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.expensesService.remove(id, user);
  }
}
