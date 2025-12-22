import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
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
import { useTags } from '@schnittmuster/core';
import { tagService } from '@schnittmuster/core';
import type { TagCategoryDTO, TagDTO } from '@schnittmuster/dtos';
import { getAppTheme } from '@/constants/theme';

const theme = getAppTheme();

type TagFormData = { name: string; colorHex: string };
type CategoryFormData = { name: string; displayOrder: string };

export default function TagManagementScreen() {
  const { categories, isLoading, refetch } = useTags();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  
  // Forms
  const [categoryForm, setCategoryForm] = useState<CategoryFormData>({ name: '', displayOrder: '' });
  const [tagForm, setTagForm] = useState<TagFormData>({ name: '', colorHex: '#4e8cff' });
  
  // Edit states
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [editCategoryDraft, setEditCategoryDraft] = useState<CategoryFormData>({ name: '', displayOrder: '' });
  const [editTagDraft, setEditTagDraft] = useState<TagFormData>({ name: '', colorHex: '#4e8cff' });
  
  // Modals
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
  const [showNewTagModal, setShowNewTagModal] = useState(false);

  const selectedCategory = useMemo(
    () => categories.find((cat) => cat.id === selectedCategoryId),
    [categories, selectedCategoryId]
  );

  useEffect(() => {
    if (!selectedCategoryId && categories.length > 0) {
      setSelectedCategoryId(categories[0].id);
    }
  }, [categories, selectedCategoryId]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleCreateCategory = async () => {
    if (!categoryForm.name.trim()) {
      Alert.alert('Fehler', 'Bitte gib einen Namen ein');
      return;
    }
    try {
      await tagService.createCategory({
        name: categoryForm.name.trim(),
        displayOrder: categoryForm.displayOrder ? Number(categoryForm.displayOrder) : undefined,
      });
      setCategoryForm({ name: '', displayOrder: '' });
      setShowNewCategoryModal(false);
      await refetch();
      Alert.alert('Erfolg', 'Kategorie erstellt');
    } catch (error) {
      Alert.alert('Fehler', error instanceof Error ? error.message : 'Fehler beim Erstellen');
    }
  };

  const handleUpdateCategory = async (categoryId: string) => {
    try {
      await tagService.updateCategory(categoryId, {
        name: editCategoryDraft.name.trim(),
        displayOrder: editCategoryDraft.displayOrder ? Number(editCategoryDraft.displayOrder) : undefined,
      });
      setEditingCategory(null);
      await refetch();
      Alert.alert('Erfolg', 'Kategorie aktualisiert');
    } catch (error) {
      Alert.alert('Fehler', error instanceof Error ? error.message : 'Fehler beim Aktualisieren');
    }
  };

  const handleDeleteCategory = (categoryId: string) => {
    Alert.alert(
      'Kategorie löschen',
      'Möchtest du diese Kategorie wirklich löschen? Alle zugehörigen Tags werden ebenfalls gelöscht.',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: async () => {
            try {
              await tagService.deleteCategory(categoryId);
              if (selectedCategoryId === categoryId) {
                setSelectedCategoryId('');
              }
              await refetch();
              Alert.alert('Erfolg', 'Kategorie gelöscht');
            } catch (error) {
              Alert.alert('Fehler', error instanceof Error ? error.message : 'Fehler beim Löschen');
            }
          },
        },
      ]
    );
  };

  const handleCreateTag = async () => {
    if (!selectedCategoryId || !tagForm.name.trim()) {
      Alert.alert('Fehler', 'Bitte wähle eine Kategorie und gib einen Namen ein');
      return;
    }
    try {
      await tagService.createTag({
        name: tagForm.name.trim(),
        colorHex: tagForm.colorHex,
        tagCategoryId: selectedCategoryId,
      });
      setTagForm({ name: '', colorHex: '#4e8cff' });
      setShowNewTagModal(false);
      await refetch();
      Alert.alert('Erfolg', 'Tag erstellt');
    } catch (error) {
      Alert.alert('Fehler', error instanceof Error ? error.message : 'Fehler beim Erstellen');
    }
  };

  const handleUpdateTag = async (tagId: string) => {
    try {
      await tagService.updateTag(tagId, {
        name: editTagDraft.name.trim(),
        colorHex: editTagDraft.colorHex,
      });
      setEditingTag(null);
      await refetch();
      Alert.alert('Erfolg', 'Tag aktualisiert');
    } catch (error) {
      Alert.alert('Fehler', error instanceof Error ? error.message : 'Fehler beim Aktualisieren');
    }
  };

  const handleDeleteTag = (tagId: string) => {
    Alert.alert('Tag löschen', 'Möchtest du diesen Tag wirklich löschen?', [
      { text: 'Abbrechen', style: 'cancel' },
      {
        text: 'Löschen',
        style: 'destructive',
        onPress: async () => {
          try {
            await tagService.deleteTag(tagId);
            await refetch();
            Alert.alert('Erfolg', 'Tag gelöscht');
          } catch (error) {
            Alert.alert('Fehler', error instanceof Error ? error.message : 'Fehler beim Löschen');
          }
        },
      },
    ]);
  };

  const startEditCategory = (category: TagCategoryDTO) => {
    setEditCategoryDraft({
      name: category.name,
      displayOrder: category.displayOrder?.toString() ?? '',
    });
    setEditingCategory(category.id);
  };

  const startEditTag = (tag: TagDTO) => {
    setEditTagDraft({
      name: tag.name,
      colorHex: tag.colorHex ?? '#4e8cff',
    });
    setEditingTag(tag.id);
  };

  if (isLoading && categories.length === 0) {
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
            <Text style={styles.title}>Meine Tags</Text>
            <Text style={styles.subtitle}>Verwalte deine Kategorien und Tags</Text>
          </View>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>Zurück</Text>
          </TouchableOpacity>
        </View>

        {/* Categories Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Kategorien</Text>
            <TouchableOpacity onPress={() => setShowNewCategoryModal(true)} style={styles.addButton}>
              <Text style={styles.addButtonText}>+ Neu</Text>
            </TouchableOpacity>
          </View>

          {categories.length === 0 ? (
            <Text style={styles.emptyText}>Noch keine Kategorien vorhanden</Text>
          ) : (
            categories.map((category) => (
              <View key={category.id} style={styles.card}>
                {editingCategory === category.id ? (
                  <>
                    <TextInput
                      style={styles.input}
                      value={editCategoryDraft.name}
                      onChangeText={(text) => setEditCategoryDraft((prev) => ({ ...prev, name: text }))}
                      placeholder="Name"
                    />
                    <TextInput
                      style={styles.input}
                      value={editCategoryDraft.displayOrder}
                      onChangeText={(text) => setEditCategoryDraft((prev) => ({ ...prev, displayOrder: text }))}
                      placeholder="Reihenfolge"
                      keyboardType="number-pad"
                    />
                    <View style={styles.buttonRow}>
                      <TouchableOpacity
                        onPress={() => handleUpdateCategory(category.id)}
                        style={[styles.button, styles.primaryButton]}
                      >
                        <Text style={styles.buttonText}>Speichern</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => setEditingCategory(null)}
                        style={[styles.button, styles.secondaryButton]}
                      >
                        <Text style={[styles.buttonText, { color: theme.textPrimary }]}>Abbrechen</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                ) : (
                  <>
                    <View style={styles.categoryInfo}>
                      <Text style={styles.categoryName}>{category.name}</Text>
                      <Text style={styles.categoryMeta}>{category.tags.length} Tags</Text>
                    </View>
                    <View style={styles.buttonRow}>
                      <TouchableOpacity onPress={() => startEditCategory(category)} style={styles.iconButton}>
                        <Text style={styles.iconButtonText}>✏️</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDeleteCategory(category.id)} style={styles.iconButton}>
                        <Text style={styles.iconButtonText}>🗑️</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>
            ))
          )}
        </View>

        {/* Tags Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tags</Text>
            <TouchableOpacity
              onPress={() => setShowNewTagModal(true)}
              style={styles.addButton}
              disabled={!selectedCategoryId}
            >
              <Text style={[styles.addButtonText, !selectedCategoryId && { opacity: 0.5 }]}>+ Neu</Text>
            </TouchableOpacity>
          </View>

          {categories.length === 0 ? (
            <Text style={styles.emptyText}>Bitte erstelle zuerst eine Kategorie</Text>
          ) : (
            <>
              <View style={styles.picker}>
                <Text style={styles.label}>Kategorie:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryPicker}>
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      onPress={() => setSelectedCategoryId(cat.id)}
                      style={[styles.categoryChip, selectedCategoryId === cat.id && styles.categoryChipActive]}
                    >
                      <Text
                        style={[
                          styles.categoryChipText,
                          selectedCategoryId === cat.id && styles.categoryChipTextActive,
                        ]}
                      >
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {selectedCategory && selectedCategory.tags.length === 0 ? (
                <Text style={styles.emptyText}>Noch keine Tags in dieser Kategorie</Text>
              ) : (
                selectedCategory?.tags.map((tag) => (
                  <View key={tag.id} style={styles.card}>
                    {editingTag === tag.id ? (
                      <>
                        <TextInput
                          style={styles.input}
                          value={editTagDraft.name}
                          onChangeText={(text) => setEditTagDraft((prev) => ({ ...prev, name: text }))}
                          placeholder="Name"
                        />
                        <View style={styles.colorRow}>
                          <Text style={styles.label}>Farbe:</Text>
                          <View style={[styles.colorPreview, { backgroundColor: editTagDraft.colorHex }]} />
                          <TextInput
                            style={[styles.input, { flex: 1 }]}
                            value={editTagDraft.colorHex}
                            onChangeText={(text) => setEditTagDraft((prev) => ({ ...prev, colorHex: text }))}
                            placeholder="#4e8cff"
                          />
                        </View>
                        <View style={styles.buttonRow}>
                          <TouchableOpacity
                            onPress={() => handleUpdateTag(tag.id)}
                            style={[styles.button, styles.primaryButton]}
                          >
                            <Text style={styles.buttonText}>Speichern</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => setEditingTag(null)}
                            style={[styles.button, styles.secondaryButton]}
                          >
                            <Text style={[styles.buttonText, { color: theme.textPrimary }]}>Abbrechen</Text>
                          </TouchableOpacity>
                        </View>
                      </>
                    ) : (
                      <>
                        <View style={styles.tagInfo}>
                          <View style={[styles.tagColorBadge, { backgroundColor: tag.colorHex ?? '#4e8cff' }]} />
                          <Text style={styles.tagName}>{tag.name}</Text>
                        </View>
                        <View style={styles.buttonRow}>
                          <TouchableOpacity onPress={() => startEditTag(tag)} style={styles.iconButton}>
                            <Text style={styles.iconButtonText}>✏️</Text>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => handleDeleteTag(tag.id)} style={styles.iconButton}>
                            <Text style={styles.iconButtonText}>🗑️</Text>
                          </TouchableOpacity>
                        </View>
                      </>
                    )}
                  </View>
                ))
              )}
            </>
          )}
        </View>
      </ScrollView>

      {/* New Category Modal */}
      <Modal visible={showNewCategoryModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Neue Kategorie</Text>
            <TextInput
              style={styles.input}
              value={categoryForm.name}
              onChangeText={(text) => setCategoryForm((prev) => ({ ...prev, name: text }))}
              placeholder="Name"
              autoFocus
            />
            <TextInput
              style={styles.input}
              value={categoryForm.displayOrder}
              onChangeText={(text) => setCategoryForm((prev) => ({ ...prev, displayOrder: text }))}
              placeholder="Reihenfolge (optional)"
              keyboardType="number-pad"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={handleCreateCategory} style={[styles.button, styles.primaryButton]}>
                <Text style={styles.buttonText}>Erstellen</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowNewCategoryModal(false)}
                style={[styles.button, styles.secondaryButton]}
              >
                <Text style={[styles.buttonText, { color: theme.textPrimary }]}>Abbrechen</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* New Tag Modal */}
      <Modal visible={showNewTagModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Neuer Tag</Text>
            <TextInput
              style={styles.input}
              value={tagForm.name}
              onChangeText={(text) => setTagForm((prev) => ({ ...prev, name: text }))}
              placeholder="Name"
              autoFocus
            />
            <View style={styles.colorRow}>
              <Text style={styles.label}>Farbe:</Text>
              <View style={[styles.colorPreview, { backgroundColor: tagForm.colorHex }]} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={tagForm.colorHex}
                onChangeText={(text) => setTagForm((prev) => ({ ...prev, colorHex: text }))}
                placeholder="#4e8cff"
              />
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={handleCreateTag} style={[styles.button, styles.primaryButton]}>
                <Text style={styles.buttonText}>Erstellen</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowNewTagModal(false)}
                style={[styles.button, styles.secondaryButton]}
              >
                <Text style={[styles.buttonText, { color: theme.textPrimary }]}>Abbrechen</Text>
              </TouchableOpacity>
            </View>
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
  categoryInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.textPrimary,
  },
  categoryMeta: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  tagInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tagColorBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 12,
  },
  tagName: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.textPrimary,
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
  picker: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textPrimary,
    marginBottom: 8,
  },
  categoryPicker: {
    flexDirection: 'row',
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#e2e8f0',
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: theme.primary,
  },
  categoryChipText: {
    color: theme.textPrimary,
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: '#fff',
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  colorPreview: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
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
});
