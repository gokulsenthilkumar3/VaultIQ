import { Controller, Get } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  getDashboardData() {
    return { 
      insights: [
        { title: 'Predicted Laptop Failures', value: '4 expected next month', type: 'warning' },
        { title: 'Asset Depreciation', value: '$12,400 this quarter', type: 'info' }
      ],
      compliance: { soc2: '98%', iso27001: '100%' }
    };
  }
}
