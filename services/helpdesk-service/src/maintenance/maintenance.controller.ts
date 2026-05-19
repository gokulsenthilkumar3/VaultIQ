import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
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

  @Patch(':id')
  async updateRecord(
    @Param('id') id: string,
    @Body('status') status: string,
    @Body('technicianNotes') technicianNotes?: string,
  ) {
    return this.maintenanceEngine.updateRecord(id, status, technicianNotes);
  }
}
