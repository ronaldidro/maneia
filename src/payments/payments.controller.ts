import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { PaymentsService } from '@/payments/payments.service';
import { CreatePaymentDto } from '@/payments/dto/create-payment.dto';
import { PaymentsQueryDto } from '@/payments/dto/payments-query.dto';
import { User } from '@/users/entities/user.entity';
import { CurrentUser } from '@/decorator/user.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('payments')
export class PaymentsController {
  constructor(private readonly service: PaymentsService) {}

  @Post()
  async create(
    @Body() createPaymentDto: CreatePaymentDto,
    @CurrentUser() user: User,
  ) {
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
    return this.service.remove(id, user);
  }
}
