import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
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
import { Link } from 'expo-router';
import { useAuth, usePatterns, useTags } from '@schnittmuster/core';
import type { PatternFilters } from '@schnittmuster/core';
import type { TagCategoryDTO } from 'schnittmuster-manager-dtos';
import { getAppTheme } from '@/constants/theme';

type TagFilterSelections = Record<string, string[]>;

const sortCategories = (categories: TagCategoryDTO[]): TagCategoryDTO[] =>
  [...categories].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

const buildEmptySelections = (categories: TagCategoryDTO[] = []): TagFilterSelections =>
  categories.reduce((acc, category) => {
    acc[category.id] = [];
    return acc;
  }, {} as TagFilterSelections);

const buildSelectionFromFilters = (
  filters: PatternFilters,
  categories: TagCategoryDTO[]
): TagFilterSelections => {
  const base = buildEmptySelections(categories);
  Object.entries(filters.tagFilters ?? {}).forEach(([categoryId, tagIds]) => {
    base[categoryId] = [...tagIds];
  });
  return base;
};

const pruneEmptySelections = (selection: TagFilterSelections): TagFilterSelections =>
  Object.entries(selection).reduce((acc, [categoryId, tagIds]) => {
    if (tagIds.length) {
      acc[categoryId] = [...tagIds];
    }
    return acc;
  }, {} as TagFilterSelections);

const getContrastColor = (hexColor: string) => {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? '#0f172a' : '#f8fafc';
};

const countActiveTagFilters = (filters: TagFilterSelections = {}) =>
  Object.values(filters).reduce((total, tagIds) => total + tagIds.length, 0);

const Header = ({ username, onLogout }: { username: string; onLogout: () => void }) => (
  <View style={styles.header}>
    <Text style={styles.headerTitle}>Hallo, {username}</Text>
    <TouchableOpacity onPress={onLogout} style={styles.logoutButton}>
      <Text style={styles.logoutLabel}>Logout</Text>
    </TouchableOpacity>
  </View>
);

type TagFilterModalProps = {
  visible: boolean;
  filters: PatternFilters;
  onClose: () => void;
  onApply: (selection: TagFilterSelections) => void;
};

const TagFilterModal = ({ visible, filters, onClose, onApply }: TagFilterModalProps) => {
  const { categories, isLoading, error, refetch, isRefetching } = useTags();
  const sortedCategories = useMemo(() => sortCategories(categories), [categories]);
  const hasTagData = useMemo(
    () => sortedCategories.some((category) => category.tags?.length),
    [sortedCategories]
  );
  const [selections, setSelections] = useState<TagFilterSelections>(() =>
    buildSelectionFromFilters(filters, sortedCategories)
  );

  useEffect(() => {
    if (!visible) {
      return;
    }
    setSelections(buildSelectionFromFilters(filters, sortedCategories));
  }, [filters.tagFilters, sortedCategories, visible]);

  const toggleTag = (categoryId: string, tagId: string) => {
    setSelections((prev) => {
      const current = prev[categoryId] ?? [];
      const exists = current.includes(tagId);
      const next = exists ? current.filter((id) => id !== tagId) : [...current, tagId];
      return { ...prev, [categoryId]: next };
    });
  };

  const handleApply = () => {
    onApply(pruneEmptySelections(selections));
    onClose();
  };

  const handleClear = () => {
    setSelections(buildEmptySelections(sortedCategories));
  };

  const showLoadingState = isLoading && !sortedCategories.length;

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filter</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.modalCloseLabel}>Schließen</Text>
            </TouchableOpacity>
          </View>
          {showLoadingState ? (
            <View style={styles.modalMessage}>
              <ActivityIndicator color={theme.primary} />
              <Text style={styles.modalMessageText}>Kategorien werden geladen …</Text>
            </View>
          ) : error ? (
            <View style={styles.modalMessage}>
              <Text style={[styles.modalMessageText, styles.errorText]}>Kategorien konnten nicht geladen werden.</Text>
              <TouchableOpacity onPress={refetch} style={[styles.primaryButton, styles.modalRetryButton]}>
                <Text style={styles.primaryButtonLabel}>Erneut versuchen</Text>
              </TouchableOpacity>
            </View>
          ) : !sortedCategories.length ? (
            <View style={styles.modalMessage}>
              <Text style={styles.modalMessageText}>Noch sind keine Tag-Kategorien verfügbar.</Text>
            </View>
          ) : !hasTagData ? (
            <View style={styles.modalMessage}>
              <Text style={styles.modalMessageText}>Für diese Filter stehen noch keine Tags bereit.</Text>
            </View>
          ) : (
            <ScrollView
              style={styles.modalScroll}
              contentContainerStyle={styles.modalScrollContent}
              refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
            >
              {sortedCategories.map((category) => {
                const tags = category.tags ?? [];
                const selectedTags = selections[category.id] ?? [];
                return (
                  <View key={category.id} style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>{category.name}</Text>
                    {tags.length ? (
                      <View style={styles.modalTagRow}>
                        {tags.map((tag) => {
                          const swatchColor = tag.colorHex || '#cbd5e1';
                          const isSelected = selectedTags.includes(tag.id);
                          const backgroundColor = isSelected ? swatchColor : '#fff';
                          const textColor = isSelected ? getContrastColor(backgroundColor) : '#0f172a';
                          return (
                            <TouchableOpacity
                              key={tag.id}
                              style={[
                                styles.modalTagButton,
                                {
                                  backgroundColor,
                                  borderColor: swatchColor,
                                },
                              ]}
                              onPress={() => toggleTag(category.id, tag.id)}
                            >
                              <View style={[styles.modalTagSwatch, { backgroundColor: swatchColor }]} />
                              <Text style={[styles.modalTagLabel, { color: textColor }]} numberOfLines={1}>
                                {tag.name}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    ) : (
                      <Text style={styles.modalMessageText}>Keine Tags für diese Kategorie vorhanden.</Text>
                    )}
                  </View>
                );
              })}
            </ScrollView>
          )}
          <View style={styles.modalFooter}>
            <TouchableOpacity style={[styles.secondaryButton, styles.modalFooterButton]} onPress={handleClear}>
              <Text style={styles.secondaryButtonLabel}>Zurücksetzen</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.primaryButton, styles.modalFooterButton]} onPress={handleApply}>
              <Text style={styles.primaryButtonLabel}>Anwenden</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const PatternList = () => {
  const { items, isLoading, error, refetch, isRefetching, filters, setFilters } = usePatterns();
  const [isFilterVisible, setFilterVisible] = useState(false);

  const activeFilterCount = useMemo(() => countActiveTagFilters(filters.tagFilters), [filters.tagFilters]);
  const hasActiveFilters = activeFilterCount > 0;

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Fehler beim Laden der Schnittmuster.</Text>
        <TouchableOpacity onPress={() => refetch()} style={styles.primaryButton}>
          <Text style={styles.primaryButtonLabel}>Erneut versuchen</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.listWrapper}>
      <View style={styles.listHeaderRow}>
        <View>
          <Text style={styles.listHeaderTitle}>Schnittmuster</Text>
          <Text style={styles.listHeaderSubtitle}>Passe die Liste mit Filtern an.</Text>
        </View>
        <TouchableOpacity style={styles.filterButton} onPress={() => setFilterVisible(true)}>
          <Text style={styles.filterButtonLabel}>Filter</Text>
          {hasActiveFilters ? (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeLabel}>{activeFilterCount}</Text>
            </View>
          ) : null}
        </TouchableOpacity>
      </View>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        contentContainerStyle={
          items.length ? styles.listContent : [styles.listContent, styles.listContentCentered]
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Keine Schnittmuster gefunden</Text>
            <Text style={styles.emptyCopy}>Passe deine Filter an oder lege ein neues Schnittmuster an.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Link href={`/patterns/${item.id}`} asChild>
            <TouchableOpacity style={styles.listItem}>
              {item.thumbnailUrl ? (
                <Image source={{ uri: item.thumbnailUrl }} style={styles.listItemThumbnail} />
              ) : (
                <View style={[styles.listItemThumbnail, styles.thumbnailPlaceholder]}>
                  <Text style={styles.thumbnailPlaceholderText}>
                    {(item.name?.charAt(0) ?? '?').toUpperCase()}
                  </Text>
                </View>
              )}
              <View style={styles.listItemContent}>
                <Text style={styles.listItemTitle}>{item.name}</Text>
                <Text style={styles.listItemMeta}>{item.status}</Text>
                {item.tags?.length ? (
                  <View style={styles.listTagRow}>
                    {item.tags.slice(0, 2).map((tag) => {
                      const backgroundColor = tag.colorHex || '#e2e8f0';
                      return (
                        <View key={tag.id} style={[styles.listTagPill, { backgroundColor }]}
                        >
                          <Text style={[styles.listTagLabel, { color: getContrastColor(backgroundColor) }]}>
                            {tag.name}
                          </Text>
                        </View>
                      );
                    })}
                    {item.tags.length > 2 ? (
                      <View style={[styles.listTagPill, styles.listTagOverflowPill]}>
                        <Text style={[styles.listTagLabel, styles.listTagOverflowLabel]}>+{item.tags.length - 2}</Text>
                      </View>
                    ) : null}
                  </View>
                ) : null}
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          </Link>
        )}
      />
      <TagFilterModal
        visible={isFilterVisible}
        filters={filters}
        onClose={() => setFilterVisible(false)}
        onApply={(selection) => setFilters({ tagFilters: selection })}
      />
    </View>
  );
};

export default function HomeScreen() {
  const { user, isAuthenticated, isLoading, login, logout, error, isLoginPending } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const username = useMemo(() => user?.username || user?.email || 'Nutzer', [user]);

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Fehlende Angaben', 'Bitte E-Mail und Passwort eingeben.');
      return;
    }
    login({ email, password });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (isAuthenticated && user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header username={username} onLogout={logout} />
        <PatternList />
        <Link href="/patterns/new" asChild>
          <TouchableOpacity style={styles.fab}>
            <Text style={styles.fabLabel}>+</Text>
          </TouchableOpacity>
        </Link>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.formContainer}>
        <Text style={styles.screenTitle}>Anmelden</Text>
        {error && <Text style={styles.errorText}>{error.message || 'Login fehlgeschlagen'}</Text>}
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="E-Mail"
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Passwort"
          secureTextEntry
          style={styles.input}
        />
        <TouchableOpacity
          onPress={handleLogin}
          disabled={isLoginPending}
          style={[styles.primaryButton, isLoginPending && styles.buttonDisabled]}
        >
          {isLoginPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryButtonLabel}>Login</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const theme = getAppTheme();

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.background,
  },
  listWrapper: {
    flex: 1,
  },
  listHeaderRow: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  listHeaderTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.textPrimary,
  },
  listHeaderSubtitle: {
    fontSize: 13,
    color: theme.textSecondary,
    marginTop: 2,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: theme.badgeGray,
  },
  filterButtonLabel: {
    fontWeight: '700',
    color: theme.textPrimary,
  },
  filterBadge: {
    minWidth: 26,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: theme.primary,
    alignItems: 'center',
  },
  filterBadgeLabel: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  logoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#ef4444',
    borderRadius: 10,
  },
  logoutLabel: {
    color: '#fff',
    fontWeight: '700',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    color: '#dc2626',
    marginBottom: 12,
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 24,
    color: theme.textPrimary,
  },
  input: {
    backgroundColor: theme.cardBackground,
    borderColor: theme.border,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: theme.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButton: {
    backgroundColor: theme.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButtonLabel: {
    color: theme.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 120,
  },
  listContentCentered: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  listItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.border,
    backgroundColor: theme.cardBackground,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 92,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.textPrimary,
    marginBottom: 4,
  },
  listItemMeta: {
    color: theme.textSecondary,
    fontSize: 14,
  },
  listItemThumbnail: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#e2e8f0',
  },
  thumbnailPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailPlaceholderText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#475569',
  },
  listItemContent: {
    flex: 1,
  },
  listTagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  listTagPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  listTagLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  listTagOverflowPill: {
    backgroundColor: '#e2e8f0',
  },
  listTagOverflowLabel: {
    color: theme.textPrimary,
  },
  chevron: {
    fontSize: 22,
    color: '#94a3b8',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: theme.cardBackground,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingBottom: 24,
    maxHeight: '90%',
    width: '100%',
  },
  modalHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.textPrimary,
  },
  modalCloseLabel: {
    fontWeight: '700',
    color: theme.primary,
  },
  modalMessage: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: 'center',
    gap: 8,
  },
  modalMessageText: {
    color: '#475569',
    textAlign: 'center',
  },
  modalRetryButton: {
    width: '100%',
    marginTop: 12,
  },
  modalScroll: {
    maxHeight: '70%',
  },
  modalScrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  modalSection: {
    marginBottom: 20,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.textPrimary,
    marginBottom: 6,
  },
  modalTagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  modalTagButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  modalTagLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  modalTagSwatch: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  modalFooterButton: {
    flex: 1,
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
    gap: 4,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.textPrimary,
  },
  emptyCopy: {
    color: '#64748b',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  fabLabel: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
    marginTop: -2,
  },
});
