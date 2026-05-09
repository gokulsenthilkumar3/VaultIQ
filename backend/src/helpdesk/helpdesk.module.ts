import { Module } from '@nestjs/common';
import { HelpdeskController } from './helpdesk.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [HelpdeskController],
})
export class HelpdeskModule {}
