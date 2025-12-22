import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import type { FabricRequirementsDTO } from '@schnittmuster/dtos';
import { getAppTheme } from '@/constants/theme';

const theme = getAppTheme();

type FabricRequirementsProps = {
  fabricRequirements: FabricRequirementsDTO;
  onChange: (fabric: FabricRequirementsDTO) => void;
};

export const FabricRequirements = ({ fabricRequirements, onChange }: FabricRequirementsProps) => {
  const handleChange = (field: keyof FabricRequirementsDTO, value: string) => {
    if (field === 'fabricWidth' || field === 'fabricLength') {
      const numValue = value ? parseFloat(value) : undefined;
      onChange({ ...fabricRequirements, [field]: numValue });
    } else {
      onChange({ ...fabricRequirements, [field]: value || undefined });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Stoffbreite (cm)</Text>
      <TextInput
        style={styles.input}
        value={fabricRequirements.fabricWidth?.toString() ?? ''}
        onChangeText={(text) => handleChange('fabricWidth', text)}
        placeholder="z.B. 140"
        keyboardType="decimal-pad"
      />

      <Text style={styles.label}>Stofflänge (cm)</Text>
      <TextInput
        style={styles.input}
        value={fabricRequirements.fabricLength?.toString() ?? ''}
        onChangeText={(text) => handleChange('fabricLength', text)}
        placeholder="z.B. 200"
        keyboardType="decimal-pad"
      />

      <Text style={styles.label}>Stoffart</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        value={fabricRequirements.fabricType ?? ''}
        onChangeText={(text) => handleChange('fabricType', text)}
        placeholder="z.B. Baumwolle, Leinen, Jersey"
        multiline
        numberOfLines={2}
      />
      <Text style={styles.helperText}>
        Optional: Gib die empfohlenen Stoffarten an
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.cardBackground,
    padding: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textPrimary,
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 10,
    marginBottom: 4,
    fontSize: 15,
    color: theme.textPrimary,
  },
  multiline: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  helperText: {
    fontSize: 12,
    color: theme.textSecondary,
    marginTop: 4,
  },
});
