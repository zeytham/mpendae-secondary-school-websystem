require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

const now = new Date();

// Tukio la 1: wiki 1 ijayo
const week1Start = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
const week1End   = new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000);

// Tukio la 2: wiki 2 ijayo  
const week2Start = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
const week2End   = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);

p.event.findMany({ orderBy: { createdAt: 'asc' } })
.then(events => {
  const updates = events.map((e, i) => {
    const startDate = i === 0 ? week1Start : week2Start;
    const endDate   = i === 0 ? week1End   : week2End;
    return p.event.update({
      where: { id: e.id },
      data: { startDate, endDate, status: 'UPCOMING' }
    });
  });
  return Promise.all(updates);
})
.then(updated => {
  updated.forEach(e => console.log('Imesasishwa:', e.title, '| status:', e.status, '| startDate:', e.startDate.toDateString()));
})
.finally(() => p.$disconnect());
