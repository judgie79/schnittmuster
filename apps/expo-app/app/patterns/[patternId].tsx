import { View, Text, ActivityIndicator, Image, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { useLocalSearchParams, useRouter, Link } from 'expo-router';
import { usePattern, resolveAssetUrl, usePatterns, useAuth } from '@schnittmuster/core';

export default function PatternDetails() {
  const { patternId } = useLocalSearchParams<{ patternId: string }>();
  const router = useRouter();
  const { data: pattern, isLoading, error } = usePattern(patternId);
  const { mutate } = usePatterns();
  const { user } = useAuth();

  const isOwner = user?.id === pattern?.ownerId;
  const isAdmin = user?.adminRole;
  const canEdit = isOwner || isAdmin;

  const handleDelete = () => {
    Alert.alert(
      "Delete Pattern",
      "Are you sure you want to delete this pattern?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              if (patternId) {
                await mutate.remove(patternId);
                router.replace('/');
              }
            } catch (e) {
              Alert.alert("Error", "Failed to delete pattern");
            }
          }
        }
      ]
    );
  };

  const handleOpenPdf = async () => {
    if (!pattern?.fileUrl) return;
    const url = resolveAssetUrl(pattern.fileUrl);
    if (url) {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Error", "Cannot open this file URL");
      }
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error || !pattern) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-red-500">Error loading pattern details</Text>
      </View>
    );
  }

  const imageUrl = resolveAssetUrl(pattern.thumbnailUrl);

  return (
    <ScrollView className="flex-1 bg-white">
      {imageUrl && (
        <Image
          source={{ uri: imageUrl }}
          className="w-full h-64 bg-gray-200"
          resizeMode="cover"
        />
      )}
      <View className="p-4">
        <View className="flex-row justify-between items-start mb-2">
          <Text className="text-2xl font-bold flex-1 mr-2">{pattern.name}</Text>
          {canEdit && (
            <View className="flex-row gap-2">
              <Link href={`/patterns/${patternId}/edit`} asChild>
                <TouchableOpacity className="bg-blue-500 px-3 py-2 rounded">
                  <Text className="text-white font-bold">Edit</Text>
                </TouchableOpacity>
              </Link>
              <TouchableOpacity 
                onPress={handleDelete}
                className="bg-red-500 px-3 py-2 rounded"
              >
                <Text className="text-white font-bold">Delete</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View className="flex-row mb-4">
          <View className="bg-gray-100 px-3 py-1 rounded-full">
            <Text className="text-gray-600 text-sm capitalize">{pattern.status}</Text>
          </View>
        </View>
        
        {pattern.description && (
          <View className="mb-6">
            <Text className="text-lg font-semibold mb-2">Description</Text>
            <Text className="text-base text-gray-700 leading-6">{pattern.description}</Text>
          </View>
        )}

        {pattern.tags && pattern.tags.length > 0 && (
          <View className="mb-6">
            <Text className="text-lg font-semibold mb-2">Tags</Text>
            <View className="flex-row flex-wrap gap-2">
              {pattern.tags.map((tag) => (
                <View 
                  key={tag.id} 
                  className="px-3 py-1 rounded-full"
                  style={{ backgroundColor: tag.colorHex || '#e5e7eb' }}
                >
                  <Text className="text-xs font-medium" style={{ color: getContrastColor(tag.colorHex || '#e5e7eb') }}>
                    {tag.name}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {pattern.fileUrl && (
          <TouchableOpacity 
            onPress={handleOpenPdf}
            className="bg-gray-800 p-4 rounded-lg items-center mb-8"
          >
            <Text className="text-white font-bold text-lg">Open PDF Pattern</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

function getContrastColor(hexColor: string) {
  // Simple contrast check
  const r = parseInt(hexColor.substr(1, 2), 16);
  const g = parseInt(hexColor.substr(3, 2), 16);
  const b = parseInt(hexColor.substr(5, 2), 16);
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return (yiq >= 128) ? 'black' : 'white';
}
