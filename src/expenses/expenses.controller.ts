import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ExpensesService } from '@/expenses/expenses.service';
import { CreateExpenseDto } from '@/expenses/dto/create-expense.dto';
import { User } from '@/users/entities/user.entity';
import { CurrentUser } from '@/decorator/user.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ExpensesQueryDto } from '@/expenses/dto/expenses-query.dto';
import { SummaryService } from '@/summary/summary.service';

@ApiBearerAuth()
@Controller('expenses')
export class ExpensesController {
  constructor(
    private readonly service: ExpensesService,
    private readonly summaryService: SummaryService,
  ) {}

  @Post()
  create(
    @Body() createExpenseDto: CreateExpenseDto,
    @CurrentUser() user: User,
  ) {
    return this.service.create(createExpenseDto, user.id);
  }

  @Get()
  findAll(@Query() expensesQuery: ExpensesQueryDto, @CurrentUser() user: User) {
    return this.service.findAll(expensesQuery, user);
  }

  @Get('summary')
  findSummary(@CurrentUser() user: User) {
    return this.summaryService.findAll(user);
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.service.findOne(id);
  }

  @Delete(':id')
  remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: User,
  ) {
    return this.service.remove(id, user);
  }
}
