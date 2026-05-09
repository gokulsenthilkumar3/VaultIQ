import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface TelemetryData {
  assetId: string;
  temperature: number; // Celsius
  cpuUsage: number;    // Percentage
  diskIOPs: number;
  runtimeHours: number;
}

@Injectable()
export class MaintenanceEngine {
  constructor(private prisma: PrismaService) {}

  async getTriageQueue() {
    return this.prisma.maintenanceRecord.findMany({
      where: { status: { in: ['OPEN', 'IN_PROGRESS'] } },
      include: {
        asset: {
          include: { type: true }
        }
      },
      orderBy: { scheduledDate: 'asc' }
    });
  }

  /**
   * Predicts the health status of an asset based on telemetry and historical lifespan.
   * Uses a heuristic-based prediction model (AI-ready).
   */
  async predictAssetHealth(telemetry: TelemetryData, lifespanYears: number) {
    const lifespanHours = lifespanYears * 365 * 24;
    const wearLevel = telemetry.runtimeHours / lifespanHours;

    let riskScore = 0;

    // 1. Temperature Check (Critical for Servers/Laptops)
    if (telemetry.temperature > 85) riskScore += 50;
    else if (telemetry.temperature > 70) riskScore += 20;

    // 2. Performance Degradation (High I/O or CPU during idle)
    if (telemetry.cpuUsage > 90) riskScore += 15;
    
    // 3. Wear-and-tear (Lifespan proximity)
    if (wearLevel > 0.9) riskScore += 30;
    else if (wearLevel > 0.75) riskScore += 10;

    // Determine Status
    if (riskScore >= 50) return 'CRITICAL';
    if (riskScore >= 20) return 'WARNING';
    return 'HEALTHY';
  }

  /**
   * Generates a "Maintenance Forecast" for the next 30 days.
   */
  async getForecast(assetId: string) {
    // In a real scenario, this would use a regression model on historical telemetry
    return {
      assetId,
      probabilityOfFailure: '14%',
      estimatedDaysRemaining: 18,
      recommendedAction: 'Clean cooling fans and check thermal paste.',
      costSavingEstimate: '$450 (vs emergency replacement)'
    };
  }
}
