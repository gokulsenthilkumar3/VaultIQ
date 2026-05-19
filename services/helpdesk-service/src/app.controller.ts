import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHello(): string {
    return 'VaultIQ Core API - System Operational';
  }

  @Get('health')
  getHealth() {
    return { status: 'OK', timestamp: new Date().toISOString() };
  }
}
