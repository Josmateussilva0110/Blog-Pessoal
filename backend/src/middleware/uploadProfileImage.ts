import multer from "multer"
import { PROFILE_IMAGE_MAX_BYTES, PROFILE_IMAGE_MIME_TYPES } from "../constants/profileImage"
import { buildUploadErrorMessages, INVALID_UPLOAD_TYPE_ERROR } from "../errors/uploads"
import { runUpload } from "../utils/http/runUpload"

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: PROFILE_IMAGE_MAX_BYTES, files: 1 },
  fileFilter: (_request, file, callback) => {
    if (PROFILE_IMAGE_MIME_TYPES.includes(file.mimetype as (typeof PROFILE_IMAGE_MIME_TYPES)[number])) {
      callback(null, true)
      return
    }

    callback(new Error(INVALID_UPLOAD_TYPE_ERROR))
  },
})

export const uploadProfileImage = runUpload(upload.single("image"), {
  messages: buildUploadErrorMessages(PROFILE_IMAGE_MAX_BYTES, "a imagem", "JPEG, PNG ou WebP"),
  requireFile: true,
})
