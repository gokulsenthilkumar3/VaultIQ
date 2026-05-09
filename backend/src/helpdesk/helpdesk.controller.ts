import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('tickets')
@UseGuards(JwtAuthGuard)
export class HelpdeskController {

  @Get()
  async getTickets() {
    // TODO: Replace with PrismaService query once Ticket model is added to schema
    return [
      { id: 'TKT-101', subject: 'MacBook Overheating', priority: 'HIGH', sla_status: 'OVERDUE' },
      { id: 'TKT-102', subject: 'Monitor Screen Flicker', priority: 'MEDIUM', sla_status: 'HEALTHY' },
    ];
  }

  @Post('triage')
  async triageTicket(@Body() data: any) {
    // TODO: Connect to real LLM triage service
    return {
      suggestedPriority: 'HIGH',
      suggestedCategory: 'Hardware',
      confidence: 0.94,
      aiSummary: 'Based on the description, this appears to be a thermal management issue. Recommend scheduling a hardware inspection.',
    };
  }
}
