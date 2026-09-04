const multer = require('multer');
const { cloudinary } = require('../utils/cloudinary');
const { Readable } = require('stream');

// Use memory storage — files buffered in RAM, then streamed to Cloudinary
const memoryStorage = multer.memoryStorage();

const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const timetableFilter = (req, file, cb) => {
  const allowed = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF and image files are allowed for timetables'), false);
  }
};

// Helper: Upload a buffer to Cloudinary using upload_stream
const uploadBufferToCloudinary = (buffer, folder, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `mpendae-school/${folder}`,
        resource_type: options.resource_type || 'auto',
        ...options,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    const readable = Readable.from(buffer);
    readable.pipe(uploadStream);
  });
};

// Middleware factory: parses single file + uploads to Cloudinary
const uploadImage = (folder) => {
  const upload = multer({
    storage: memoryStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: imageFilter,
  });

  return {
    single: (fieldName) => [
      upload.single(fieldName),
      async (req, res, next) => {
        if (!req.file) return next();
        try {
          const result = await uploadBufferToCloudinary(req.file.buffer, folder, {
            resource_type: 'image',
            transformation: [{ quality: 'auto', fetch_format: 'auto' }],
          });
          req.file.path = result.secure_url;
          req.file.filename = result.public_id;
          next();
        } catch (err) {
          next(err);
        }
      },
    ],
  };
};

// Gallery: multiple image upload
const uploadGallery = {
  array: (fieldName, maxCount) => [
    multer({
      storage: memoryStorage,
      limits: { fileSize: 8 * 1024 * 1024 },
      fileFilter: imageFilter,
    }).array(fieldName, maxCount),
    async (req, res, next) => {
      if (!req.files || req.files.length === 0) return next();
      try {
        const uploaded = await Promise.all(
          req.files.map((file) =>
            uploadBufferToCloudinary(file.buffer, 'gallery', { resource_type: 'image' })
          )
        );
        req.files = req.files.map((file, i) => ({
          ...file,
          path: uploaded[i].secure_url,
          filename: uploaded[i].public_id,
        }));
        next();
      } catch (err) {
        next(err);
      }
    },
  ],
};

// Timetable: single file (PDF or image)
const uploadTimetable = {
  single: () => [
    multer({
      storage: memoryStorage,
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: timetableFilter,
    }).fields([{ name: 'file', maxCount: 1 }, { name: 'timetable', maxCount: 1 }]),
    async (req, res, next) => {
      const file = (req.files?.file && req.files.file[0]) || (req.files?.timetable && req.files.timetable[0]) || req.file;
      if (!file) return next();
      try {
        const resourceType = file.mimetype === 'application/pdf' ? 'raw' : 'image';
        const ext = file.originalname ? file.originalname.split('.').pop() : (resourceType === 'raw' ? 'pdf' : 'png');
        const cleanBase = file.originalname ? file.originalname.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_') : 'ratiba';
        const publicId = `${cleanBase}_${Date.now()}.${ext}`;

        const result = await uploadBufferToCloudinary(file.buffer, 'timetables', {
          resource_type: resourceType,
          public_id: publicId,
        });
        req.file = {
          ...file,
          path: result.secure_url,
          filename: result.public_id,
        };
        next();
      } catch (err) {
        next(err);
      }
    },
  ],
};


module.exports = { uploadImage, uploadGallery, uploadTimetable };
