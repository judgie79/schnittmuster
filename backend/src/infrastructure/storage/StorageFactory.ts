import { environment } from "@config/environment";
import { IFileStorage } from "./FileStorageService";
import { LocalStorage } from "./implementations/LocalStorage";
import { S3Storage } from "./implementations/S3Storage";
import { DatabaseStorage } from "./implementations/DatabaseStorage";

export class StorageFactory {
  static create(): IFileStorage {
    switch (environment.storage.type) {
      case "local":
        return new LocalStorage(environment.storage.uploadDir);
      case "s3":
        if (!environment.storage.s3Bucket) {
          throw new Error("S3 bucket not configured");
        }
        return new S3Storage(environment.storage.s3Bucket, environment.storage.s3Region);
      case "database":
        return new DatabaseStorage();
      default:
        throw new Error(`Unknown storage type: ${environment.storage.type}`);
    }
  }
}
