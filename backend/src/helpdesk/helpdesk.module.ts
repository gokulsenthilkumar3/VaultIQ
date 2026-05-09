import { Module } from '@nestjs/common';
import { HelpdeskController } from './helpdesk.controller';

@Module({
  controllers: [HelpdeskController],
})
export class HelpdeskModule {}
