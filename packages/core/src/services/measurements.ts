import { apiClient } from './api';
import type {
  ApiResponse,
  MeasurementTypeDTO,
  MeasurementTypeCreateDTO,
  MeasurementTypeUpdateDTO,
  PatternMeasurementDTO,
  PatternMeasurementCreateDTO,
  PatternMeasurementUpdateDTO,
} from '@schnittmuster/dtos';

export const measurementService = {
  // Measurement Types
  async getMeasurementTypes(category?: string): Promise<MeasurementTypeDTO[]> {
    const response = await apiClient.get<ApiResponse<MeasurementTypeDTO[]>>('/measurement-types', {
      params: category ? { category } : undefined,
    });
    return response.data.data;
  },

  async getSystemDefaults(): Promise<MeasurementTypeDTO[]> {
    const response = await apiClient.get<ApiResponse<MeasurementTypeDTO[]>>('/measurement-types/system-defaults');
    return response.data.data;
  },

  async getUserCustom(): Promise<MeasurementTypeDTO[]> {
    const response = await apiClient.get<ApiResponse<MeasurementTypeDTO[]>>('/measurement-types/custom');
    return response.data.data;
  },

  async getMeasurementType(id: string): Promise<MeasurementTypeDTO> {
    const response = await apiClient.get<ApiResponse<MeasurementTypeDTO>>(`/measurement-types/${id}`);
    return response.data.data;
  },

  async createMeasurementType(data: MeasurementTypeCreateDTO): Promise<MeasurementTypeDTO> {
    const response = await apiClient.post<ApiResponse<MeasurementTypeDTO>>('/measurement-types', data);
    return response.data.data;
  },

  async updateMeasurementType(id: string, data: MeasurementTypeUpdateDTO): Promise<MeasurementTypeDTO> {
    const response = await apiClient.patch<ApiResponse<MeasurementTypeDTO>>(`/measurement-types/${id}`, data);
    return response.data.data;
  },

  async deleteMeasurementType(id: string): Promise<void> {
    await apiClient.delete(`/measurement-types/${id}`);
  },

  // Pattern Measurements
  async getPatternMeasurements(patternId: string): Promise<PatternMeasurementDTO[]> {
    const response = await apiClient.get<ApiResponse<PatternMeasurementDTO[]>>(`/patterns/${patternId}/measurements`);
    return response.data.data;
  },

  async addPatternMeasurement(patternId: string, data: PatternMeasurementCreateDTO): Promise<PatternMeasurementDTO> {
    const response = await apiClient.post<ApiResponse<PatternMeasurementDTO>>(
      `/patterns/${patternId}/measurements`,
      data
    );
    return response.data.data;
  },

  async updatePatternMeasurement(
    patternId: string,
    measurementId: string,
    data: PatternMeasurementUpdateDTO
  ): Promise<PatternMeasurementDTO> {
    const response = await apiClient.patch<ApiResponse<PatternMeasurementDTO>>(
      `/patterns/${patternId}/measurements/${measurementId}`,
      data
    );
    return response.data.data;
  },

  async deletePatternMeasurement(patternId: string, measurementId: string): Promise<void> {
    await apiClient.delete(`/patterns/${patternId}/measurements/${measurementId}`);
  },
};
