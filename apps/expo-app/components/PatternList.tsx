import { Text, View, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { usePatterns } from '@schnittmuster/core';
import { Link } from 'expo-router';

export default function PatternList() {
  const { items, isLoading, error } = usePatterns();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-red-500">Error loading patterns</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <Link href={`/patterns/${item.id}`} asChild>
          <TouchableOpacity className="p-4 border-b border-gray-200">
            <Text className="text-lg font-bold">{item.name}</Text>
            <Text className="text-gray-500">{item.status}</Text>
          </TouchableOpacity>
        </Link>
      )}
      ListEmptyComponent={
        <View className="p-4 items-center">
          <Text className="text-gray-500">No patterns found</Text>
        </View>
      }
    />
  );
}
