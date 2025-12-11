import { Text, View, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '@schnittmuster/core';
import { useState } from 'react';
import PatternList from '../components/PatternList';
import { Link } from 'expo-router';

export default function Index() {
  const { isAuthenticated, user, login, logout, isLoading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (isAuthenticated && user) {
    return (
      <View className="flex-1 bg-white">
        <View className="p-4 border-b border-gray-200 flex-row justify-between items-center">
          <View>
            <Text className="text-xl font-bold">Welcome, {user.name}!</Text>
          </View>
          <TouchableOpacity
            onPress={() => logout()}
            className="bg-red-500 px-4 py-2 rounded-lg"
          >
            <Text className="text-white font-bold">Logout</Text>
          </TouchableOpacity>
        </View>
        <PatternList />
        <Link href="/patterns/new" asChild>
          <TouchableOpacity className="absolute bottom-6 right-6 bg-blue-500 w-14 h-14 rounded-full items-center justify-center shadow-lg">
            <Text className="text-white text-3xl font-bold">+</Text>
          </TouchableOpacity>
        </Link>
      </View>
    );
  }

  return (
    <View className="flex-1 items-center justify-center bg-white p-4">
      <Text className="text-2xl font-bold mb-8">Login</Text>
      
      {error && (
        <Text className="text-red-500 mb-4">{error.message || 'An error occurred'}</Text>
      )}

      <TextInput
        className="w-full border border-gray-300 rounded-lg p-3 mb-4"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      
      <TextInput
        className="w-full border border-gray-300 rounded-lg p-3 mb-6"
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        onPress={() => login({ email, password })}
        className="bg-blue-500 w-full py-3 rounded-lg items-center"
      >
        <Text className="text-white font-bold">Sign In</Text>
      </TouchableOpacity>
    </View>
  );
}
