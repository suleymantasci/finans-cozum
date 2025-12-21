import { PrismaClient } from '../generated/prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
import { generateSlug, generateUniqueSlug } from '../common/utils/slug.util';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  const allNews = await prisma.news.findMany({
    where: {
      OR: [
        { slug: null },
        { slug: '' },
      ],
    },
  });

  console.log(`Found ${allNews.length} news items without slug`);

  for (const news of allNews) {
    const baseSlug = generateSlug(news.title);
    const slug = await generateUniqueSlug(
      baseSlug,
      async (slug) => {
        const existing = await prisma.news.findFirst({
          where: {
            slug,
            NOT: { id: news.id },
          },
        });
        return !!existing;
      }
    );

    await prisma.news.update({
      where: { id: news.id },
      data: { slug },
    });

    console.log(`Updated news "${news.title}" with slug: ${slug}`);
  }

  console.log('✅ All news slugs updated!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


