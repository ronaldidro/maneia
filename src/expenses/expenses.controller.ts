import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  Header,
  StreamableFile,
} from '@nestjs/common';
import { ExpensesService } from '@/expenses/expenses.service';
import { SummariesService } from '@/summaries/summaries.service';
import { CreateExpenseDto } from '@/expenses/dto/create-expense.dto';
import { ExpensesQueryDto } from '@/expenses/dto/expenses-query.dto';
import { QueryDto } from '@/common/dto/query.dto';
import { User } from '@/users/entities/user.entity';
import { CurrentUser } from '@/decorator/user.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('expenses')
export class ExpensesController {
  constructor(
    private readonly service: ExpensesService,
    private readonly summariesService: SummariesService,
  ) {}

  @Post()
  create(
    @Body() createExpenseDto: CreateExpenseDto,
    @CurrentUser() user: User,
  ) {
    return this.service.create(createExpenseDto, user);
  }

  @Get()
  findAll(@Query() expensesQuery: ExpensesQueryDto, @CurrentUser() user: User) {
    return this.service.findAll(expensesQuery, user);
  }

  @Get('summary')
  findSummary(@CurrentUser() user: User) {
    return this.summariesService.findAll(user);
  }

  @Get('report')
  @Header('Content-Type', 'application/pdf')
  @Header('Content-Disposition', 'attachment; filename="expenses.pdf"')
  async findReport(@Query() queryDto: QueryDto, @CurrentUser() user: User) {
    const file = await this.service.findReport(queryDto, user);
    return new StreamableFile(file);
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.service.findOne(id);
  }

  @Delete()
  removeAll(@CurrentUser() user: User) {
    return this.service.removeAll(user);
  }

  @Delete(':id')
  remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: User,
  ) {
    return this.service.remove(id, user);
  }
}
