import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AssetService {
  constructor(private prisma: PrismaService) {}

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
}
