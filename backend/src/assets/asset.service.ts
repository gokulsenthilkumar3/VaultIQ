import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DepreciationService } from './depreciation.service';

@Injectable()
export class AssetService {
  constructor(
    private prisma: PrismaService,
    private depreciationService: DepreciationService
  ) {}

  /**
   * Checks out an asset to a specific user.
   * Ensures the asset is available and records a digital signature.
   */
  async checkoutAsset(assetId: string, userId: string, signatureBlob: string) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Check if asset exists and is available
      const asset = await tx.asset.findUnique({ where: { id: assetId } });
      
      if (!asset) {
        throw new NotFoundException('Asset not found');
      }
      
      if (asset.status !== 'AVAILABLE') {
        throw new BadRequestException(`Asset is currently ${asset.status}`);
      }

      // 2. Update Asset status
      await tx.asset.update({
        where: { id: assetId },
        data: { status: 'ASSIGNED' },
      });

      // 3. Create Assignment record with digital signature
      const assignment = await tx.assetAssignment.create({
        data: {
          assetId,
          userId,
          signatureBlob, // Base64 representation of the digital signature
          assignedAt: new Date(),
        },
      });

      // 4. Log Audit Trail
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

  async findAll() {
    return this.prisma.asset.findMany({
      include: {
        type: true,
        location: true,
      },
    });
  }

  async findOne(id: string) {
    const asset = await this.prisma.asset.findUnique({
      where: { id },
      include: {
        type: true,
        location: true,
        assignments: {
          include: { user: true },
          orderBy: { assignedAt: 'desc' },
        },
        maintenance: true,
      },
    });

    if (!asset) throw new NotFoundException('Asset not found');

    const depreciation = this.depreciationService.calculateDepreciation(
      asset.purchasePrice,
      asset.purchaseDate,
      asset.type.lifespanYears
    );

    return { ...asset, depreciation };
  }

  async getSummary() {
    const totalAssets = await this.prisma.asset.count();
    const assignedAssets = await this.prisma.asset.count({
      where: { status: 'ASSIGNED' },
    });
    const maintenanceAssets = await this.prisma.asset.count({
      where: { status: 'MAINTENANCE' },
    });

    const recentActivities = await this.prisma.auditLog.findMany({
      take: 5,
      orderBy: { timestamp: 'desc' },
      include: { user: true },
    });

    return {
      stats: {
        total: totalAssets,
        assigned: assignedAssets,
        maintenance: maintenanceAssets,
        utilization: totalAssets > 0 ? (assignedAssets / totalAssets) * 100 : 0,
      },
      recentActivities: recentActivities.map(log => ({
        user: log.user.fullName,
        action: log.details,
        time: log.timestamp,
        icon: log.action === 'CHECKOUT' ? '💻' : '🔄',
      })),
    };
  }
}
