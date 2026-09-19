import { Controller, Get } from '@nestjs/common';
import { Public } from '@/decorator/public.decorator';

@Controller()
export class AppController {
  @Public()
  @Get('health')
  health() {
    return { message: "I'm live" };
  }
}
