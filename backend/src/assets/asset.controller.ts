import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, UseGuards, Req, HttpCode, HttpStatus, Query
} from '@nestjs/common';
import { AssetService } from './asset.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';

@Controller('assets')
@UseGuards(JwtAuthGuard)
export class AssetController {
  constructor(private assetService: AssetService) {}

  @Get()
  async findAll(
    @Query('page') page?: string, 
    @Query('limit') limit?: string,
    @Query('search') search?: string
  ) {
    return this.assetService.findAll(page ? Number(page) : 1, limit ? Number(limit) : 20, search);
  }

  @Get('summary')
  async getSummary() {
    return this.assetService.getSummary();
  }

  @Get('activity')
  async getActivity() {
    return this.assetService.getGlobalActivityLog();
  }

  @Get('types')
  async getTypes() {
    return this.assetService.getTypes();
  }

  @Get('locations')
  async getLocations() {
    return this.assetService.getLocations();
  }

  @Post('types')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'MANAGER')
  async createType(@Body('name') name: string, @Body('lifespanYears') lifespanYears?: number) {
    return this.assetService.createType(name, lifespanYears || 3);
  }

  @Post('locations')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'MANAGER')
  async createLocation(@Body('name') name: string, @Body('address') address?: string) {
    return this.assetService.createLocation(name, address || 'TBD');
  }

  @Get(':id/audit-hash')
  async getAuditHash(@Param('id') id: string) {
    return this.assetService.getAuditHash(id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.assetService.findOne(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'MANAGER')
  async create(@Body() createAssetDto: CreateAssetDto) {
    return this.assetService.createAsset(createAssetDto);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'MANAGER')
  async update(@Param('id') id: string, @Body() updateAssetDto: UpdateAssetDto) {
    return this.assetService.updateAsset(id, updateAssetDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    return this.assetService.deleteAsset(id);
  }

  @Post(':id/checkout')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'MANAGER')
  async checkout(
    @Param('id') assetId: string,
    @Body('userId') userId: string,
    @Body('signature') signature: string,
    @Req() req: any,
  ) {
    const requestingUserId = userId || req.user.userId;
    return this.assetService.checkoutAsset(assetId, requestingUserId, signature || '');
  }

  @Post(':id/checkin')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'MANAGER')
  async checkin(
    @Param('id') assetId: string,
    @Body('conditionNotes') conditionNotes: string,
    @Req() req: any,
  ) {
    return this.assetService.checkinAsset(assetId, req.user.userId, conditionNotes);
  }
}
