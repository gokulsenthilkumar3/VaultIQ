import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@Controller('tickets')
@UseGuards(JwtAuthGuard)
export class HelpdeskController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async getTickets() {
    return this.prisma.helpdeskTicket.findMany({
      include: { user: true, asset: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Post()
  async createTicket(@Body() data: any, @Request() req: any) {
    return this.prisma.helpdeskTicket.create({
      data: {
        title: data.title,
        description: data.description,
        priority: data.priority || 'MEDIUM',
        assetId: data.assetId,
        userId: req.user.userId,
      },
      include: { user: true, asset: true },
    });
  }

  @Post('triage')
  async triageTicket(@Body() data: any) {
    // In a full production setup, this would call an LLM (e.g., OpenAI/Gemini)
    // For now, return a placeholder heuristic response labeled as Demo
    return {
      suggestedPriority: data.description?.toLowerCase().includes('critical') ? 'HIGH' : 'MEDIUM',
      suggestedCategory: 'Hardware (Demo Triage)',
      confidence: 0.85,
      aiSummary: 'Based on the description provided, this ticket requires standard triage. (Demo Mode)',
    };
  }
}
