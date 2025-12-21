import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTags } from '@schnittmuster/core';
import type { TagCategoryDTO, TagDTO } from 'schnittmuster-manager-dtos';

const getContrastColor = (hexColor: string) => {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? '#0f172a' : '#f8fafc';
};

type PatternTagEditorProps = {
  selectedTags: TagDTO[];
  onChange: (tags: TagDTO[]) => void;
};

export const PatternTagEditor = ({ selectedTags, onChange }: PatternTagEditorProps) => {
  const { categories, isLoading, error } = useTags();

  const toggleTag = (tag: TagDTO) => {
    const isSelected = selectedTags.some((item) => item.id === tag.id);
    if (isSelected) {
      onChange(selectedTags.filter((item) => item.id !== tag.id));
      return;
    }
    onChange([...selectedTags, tag]);
  };

  if (isLoading) {
    return (
      <View style={styles.messageContainer}>
        <ActivityIndicator color="#2563eb" />
        <Text style={styles.subtleText}>Tag-Kategorien werden geladen …</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.messageContainer}>
        <Text style={[styles.subtleText, styles.errorText]}>Kategorien konnten nicht geladen werden.</Text>
      </View>
    );
  }

  if (!categories.length) {
    return (
      <View style={styles.messageContainer}>
        <Text style={styles.subtleText}>Noch sind keine Kategorien oder Tags verfügbar.</Text>
      </View>
    );
  }

  const selectedLabel = selectedTags.length
    ? `Ausgewählt (${selectedTags.length}): ${selectedTags.map((tag) => tag.name).join(', ')}`
    : 'Noch keine Tags ausgewählt.';

  return (
    <View style={styles.container}>
      <Text style={styles.subtleText}>{selectedLabel}</Text>
      {categories.map((category) => (
        <View key={category.id} style={styles.categoryBlock}>
          <View style={styles.categoryHeader}>
            <Text style={styles.categoryTitle}>{category.name}</Text>
            <Text style={styles.categoryMeta}>{category.tags.length} Tags</Text>
          </View>
          <View style={styles.tagRow}>
            {category.tags.map((tag) => {
              const isActive = selectedTags.some((item) => item.id === tag.id);
              const backgroundColor = isActive ? tag.colorHex || '#2563eb' : '#e2e8f0';
              const textColor = isActive ? getContrastColor(backgroundColor) : '#0f172a';

              return (
                <TouchableOpacity
                  key={tag.id}
                  style={[
                    styles.tagButton,
                    {
                      backgroundColor,
                      borderColor: isActive ? 'transparent' : '#cbd5e1',
                    },
                  ]}
                  onPress={() => toggleTag(tag)}
                >
                  <Text style={[styles.tagLabel, { color: textColor }]} numberOfLines={1}>
                    {tag.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#fff',
    padding: 12,
  },
  messageContainer: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#fff',
    padding: 12,
    alignItems: 'center',
  },
  subtleText: {
    fontSize: 13,
    color: '#475569',
  },
  errorText: {
    color: '#dc2626',
  },
  categoryBlock: {
    marginTop: 12,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  categoryMeta: {
    fontSize: 12,
    color: '#94a3b8',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 6,
  },
  tagLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
});
