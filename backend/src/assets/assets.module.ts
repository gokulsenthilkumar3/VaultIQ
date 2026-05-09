import { Module } from '@nestjs/common';
import { AssetService } from './asset.service';
import { AssetController } from './asset.controller';
import { DepreciationService } from './depreciation.service';

@Module({
  controllers: [AssetController],
  providers: [AssetService, DepreciationService],
  exports: [AssetService],
})
export class AssetsModule {}
