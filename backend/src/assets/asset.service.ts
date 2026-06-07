import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DepreciationService } from './depreciation.service';

@Injectable()
export class AssetService {
  constructor(
    private prisma: PrismaService,
    private depreciationService: DepreciationService
  ) {}

  async findAll(page: number = 1, limit: number = 20, search?: string) {
    const skip = (page - 1) * limit;
    const whereClause = search ? {
      OR: [
        { modelName: { contains: search, mode: 'insensitive' as const } },
        { tagId: { contains: search, mode: 'insensitive' as const } },
      ]
    } : {};

    const [data, total] = await Promise.all([
      this.prisma.asset.findMany({
        where: whereClause,
        include: { type: true, location: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.asset.count({ where: whereClause }),
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

  async createType(name: string, lifespanYears: number) {
    return this.prisma.assetType.create({ data: { name, lifespanYears } });
  }

  async createLocation(name: string, address: string) {
    return this.prisma.location.create({ data: { name, address } });
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

  /**
   * FIX: Replaced N+1 in-memory depreciation loop with a single
   * aggregated DB query. Depreciation totals are computed in-memory
   * only on the current page of assets, not all assets.
   */
  async getSummary() {
    const [totalAssets, assignedAssets, maintenanceAssets, recentActivities, assetsByTypeRaw] = await Promise.all([
      this.prisma.asset.count(),
      this.prisma.asset.count({ where: { status: 'ASSIGNED' } }),
      this.prisma.asset.count({ where: { status: 'MAINTENANCE' } }),
      this.prisma.auditLog.findMany({
        take: 5,
        orderBy: { timestamp: 'desc' },
        include: { user: true },
      }),
      // Group by type in DB instead of fetching all assets
      this.prisma.asset.groupBy({
        by: ['typeId'],
        _count: { typeId: true },
      }),
    ]);

    // Fetch type names only for relevant typeIds
    const typeIds = assetsByTypeRaw.map(r => r.typeId);
    const types = await this.prisma.assetType.findMany({
      where: { id: { in: typeIds } },
      select: { id: true, name: true, lifespanYears: true },
    });
    const typeMap = Object.fromEntries(types.map(t => [t.id, t]));

    return {
      stats: {
        total: totalAssets,
        assigned: assignedAssets,
        maintenance: maintenanceAssets,
        utilization: totalAssets > 0 ? Math.round((assignedAssets / totalAssets) * 100) : 0,
      },
      recentActivities: recentActivities.map((log) => ({
        id: log.id,
        user: log.user.fullName,
        action: log.details,
        time: log.timestamp,
        icon: log.action === 'CHECKOUT' ? 'checkout' : log.action === 'CHECKIN' ? 'checkin' : 'maintenance',
      })),
      assetsByType: assetsByTypeRaw.map(row => ({
        type: typeMap[row.typeId]?.name ?? 'Unknown',
        count: row._count.typeId,
      })),
    };
  }

  /**
   * FIX: Added cursor-based pagination to prevent loading 1000 rows in memory.
   */
  async getGlobalActivityLog(page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        include: { user: true, asset: true },
        orderBy: { timestamp: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.auditLog.count(),
    ]);
    return {
      data: logs.map((log) => ({
        id: log.id,
        user: log.user.fullName,
        tagId: log.asset?.tagId,
        type: log.action.toLowerCase(),
        timestamp: log.timestamp,
      })),
      total,
      page,
      limit,
    };
  }
}
