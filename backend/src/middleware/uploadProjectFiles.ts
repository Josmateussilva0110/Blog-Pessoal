import multer from "multer"
import { PROJECT_IMAGE_MAX_BYTES, PROJECT_IMAGES_MAX_COUNT } from "@blog/shared"
import { buildUploadErrorMessages } from "../errors/uploads"
import { runUpload } from "../utils/http/runUpload"

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: PROJECT_IMAGE_MAX_BYTES,
    files: PROJECT_IMAGES_MAX_COUNT,
  },
})

export const uploadProjectFiles = runUpload(
  upload.fields([{ name: "images", maxCount: PROJECT_IMAGES_MAX_COUNT }]),
  { messages: buildUploadErrorMessages(PROJECT_IMAGE_MAX_BYTES, "os arquivos", "JPEG, PNG, WebP ou GIF") },
)
