import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, UseGuards, Request, HttpCode, HttpStatus
} from '@nestjs/common';
import { AssetService } from './asset.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

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

  @Get('types')
  async getTypes() {
    return this.assetService.getTypes();
  }

  @Get('locations')
  async getLocations() {
    return this.assetService.getLocations();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.assetService.findOne(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'MANAGER')
  async create(@Body() body: any) {
    return this.assetService.createAsset(body);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'MANAGER')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.assetService.updateAsset(id, body);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    return this.assetService.deleteAsset(id);
  }

  @Post(':id/checkout')
  async checkout(
    @Param('id') assetId: string,
    @Body('userId') userId: string,
    @Body('signature') signature: string,
    @Request() req: any,
  ) {
    const requestingUserId = userId || req.user.userId;
    return this.assetService.checkoutAsset(assetId, requestingUserId, signature || '');
  }

  @Post(':id/checkin')
  async checkin(
    @Param('id') assetId: string,
    @Body('conditionNotes') conditionNotes: string,
    @Request() req: any,
  ) {
    return this.assetService.checkinAsset(assetId, req.user.userId, conditionNotes);
  }
}
