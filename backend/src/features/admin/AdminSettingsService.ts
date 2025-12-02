import { SystemSettingsDTO } from "@shared/dtos";
import { SystemSettingsRepository } from "@infrastructure/database/repositories/SystemSettingsRepository";

export class AdminSettingsService {
  constructor(private readonly repo = new SystemSettingsRepository()) {}

  async getSettings(): Promise<SystemSettingsDTO> {
    return this.repo.getSettings();
  }

  async updateSettings(partial: Partial<SystemSettingsDTO>, adminId: string): Promise<SystemSettingsDTO> {
    return this.repo.updateSettings(partial, adminId);
  }
}
