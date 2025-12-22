import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { resolveAssetUrl, usePattern, usePatterns, usePatternMeasurements } from '@schnittmuster/core';
import type { TagDTO, FabricRequirementsDTO, MeasurementTypeDTO } from '@schnittmuster/dtos';
import { PatternTagEditor } from '@/components/pattern-tag-editor';
import { PatternMeasurementEditor } from '@/components/pattern-measurement-editor';
import { FabricRequirements } from '@/components/fabric-requirements';
import { getAppTheme } from '@/constants/theme';

type MeasurementInput = {
  measurementTypeId: string;
  measurementType: MeasurementTypeDTO;
  value?: number;
  notes?: string;
  isRequired: boolean;
};

export default function EditPatternScreen() {
  const { patternId } = useLocalSearchParams<{ patternId?: string }>();
  const router = useRouter();
  const { data: pattern, isLoading } = usePattern(patternId);
  const { measurements: existingMeasurements } = usePatternMeasurements(patternId);
  const { mutate } = usePatterns();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnail, setThumbnail] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTags, setSelectedTags] = useState<TagDTO[]>([]);
  const [selectedMeasurements, setSelectedMeasurements] = useState<MeasurementInput[]>([]);
  const [fabricRequirements, setFabricRequirements] = useState<FabricRequirementsDTO>({});

  useEffect(() => {
    if (pattern) {
      setName(pattern.name);
      setDescription(pattern.description || '');
      setSelectedTags(pattern.tags ?? []);
      if (pattern.fabricRequirements) {
        setFabricRequirements({
          fabricWidth: pattern.fabricRequirements.fabricWidth,
          fabricLength: pattern.fabricRequirements.fabricLength,
          fabricType: pattern.fabricRequirements.fabricType,
        });
      }
    }
  }, [pattern]);

  useEffect(() => {
    if (existingMeasurements.length > 0) {
      setSelectedMeasurements(
        existingMeasurements.map((m) => ({
          measurementTypeId: m.measurementTypeId,
          measurementType: m.measurementType,
          value: m.value ?? undefined,
          notes: m.notes,
          isRequired: m.isRequired,
        }))
      );
    }
  }, [existingMeasurements]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });
    if (!result.canceled) {
      setThumbnail(result.assets[0]);
    }
  };

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
      copyToCacheDirectory: true,
    });
    if (!result.canceled) {
      setFile(result.assets[0]);
    }
  };

  const handleSubmit = async () => {
    if (!patternId) return;
    if (!name.trim()) {
      Alert.alert('Fehlende Angaben', 'Bitte einen Namen eingeben.');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('description', description.trim());

      if (thumbnail) {
        formData.append(
          'thumbnail',
          {
            uri: thumbnail.uri,
            name: thumbnail.fileName || 'thumbnail.jpg',
            type: thumbnail.mimeType || 'image/jpeg',
          } as unknown as Blob,
        );
      }

      if (file) {
        formData.append(
          'file',
          {
            uri: file.uri,
            name: file.name || 'pattern.pdf',
            type: file.mimeType || 'application/pdf',
          } as unknown as Blob,
        );
      }

      if (selectedTags.length) {
        formData.append('tagIds', JSON.stringify(selectedTags.map((tag) => tag.id)));
      }

      if (fabricRequirements.fabricWidth || fabricRequirements.fabricLength || fabricRequirements.fabricType) {
        formData.append('fabricRequirements', JSON.stringify(fabricRequirements));
      }

      await mutate.update(patternId as string, formData);

      // Handle measurements separately
      const { measurementService } = await import('@schnittmuster/core');
      
      // Get current measurements to compare
      const existingIds = new Set(existingMeasurements.map((m) => m.measurementTypeId));
      const selectedIds = new Set(selectedMeasurements.map((m) => m.measurementTypeId));
      
      // Delete removed measurements
      for (const existing of existingMeasurements) {
        if (!selectedIds.has(existing.measurementTypeId)) {
          await measurementService.deletePatternMeasurement(patternId as string, existing.id);
        }
      }
      
      // Add or update measurements
      for (const measurement of selectedMeasurements) {
        const existing = existingMeasurements.find((m) => m.measurementTypeId === measurement.measurementTypeId);
        if (existing) {
          // Update existing
          await measurementService.updatePatternMeasurement(patternId as string, existing.id, {
            value: measurement.value,
            notes: measurement.notes,
            isRequired: measurement.isRequired,
          });
        } else {
          // Add new
          await measurementService.addPatternMeasurement(patternId as string, {
            measurementTypeId: measurement.measurementTypeId,
            value: measurement.value,
            notes: measurement.notes,
            isRequired: measurement.isRequired,
          });
        }
      }
      
      Alert.alert('Erfolg', 'Schnittmuster aktualisiert.');
      router.back();
    } catch (err: any) {
      Alert.alert('Fehler', err?.message || 'Aktualisierung fehlgeschlagen.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  const currentThumbnail = resolveAssetUrl(pattern?.thumbnailUrl);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backIcon}>‹</Text>
          <Text style={styles.backLabel}>Zurück</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Schnittmuster bearbeiten</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Name *</Text>
          <TextInput value={name} onChangeText={setName} style={styles.input} placeholder="Name" />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Beschreibung</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Kurzbeschreibung"
            multiline
            textAlignVertical="top"
            style={[styles.input, styles.multiline]}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Thumbnail</Text>
          <TouchableOpacity style={styles.uploadBox} onPress={pickImage}>
            {thumbnail ? (
              <Image source={{ uri: thumbnail.uri }} style={styles.thumbnail} resizeMode="cover" />
            ) : currentThumbnail ? (
              <Image source={{ uri: currentThumbnail }} style={styles.thumbnail} resizeMode="cover" />
            ) : (
              <Text style={styles.muted}>Bild auswählen</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>PDF-Datei</Text>
          <TouchableOpacity style={styles.uploadBox} onPress={pickDocument}>
            {file ? (
              <View style={{ alignItems: 'center' }}>
                <Text style={styles.fileName}>{file.name}</Text>
                {file.size ? <Text style={styles.fileMeta}>{(file.size / 1024 / 1024).toFixed(2)} MB</Text> : null}
              </View>
            ) : (
              <Text style={styles.muted}>PDF ändern</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Kategorien & Tags</Text>
          <PatternTagEditor selectedTags={selectedTags} onChange={setSelectedTags} />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Messungen</Text>
          <PatternMeasurementEditor
            selectedMeasurements={selectedMeasurements}
            onChange={setSelectedMeasurements}
            patternId={patternId}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Stoffanforderungen</Text>
          <FabricRequirements
            fabricRequirements={fabricRequirements}
            onChange={setFabricRequirements}
          />
        </View>

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isSubmitting}
          style={[styles.primaryButton, isSubmitting && styles.buttonDisabled]}
        >
          {isSubmitting ? (
            <ActivityIndicator color={theme.textLight} />
          ) : (
            <Text style={styles.primaryButtonLabel}>Speichern</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const theme = getAppTheme();

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.background,
  },
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    marginBottom: 2,
  },
  backIcon: {
    fontSize: 20,
    color: theme.textPrimary,
    marginTop: -2,
  },
  backLabel: {
    color: theme.textPrimary,
    fontWeight: '700',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.textPrimary,
    marginBottom: 16,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontWeight: '700',
    color: theme.textPrimary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: theme.cardBackground,
    borderColor: theme.border,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  multiline: {
    minHeight: 100,
  },
  uploadBox: {
    borderWidth: 1,
    borderColor: theme.border,
    borderStyle: 'dashed',
    borderRadius: 12,
    minHeight: 120,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.cardBackground,
    padding: 12,
  },
  thumbnail: {
    width: '100%',
    height: 160,
    borderRadius: 10,
  },
  muted: {
    color: theme.textSecondary,
  },
  fileName: {
    fontWeight: '700',
    color: theme.textPrimary,
    textAlign: 'center',
  },
  fileMeta: {
    color: theme.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  primaryButton: {
    backgroundColor: theme.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonLabel: {
    color: theme.textLight,
    fontWeight: '700',
    fontSize: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
