import { promises as fs } from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { FileMetadata, IFileStorage } from "../FileStorageService";

export class LocalStorage implements IFileStorage {
  constructor(private readonly uploadDir: string = "./uploads") {}

  private getAbsolutePath(fileName: string): string {
    return path.resolve(this.uploadDir, fileName);
  }

  private async resolveStoredName(fileId: string): Promise<string | undefined> {
    const files = await fs.readdir(this.uploadDir);
    return files.find((f) => f.startsWith(fileId));
  }

  async upload(file: Buffer, fileName: string, mimeType: string): Promise<FileMetadata> {
    await fs.mkdir(this.uploadDir, { recursive: true });
    const fileId = uuidv4();
    const storedName = fileId;
    const filePath = this.getAbsolutePath(storedName);
    await fs.writeFile(filePath, file);

    return {
      id: fileId,
      originalName: fileName,
      mimeType,
      size: file.length,
      url: `/uploads/${storedName}`,
    };
  }

  async download(fileId: string): Promise<Buffer> {
    const match = await this.resolveStoredName(fileId);
    if (!match) {
      throw new Error("File not found");
    }
    return fs.readFile(this.getAbsolutePath(match));
  }

  async delete(fileId: string): Promise<void> {
    const match = await this.resolveStoredName(fileId);
    if (!match) {
      return;
    }
    await fs.unlink(this.getAbsolutePath(match));
  }

  getUrl(fileId: string): string {
    // Consumers should rely on metadata.url returned from upload; fallback uses base path
    return `/uploads/${fileId}`;
  }
}
