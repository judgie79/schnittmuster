import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTags } from '@schnittmuster/core';
import type { TagCategoryDTO, TagDTO } from 'schnittmuster-manager-dtos';
import { getAppTheme } from '@/constants/theme';

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
  const theme = getAppTheme();

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
        <ActivityIndicator color={theme.primary} />
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
              const backgroundColor = isActive ? tag.colorHex || theme.primary : theme.badgeGray;
              const textColor = isActive ? getContrastColor(backgroundColor) : theme.textPrimary;

              return (
                <TouchableOpacity
                  key={tag.id}
                  style={[
                    styles.tagButton,
                    {
                      backgroundColor,
                      borderColor: isActive ? 'transparent' : theme.border,
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

const theme = getAppTheme();

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
  subtleText: {
    fontSize: 13,
    color: theme.textSecondary,
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
    color: theme.textPrimary,
  },
  categoryMeta: {
    fontSize: 12,
    color: theme.textSecondary,
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
