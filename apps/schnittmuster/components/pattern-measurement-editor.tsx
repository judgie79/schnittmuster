import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useMeasurementTypes } from '@schnittmuster/core';
import { measurementService } from '@schnittmuster/core';
import type { MeasurementTypeDTO, PatternMeasurementDTO, PatternMeasurementCreateDTO } from '@schnittmuster/dtos';
import { getAppTheme } from '@/constants/theme';

const theme = getAppTheme();

type MeasurementInput = {
  measurementTypeId: string;
  measurementType: MeasurementTypeDTO;
  value?: number;
  notes?: string;
  isRequired: boolean;
};

type PatternMeasurementEditorProps = {
  selectedMeasurements: MeasurementInput[];
  onChange: (measurements: MeasurementInput[]) => void;
  patternId?: string;
};

export const PatternMeasurementEditor = ({ selectedMeasurements, onChange, patternId }: PatternMeasurementEditorProps) => {
  const { measurementTypes, isLoading, error } = useMeasurementTypes();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editRequired, setEditRequired] = useState(false);

  const addMeasurement = (type: MeasurementTypeDTO) => {
    const exists = selectedMeasurements.some((m) => m.measurementTypeId === type.id);
    if (exists) {
      Alert.alert('Hinweis', 'Diese Messung wurde bereits hinzugefügt.');
      return;
    }

    onChange([
      ...selectedMeasurements,
      {
        measurementTypeId: type.id,
        measurementType: type,
        value: undefined,
        notes: '',
        isRequired: false,
      },
    ]);
    setShowAddModal(false);
  };

  const removeMeasurement = (typeId: string) => {
    onChange(selectedMeasurements.filter((m) => m.measurementTypeId !== typeId));
  };

  const startEdit = (measurement: MeasurementInput) => {
    setEditingId(measurement.measurementTypeId);
    setEditValue(measurement.value?.toString() ?? '');
    setEditNotes(measurement.notes ?? '');
    setEditRequired(measurement.isRequired);
  };

  const saveEdit = () => {
    if (!editingId) return;
    
    onChange(
      selectedMeasurements.map((m) =>
        m.measurementTypeId === editingId
          ? {
              ...m,
              value: editValue ? parseFloat(editValue) : undefined,
              notes: editNotes,
              isRequired: editRequired,
            }
          : m
      )
    );
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const availableTypes = measurementTypes.filter(
    (type) => !selectedMeasurements.some((m) => m.measurementTypeId === type.id)
  );

  const groupedAvailable = availableTypes.reduce((acc, type) => {
    if (!acc[type.category]) {
      acc[type.category] = [];
    }
    acc[type.category].push(type);
    return acc;
  }, {} as Record<string, MeasurementTypeDTO[]>);

  if (isLoading) {
    return (
      <View style={styles.messageContainer}>
        <ActivityIndicator color={theme.primary} />
        <Text style={styles.subtleText}>Messungen werden geladen …</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.messageContainer}>
        <Text style={[styles.subtleText, styles.errorText]}>Messungen konnten nicht geladen werden.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.subtleText}>
          {selectedMeasurements.length > 0
            ? `${selectedMeasurements.length} Messung(en) hinzugefügt`
            : 'Noch keine Messungen hinzugefügt.'}
        </Text>
        <TouchableOpacity onPress={() => setShowAddModal(true)} style={styles.addButton}>
          <Text style={styles.addButtonText}>+ Hinzufügen</Text>
        </TouchableOpacity>
      </View>

      {selectedMeasurements.map((measurement) => {
        const isEditing = editingId === measurement.measurementTypeId;

        return (
          <View key={measurement.measurementTypeId} style={styles.measurementCard}>
            {isEditing ? (
              <>
                <Text style={styles.measurementName}>
                  {measurement.measurementType.name} ({measurement.measurementType.unit})
                </Text>
                <TextInput
                  style={styles.input}
                  value={editValue}
                  onChangeText={setEditValue}
                  placeholder="Wert"
                  keyboardType="decimal-pad"
                />
                <TextInput
                  style={[styles.input, styles.multiline]}
                  value={editNotes}
                  onChangeText={setEditNotes}
                  placeholder="Notizen (optional)"
                  multiline
                  numberOfLines={2}
                />
                <TouchableOpacity
                  style={styles.checkboxRow}
                  onPress={() => setEditRequired(!editRequired)}
                >
                  <View style={[styles.checkbox, editRequired && styles.checkboxChecked]}>
                    {editRequired && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={styles.checkboxLabel}>Erforderlich</Text>
                </TouchableOpacity>
                <View style={styles.buttonRow}>
                  <TouchableOpacity onPress={saveEdit} style={[styles.button, styles.primaryButton]}>
                    <Text style={styles.buttonText}>Speichern</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={cancelEdit} style={[styles.button, styles.secondaryButton]}>
                    <Text style={[styles.buttonText, { color: theme.textPrimary }]}>Abbrechen</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <View style={styles.measurementInfo}>
                  <View style={styles.measurementHeader}>
                    <Text style={styles.measurementName}>{measurement.measurementType.name}</Text>
                    {measurement.isRequired && <View style={styles.requiredBadge}>
                      <Text style={styles.requiredText}>Erforderlich</Text>
                    </View>}
                  </View>
                  <Text style={styles.measurementValue}>
                    {measurement.value ? `${measurement.value} ${measurement.measurementType.unit}` : 'Kein Wert'}
                  </Text>
                  {measurement.notes && <Text style={styles.measurementNotes}>{measurement.notes}</Text>}
                </View>
                <View style={styles.buttonRow}>
                  <TouchableOpacity onPress={() => startEdit(measurement)} style={styles.iconButton}>
                    <Text style={styles.iconButtonText}>✏️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => removeMeasurement(measurement.measurementTypeId)}
                    style={styles.iconButton}
                  >
                    <Text style={styles.iconButtonText}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        );
      })}

      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Messung hinzufügen</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {Object.keys(groupedAvailable).length === 0 ? (
                <Text style={styles.emptyText}>Alle verfügbaren Messungen wurden bereits hinzugefügt.</Text>
              ) : (
                Object.entries(groupedAvailable).map(([category, types]) => (
                  <View key={category} style={styles.categoryBlock}>
                    <Text style={styles.categoryTitle}>
                      {category === 'body' ? 'Körpermaße' : category === 'garment' ? 'Kleidungsmaße' : 'Benutzerdefiniert'}
                    </Text>
                    {types.map((type) => (
                      <TouchableOpacity
                        key={type.id}
                        style={styles.typeItem}
                        onPress={() => addMeasurement(type)}
                      >
                        <View>
                          <Text style={styles.typeName}>{type.name}</Text>
                          {type.description && (
                            <Text style={styles.typeDescription}>{type.description}</Text>
                          )}
                        </View>
                        <Text style={styles.typeUnit}>{type.unit}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  messageContainer: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.cardBackground,
    padding: 12,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  subtleText: {
    fontSize: 13,
    color: theme.textSecondary,
  },
  errorText: {
    color: '#dc2626',
  },
  addButton: {
    backgroundColor: theme.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  measurementCard: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  measurementInfo: {
    marginBottom: 8,
  },
  measurementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  measurementName: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.textPrimary,
  },
  measurementValue: {
    fontSize: 14,
    color: theme.textPrimary,
    marginBottom: 4,
  },
  measurementNotes: {
    fontSize: 13,
    color: theme.textSecondary,
    fontStyle: 'italic',
  },
  requiredBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  requiredText: {
    fontSize: 11,
    color: '#92400e',
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    fontSize: 15,
    color: theme.textPrimary,
  },
  multiline: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: theme.border,
    borderRadius: 4,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  checkmark: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 14,
    color: theme.textPrimary,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: theme.primary,
  },
  secondaryButton: {
    backgroundColor: '#e2e8f0',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  iconButton: {
    padding: 8,
  },
  iconButtonText: {
    fontSize: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.textPrimary,
  },
  closeButton: {
    fontSize: 24,
    color: theme.textSecondary,
    fontWeight: '300',
  },
  modalContent: {
    padding: 16,
  },
  emptyText: {
    color: theme.textSecondary,
    textAlign: 'center',
    padding: 24,
  },
  categoryBlock: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.textPrimary,
    marginBottom: 8,
  },
  typeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    marginBottom: 8,
  },
  typeName: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.textPrimary,
  },
  typeDescription: {
    fontSize: 13,
    color: theme.textSecondary,
    marginTop: 2,
  },
  typeUnit: {
    fontSize: 14,
    color: theme.textSecondary,
    fontWeight: '600',
  },
});
