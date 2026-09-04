require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

// Chapisha habari zote za DRAFT
p.news.updateMany({
  where: { status: 'DRAFT' },
  data: { status: 'PUBLISHED', publishedAt: new Date() }
})
.then(result => {
  console.log('Habari zilizochapishwa:', result.count);
  // Rekebisha matukio yenye tarehe ya zamani - seti kuwa UPCOMING kwa tarehe mpya
  return p.event.findMany({ select: { id: true, title: true, status: true, startDate: true, endDate: true } });
})
.then(events => {
  console.log('\nMatukio yote:');
  events.forEach(e => console.log(' -', e.title, '| status:', e.status, '| startDate:', e.startDate));
})
.finally(() => p.$disconnect());
