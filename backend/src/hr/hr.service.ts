import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HrService {
  constructor(private prisma: PrismaService) {}

  async getUpdates() {
    return this.prisma.companyUpdate.findMany({
      orderBy: { date: 'desc' },
      take: 10,
    });
  }

  async getRandomQuote() {
    const count = await this.prisma.quote.count();
    if (count === 0) return { content: 'Have a great day!' };
    const skip = Math.floor(Math.random() * count);
    const quotes = await this.prisma.quote.findMany({
      take: 1,
      skip: skip,
    });
    return quotes[0];
  }

  async getLeaveRequests(userId: string) {
    return this.prisma.leaveRequest.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createLeaveRequest(userId: string, data: any) {
    return this.prisma.leaveRequest.create({
      data: {
        userId,
        type: data.type,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        days: data.days || 1, // simplified calculation
        status: 'PENDING',
      },
    });
  }

  async getPayslips(userId: string) {
    return this.prisma.payslip.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });
  }

  async getAttendanceStatus(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const log = await this.prisma.attendanceLog.findFirst({
      where: {
        userId,
        clockIn: { gte: today },
      },
      orderBy: { clockIn: 'desc' },
    });
    return {
      isClockedIn: !!log && !log.clockOut,
      clockTime: log ? log.clockIn : null,
    };
  }

  async toggleAttendance(userId: string) {
    const status = await this.getAttendanceStatus(userId);
    if (status.isClockedIn) {
      // Clock out
      const log = await this.prisma.attendanceLog.findFirst({
        where: { userId, clockOut: null },
        orderBy: { clockIn: 'desc' },
      });
      if (log) {
        return this.prisma.attendanceLog.update({
          where: { id: log.id },
          data: { clockOut: new Date() },
        });
      }
    } else {
      // Clock in
      return this.prisma.attendanceLog.create({
        data: {
          userId,
          clockIn: new Date(),
        },
      });
    }
  }
}
