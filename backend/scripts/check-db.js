require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.student.findMany({ select: { firstName: true, lastName: true, status: true, regNumber: true } })
  .then(students => {
    console.log('=== WANAFUNZI ===');
    students.forEach(s => console.log(s.firstName, s.lastName, '| status:', s.status, '| reg:', s.regNumber));
    return p.teacher.findMany({ select: { firstName: true, lastName: true, status: true } });
  })
  .then(teachers => {
    console.log('=== WALIMU ===');
    teachers.forEach(t => console.log(t.firstName, t.lastName, '| status:', t.status));
  })
  .finally(() => p.$disconnect());
