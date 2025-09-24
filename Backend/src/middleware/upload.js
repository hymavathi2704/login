// Deprecated: profile/upload handling removed from backend.
// If you still need file uploads for other features later, reintroduce multer and configure an upload dir.

module.exports = function deprecatedUploadMiddleware() {
  throw new Error('upload middleware was removed — profile uploads are deprecated. If you need uploads, re-add multer configuration.');
};
