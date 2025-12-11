import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { usePatterns, usePattern, resolveAssetUrl } from '@schnittmuster/core';

export default function EditPatternScreen() {
  const router = useRouter();
  const { patternId } = useLocalSearchParams<{ patternId: string }>();
  const { mutate } = usePatterns();
  const { data: pattern, isLoading: isLoadingPattern } = usePattern(patternId);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnail, setThumbnail] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (pattern) {
      setName(pattern.name);
      setDescription(pattern.description || '');
    }
  }, [pattern]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
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
    if (!name) {
      Alert.alert('Error', 'Please enter a name');
      return;
    }

    if (!patternId) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      
      if (thumbnail) {
        // @ts-ignore: React Native FormData expects uri, name, type
        formData.append('thumbnail', {
          uri: thumbnail.uri,
          name: thumbnail.fileName || 'thumbnail.jpg',
          type: thumbnail.mimeType || 'image/jpeg',
        });
      }

      if (file) {
        // @ts-ignore: React Native FormData expects uri, name, type
        formData.append('file', {
          uri: file.uri,
          name: file.name || 'pattern.pdf',
          type: file.mimeType || 'application/pdf',
        });
      }

      await mutate.update(patternId, formData);
      Alert.alert('Success', 'Pattern updated successfully');
      router.back();
    } catch (error: any) {
      console.error(error);
      Alert.alert('Error', error.message || 'Failed to update pattern');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingPattern) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const currentThumbnailUrl = resolveAssetUrl(pattern?.thumbnailUrl);

  return (
    <ScrollView className="flex-1 bg-white p-4">
      <Text className="text-2xl font-bold mb-6">Edit Pattern</Text>

      <View className="mb-4">
        <Text className="text-gray-700 mb-2 font-medium">Name *</Text>
        <TextInput
          className="border border-gray-300 rounded-lg p-3"
          placeholder="Pattern Name"
          value={name}
          onChangeText={setName}
        />
      </View>

      <View className="mb-4">
        <Text className="text-gray-700 mb-2 font-medium">Description</Text>
        <TextInput
          className="border border-gray-300 rounded-lg p-3 h-24"
          placeholder="Description"
          value={description}
          onChangeText={setDescription}
          multiline
          textAlignVertical="top"
        />
      </View>

      <View className="mb-4">
        <Text className="text-gray-700 mb-2 font-medium">Thumbnail</Text>
        <TouchableOpacity
          onPress={pickImage}
          className="border border-gray-300 border-dashed rounded-lg p-4 items-center justify-center bg-gray-50"
        >
          {thumbnail ? (
            <Image source={{ uri: thumbnail.uri }} className="w-full h-48 rounded-lg" resizeMode="cover" />
          ) : currentThumbnailUrl ? (
             <Image source={{ uri: currentThumbnailUrl }} className="w-full h-48 rounded-lg" resizeMode="cover" />
          ) : (
            <Text className="text-gray-500">Tap to change image</Text>
          )}
        </TouchableOpacity>
      </View>

      <View className="mb-6">
        <Text className="text-gray-700 mb-2 font-medium">Pattern File (PDF)</Text>
        <TouchableOpacity
          onPress={pickDocument}
          className="border border-gray-300 border-dashed rounded-lg p-4 items-center justify-center bg-gray-50"
        >
          {file ? (
            <View className="items-center">
              <Text className="text-blue-600 font-medium">{file.name}</Text>
              <Text className="text-gray-400 text-xs">{(file.size ? file.size / 1024 / 1024 : 0).toFixed(2)} MB</Text>
            </View>
          ) : (
            <View className="items-center">
                <Text className="text-gray-500">Tap to change PDF</Text>
                {pattern?.fileUrl && <Text className="text-xs text-gray-400 mt-1">(Current file exists)</Text>}
            </View>
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={handleSubmit}
        disabled={isSubmitting}
        className={`p-4 rounded-lg items-center mb-8 ${isSubmitting ? 'bg-blue-300' : 'bg-blue-500'}`}
      >
        {isSubmitting ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white font-bold text-lg">Update Pattern</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}
