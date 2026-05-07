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
  await prisma.cartItem.deleteMany({});
  await prisma.cart.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
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
  const catComputers = await prisma.category.create({
    data: { id: 'computers', name: 'Computer and IT' },
  });

  const catElectronics = await prisma.category.create({
    data: { id: 'electronics', name: 'Electronics' },
  });

  const catLogistics = await prisma.category.create({
    data: { id: 'logistics', name: 'Logistics' },
  });

  const catDailyNeeds = await prisma.category.create({
    data: { id: 'daily_needs', name: 'Daily Needs' },
  });

  const catTransport = await prisma.category.create({
    data: { id: 'transport', name: 'Transport' },
  });

  const catDecorFurniture = await prisma.category.create({
    data: { id: 'decor_furniture', name: 'Decor and Furniture' },
  });

  const catApparel = await prisma.category.create({
    data: { id: 'apparel', name: 'Apparel(bulk)' },
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
      title: 'Industrial Wooden Shipping Pallets (Heavy Duty)',
      description: 'Standard size heavy-duty wooden shipping pallets for warehouse storage and global cargo logistics. Crafted from premium seasoned pine wood, load capacity up to 1.5 tons.',
      price: 450,
      moq: 200,
      categoryId: catLogistics.id,
      images: ['https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop'],
    },
    {
      title: 'Heavy-Duty Industrial Stretch Wrap Film (Roll)',
      description: 'High-tensile strength cast stretch film roll for securing pallet shipments. Superior puncture resistance, excellent cling property, and ultra-clear visibility for barcodes.',
      price: 280,
      moq: 50,
      categoryId: catLogistics.id,
      images: ['https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600&auto=format&fit=crop'],
    },
    {
      title: 'Premium Industrial Biodegradable Hand Soap (20L Can)',
      description: 'Bulk eco-friendly biodegradable liquid hand soap for factories, warehouses, and corporate facilities. Effectively removes grease, oils, and industrial grime while keeping hands soft.',
      price: 1200,
      moq: 10,
      categoryId: catDailyNeeds.id,
      images: ['https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=600&auto=format&fit=crop'],
    },
    {
      title: 'Single-Use Nitrile Protective Gloves (Box of 100)',
      description: 'Powder-free, medical-grade nitrile examination and protective gloves. High tactile sensitivity, excellent puncture resistance, textured fingertips, and latex-free composition.',
      price: 450,
      moq: 100,
      categoryId: catDailyNeeds.id,
      images: ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop'],
    },
    {
      title: 'Electric Utility Cargo Tricycle (Heavy-Duty)',
      description: 'Zero-emission high-payload electric cargo vehicle for inner-city industrial transport. 1000W motor, heavy duty suspension, dual braking, and cargo loading bed up to 500kg.',
      price: 85000,
      moq: 1,
      categoryId: catTransport.id,
      images: ['https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600&auto=format&fit=crop'],
    },
    {
      title: 'Hydraulic Lift Pallet Jack (2.5 Ton Capacity)',
      description: 'Professional-grade manual hydraulic pallet truck for warehouse transport. 2500kg lifting capacity, reinforced steel chassis, leakproof pump, and smooth polyurethane wheels.',
      price: 14500,
      moq: 5,
      categoryId: catTransport.id,
      images: ['https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop'],
    },
    {
      title: 'Ergonomic Orthopedic Mesh Office Chair',
      description: 'Premium ergonomic office chair with breathable high-elastic mesh back, adjustable 3D armrests, dynamic lumbar support, and heavy-duty gas lift for commercial facilities.',
      price: 6500,
      moq: 20,
      categoryId: catDecorFurniture.id,
      images: ['https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=600&auto=format&fit=crop'],
    },
    {
      title: 'Modular Wooden Meeting Room Conference Table',
      description: 'Elegant commercial-grade conference table made from high-density engineered wood with a melamine finish. Built-in wire management ports and seating capacity of up to 10 persons.',
      price: 45000,
      moq: 2,
      categoryId: catDecorFurniture.id,
      images: ['https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=600&auto=format&fit=crop'],
    },
    {
      title: '100% Pure Cotton Blank Unisex T-Shirts (Bulk Pack of 50)',
      description: 'Premium blank combed cotton crew neck t-shirts. 180 GSM bio-washed pre-shrunk fabric. Perfect for corporate branding, printing, uniforms, or wholesale distribution.',
      price: 4500,
      moq: 10,
      categoryId: catApparel.id,
      images: ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop'],
    },
    {
      title: 'Reflective Safety High-Visibility Vest (Bulk Pack of 100)',
      description: 'Premium lightweight neon mesh reflective safety vests with high-reflectivity strips. Meets industrial safety standards. Perfect for construction sites, logistics, and roadways.',
      price: 8500,
      moq: 5,
      categoryId: catApparel.id,
      images: ['https://images.unsplash.com/photo-1516216622439-d1bc1623c5c7?w=600&auto=format&fit=crop'],
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
