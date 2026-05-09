import { Controller, Get, Param, Post, Body, UseGuards } from '@nestjs/common';
import { AssetService } from './asset.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('assets')
@UseGuards(JwtAuthGuard)
export class AssetController {
  constructor(private assetService: AssetService) {}

  @Get()
  async findAll() {
    return this.assetService.findAll();
  }

  @Get('summary')
  async getSummary() {
    return this.assetService.getSummary();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.assetService.findOne(id);
  }

  @Post(':id/checkout')
  async checkout(
    @Param('id') assetId: string,
    @Body('userId') userId: string,
    @Body('signature') signature: string,
  ) {
    return this.assetService.checkoutAsset(assetId, userId, signature);
  }
}
