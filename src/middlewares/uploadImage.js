import multer from "multer";
import path from "path";

import { RequestValidationError } from "./Errors";

var _ = require('lodash');

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'tmp');
  },
  filename: function (req, file, cb) {
    var ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${Date.now()}${ext}`);
  }
});

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
