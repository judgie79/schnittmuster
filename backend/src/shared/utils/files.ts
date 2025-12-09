import { environment } from "@config/environment";

const FILE_ROUTE_PREFIX = `${environment.apiPrefix}/files`;

export const buildFileDownloadUrl = (identifier: string): string => {
  return `${FILE_ROUTE_PREFIX}/${identifier}`;
};

export const extractFileIdentifierFromPath = (path?: string | null): string | undefined => {
  if (!path) {
    return undefined;
  }
  const cleaned = path.trim();
  if (!cleaned) {
    return undefined;
  }
  const sanitized = cleaned.split(/[?#]/)[0];
  const segments = sanitized.split("/").filter(Boolean);
  return segments.length ? segments[segments.length - 1] : undefined;
};

export const normalizeFilePathToDownloadUrl = (path?: string | null): string | undefined => {
  const identifier = extractFileIdentifierFromPath(path);
  return identifier ? buildFileDownloadUrl(identifier) : path ?? undefined;
};
