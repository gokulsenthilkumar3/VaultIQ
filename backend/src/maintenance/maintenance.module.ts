import { Module } from '@nestjs/common';
import { MaintenanceEngine } from './maintenance.engine';
import { MaintenanceController } from './maintenance.controller';

@Module({
  providers: [MaintenanceEngine],
  controllers: [MaintenanceController],
  exports: [MaintenanceEngine],
})
export class MaintenanceModule {}
