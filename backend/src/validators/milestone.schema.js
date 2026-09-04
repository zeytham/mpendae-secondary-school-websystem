const { z } = require('zod');

const milestoneSchema = z.object({
  year: z.string().trim().min(1, 'Mwaka unahitajika').max(20),
  event: z.string().trim().min(1, 'Tukio linahitajika').max(500),
  order: z.number().int().optional(),
});

const updateMilestoneSchema = milestoneSchema.partial();

module.exports = { milestoneSchema, updateMilestoneSchema };
