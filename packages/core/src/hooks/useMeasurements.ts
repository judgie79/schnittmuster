import { useQuery } from '@tanstack/react-query';
import { measurementService } from '../services/measurements';
import type { MeasurementTypeDTO, PatternMeasurementDTO } from '@schnittmuster/dtos';

export const useMeasurementTypes = (category?: string) => {
  const query = useQuery<MeasurementTypeDTO[], Error>({
    queryKey: ['measurementTypes', category],
    queryFn: () => measurementService.getMeasurementTypes(category),
    staleTime: 5 * 60 * 1000,
  });

  return {
    ...query,
    measurementTypes: query.data ?? [],
  };
};

export const useSystemDefaultMeasurements = () => {
  const query = useQuery<MeasurementTypeDTO[], Error>({
    queryKey: ['measurementTypes', 'system-defaults'],
    queryFn: () => measurementService.getSystemDefaults(),
    staleTime: 5 * 60 * 1000,
  });

  return {
    ...query,
    systemDefaults: query.data ?? [],
  };
};

export const useUserCustomMeasurements = () => {
  const query = useQuery<MeasurementTypeDTO[], Error>({
    queryKey: ['measurementTypes', 'user-custom'],
    queryFn: () => measurementService.getUserCustom(),
    staleTime: 5 * 60 * 1000,
  });

  return {
    ...query,
    customMeasurements: query.data ?? [],
  };
};

export const usePatternMeasurements = (patternId: string | undefined) => {
  const query = useQuery<PatternMeasurementDTO[], Error>({
    queryKey: ['patternMeasurements', patternId],
    queryFn: () => measurementService.getPatternMeasurements(patternId!),
    enabled: !!patternId,
    staleTime: 5 * 60 * 1000,
  });

  return {
    ...query,
    measurements: query.data ?? [],
  };
};
