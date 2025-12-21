import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { useAuth, usePatterns } from '@schnittmuster/core';

const Header = ({ username, onLogout }: { username: string; onLogout: () => void }) => (
  <View style={styles.header}>
    <Text style={styles.headerTitle}>Hallo, {username}</Text>
    <TouchableOpacity onPress={onLogout} style={styles.logoutButton}>
      <Text style={styles.logoutLabel}>Logout</Text>
    </TouchableOpacity>
  </View>
);

const PatternList = () => {
  const { items, isLoading, error, refetch, isRefetching } = usePatterns();

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
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Keine Schnittmuster gefunden</Text>
          <Text style={styles.emptyCopy}>Lege ein neues Schnittmuster an, um zu starten.</Text>
        </View>
      }
      renderItem={({ item }) => (
        <Link href={`/patterns/${item.id}`} asChild>
          <TouchableOpacity style={styles.listItem}>
            <View style={{ flex: 1 }}>
              <Text style={styles.listItemTitle}>{item.name}</Text>
              <Text style={styles.listItemMeta}>{item.status}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </Link>
      )}
    />
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
          <ActivityIndicator size="large" color="#2563eb" />
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0f172a',
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
    color: '#0f172a',
  },
  input: {
    backgroundColor: '#fff',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 12,
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
  listItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  listItemMeta: {
    color: '#64748b',
    fontSize: 14,
  },
  chevron: {
    fontSize: 22,
    color: '#94a3b8',
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
    gap: 4,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
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
    backgroundColor: '#2563eb',
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
