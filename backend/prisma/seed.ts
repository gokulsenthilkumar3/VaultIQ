import { PrismaClient, Role, AssetStatus, MaintenanceStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Create Locations
  const hq = await prisma.location.upsert({
    where: { name: 'Corporate HQ' },
    update: {},
    create: {
      name: 'Corporate HQ',
      address: '123 Tech Park, Innovation Way',
    },
  });

  const lab = await prisma.location.upsert({
    where: { name: 'R&D Lab' },
    update: {},
    create: {
      name: 'R&D Lab',
      address: '456 Science Blvd, Lab City',
    },
  });

  // 2. Create Asset Types
  const laptopType = await prisma.assetType.upsert({
    where: { name: 'LAPTOP' },
    update: {},
    create: { name: 'LAPTOP', lifespanYears: 3 },
  });

  const serverType = await prisma.assetType.upsert({
    where: { name: 'SERVER' },
    update: {},
    create: { name: 'SERVER', lifespanYears: 5 },
  });

  // 3. Create Users
  const admin = await prisma.user.upsert({
    where: { email: 'admin.test@kangeyan.com' },
    update: {},
    create: {
      email: 'admin.test@kangeyan.com',
      fullName: 'Main Administrator',
      role: Role.ADMIN,
      azureId: 'test-admin-sso',
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: 'manager.test@kangeyan.com' },
    update: {},
    create: {
      email: 'manager.test@kangeyan.com',
      fullName: 'Regional Manager',
      role: Role.MANAGER,
      azureId: 'test-manager-sso',
    },
  });

  const staff = await prisma.user.upsert({
    where: { email: 'user.test@kangeyan.com' },
    update: {},
    create: {
      email: 'user.test@kangeyan.com',
      fullName: 'General Staff',
      role: Role.USER,
      azureId: 'test-user-sso',
    },
  });

  // 4. Create Assets
  const macbook = await prisma.asset.upsert({
    where: { tagId: 'VIQ-LT-001' },
    update: {},
    create: {
      tagId: 'VIQ-LT-001',
      serialNumber: 'SN-MBP-2024',
      modelName: 'MacBook Pro M3 Max',
      typeId: laptopType.id,
      locationId: hq.id,
      status: AssetStatus.AVAILABLE,
      purchasePrice: 3499.00,
      purchaseDate: new Date('2024-01-15'),
    },
  });

  const dellServer = await prisma.asset.upsert({
    where: { tagId: 'VIQ-SV-001' },
    update: {},
    create: {
      tagId: 'VIQ-SV-001',
      serialNumber: 'SN-DELL-R750',
      modelName: 'PowerEdge R750',
      typeId: serverType.id,
      locationId: lab.id,
      status: AssetStatus.MAINTENANCE,
      purchasePrice: 12500.00,
      purchaseDate: new Date('2023-06-20'),
    },
  });

  // 5. Create Maintenance Records
  await prisma.maintenanceRecord.create({
    data: {
      assetId: dellServer.id,
      issueType: 'High Thermal Throttling',
      description: 'System fan 3 failure causing heat spike in Rack B-04',
      status: MaintenanceStatus.OPEN,
      scheduledDate: new Date(),
    }
  });

  // 6. Create Audit Logs
  await prisma.auditLog.create({
    data: {
      action: 'SYSTEM_INIT',
      userId: admin.id,
      details: 'VaultIQ Core System Initialization and Seeding',
    }
  });

  console.log('✅ Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
