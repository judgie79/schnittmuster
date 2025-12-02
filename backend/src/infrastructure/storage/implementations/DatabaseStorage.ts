import { v4 as uuidv4 } from "uuid";
import { FileStorage } from "@infrastructure/database/models/FileStorage";
import { FileMetadata, IFileStorage } from "../FileStorageService";

export class DatabaseStorage implements IFileStorage {
  async upload(file: Buffer, fileName: string, mimeType: string): Promise<FileMetadata> {
    const record = await FileStorage.create({
      id: uuidv4(),
      fileName,
      mimeType,
      fileData: file,
      size: file.length,
    });

    return {
      id: record.id,
      originalName: fileName,
      mimeType,
      size: file.length,
      url: `/api/v1/files/${record.id}`,
    };
  }

  async download(fileId: string): Promise<Buffer> {
    const record = await FileStorage.findByPk(fileId);
    if (!record) {
      throw new Error("File not found");
    }
    return record.fileData;
  }

  async delete(fileId: string): Promise<void> {
    await FileStorage.destroy({ where: { id: fileId } });
  }

  getUrl(fileId: string): string {
    return `/api/v1/files/${fileId}`;
  }
}
