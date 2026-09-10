const { deleteFromCloudinary } = require('../utils/cloudinary');
const { sendContactMessage } = require('../utils/email');

const prisma = require('../utils/prisma');

const getSettings = async (req, res, next) => {
  try {
    let settings = await prisma.schoolSettings.findFirst();
    if (!settings) {
      settings = await prisma.schoolSettings.create({ data: {} });
    }

    if (settings && settings.artsReelUrl === undefined) {
      try {
        const raw = await prisma.$queryRawUnsafe(
          `SELECT "artsReelUrl" FROM "SchoolSettings" WHERE id = $1`,
          settings.id
        );
        if (raw && raw[0]) {
          settings.artsReelUrl = raw[0].artsReelUrl;
        }
      } catch (e) {}
    }

    res.json(settings);
  } catch (error) {
    next(error);
  }
};

const updateSettings = async (req, res, next) => {
  try {
    let settings = await prisma.schoolSettings.findFirst();
    if (!settings) {
      settings = await prisma.schoolSettings.create({ data: {} });
    }

    const { artsReelUrl, ...restData } = req.body;

    const updated = await prisma.schoolSettings.update({
      where: { id: settings.id },
      data: restData,
    });

    if (artsReelUrl !== undefined) {
      try {
        await prisma.$executeRawUnsafe(
          `UPDATE "SchoolSettings" SET "artsReelUrl" = $1 WHERE id = $2`,
          artsReelUrl,
          settings.id
        );
        updated.artsReelUrl = artsReelUrl;
      } catch (e) {}
    }

    res.json({ message: 'Settings updated.', settings: updated });
  } catch (error) {
    next(error);
  }
};

const uploadLogo = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });

    let settings = await prisma.schoolSettings.findFirst();
    if (!settings) {
      settings = await prisma.schoolSettings.create({ data: {} });
    }

    if (settings.logoPubId) await deleteFromCloudinary(settings.logoPubId);

    const updated = await prisma.schoolSettings.update({
      where: { id: settings.id },
      data: { logoUrl: req.file.path, logoPubId: req.file.filename },
    });
    res.json({ message: 'Logo updated.', logoUrl: updated.logoUrl });
  } catch (error) {
    next(error);
  }
};

const contactForm = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body; // tayari imepitia contactSchema

    await sendContactMessage({ name, email, subject, message });
    res.json({ message: 'Your message has been sent. We will get back to you soon.' });
  } catch (error) {
    console.error('Contact email error:', error.message);
    res.json({ message: 'Your message has been received.' });
  }
};

const getDashboardStats = async (req, res, next) => {
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

    const totalFormStudents = form1 + form2 + form3 + form4 + form5 + form6;
    const form4Grads = settings.form4Graduates || 0;
    const form6Grads = settings.form6Graduates || 0;
    const totalGraduated = form4Grads + form6Grads;

    const [dbStudentCount, teachers, pendingAdmissions, upcomingEvents, recentNews, recentAdmissions] = await Promise.all([
      prisma.student.count({ where: { status: 'ACTIVE' } }),
      prisma.teacher.count({ where: { status: 'ACTIVE' } }),
      prisma.admission.count({ where: { status: 'PENDING' } }),
      prisma.event.count({ where: { status: { in: ['UPCOMING', 'ONGOING'] } } }),
      prisma.news.findMany({ where: { status: 'PUBLISHED' }, take: 5, orderBy: { publishedAt: 'desc' }, select: { id: true, title: true, publishedAt: true, category: true } }),
      prisma.admission.findMany({ take: 5, orderBy: { createdAt: 'desc' }, select: { id: true, firstName: true, lastName: true, status: true, referenceNo: true, createdAt: true } }),
    ]);

    const studentTotal = totalFormStudents > 0 ? totalFormStudents : dbStudentCount;

    res.json({
      students: studentTotal,
      graduated: totalGraduated,
      form4Graduates: form4Grads,
      form6Graduates: form6Grads,
      teachers,
      pendingAdmissions,
      upcomingEvents,
      recentNews,
      recentAdmissions,
      formCounts: {
        form1, form2, form3, form4, form5, form6,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getSettings, updateSettings, uploadLogo, contactForm, getDashboardStats };