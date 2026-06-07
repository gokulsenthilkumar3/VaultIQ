import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface TelemetryData {
  assetId: string;
  temperature: number;
  cpuUsage: number;
  diskIOPs: number;
  runtimeHours: number;
}

@Injectable()
export class MaintenanceEngine {
  constructor(private prisma: PrismaService) {}

  async getTriageQueue() {
    return this.prisma.maintenanceRecord.findMany({
      where: { status: { in: ['OPEN', 'IN_PROGRESS'] } },
      include: { asset: { include: { type: true, location: true } } },
      orderBy: { scheduledDate: 'asc' },
    });
  }

  async findAll() {
    return this.prisma.maintenanceRecord.findMany({
      include: { asset: { include: { type: true, location: true } } },
      orderBy: { scheduledDate: 'desc' },
    });
  }

  async createRecord(data: any) {
    return this.prisma.maintenanceRecord.create({
      data: {
        assetId: data.assetId,
        issueType: data.priority || 'MEDIUM', // mapping priority to issueType for now
        description: data.issue,
        scheduledDate: new Date(),
        status: 'OPEN'
      },
      include: { asset: { include: { type: true, location: true } } }
    });
  }

  async updateRecord(id: string, status: string, technicianNotes?: string) {
    const record = await this.prisma.maintenanceRecord.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('Maintenance record not found');
    return this.prisma.maintenanceRecord.update({
      where: { id },
      data: {
        status: status as any,
        ...(technicianNotes && { technicianNotes }),
        ...(status === 'COMPLETED' && { completedAt: new Date() }),
      },
      include: { asset: { include: { type: true } } },
    });
  }

  async predictAssetHealth(telemetry: TelemetryData, lifespanYears: number) {
    const lifespanHours = lifespanYears * 365 * 24;
    const wearLevel = telemetry.runtimeHours / lifespanHours;
    let riskScore = 0;
    if (telemetry.temperature > 85) riskScore += 50;
    else if (telemetry.temperature > 70) riskScore += 20;
    if (telemetry.cpuUsage > 90) riskScore += 15;
    if (wearLevel > 0.9) riskScore += 30;
    else if (wearLevel > 0.75) riskScore += 10;
    if (riskScore >= 50) return 'CRITICAL';
    if (riskScore >= 20) return 'WARNING';
    return 'HEALTHY';
  }

  async getForecast(assetId: string) {
    const records = await this.prisma.maintenanceRecord.findMany({
      where: { assetId },
      orderBy: { scheduledDate: 'desc' },
      take: 5,
    });
    const nextScheduled = new Date();
    nextScheduled.setDate(nextScheduled.getDate() + 30);
    return {
      assetId,
      historicalCount: records.length,
      nextScheduledDate: nextScheduled.toISOString(),
      predictedIssues: records.length > 2 ? ['Thermal degradation likely', 'Storage capacity nearing threshold'] : [],
      healthScore: Math.max(0, 100 - records.length * 8),
    };
  }
}
