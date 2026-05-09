import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { AssetsModule } from './assets/assets.module';
import { BlockchainModule } from './blockchain/blockchain.module';
import { MaintenanceModule } from './maintenance/maintenance.module';
import { HelpdeskModule } from './helpdesk/helpdesk.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    PrismaModule,
    AssetsModule,
    BlockchainModule,
    MaintenanceModule,
    HelpdeskModule,
    AuthModule,
    UsersModule,
    ReportsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
