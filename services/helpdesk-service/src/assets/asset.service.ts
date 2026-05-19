import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DepreciationService } from './depreciation.service';

@Injectable()
export class AssetService {
  constructor(
    private prisma: PrismaService,
    private depreciationService: DepreciationService
  ) {}

  async findAll(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.asset.findMany({
        include: { type: true, location: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.asset.count(),
    ]);
    return { data, total, page, limit };
  }

  async findOne(idOrTag: string) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrTag);
    const asset = await this.prisma.asset.findFirst({
      where: isUuid ? { id: idOrTag } : { tagId: idOrTag },
      include: {
        type: true,
        location: true,
        assignments: {
          include: { user: true },
          orderBy: { assignedAt: 'desc' },
        },
        maintenance: {
          orderBy: { scheduledDate: 'desc' },
        },
      },
    });
    if (!asset) throw new NotFoundException('Asset not found');
    const depreciation = this.depreciationService.calculateDepreciation(
      asset.purchasePrice,
      asset.purchaseDate,
      asset.type.lifespanYears,
    );
    return { ...asset, depreciation };
  }

  async getTypes() {
    return this.prisma.assetType.findMany({ orderBy: { name: 'asc' } });
  }

  async getLocations() {
    return this.prisma.location.findMany({ orderBy: { name: 'asc' } });
  }

  async createAsset(data: any) {
    return this.prisma.asset.create({
      data: {
        tagId: data.tagId,
        serialNumber: data.serialNumber,
        modelName: data.modelName,
        typeId: data.typeId,
        locationId: data.locationId,
        purchasePrice: parseFloat(data.purchasePrice),
        purchaseDate: new Date(data.purchaseDate),
      },
      include: { type: true, location: true },
    });
  }

  async updateAsset(id: string, data: any) {
    const asset = await this.prisma.asset.findUnique({ where: { id } });
    if (!asset) throw new NotFoundException('Asset not found');
    return this.prisma.asset.update({
      where: { id },
      data: {
        ...(data.modelName && { modelName: data.modelName }),
        ...(data.locationId && { locationId: data.locationId }),
        ...(data.status && { status: data.status }),
        ...(data.typeId && { typeId: data.typeId }),
      },
      include: { type: true, location: true },
    });
  }

  async deleteAsset(id: string) {
    const asset = await this.prisma.asset.findUnique({ where: { id } });
    if (!asset) throw new NotFoundException('Asset not found');
    if (asset.status === 'ASSIGNED') {
      throw new BadRequestException('Cannot delete an asset that is currently assigned. Check it in first.');
    }
    return this.prisma.asset.delete({ where: { id } });
  }

  async checkoutAsset(assetId: string, userId: string, signatureBlob: string) {
    return this.prisma.$transaction(async (tx) => {
      const asset = await tx.asset.findUnique({ where: { id: assetId } });
      if (!asset) throw new NotFoundException('Asset not found');
      if (asset.status !== 'AVAILABLE') {
        throw new BadRequestException(`Asset is currently ${asset.status} and cannot be checked out`);
      }
      await tx.asset.update({ where: { id: assetId }, data: { status: 'ASSIGNED' } });
      const assignment = await tx.assetAssignment.create({
        data: { assetId, userId, signatureBlob, assignedAt: new Date() },
      });
      await tx.auditLog.create({
        data: {
          action: 'CHECKOUT',
          assetId,
          userId,
          details: `Asset ${asset.tagId} checked out to user ${userId}`,
        },
      });
      return assignment;
    });
  }

  async checkinAsset(assetId: string, userId: string, conditionNotes?: string) {
    return this.prisma.$transaction(async (tx) => {
      const asset = await tx.asset.findUnique({ where: { id: assetId } });
      if (!asset) throw new NotFoundException('Asset not found');
      if (asset.status !== 'ASSIGNED') {
        throw new BadRequestException(`Asset is not currently assigned`);
      }
      const openAssignment = await tx.assetAssignment.findFirst({
        where: { assetId, returnedAt: null },
        orderBy: { assignedAt: 'desc' },
      });
      if (openAssignment) {
        await tx.assetAssignment.update({
          where: { id: openAssignment.id },
          data: { returnedAt: new Date(), conditionNotes },
        });
      }
      await tx.asset.update({ where: { id: assetId }, data: { status: 'AVAILABLE' } });
      await tx.auditLog.create({
        data: {
          action: 'CHECKIN',
          assetId,
          userId,
          details: `Asset ${asset.tagId} returned by user ${userId}`,
        },
      });
      return { success: true, assetId };
    });
  }

  async getAuditHash(assetId: string) {
    const logs = await this.prisma.auditLog.findMany({
      where: { assetId },
      orderBy: { timestamp: 'asc' },
    });
    const dataString = logs.map(l => `${l.action}:${l.timestamp.toISOString()}`).join('|');
    const { createHash } = await import('crypto');
    const hash = createHash('sha256').update(dataString || assetId).digest('hex');
    return { hash, count: logs.length };
  }

  async getSummary() {
    const [totalAssets, assignedAssets, maintenanceAssets, recentActivities, allAssets] = await Promise.all([
      this.prisma.asset.count(),
      this.prisma.asset.count({ where: { status: 'ASSIGNED' } }),
      this.prisma.asset.count({ where: { status: 'MAINTENANCE' } }),
      this.prisma.auditLog.findMany({
        take: 5,
        orderBy: { timestamp: 'desc' },
        include: { user: true },
      }),
      this.prisma.asset.findMany({ include: { type: true } })
    ]);

    let totalMonthlyDepreciation = 0;
    allAssets.forEach(asset => {
      const dep = this.depreciationService.calculateDepreciation(
        asset.purchasePrice,
        asset.purchaseDate,
        asset.type.lifespanYears
      );
      totalMonthlyDepreciation += dep.monthlyDepreciation;
    });

    return {
      stats: {
        total: totalAssets,
        assigned: assignedAssets,
        maintenance: maintenanceAssets,
        utilization: totalAssets > 0 ? Math.round((assignedAssets / totalAssets) * 100) : 0,
        totalMonthlyDepreciation: Math.round(totalMonthlyDepreciation),
      },
      recentActivities: recentActivities.map((log) => ({
        user: log.user.fullName,
        action: log.details,
        time: log.timestamp,
        icon: log.action === 'CHECKOUT' ? 'checkout' : log.action === 'CHECKIN' ? 'checkin' : 'maintenance',
      })),
    };
  }
}
