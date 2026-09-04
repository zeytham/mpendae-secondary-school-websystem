const prisma = require('../utils/prisma');

const getAll = async (req, res, next) => {
  try {
    const milestones = await prisma.milestone.findMany({
      orderBy: [
        { year: 'asc' },
        { order: 'asc' },
      ],
    });
    res.json(milestones);
  } catch (error) {
    next(error);
  }
};

const createMilestone = async (req, res, next) => {
  try {
    const milestone = await prisma.milestone.create({
      data: req.body,
    });
    res.status(201).json(milestone);
  } catch (error) {
    next(error);
  }
};

const updateMilestone = async (req, res, next) => {
  try {
    const { id } = req.params;
    const milestone = await prisma.milestone.update({
      where: { id },
      data: req.body,
    });
    res.json(milestone);
  } catch (error) {
    next(error);
  }
};

const deleteMilestone = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.milestone.delete({
      where: { id },
    });
    res.json({ message: 'Milestone deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAll,
  createMilestone,
  updateMilestone,
  deleteMilestone,
};
