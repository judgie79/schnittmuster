export interface FileMetadata {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
}

export interface IFileStorage {
  upload(file: Buffer, fileName: string, mimeType: string): Promise<FileMetadata>;
  download(fileId: string): Promise<Buffer>;
  delete(fileId: string): Promise<void>;
  getUrl(fileId: string): string;
}
