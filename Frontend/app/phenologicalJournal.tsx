import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Platform,
  ActivityIndicator
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = Platform.select({
  ios: 'http://localhost:8000',
  android: 'http://10.0.2.2:8000',
  default: 'http://localhost:8000'
});

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

const PhenologicalJournal = () => {
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const createDefaultEntry = async () => {
      try {
          const token = await AsyncStorage.getItem('token');
        const response = await api.post('/lots/1/entry', {
          entry_date: new Date().toISOString(),
          description: "Автоматически созданная запись",
          height: 10,
          moisture: 50,
          photo: null
        }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setEntry(response.data);
      } catch (err) {
        console.error('Ошибка при создании записи:', err);
      } finally {
        setLoading(false);
      }
    };

    createDefaultEntry();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {entry ? (
          <View style={styles.entryCard}>
            <Text style={styles.entryDate}>
              {new Date(entry.entry_date).toLocaleDateString('ru-RU')}
            </Text>
            <Text style={styles.entryText}>Высота: {entry.height} см</Text>
            <Text style={styles.entryText}>Влажность: {entry.moisture}%</Text>
            <Text style={styles.entryText}>Описание: {entry.description}</Text>
            {entry.photo_url && (
              <Image
                source={{ uri: entry.photo_url }}
                style={styles.entryImage}
              />
            )}
          </View>
        ) : (
          <Text style={styles.errorText}>Не удалось создать запись</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 16,
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  entryCard: {
    backgroundColor: '#333',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  entryDate: {
    color: '#AAA',
    fontSize: 14,
    marginBottom: 8,
  },
  entryText: {
    color: '#FFF',
    fontSize: 16,
    marginBottom: 8,
  },
  entryImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginTop: 10,
  },
  errorText: {
    color: '#FF3B30',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default PhenologicalJournal;