require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
Promise.all([
  p.news.findMany({ select: { id: true, title: true, status: true, publishedAt: true }, orderBy: { createdAt: 'desc' } }),
  p.event.findMany({ select: { id: true, title: true, status: true, startDate: true }, orderBy: { createdAt: 'desc' } }),
])
.then(([news, events]) => {
  console.log('=== HABARI ===');
  news.forEach(n => console.log(' -', n.title, '| status:', n.status, '| publishedAt:', n.publishedAt));
  console.log('\n=== MATUKIO ===');
  events.forEach(e => console.log(' -', e.title, '| status:', e.status, '| startDate:', e.startDate));
})
.finally(() => p.$disconnect());
