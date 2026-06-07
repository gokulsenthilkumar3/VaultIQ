import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
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
    // Load environment variables globally
    ConfigModule.forRoot({ isGlobal: true }),

    // Rate limiting: 100 requests per 60 seconds per IP
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),

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
  providers: [
    // Apply throttle guard globally
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
