const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

dotenv.config();

const User = require('./models/User');
const Book = require('./models/Book');

// Minimal valid PDF content generator
const createSamplePdf = (title) => {
  return `%PDF-1.4
1 0 obj
<<
  /Type /Catalog
  /Pages 2 0 R
>>
endobj
2 0 obj
<<
  /Type /Pages
  /Kids [3 0 R]
  /Count 1
>>
endobj
3 0 obj
<<
  /Type /Page
  /Parent 2 0 R
  /Resources <<
    /Font <<
      /F1 <<
        /Type /Font
        /Subtype /Type1
        /BaseFont /Helvetica-Bold
      >>
      /F2 <<
        /Type /Font
        /Subtype /Type1
        /BaseFont /Helvetica
      >>
    >>
  >>
  /MediaBox [0 0 612 792]
  /Contents 4 0 R
>>
endobj
4 0 obj
<<
  /Length 240
>>
stream
BT
/F1 22 Tf
50 720 Td
(BrainByte Books - Secure Digital Edition) Tj
/F1 16 Tf
0 -40 Td
(${title.replace(/[^a-zA-Z0-9\s]/g, '')}) Tj
/F2 11 Tf
0 -30 Td
(Licensed to authorized purchaser. Protected by cryptographically expiring tokens.) Tj
0 -20 Td
(Thank you for learning with BrainByte Books! Instant secure digital delivery verified.) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000305 00000 n 
trailer
<<
  /Size 5
  /Root 1 0 R
>>
startxref
595
%%EOF`;
};

const sampleBooks = [
  {
    title: 'Modern React 19 & Full-Stack Architecture',
    author: 'Elena Vance & Dev Team',
    description: 'Master React 19 Server Components, Actions, optimistic UI patterns, compiler optimizations, and robust full-stack production architecture with real-world case studies.',
    price: 599,
    category: 'Web Development',
    coverImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&auto=format&fit=crop&q=80',
    fileName: 'react-19-architecture.pdf',
    samplePages: 12,
    pages: 384,
    language: 'English',
    isbn: '978-1-987654-01-2',
    tags: ['React', 'JavaScript', 'Frontend', 'WebDev'],
    totalSales: 42,
  },
  {
    title: 'Autonomous AI Agents & Large Language Models',
    author: 'Dr. Aris Thorne',
    description: 'A comprehensive handbook for building multi-agent systems, tool augmentation, memory architectures, semantic search with vector embeddings, and production safety guardrails.',
    price: 899,
    category: 'AI & Machine Learning',
    coverImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&auto=format&fit=crop&q=80',
    fileName: 'ai-agents-llm.pdf',
    samplePages: 15,
    pages: 460,
    language: 'English',
    isbn: '978-1-987654-02-9',
    tags: ['AI', 'Python', 'LLM', 'Agents', 'MachineLearning'],
    totalSales: 87,
  },
  {
    title: 'Designing Resilient Microservices & Kubernetes',
    author: 'Marcus K. Bell',
    description: 'The definitive blueprint for high-throughput distributed systems, container orchestration, event-driven streaming, zero-trust security, and observability in the cloud.',
    price: 749,
    category: 'DevOps',
    coverImage: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=600&auto=format&fit=crop&q=80',
    fileName: 'microservices-k8s.pdf',
    samplePages: 10,
    pages: 512,
    language: 'English',
    isbn: '978-1-987654-03-6',
    tags: ['DevOps', 'Kubernetes', 'Docker', 'Cloud'],
    totalSales: 35,
  },
  {
    title: 'Python for High-Performance Data Engineering',
    author: 'Sophia Chen',
    description: 'Transform raw data into real-time analytical pipelines. Covers Polars, DuckDB, Apache Spark, delta tables, columnar storage optimizations, and cloud warehouses.',
    price: 649,
    category: 'Data Science',
    coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80',
    fileName: 'python-data-engineering.pdf',
    samplePages: 14,
    pages: 420,
    language: 'English',
    isbn: '978-1-987654-04-3',
    tags: ['Python', 'DataScience', 'DataEngineering', 'SQL'],
    totalSales: 51,
  },
  {
    title: 'Offensive Security & Modern Penetration Testing',
    author: 'Viktor Ramos',
    description: 'Hands-on offensive cyber defense tactics, network vulnerability exploitation, web application security (OWASP Top 10), identity attack paths, and cryptographic safeguards.',
    price: 799,
    category: 'Cybersecurity',
    coverImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&auto=format&fit=crop&q=80',
    fileName: 'offensive-security.pdf',
    samplePages: 12,
    pages: 475,
    language: 'English',
    isbn: '978-1-987654-05-0',
    tags: ['Security', 'EthicalHacking', 'Linux', 'Network'],
    totalSales: 29,
  },
  {
    title: 'System Design Patterns: From MVP to Hyper-Scale',
    author: 'Liam O\'Connor',
    description: 'Learn how modern tech giants scale to millions of concurrent users. In-depth chapters on caching strategies, database sharding, rate limiting, and consensus algorithms.',
    price: 699,
    category: 'Software Engineering',
    coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80',
    fileName: 'system-design-patterns.pdf',
    samplePages: 15,
    pages: 395,
    language: 'English',
    isbn: '978-1-987654-06-7',
    tags: ['SystemDesign', 'Architecture', 'Backend', 'Scalability'],
    totalSales: 63,
  },
];

const seedDatabase = async () => {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('❌ MONGODB_URI is not defined in server/.env');
    process.exit(1);
  }

  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB.');

    // 1. Ensure private upload directories exist
    const uploadsDir = path.join(__dirname, 'uploads');
    const coversDir = path.join(uploadsDir, 'covers');
    const pdfsDir = path.join(uploadsDir, 'pdfs');
    [uploadsDir, coversDir, pdfsDir].forEach((dir) => {
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    });

    // 2. Seed Default Admin User
    const adminEmail = 'hemantjvd@gmail.com';
    let adminUser = await User.findOne({ email: adminEmail });
    if (!adminUser) {
      adminUser = await User.create({
        name: 'Hemant Sharma',
        email: adminEmail,
        password: 'Hemant2005@gmail',
        role: 'admin',
      });
      console.log('✅ Created Admin user: hemantjvd@gmail.com');
    } else {
      adminUser.role = 'admin';
      await adminUser.save();
      console.log('ℹ️ Admin user already exists: hemantjvd@gmail.com');
    }

    // 3. Seed Default Customer User
    const userEmail = 'user@brainbyte.com';
    let normalUser = await User.findOne({ email: userEmail });
    if (!normalUser) {
      normalUser = await User.create({
        name: 'Alex Reader',
        email: userEmail,
        password: 'Password123!',
        role: 'user',
      });
      console.log('✅ Created Demo Customer: user@brainbyte.com (Password: Password123!)');
    } else {
      console.log('ℹ️ Customer user already exists: user@brainbyte.com');
    }

    // 4. Seed Books with Private PDF Files
    for (const book of sampleBooks) {
      const existing = await Book.findOne({ title: book.title });
      const pdfFilePath = path.join(pdfsDir, book.fileName);

      // Write valid physical sample PDF file into the private pdf vault
      const pdfContent = createSamplePdf(book.title);
      fs.writeFileSync(pdfFilePath, pdfContent, 'utf-8');

      const bookPayload = {
        title: book.title,
        author: book.author,
        description: book.description,
        price: book.price,
        category: book.category,
        coverImage: book.coverImage,
        pdfFile: `uploads/pdfs/${book.fileName}`,
        pdfKey: book.fileName,
        storageType: 'local',
        fileSize: Buffer.byteLength(pdfContent),
        samplePages: book.samplePages,
        pages: book.pages,
        language: book.language,
        isbn: book.isbn,
        tags: book.tags,
        totalSales: book.totalSales,
        isAvailable: true,
      };

      if (!existing) {
        await Book.create(bookPayload);
        console.log(`✅ Seeded e-book: "${book.title}"`);
      } else {
        await Book.findByIdAndUpdate(existing._id, bookPayload);
        console.log(`ℹ️ Updated e-book: "${book.title}"`);
      }
    }

    console.log('\n🎉 Seeding complete! Database is ready with demo users and e-books.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
};

seedDatabase();
