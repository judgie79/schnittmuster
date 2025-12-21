import React from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { resolveAssetUrl, useAuth, usePattern, usePatterns } from '@schnittmuster/core';
import { TagDTO } from 'schnittmuster-manager-dtos';

const getContrastColor = (hexColor: string) => {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? '#0f172a' : '#f8fafc';
};

export default function PatternDetailScreen() {
  const { patternId } = useLocalSearchParams<{ patternId?: string }>();
  const router = useRouter();
  const { data: pattern, isLoading, error } = usePattern(patternId);
  const { mutate } = usePatterns();
  const { user } = useAuth();

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

  const handleOpenPdf = async () => {
    if (!pattern?.fileUrl) return;
    const url = resolveAssetUrl(pattern.fileUrl);
    if (!url) return;
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Fehler', 'Die Datei kann nicht geöffnet werden.');
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
              <Link href={`/patterns/${pattern.id}/edit`} asChild>
                <TouchableOpacity style={[styles.chipButton, styles.primaryButton, styles.actionButton]}>
                  <Text style={styles.chipButtonLabel}>Bearbeiten</Text>
                </TouchableOpacity>
              </Link>
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
            <TouchableOpacity style={styles.primaryButtonLarge} onPress={handleOpenPdf}>
              <Text style={styles.primaryButtonLabel}>PDF öffnen</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
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
    color: '#475569',
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
    color: '#0f172a',
    marginTop: -2,
  },
  backLabel: {
    color: '#0f172a',
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
    color: '#0f172a',
    flex: 1,
  },
  badgeRow: {
    marginTop: 10,
    marginBottom: 16,
  },
  badge: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  badgeLabel: {
    color: '#475569',
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 6,
  },
  bodyText: {
    color: '#334155',
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
    backgroundColor: '#0f172a',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  primaryButtonLabel: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  chipButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#e2e8f0',
  },
  actionButton: {
    marginRight: 8,
    minWidth: 110,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    borderColor: '#1d4ed8',
  },
  dangerButton: {
    backgroundColor: '#ef4444',
    borderColor: '#dc2626',
  },
  chipButtonLabel: {
    color: '#fff',
    fontWeight: '700',
  },
});
