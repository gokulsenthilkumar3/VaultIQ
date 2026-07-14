import { Controller, Get } from '@nestjs/common';
import { ProcurementService } from './procurement.service';

@Controller('procurement')
export class ProcurementController {
  constructor(private readonly procurementService: ProcurementService) {}

  @Get('vendors')
  getVendors() {
    return { vendors: [] };
  }

  @Get('requests')
  getPurchaseRequests() {
    return { purchaseRequests: [] };
  }
}
