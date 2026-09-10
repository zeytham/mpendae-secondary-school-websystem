const { deleteFromCloudinary } = require('../utils/cloudinary');

const prisma = require('../utils/prisma');

const ALLOWED_FIELDS = [
  'regNumber', 'firstName', 'lastName', 'gender', 'dateOfBirth', 'form',
  'stream', 'parentName', 'parentPhone', 'parentEmail', 'address',
  'enrolledAt', 'status',
];

const pickAllowed = (body) => {
  const out = {};
  for (const key of ALLOWED_FIELDS) {
    if (body[key] !== undefined) out[key] = body[key];
  }
  return out;
};

const getAll = async (req, res, next) => {
  try {
    const { search = '', form = '', status = '' } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const where = {
      AND: [
        search ? {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { regNumber: { contains: search, mode: 'insensitive' } },
          ],
        } : {},
        form ? { form } : {},
        status ? { status } : {},
      ],
    };

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where, skip, take: limit,
        orderBy: [{ form: 'asc' }, { lastName: 'asc' }],
      }),
      prisma.student.count({ where }),
    ]);

    res.json({
      students,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

const getOne = async (req, res, next) => {
  try {
    const student = await prisma.student.findUnique({
      where: { id: req.params.id },
      include: { attendance: { orderBy: { date: 'desc' }, take: 30 } },
    });
    if (!student) return res.status(404).json({ error: 'Student not found.' });
    res.json(student);
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const data = pickAllowed(req.body);
    const photoUrl = req.file ? req.file.path : null;
    const photoPubId = req.file ? req.file.filename : null;

    const baseData = {
      ...data,
      dateOfBirth: new Date(data.dateOfBirth),
      enrolledAt: data.enrolledAt ? new Date(data.enrolledAt) : new Date(),
      photo: photoUrl,
      photoPubId,
    };

    let student;
    if (data.regNumber) {
      // regNumber imetolewa moja kwa moja na mtumiaji -> jaribu mara moja tu,
      // error ya kawaida (tayari ipo) itashughulikiwa na errorHandler (P2002).
      student = await prisma.student.create({ data: baseData });
    } else {
      // Auto-generate: awali tulitumia prisma.student.count() mara moja tu ->
      // kama maombi 2 ya "ongeza mwanafunzi" bila regNumber yanatumwa kwa
      // wakati mmoja, yote mawili yanaweza kupata hesabu ile ile na
      // kujaribu regNumber sawa (race condition). Sasa tunajaribu tena
      // (retry) kama collision itatokea, hadi mara 5.
      const year = new Date().getFullYear();
      let attempt = 0;
      while (true) {
        attempt++;
        const count = await prisma.student.count();
        const regNumber = `MPS/${year}/${String(count + attempt).padStart(4, '0')}`;
        try {
          student = await prisma.student.create({ data: { ...baseData, regNumber } });
          break;
        } catch (err) {
          if (err.code === 'P2002' && attempt < 5) continue; // regNumber tayari ipo, jaribu tena
          throw err;
        }
      }
    }

    res.status(201).json({ message: 'Student added successfully.', student });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = pickAllowed(req.body);

    const existing = await prisma.student.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Student not found.' });

    let photo = existing.photo;
    let photoPubId = existing.photoPubId;
    if (req.file) {
      if (existing.photoPubId) await deleteFromCloudinary(existing.photoPubId);
      photo = req.file.path;
      photoPubId = req.file.filename;
    }

    const student = await prisma.student.update({
      where: { id },
      data: {
        ...data,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : existing.dateOfBirth,
        photo,
        photoPubId,
      },
    });
    res.json({ message: 'Student updated successfully.', student });
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const student = await prisma.student.findUnique({ where: { id } });
    if (!student) return res.status(404).json({ error: 'Student not found.' });

    if (student.photoPubId) await deleteFromCloudinary(student.photoPubId);
    await prisma.student.delete({ where: { id } });

    res.json({ message: 'Student deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

const getStats = async (req, res, next) => {
  try {
    let settings = await prisma.schoolSettings.findFirst();
    if (!settings) {
      settings = await prisma.schoolSettings.create({ data: {} });
    }

    const form1 = settings.form1Count || 0;
    const form2 = settings.form2Count || 0;
    const form3 = settings.form3Count || 0;
    const form4 = settings.form4Count || 0;
    const form5 = settings.form5Count || 0;
    const form6 = settings.form6Count || 0;

    const totalStudents = form1 + form2 + form3 + form4 + form5 + form6;
    const form4Grads = settings.form4Graduates || 0;
    const form6Grads = settings.form6Graduates || 0;
    const totalGraduated = form4Grads + form6Grads;

    const activeDbStudents = await prisma.student.count({ where: { status: 'ACTIVE' } });
    const finalTotal = totalStudents > 0 ? totalStudents : activeDbStudents;

    const byForm = [
      { form: 'FORM_1', _count: { id: form1 } },
      { form: 'FORM_2', _count: { id: form2 } },
      { form: 'FORM_3', _count: { id: form3 } },
      { form: 'FORM_4', _count: { id: form4 } },
      { form: 'FORM_5', _count: { id: form5 } },
      { form: 'FORM_6', _count: { id: form6 } },
    ];

    const byGender = [
      { gender: 'MALE', _count: { id: Math.ceil(finalTotal * 0.52) } },
      { gender: 'FEMALE', _count: { id: Math.floor(finalTotal * 0.48) } },
    ];

    const byStatus = [
      { status: 'ACTIVE', _count: { id: finalTotal } },
      { status: 'GRADUATED', _count: { id: totalGraduated } },
    ];

    res.json({
      total: finalTotal,
      byForm,
      byGender,
      byStatus,
      graduated: totalGraduated,
      form4Graduates: form4Grads,
      form6Graduates: form6Grads,
      formCounts: {
        form1, form2, form3, form4, form5, form6,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateStudentCounts = async (req, res, next) => {
  try {
    let settings = await prisma.schoolSettings.findFirst();
    if (!settings) {
      settings = await prisma.schoolSettings.create({ data: {} });
    }

    const {
      form1Count, form2Count, form3Count, form4Count, form5Count, form6Count,
      form4Graduates, form6Graduates,
    } = req.body;

    const updated = await prisma.schoolSettings.update({
      where: { id: settings.id },
      data: {
        form1Count: Number(form1Count) || 0,
        form2Count: Number(form2Count) || 0,
        form3Count: Number(form3Count) || 0,
        form4Count: Number(form4Count) || 0,
        form5Count: Number(form5Count) || 0,
        form6Count: Number(form6Count) || 0,
        form4Graduates: Number(form4Graduates) || 0,
        form6Graduates: Number(form6Graduates) || 0,
      },
    });

    res.json({ message: 'Takwimu za wanafunzi na wahitimu zimesasishwa vyema.', settings: updated });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, getOne, create, update, remove, getStats, updateStudentCounts };