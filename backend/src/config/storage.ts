import { environment } from "./environment";

export const storageConfig = {
  type: environment.storage.type,
  uploadDir: environment.storage.uploadDir,
  s3Bucket: environment.storage.s3Bucket,
  s3Region: environment.storage.s3Region,
};
