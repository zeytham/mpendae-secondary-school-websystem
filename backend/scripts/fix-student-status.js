require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.student.updateMany({
  where: { status: 'TRANSFERRED' },
  data: { status: 'ACTIVE' }
})
.then(result => {
  console.log('Wanafunzi waliosasishwa:', result.count);
  return p.student.findMany({ select: { firstName: true, lastName: true, status: true, regNumber: true } });
})
.then(students => {
  console.log('Hali baada ya marekebisho:');
  students.forEach(s => console.log(' -', s.firstName, s.lastName, '| status:', s.status));
})
.finally(() => p.$disconnect());
