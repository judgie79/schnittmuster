import React from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { resolveAssetUrl, useAuth, usePattern, usePatterns, getContrastColor } from '@schnittmuster/core';
import { TagDTO } from '@schnittmuster/dtos';
import { usePatternFile } from '../../hooks/usePatternFile';
import { getAppTheme } from '@/constants/theme';

export default function PatternDetailScreen() {
  const { patternId } = useLocalSearchParams<{ patternId?: string }>();
  const router = useRouter();
  const { data: pattern, isLoading, error } = usePattern(patternId);
  const { mutate } = usePatterns();
  const { user } = useAuth();
  const {
    fileName,
    mimeType,
    isPreparing: isFilePreparing,
    error: fileError,
    prepare,
  } = usePatternFile(pattern?.fileUrl);
  const [isSharing, setIsSharing] = React.useState(false);
  const [isPrinting, setIsPrinting] = React.useState(false);
  const [printError, setPrintError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setPrintError(null);
  }, [pattern?.fileUrl]);

  const isOwner = user && pattern && user.id === pattern.ownerId;
  const isAdmin = Boolean(user?.adminRole);
  const canEdit = Boolean(pattern && (isOwner || isAdmin));

  const handleDelete = () => {
    if (!patternId) return;

    Alert.alert('Schnittmuster löschen', 'Bist du sicher, dass du dieses Schnittmuster löschen willst?', [
      { text: 'Abbrechen', style: 'cancel' },
      {
        text: 'Löschen',
        style: 'destructive',
        onPress: async () => {
          try {
            await mutate.remove(patternId as string);
            router.replace('/');
          } catch {
            Alert.alert('Fehler', 'Löschen fehlgeschlagen.');
          }
        },
      },
    ]);
  };

  const handleOpenFile = async () => {
    if (!pattern?.fileUrl) return;
    try {
      setIsSharing(true);
      const sharingAvailable = await Sharing.isAvailableAsync();
      if (!sharingAvailable) {
        Alert.alert('Nicht unterstützt', 'Teilen ist auf diesem Gerät nicht verfügbar.');
        return;
      }

      const handle = await prepare();
      const shareMime = handle.mimeType ?? mimeType ?? undefined;
      let shareUri = handle.uri;

      if (Platform.OS === 'android' && handle.contentUri) {
        shareUri = handle.contentUri;
      }

      await Sharing.shareAsync(shareUri, {
        mimeType: shareMime,
        dialogTitle: handle.fileName ?? 'Schnittmuster',
      });
    } catch (shareError) {
      const message =
        shareError instanceof Error ? shareError.message : 'Datei konnte nicht geöffnet werden.';
      Alert.alert('Fehler', message);
    } finally {
      setIsSharing(false);
    }
  };

  const handlePrint = async () => {
    if (!pattern?.fileUrl) return;
    try {
      setIsPrinting(true);
      setPrintError(null);
      const handle = await prepare();
      await Print.printAsync({ uri: handle.uri });
    } catch (printIssue) {
      const message =
        printIssue instanceof Error ? printIssue.message : 'Drucken fehlgeschlagen.';
      setPrintError(message);
      Alert.alert('Fehler', message);
    } finally {
      setIsPrinting(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (error || !pattern) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Schnittmuster konnte nicht geladen werden.</Text>
      </View>
    );
  }

  const thumbnailUrl = resolveAssetUrl(pattern.thumbnailUrl);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backIcon}>‹</Text>
          <Text style={styles.backLabel}>Zurück</Text>
        </TouchableOpacity>

        {thumbnailUrl ? (
          <Image source={{ uri: thumbnailUrl }} style={styles.cover} resizeMode="cover" />
        ) : (
          <View style={[styles.cover, styles.coverPlaceholder]}>
            <Text style={styles.coverPlaceholderText}>Kein Bild</Text>
          </View>
        )}

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{pattern.name}</Text>
          </View>

          {canEdit && (
            <View style={styles.actionRow}>
              <TouchableOpacity style={[styles.chipButton, styles.primaryButton, styles.actionButton]} onPress={() => router.push(`/patterns/${pattern.id}/edit`)}>
                <Text style={styles.chipButtonLabel}>Bearbeiten</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.chipButton, styles.dangerButton, styles.actionButton]} onPress={handleDelete}>
                <Text style={styles.chipButtonLabel}>Löschen</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeLabel}>{pattern.status}</Text>
            </View>
          </View>

          {pattern.description ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Beschreibung</Text>
              <Text style={styles.bodyText}>{pattern.description}</Text>
            </View>
          ) : null}

          {pattern.tags?.length ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tags</Text>
              <View style={styles.tagWrap}>
                {pattern.tags.map((tag: TagDTO) => (
                  <View
                    key={tag.id}
                    style={[styles.tagPill, { backgroundColor: tag.colorHex || '#e2e8f0' }]}
                  >
                    <Text style={[styles.tagLabel, { color: getContrastColor(tag.colorHex || '#e2e8f0') }]}>
                      {tag.name}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {pattern.fileUrl ? (
            <View style={[styles.section, styles.fileSection]}>
              <Text style={styles.sectionTitle}>Datei & Druck</Text>
              <View style={styles.fileButtonGroup}>
                <TouchableOpacity
                  style={[
                    styles.secondaryButtonLarge,
                    styles.fileButton,
                    (isFilePreparing || isSharing) && styles.buttonDisabled,
                  ]}
                  onPress={handleOpenFile}
                  disabled={isFilePreparing || isSharing}
                >
                  <Text style={styles.secondaryButtonLabel}>
                    {isSharing ? 'Wird geöffnet...' : 'Datei öffnen'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.primaryButtonLarge,
                    styles.fileButton,
                    (isFilePreparing || isPrinting) && styles.buttonDisabled,
                  ]}
                  onPress={handlePrint}
                  disabled={isFilePreparing || isPrinting}
                >
                  <Text style={styles.primaryButtonLabel}>
                    {isPrinting ? 'Wird gedruckt...' : 'Drucken'}
                  </Text>
                </TouchableOpacity>
              </View>
              {isFilePreparing ? (
                <Text style={styles.fileStatusText}>Datei wird vorbereitet...</Text>
              ) : fileName ? (
                <Text style={styles.fileStatusText}>Bereit: {fileName}</Text>
              ) : (
                <Text style={styles.fileHelperText}>
                  Die Datei wird beim ersten Öffnen sicher heruntergeladen.
                </Text>
              )}
              {fileError ? <Text style={styles.fileErrorText}>{fileError.message}</Text> : null}
              {printError ? <Text style={styles.fileErrorText}>{printError}</Text> : null}
            </View>
          ) : null}
        </View>
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
  scrollContent: {
    paddingBottom: 24,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    color: '#dc2626',
  },
  cover: {
    width: '100%',
    height: 240,
    backgroundColor: '#e2e8f0',
  },
  coverPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverPlaceholderText: {
    color: theme.textSecondary,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 4,
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
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.textPrimary,
    flex: 1,
  },
  badgeRow: {
    marginTop: 10,
    marginBottom: 16,
  },
  badge: {
    backgroundColor: theme.badgeGray,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  badgeLabel: {
    color: theme.textSecondary,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.textPrimary,
    marginBottom: 6,
  },
  bodyText: {
    color: theme.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  tagLabel: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  primaryButtonLarge: {
    backgroundColor: theme.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  primaryButtonLabel: {
    color: theme.textLight,
    fontWeight: '700',
    fontSize: 16,
  },
  secondaryButtonLarge: {
    backgroundColor: theme.badgeGray,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonLabel: {
    color: theme.textPrimary,
    fontWeight: '700',
    fontSize: 16,
  },
  chipButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.badgeGray,
  },
  actionButton: {
    marginRight: 8,
    minWidth: 110,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: theme.primary,
    borderColor: theme.primaryDark,
  },
  dangerButton: {
    backgroundColor: '#ef4444',
    borderColor: '#dc2626',
  },
  chipButtonLabel: {
    color: theme.textLight,
    fontWeight: '700',
  },
  fileSection: {
    marginTop: 8,
  },
  fileButtonGroup: {
    gap: 12,
    marginTop: 8,
  },
  fileButton: {
    width: '100%',
  },
  fileStatusText: {
    marginTop: 8,
    color: theme.textSecondary,
    fontSize: 14,
  },
  fileHelperText: {
    marginTop: 8,
    color: '#94a3b8',
    fontSize: 14,
  },
  fileErrorText: {
    marginTop: 8,
    color: '#dc2626',
    fontSize: 14,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
