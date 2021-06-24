import multer from "multer";
import { RequestValidationError } from "./Errors";

var _ = require('lodash');

const storage = multer.memoryStorage();

var limits = {
  files: 1,
  fileSize: 5120 * 1024 // 5 MB
};
  
var fileFilter = function(req, file, cb) {
  var allowedMimes = ['image/jpeg', 'image/pjpeg', 'image/png', 'image/gif'];

  if (_.includes(allowedMimes, file.mimetype)) {
    cb(null, true);
  } else {
    cb(new RequestValidationError('Invalid file type. Only jpg, png and gif image files are allowed.'));
  }
};

export default multer({
  storage,
  limits,
  fileFilter
}).single('image');
