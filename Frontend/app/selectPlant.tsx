import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  FlatList,
  Image,
  SafeAreaView,
  ActivityIndicator,
  Platform,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PlantItem = ({ plant, onSelect }) => {
  return (
    <TouchableOpacity style={styles.plantItem} onPress={() => onSelect(plant)}>
      <Image source={{ uri: plant.avatar }} style={styles.plantImage} />
      <View style={styles.plantInfo}>
        <Text style={styles.plantName}>{plant.name}</Text>
        <Text style={styles.plantDetails}>
          {`Days to grow: ${plant.days_to_grow} | Temp: ${plant.temperature} | Light: ${plant.light}`}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default function SelectPlant({ onSelectPlant, onClose }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);

  // Динамический URL для разных платформ
  const API_BASE_URL = Platform.select({
    ios: 'http://192.168.1.179:8000', // Для iOS
    android: 'http://10.0.2.2:8000',      // Для Android эмулятора
    default: 'http://127.0.0.1:8000'      // Для веба
  });

  const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });

  useEffect(() => {
    const fetchPlants = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        console.log('Токен из хранилища:', token); // Логируем токен
        
        if (!token) {
          throw new Error('Токен не найден');
        }
  
        const response = await api.get('/microgreens', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        console.log('Ответ сервера:', response.data);

        if (Array.isArray(response.data)) {
          setPlants(response.data);
        } else if (response.data.microgreens && Array.isArray(response.data.microgreens)) {
          setPlants(response.data.microgreens);
        } else {
          setPlants([]);
        }
      } catch (error) {
        console.error('Полная ошибка:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        Alert.alert('Ошибка', 'Проблема с токеном. Попробуйте войти снова.');
        await AsyncStorage.removeItem('token'); // Удаляем невалидный токен
      }
      finally {
        setLoading(false); // Важно: устанавливаем loading в false в любом случае
      }
    };
    fetchPlants();
  }, []);

  const filteredPlants = plants.filter(plant =>
    plant.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Выберите растение</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#777" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Поиск растений..."
            placeholderTextColor="#777"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#FFF" />
        ) : (
          <FlatList
            data={filteredPlants}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <PlantItem plant={item} onSelect={onSelectPlant} />
            )}
            contentContainerStyle={styles.listContainer}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

// Стили остаются без изменений
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  content: { flex: 1, padding: 16, paddingTop: 0 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333'
  },
  backButton: { marginRight: 16 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#FFF' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginTop: 20,
    marginBottom: 20
  },
  searchIcon: { marginRight: 10 },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#FFF'
  },
  listContainer: { paddingBottom: 20 },
  plantItem: {
    flexDirection: 'row',
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    marginBottom: 16,
    padding: 12
  },
  plantImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16
  },
  plantInfo: { flex: 1, justifyContent: 'center' },
  plantName: { fontSize: 18, fontWeight: 'bold', color: '#FFF' },
  plantDetails: { fontSize: 14, color: '#AAA', marginTop: 4 }
});