const router = require('express').Router();
const {
  getAll,
  createMilestone,
  updateMilestone,
  deleteMilestone,
} = require('../controllers/milestone.controller');
const { protect } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const { milestoneSchema, updateMilestoneSchema } = require('../validators/milestone.schema');

router.get('/', getAll);
router.post('/', protect, validate(milestoneSchema), createMilestone);
router.put('/:id', protect, validate(updateMilestoneSchema), updateMilestone);
router.delete('/:id', protect, deleteMilestone);

module.exports = router;
