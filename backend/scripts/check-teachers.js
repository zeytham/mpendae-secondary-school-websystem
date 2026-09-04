require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.teacher.findMany({ select: { id: true, firstName: true, lastName: true, status: true } })
.then(teachers => {
  console.log('Walimu wote:');
  teachers.forEach(t => console.log(' -', t.firstName, t.lastName, '| status:', t.status, '| id:', t.id));
})
.finally(() => p.$disconnect());
