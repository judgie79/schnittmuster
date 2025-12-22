import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useSystemDefaultMeasurements, useUserCustomMeasurements } from '@schnittmuster/core';
import { measurementService } from '@schnittmuster/core';
import type { MeasurementTypeDTO, MeasurementTypeCreateDTO, MeasurementTypeUpdateDTO } from '@schnittmuster/dtos';
import { MeasurementUnit, MeasurementCategory } from '@schnittmuster/dtos';
import { getAppTheme } from '@/constants/theme';

const theme = getAppTheme();

type MeasurementFormData = {
  name: string;
  description: string;
  unit: MeasurementUnit;
  category: MeasurementCategory;
  displayOrder: string;
};

const UNIT_OPTIONS: { value: MeasurementUnit; label: string }[] = [
  { value: MeasurementUnit.cm, label: 'cm' },
  { value: MeasurementUnit.inch, label: 'inch' },
  { value: MeasurementUnit.mm, label: 'mm' },
];

const CATEGORY_OPTIONS: { value: MeasurementCategory; label: string }[] = [
  { value: MeasurementCategory.body, label: 'Körpermaße' },
  { value: MeasurementCategory.garment, label: 'Kleidungsmaße' },
  { value: MeasurementCategory.custom, label: 'Benutzerdefiniert' },
];

export default function MeasurementsScreen() {
  const { systemDefaults, isLoading: loadingSystem, refetch: refetchSystem } = useSystemDefaultMeasurements();
  const { customMeasurements, isLoading: loadingCustom, refetch: refetchCustom } = useUserCustomMeasurements();
  const [refreshing, setRefreshing] = useState(false);
  
  // Forms
  const [measurementForm, setMeasurementForm] = useState<MeasurementFormData>({
    name: '',
    description: '',
    unit: MeasurementUnit.cm,
    category: MeasurementCategory.body,
    displayOrder: '',
  });
  
  // Edit state
  const [editingMeasurement, setEditingMeasurement] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<MeasurementFormData>({
    name: '',
    description: '',
    unit: MeasurementUnit.cm,
    category: MeasurementCategory.body,
    displayOrder: '',
  });
  
  // Modals
  const [showNewMeasurementModal, setShowNewMeasurementModal] = useState(false);
  const [showUnitPicker, setShowUnitPicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const isLoading = loadingSystem || loadingCustom;

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchSystem(), refetchCustom()]);
    setRefreshing(false);
  };

  const handleCreateMeasurement = async () => {
    if (!measurementForm.name.trim()) {
      Alert.alert('Fehler', 'Bitte gib einen Namen ein');
      return;
    }
    try {
      const data: MeasurementTypeCreateDTO = {
        name: measurementForm.name.trim(),
        description: measurementForm.description.trim() || undefined,
        unit: measurementForm.unit,
        category: measurementForm.category,
        displayOrder: measurementForm.displayOrder ? Number(measurementForm.displayOrder) : undefined,
      };
      await measurementService.createMeasurementType(data);
      setMeasurementForm({
        name: '',
        description: '',
        unit: MeasurementUnit.cm,
        category: MeasurementCategory.body,
        displayOrder: '',
      });
      setShowNewMeasurementModal(false);
      await refetchCustom();
      Alert.alert('Erfolg', 'Messung erstellt');
    } catch (error) {
      Alert.alert('Fehler', error instanceof Error ? error.message : 'Fehler beim Erstellen');
    }
  };

  const handleUpdateMeasurement = async (measurementId: string) => {
    try {
      const data: MeasurementTypeUpdateDTO = {
        name: editDraft.name.trim(),
        description: editDraft.description.trim() || undefined,
        unit: editDraft.unit,
        category: editDraft.category,
        displayOrder: editDraft.displayOrder ? Number(editDraft.displayOrder) : undefined,
      };
      await measurementService.updateMeasurementType(measurementId, data);
      setEditingMeasurement(null);
      await refetchCustom();
      Alert.alert('Erfolg', 'Messung aktualisiert');
    } catch (error) {
      Alert.alert('Fehler', error instanceof Error ? error.message : 'Fehler beim Aktualisieren');
    }
  };

  const handleDeleteMeasurement = (measurementId: string) => {
    Alert.alert(
      'Messung löschen',
      'Möchtest du diese Messung wirklich löschen? Sie wird auch von allen Schnittmustern entfernt.',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: async () => {
            try {
              await measurementService.deleteMeasurementType(measurementId);
              await refetchCustom();
              Alert.alert('Erfolg', 'Messung gelöscht');
            } catch (error) {
              Alert.alert('Fehler', error instanceof Error ? error.message : 'Fehler beim Löschen');
            }
          },
        },
      ]
    );
  };

  const startEditMeasurement = (measurement: MeasurementTypeDTO) => {
    setEditDraft({
      name: measurement.name,
      description: measurement.description || '',
      unit: measurement.unit,
      category: measurement.category,
      displayOrder: measurement.displayOrder?.toString() ?? '',
    });
    setEditingMeasurement(measurement.id);
  };

  if (isLoading && systemDefaults.length === 0 && customMeasurements.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={theme.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Meine Messungen</Text>
            <Text style={styles.subtitle}>Verwalte deine benutzerdefinierten Messungen</Text>
          </View>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>Zurück</Text>
          </TouchableOpacity>
        </View>

        {/* System Default Measurements Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Standardmessungen</Text>
          <Text style={styles.sectionDescription}>
            Diese Messungen sind vordefiniert und können nicht bearbeitet werden.
          </Text>

          {systemDefaults.length === 0 ? (
            <Text style={styles.emptyText}>Keine Standardmessungen vorhanden</Text>
          ) : (
            systemDefaults.map((measurement) => (
              <View key={measurement.id} style={styles.card}>
                <View style={styles.measurementInfo}>
                  <View style={styles.measurementHeader}>
                    <Text style={styles.measurementName}>{measurement.name}</Text>
                    <Text style={styles.measurementUnit}>{measurement.unit}</Text>
                  </View>
                  {measurement.description && (
                    <Text style={styles.measurementDescription}>{measurement.description}</Text>
                  )}
                  <Text style={styles.measurementCategory}>
                    {measurement.category === 'body'
                      ? 'Körpermaße'
                      : measurement.category === 'garment'
                      ? 'Kleidungsmaße'
                      : 'Benutzerdefiniert'}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Custom Measurements Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Benutzerdefinierte Messungen</Text>
            <TouchableOpacity onPress={() => setShowNewMeasurementModal(true)} style={styles.addButton}>
              <Text style={styles.addButtonText}>+ Neu</Text>
            </TouchableOpacity>
          </View>

          {customMeasurements.length === 0 ? (
            <Text style={styles.emptyText}>Noch keine benutzerdefinierten Messungen vorhanden</Text>
          ) : (
            customMeasurements.map((measurement) => (
              <View key={measurement.id} style={styles.card}>
                {editingMeasurement === measurement.id ? (
                  <>
                    <TextInput
                      style={styles.input}
                      value={editDraft.name}
                      onChangeText={(text) => setEditDraft((prev) => ({ ...prev, name: text }))}
                      placeholder="Name"
                    />
                    <TextInput
                      style={[styles.input, styles.multiline]}
                      value={editDraft.description}
                      onChangeText={(text) => setEditDraft((prev) => ({ ...prev, description: text }))}
                      placeholder="Beschreibung (optional)"
                      multiline
                      numberOfLines={2}
                    />
                    
                    <TouchableOpacity
                      style={styles.pickerButton}
                      onPress={() => {
                        setIsEditMode(true);
                        setShowUnitPicker(true);
                      }}
                    >
                      <Text style={styles.pickerLabel}>Einheit:</Text>
                      <Text style={styles.pickerValue}>{editDraft.unit}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.pickerButton}
                      onPress={() => {
                        setIsEditMode(true);
                        setShowCategoryPicker(true);
                      }}
                    >
                      <Text style={styles.pickerLabel}>Kategorie:</Text>
                      <Text style={styles.pickerValue}>
                        {CATEGORY_OPTIONS.find((opt) => opt.value === editDraft.category)?.label}
                      </Text>
                    </TouchableOpacity>

                    <TextInput
                      style={styles.input}
                      value={editDraft.displayOrder}
                      onChangeText={(text) => setEditDraft((prev) => ({ ...prev, displayOrder: text }))}
                      placeholder="Reihenfolge (optional)"
                      keyboardType="number-pad"
                    />
                    <View style={styles.buttonRow}>
                      <TouchableOpacity
                        onPress={() => handleUpdateMeasurement(measurement.id)}
                        style={[styles.button, styles.primaryButton]}
                      >
                        <Text style={styles.buttonText}>Speichern</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => setEditingMeasurement(null)}
                        style={[styles.button, styles.secondaryButton]}
                      >
                        <Text style={[styles.buttonText, { color: theme.textPrimary }]}>Abbrechen</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                ) : (
                  <>
                    <View style={styles.measurementInfo}>
                      <View style={styles.measurementHeader}>
                        <Text style={styles.measurementName}>{measurement.name}</Text>
                        <Text style={styles.measurementUnit}>{measurement.unit}</Text>
                      </View>
                      {measurement.description && (
                        <Text style={styles.measurementDescription}>{measurement.description}</Text>
                      )}
                      <Text style={styles.measurementCategory}>
                        {measurement.category === 'body'
                          ? 'Körpermaße'
                          : measurement.category === 'garment'
                          ? 'Kleidungsmaße'
                          : 'Benutzerdefiniert'}
                      </Text>
                    </View>
                    <View style={styles.buttonRow}>
                      <TouchableOpacity onPress={() => startEditMeasurement(measurement)} style={styles.iconButton}>
                        <Text style={styles.iconButtonText}>✏️</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDeleteMeasurement(measurement.id)}
                        style={styles.iconButton}
                      >
                        <Text style={styles.iconButtonText}>🗑️</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* New Measurement Modal */}
      <Modal visible={showNewMeasurementModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Neue Messung</Text>
            <TextInput
              style={styles.input}
              value={measurementForm.name}
              onChangeText={(text) => setMeasurementForm((prev) => ({ ...prev, name: text }))}
              placeholder="Name"
              autoFocus
            />
            <TextInput
              style={[styles.input, styles.multiline]}
              value={measurementForm.description}
              onChangeText={(text) => setMeasurementForm((prev) => ({ ...prev, description: text }))}
              placeholder="Beschreibung (optional)"
              multiline
              numberOfLines={2}
            />
            
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => {
                setIsEditMode(false);
                setShowUnitPicker(true);
              }}
            >
              <Text style={styles.pickerLabel}>Einheit:</Text>
              <Text style={styles.pickerValue}>{measurementForm.unit}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => {
                setIsEditMode(false);
                setShowCategoryPicker(true);
              }}
            >
              <Text style={styles.pickerLabel}>Kategorie:</Text>
              <Text style={styles.pickerValue}>
                {CATEGORY_OPTIONS.find((opt) => opt.value === measurementForm.category)?.label}
              </Text>
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              value={measurementForm.displayOrder}
              onChangeText={(text) => setMeasurementForm((prev) => ({ ...prev, displayOrder: text }))}
              placeholder="Reihenfolge (optional)"
              keyboardType="number-pad"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={handleCreateMeasurement} style={[styles.button, styles.primaryButton]}>
                <Text style={styles.buttonText}>Erstellen</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowNewMeasurementModal(false)}
                style={[styles.button, styles.secondaryButton]}
              >
                <Text style={[styles.buttonText, { color: theme.textPrimary }]}>Abbrechen</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Unit Picker Modal */}
      <Modal visible={showUnitPicker} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.pickerModal}>
            <Text style={styles.modalTitle}>Einheit wählen</Text>
            {UNIT_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={styles.pickerOption}
                onPress={() => {
                  if (isEditMode) {
                    setEditDraft((prev) => ({ ...prev, unit: option.value }));
                  } else {
                    setMeasurementForm((prev) => ({ ...prev, unit: option.value }));
                  }
                  setShowUnitPicker(false);
                }}
              >
                <Text style={styles.pickerOptionText}>{option.label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton, { marginTop: 12 }]}
              onPress={() => setShowUnitPicker(false)}
            >
              <Text style={[styles.buttonText, { color: theme.textPrimary }]}>Abbrechen</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Category Picker Modal */}
      <Modal visible={showCategoryPicker} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.pickerModal}>
            <Text style={styles.modalTitle}>Kategorie wählen</Text>
            {CATEGORY_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={styles.pickerOption}
                onPress={() => {
                  if (isEditMode) {
                    setEditDraft((prev) => ({ ...prev, category: option.value }));
                  } else {
                    setMeasurementForm((prev) => ({ ...prev, category: option.value }));
                  }
                  setShowCategoryPicker(false);
                }}
              >
                <Text style={styles.pickerOptionText}>{option.label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton, { marginTop: 12 }]}
              onPress={() => setShowCategoryPicker(false)}
            >
              <Text style={[styles.buttonText, { color: theme.textPrimary }]}>Abbrechen</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: theme.textSecondary,
    marginTop: 4,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: theme.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.textPrimary,
  },
  sectionDescription: {
    fontSize: 13,
    color: theme.textSecondary,
    marginBottom: 12,
  },
  addButton: {
    backgroundColor: theme.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  card: {
    backgroundColor: theme.cardBackground,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  measurementInfo: {
    marginBottom: 8,
  },
  measurementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  measurementName: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.textPrimary,
  },
  measurementUnit: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.primary,
  },
  measurementDescription: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 4,
  },
  measurementCategory: {
    fontSize: 13,
    color: theme.textSecondary,
    fontStyle: 'italic',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    fontSize: 16,
    color: theme.textPrimary,
  },
  multiline: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  pickerButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textPrimary,
  },
  pickerValue: {
    fontSize: 16,
    color: theme.primary,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    padding: 12,
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
    fontSize: 16,
  },
  iconButton: {
    padding: 8,
  },
  iconButtonText: {
    fontSize: 20,
  },
  emptyText: {
    color: theme.textSecondary,
    textAlign: 'center',
    padding: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  pickerModal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.textPrimary,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  pickerOption: {
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    marginBottom: 8,
  },
  pickerOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textPrimary,
    textAlign: 'center',
  },
});
