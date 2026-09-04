const { z } = require('zod');

// Helper to format/validate optional URLs, auto-adding https:// if missing
const urlField = z.preprocess((val) => {
  if (val === null || val === undefined) return '';
  let str = String(val).trim();
  if (str && !str.startsWith('http://') && !str.startsWith('https://')) {
    str = 'https://' + str;
  }
  return str;
}, z.string().url().optional().or(z.literal('')));

// Helper for optional email
const emailField = z.preprocess((val) => {
  if (val === null || val === undefined) return '';
  return String(val).trim();
}, z.string().email('Barua pepe si sahihi').optional().or(z.literal('')));

// Helper for optional string fields
const stringField = (maxLen = 3000) => z.preprocess((val) => {
  if (val === null || val === undefined) return '';
  return String(val).trim();
}, z.string().max(maxLen).optional());

const updateSettingsSchema = z.object({
  schoolName: stringField(150),
  motto: stringField(200),
  address: stringField(200),
  phone: stringField(30),
  email: emailField,
  website: urlField,
  about: stringField(3000),
  founded: stringField(10),
  principal: stringField(100),
  nectaPassRate: stringField(50),
  artsReelUrl: urlField,
  facebook: urlField,
  twitter: urlField,
  instagram: urlField,
  youtube: urlField,
  whatsapp: stringField(30),
  logoUrl: z.string().optional(),
});

module.exports = { updateSettingsSchema };