import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { MaintenanceEngine } from './maintenance.engine';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('maintenance')
@UseGuards(JwtAuthGuard)
export class MaintenanceController {
  constructor(private maintenanceEngine: MaintenanceEngine) {}

  @Get('triage')
  async getTriage() {
    return this.maintenanceEngine.getTriageQueue();
  }

  @Get(':id/forecast')
  async getForecast(@Param('id') assetId: string) {
    return this.maintenanceEngine.getForecast(assetId);
  }
}
