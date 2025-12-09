import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";
import { FileMetadata, IFileStorage } from "../FileStorageService";
import { buildFileDownloadUrl } from "@shared/utils/files";

export class S3Storage implements IFileStorage {
  private readonly s3: AWS.S3;

  constructor(private readonly bucket: string, region: string) {
    this.s3 = new AWS.S3({ region });
  }

  async upload(file: Buffer, fileName: string, mimeType: string): Promise<FileMetadata> {
    const fileId = uuidv4();
    const key = `patterns/${fileId}`;

    await this.s3
      .putObject({
        Bucket: this.bucket,
        Key: key,
        Body: file,
        ContentType: mimeType,
      })
      .promise();

    return {
      id: fileId,
      originalName: fileName,
      mimeType,
      size: file.length,
      url: buildFileDownloadUrl(fileId),
    };
  }

  async download(fileId: string): Promise<Buffer> {
    const { Body } = await this.s3
      .getObject({
        Bucket: this.bucket,
        Key: `patterns/${fileId}`,
      })
      .promise();

    if (!Body) {
      throw new Error("File not found");
    }

    return Body as Buffer;
  }

  async delete(fileId: string): Promise<void> {
    await this.s3
      .deleteObject({
        Bucket: this.bucket,
        Key: `patterns/${fileId}`,
      })
      .promise();
  }

  getUrl(fileId: string): string {
    return buildFileDownloadUrl(fileId);
  }
}
