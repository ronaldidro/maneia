import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
  ForbiddenException,
} from '@nestjs/common';
import { PaymentsService } from '@/payments/payments.service';
import { CreatePaymentDto } from '@/payments/dto/create-payment.dto';
import { PaymentsQueryDto } from '@/payments/dto/payments-query.dto';
import { User } from '@/users/entities/user.entity';
import { CurrentUser } from '@/decorator/user.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
import { SettlementsService } from '@/settlements/settlements.service';
import { ExpensesService } from '@/expenses/expenses.service';

@ApiBearerAuth()
@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly service: PaymentsService,
    private readonly settlementsService: SettlementsService,
    private readonly expensesService: ExpensesService,
  ) {}

  @Post()
  async create(
    @Body() createPaymentDto: CreatePaymentDto,
    @CurrentUser() user: User,
  ) {
    const { group, payer, debt, amount } = createPaymentDto;

    await this.settlementsService.create(group, payer, user.id);

    const remaining = debt - amount;

    if (remaining > 0)
      await this.createRegulatoryExpense(
        'Saldo pendiente de pago',
        Number(remaining.toFixed(2)),
        group,
        payer,
        user.id,
      );

    return this.service.create(createPaymentDto, user);
  }

  @Get()
  findAll(@Query() paymentsQuery: PaymentsQueryDto, @CurrentUser() user: User) {
    return this.service.findAll(paymentsQuery, user);
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.service.findOne(id);
  }

  @Delete(':id')
  async remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: User,
  ) {
    const payment = await this.service.findOne(id);

    if (!user.isAdmin && payment.user.id !== user.id)
      throw new ForbiddenException('Payment invalid');

    await this.createRegulatoryExpense(
      'Reversión de pago',
      Number(payment.amount),
      payment.group.id,
      payment.payer.id,
      user.id,
    );

    return this.service.remove(id);
  }

  private async createRegulatoryExpense(
    description: string,
    amount: number,
    group: string,
    payer: string,
    userId: string,
  ): Promise<void> {
    await this.expensesService.create(
      {
        description,
        amount,
        group,
        splitted: false,
        expensedAt: new Date().toISOString(),
        details: [{ user: payer, amount }],
      },
      userId,
    );
  }
}
