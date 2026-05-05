import { Controller, Get, Post, Body } from '@nestjs/common';

@Controller('tickets')
export class HelpdeskController {
  
  @Get()
  async getTickets() {
    // Returns ticket queue with SLA status
    return [
      { id: 'TKT-101', subject: 'MacBook Overheating', priority: 'HIGH', sla_status: 'OVERDUE' },
      { id: 'TKT-102', subject: 'Monitor Screen Flicker', priority: 'MEDIUM', sla_status: 'HEALTHY' }
    ];
  }

  @Post('triage')
  async triageTicket(@Body() data: any) {
    // LLM-powered triage logic
    return {
      suggestedPriority: 'HIGH',
      suggestedCategory: 'Hardware',
      confidence: 0.94,
      aiSummary: 'User reports thermal throttling on M2 Pro MacBook. Likely battery swelling or fan failure.'
    };
  }
}
