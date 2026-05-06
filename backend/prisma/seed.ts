import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcryptjs';
import { Client } from '@elastic/elasticsearch';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
const esClient = new Client({
  node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
});

async function main() {
  console.log('Clearing database tables...');
  await prisma.inquiry.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.profile.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Seeding Users...');
  const passwordHash = await bcrypt.hash('password123', 10);

  const seller = await prisma.user.create({
    data: {
      email: 'seller@tatamart.com',
      password: passwordHash,
      role: 'SELLER',
      name: 'Aditya Components',
      profile: {
        create: {
          companyName: 'Aditya Components Corp',
          gstNumber: '27AAAAA0000A1Z5',
          phone: '+91 9876543210',
          address: 'Phase 2, MIDC, Andheri East',
          city: 'Mumbai',
          state: 'Maharashtra',
          country: 'India',
          isVerified: true,
        },
      },
    },
  });

  const buyer = await prisma.user.create({
    data: {
      email: 'buyer@tatamart.com',
      password: passwordHash,
      role: 'BUYER',
      name: 'Reliance Procurement',
      profile: {
        create: {
          companyName: 'Reliance Retail Wholesale',
          gstNumber: '27BBBBB1111B2Z6',
          phone: '+91 9999999999',
          address: 'Ghansoli, Navi Mumbai',
          city: 'Mumbai',
          state: 'Maharashtra',
          country: 'India',
          isVerified: true,
        },
      },
    },
  });

  console.log('Seeding Categories...');
  const catElectronics = await prisma.category.create({
    data: { id: 'electronics', name: 'Electronics & Components' },
  });

  const catComputers = await prisma.category.create({
    data: { id: 'computers', name: 'Computers & IT Hardware' },
  });

  const catMechanical = await prisma.category.create({
    data: { id: 'mechanical', name: 'Mechanical Parts & Components' },
  });

  console.log('Seeding Products...');
  const productsData = [
    {
      title: 'STMicroelectronics STM32F407 Microcontroller',
      description: 'High-performance ARM Cortex-M4 MCU with DSP and FPU, 512 Kbytes Flash, 168 MHz CPU, art accelerator, Ethernet, USB OTG FS/HS, camera interface, crypto, FSMC.',
      price: 380,
      moq: 100,
      categoryId: catElectronics.id,
      images: ['https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop'],
    },
    {
      title: 'Multilayer FR-4 Custom Printed Circuit Board (PCB)',
      description: 'Prototype and production multilayer FR-4 PCB fabrication. High precision, impedance controlled routing, ENIG gold surface finish, 1oz copper weight, min tracing/space 4mil.',
      price: 45,
      moq: 500,
      categoryId: catElectronics.id,
      images: ['https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop'],
    },
    {
      title: 'Dell PowerEdge R750 Rack Server',
      description: 'Enterprise rackmount server powered by 3rd Generation Intel Xeon Scalable processors, supporting up to 32 DDR4 DIMMs, PCIe Gen 4, SAS/SATA/NVMe drives with advanced cooling.',
      price: 245000,
      moq: 1,
      categoryId: catComputers.id,
      images: ['https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop'],
    },
    {
      title: 'Cisco Catalyst 9300 24-Port Network Switch',
      description: 'Enterprise-class stackable access switch, 24 ports of local Gigabit Ethernet, modular uplinks, PoE+, high bandwidth stackwise technology with advanced Cisco IOS XE licensing.',
      price: 115000,
      moq: 2,
      categoryId: catComputers.id,
      images: ['https://images.unsplash.com/photo-1544256718-3bcf237f3974?w=600&auto=format&fit=crop'],
    },
    {
      title: 'High Precision Stainless Steel Ball Bearings (6204-ZZ)',
      description: 'Industrial deep groove high precision steel ball bearing, double shielded ZZ type, grease lubricated, supporting radial and axial loads with extremely low frictional torque.',
      price: 85,
      moq: 1000,
      categoryId: catMechanical.id,
      images: ['https://images.unsplash.com/photo-1530124560072-aae84ca4db0f?w=600&auto=format&fit=crop'],
    },
    {
      title: 'Custom Machined Aluminium Spur Gear (Module 2, 40T)',
      description: 'Precision milled 6061-T6 alloy structural spur gear. 40 teeth, Module 2 pitch, bore size 15mm with keyway. Manufactured to ISO Class 8 accuracy with clear anodization.',
      price: 750,
      moq: 50,
      categoryId: catMechanical.id,
      images: ['https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?w=600&auto=format&fit=crop'],
    },
  ];

  const products = [];
  for (const item of productsData) {
    const p = await prisma.product.create({
      data: {
        ...item,
        sellerId: seller.id,
      },
    });
    products.push(p);
  }

  console.log('Seeding Elasticsearch...');
  try {
    const indexExists = await esClient.indices.exists({ index: 'products' });
    if (indexExists) {
      await esClient.indices.delete({ index: 'products' });
    }
    
    await esClient.indices.create({
      index: 'products',
      mappings: {
        properties: {
          id: { type: 'keyword' },
          title: { type: 'text' },
          description: { type: 'text' },
          price: { type: 'double' },
          categoryId: { type: 'keyword' },
          sellerId: { type: 'keyword' },
          createdAt: { type: 'date' },
        },
      },
    });

    for (const p of products) {
      await esClient.index({
        index: 'products',
        id: p.id,
        document: {
          id: p.id,
          title: p.title,
          description: p.description,
          price: p.price,
          categoryId: p.categoryId,
          sellerId: p.sellerId,
          createdAt: p.createdAt,
        },
      });
    }
    console.log('Elasticsearch index successfully populated.');
  } catch (err: any) {
    console.error('Failed to seed Elasticsearch:', err.message);
  }

  console.log('Database seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
