import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  TouchableOpacity,
  ScrollView,
  Modal,
  FlatList,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';

import SelectPlant from '../selectPlant';
import PhenologicalJournal from '../phenologicalJournal';
import axios from 'axios';

// Интерфейсы для типизации
interface Microgreen {
  id: number;
  name: string;
  image_url: string;
  days_to_grow?: number;
  temperature?: string;
  light?: string;
}

interface Lot {
  id: number;
  user_id: number;
  microgreen_id: number;
  microgreen: Microgreen; // Убедитесь, что это поле есть
  sowing_date: string;
  substrate_type: string;
  expected_harvest_date: string;
  created_at: string;
  avatar_url: string;
}

// Динамический URL для разных платформ
const API_BASE_URL = Platform.select({
  ios: 'http://192.168.1.179:8000', // Для iOS
  android: 'http://10.0.2.2:8000',  // Для Android эмулятора
  default: 'http://127.0.0.1:8000'  // Для веба
});

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

const ProfileScreen = () => {
  const [activeTab, setActiveTab] = useState('plants');
  const [lots, setLots] = useState<Lot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectModalVisible, setSelectModalVisible] = useState(false);
  const [registrationModalVisible, setRegistrationModalVisible] = useState(false);
  const [selectedMicrogreen, setSelectedMicrogreen] = useState<Microgreen | null>(null);
  const [selectedLot, setSelectedLot] = useState<Lot | null>(null);
  const [showJournal, setShowJournal] = useState(false);

  // Состояния для создания новой грядки
  const [sowingDate, setSowingDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [substrateType, setSubstrateType] = useState('');
  const [expectedHarvestDate, setExpectedHarvestDate] = useState(new Date());
  const [showHarvestDatePicker, setShowHarvestDatePicker] = useState(false);

  // Загрузка грядок при монтировании
  useEffect(() => {
    fetchLots();
  }, []);

  const fetchLots = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        throw new Error('Токен не найден');
      }
  
      // 1. Получаем список грядок
      const lotsResponse = await api.get('/lots/', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
  
      // 2. Для каждой грядки получаем данные о растении
      const lotsWithMicrogreens = await Promise.all(
        lotsResponse.data.map(async (lot: any) => {
          try {
            const microgreenResponse = await api.get(`/microgreens/${lot.microgreen_id}`, {
              headers: {
                Authorization: `Bearer ${token}`
              }
            });
            return {
              ...lot,
              microgreen: microgreenResponse.data
            };
          } catch (error) {
            console.error(`Ошибка при загрузке растения ${lot.microgreen_id}:`, error);
            return {
              ...lot,
              microgreen: {
                id: lot.microgreen_id,
                name: 'Неизвестное растение',
                image_url: 'default_plant.png'
              }
            };
          }
        })
      );
  
      setLots(lotsWithMicrogreens);
    } catch (error) {
      console.error('Ошибка при загрузке грядок:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить грядки');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLots();
  }, []);

  const handleTabPress = (tab: string) => {
    setActiveTab(tab);
  };

  const handlePlantSelect = (plant: Microgreen) => {
    setSelectedMicrogreen(plant);
    setSelectModalVisible(false);
    setRegistrationModalVisible(true);
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || sowingDate;
    setShowDatePicker(Platform.OS === 'ios');
    setSowingDate(currentDate);
  };

  const onHarvestDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || expectedHarvestDate;
    setShowHarvestDatePicker(Platform.OS === 'ios');
    setExpectedHarvestDate(currentDate);
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return `${dateObj.getDate().toString().padStart(2, '0')}.${(dateObj.getMonth() + 1)
      .toString()
      .padStart(2, '0')}.${dateObj.getFullYear()}`;
  };

  const createLot = async () => {
    if (!selectedMicrogreen) {
      Alert.alert('Ошибка', 'Не выбрано растение');
      return;
    }
  
    try {
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        throw new Error('Токен не найден');
      }
  
      // 1. Создаем грядку
      const response = await api.post(
        '/lots/',
        {
          microgreen_id: selectedMicrogreen.id,
          sowing_date: sowingDate.toISOString(),
          substrate_type: substrateType,
          expected_harvest_date: expectedHarvestDate.toISOString(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
  
      // 2. Получаем данные о растении
      const microgreenResponse = await api.get(`/microgreens/${selectedMicrogreen.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
  
      // 3. Добавляем новую грядку с данными о растении
      const newLot = {
        ...response.data,
        microgreen: microgreenResponse.data
      };
  
      setLots(prev => [newLot, ...prev]);
      
      // Закрываем модальное окно и сбрасываем поля
      setRegistrationModalVisible(false);
      setSelectedMicrogreen(null);
      setSowingDate(new Date());
      setSubstrateType('');
      setExpectedHarvestDate(new Date());
    } catch (error) {
      console.error('Ошибка при создании грядки:', error);
      Alert.alert('Ошибка', 'Не удалось создать грядку');
    }
  };

  const deleteLot = async (lotId: number) => {
    try {
      const token = await AsyncStorage.getItem('token');

      if (!token) {
        throw new Error('Токен не найден');
      }

      await api.delete(`/lots/${lotId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log('Грядка удалена:', lotId);
      await fetchLots(); // Обновляем список после удаления
    } catch (error) {
      console.error('Ошибка при удалении грядки:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      Alert.alert('Ошибка', 'Не удалось удалить грядку');
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'photos':
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.emptyStateText}>Ваши фотографии</Text>
          </View>
        );
      case 'plants':
        return (
          <View style={styles.plantsContainer}>
            {loading ? (
              <ActivityIndicator size="large" color="#4CAF50" />
            ) : lots.length > 0 ? (
              <>
                <FlatList
                  data={lots}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedLot(item);
                        setShowJournal(true);
                      }}
                    >
                      <View style={styles.card}>
                        <Image
                          source={{ uri: item.microgreen?.image_url || item.avatar_url || 'https://via.placeholder.com/100' }}
                          style={styles.cardImage}
                        />
                        <View style={styles.cardTextContainer}>
                          <Text style={styles.cardTitle}>{item.microgreen?.name || 'Неизвестное растение'}</Text>
                          <Text style={styles.cardSubtitle}>
                            Посев: {formatDate(item.sowing_date)}
                          </Text>
                          {item.microgreen?.days_to_grow && (
                            <Text style={styles.cardDetails}>
                              Срок роста: {item.microgreen.days_to_grow} дней
                            </Text>
                          )}
                          {item.substrate_type && (
                            <Text style={styles.cardComment}>Субстрат: {item.substrate_type}</Text>
                          )}
                        </View>
                      </View>
                    </TouchableOpacity>
                  )}
                  contentContainerStyle={styles.listContainer}
                />
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => setSelectModalVisible(true)}
                >
                  <Text style={styles.addButtonText}>+ Добавить грядку</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.emptyStateText}>У вас пока нет грядок</Text>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => setSelectModalVisible(true)}
                >
                  <Text style={styles.addButtonText}>+ Добавить грядку</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        );
      case 'main':
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.emptyStateText}>Главная</Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <Image source={{ uri: 'https://via.placeholder.com/100' }} style={styles.avatar} />
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.userName}>Пользователь</Text>
          <Text style={styles.plantsInfo}>
            {lots.length} грядок
          </Text>
        </View>
      </View>

      <View style={styles.tabsBlock}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'photos' && styles.activeTab]}
          onPress={() => handleTabPress('photos')}
        >
          <Text style={[styles.tabText, activeTab === 'photos' && styles.activeTabText]}>
            Фотографии
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'plants' && styles.activeTab]}
          onPress={() => handleTabPress('plants')}
        >
          <Text style={[styles.tabText, activeTab === 'plants' && styles.activeTabText]}>
            Грядки
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'main' && styles.activeTab]}
          onPress={() => handleTabPress('main')}
        >
          <Text style={[styles.tabText, activeTab === 'main' && styles.activeTabText]}>
            Главная
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.contentBlock}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {renderTabContent()}
        </ScrollView>
      </View>

      {/* Модальное окно для выбора растения */}
      <Modal
        visible={selectModalVisible}
        animationType="slide"
        onRequestClose={() => setSelectModalVisible(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
          <SelectPlant
            onSelectPlant={handlePlantSelect}
            onClose={() => setSelectModalVisible(false)}
          />
        </SafeAreaView>
      </Modal>

      {/* Модальное окно регистрации грядки */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={registrationModalVisible}
        onRequestClose={() => setRegistrationModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.centeredView}
          >
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>
                Новая грядка: {selectedMicrogreen?.name}
              </Text>

              <Text style={styles.labelText}>Дата посева:</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateButtonText}>{formatDate(sowingDate)}</Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={sowingDate}
                  mode="date"
                  display="default"
                  onChange={onDateChange}
                  themeVariant="dark"
                />
              )}

              <Text style={styles.labelText}>Тип субстрата:</Text>
              <TextInput
                style={styles.input}
                placeholder="Кокос, торф, вата и т.д."
                placeholderTextColor="#666"
                value={substrateType}
                onChangeText={setSubstrateType}
              />

              <Text style={styles.labelText}>Ожидаемая дата сбора:</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowHarvestDatePicker(true)}
              >
                <Text style={styles.dateButtonText}>{formatDate(expectedHarvestDate)}</Text>
              </TouchableOpacity>
              {showHarvestDatePicker && (
                <DateTimePicker
                  value={expectedHarvestDate}
                  mode="date"
                  display="default"
                  onChange={onHarvestDateChange}
                  themeVariant="dark"
                />
              )}

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.buttonCancel]}
                  onPress={() => setRegistrationModalVisible(false)}
                >
                  <Text style={styles.buttonCancelText}>Отмена</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.buttonSave]}
                  onPress={createLot}
                >
                  <Text style={styles.buttonSaveText}>Создать</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Модальное окно фенологического журнала */}
      <Modal
        visible={showJournal}
        animationType="slide"
        onRequestClose={() => setShowJournal(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
          {selectedLot && (
            <PhenologicalJournal
              plantName={selectedLot.microgreen.name}
              lotId={selectedLot.id}
            />
          )}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowJournal(false)}
          >
            <Text style={styles.closeButtonText}>Закрыть</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  cardDetails: {
    fontSize: 14,
    color: '#AAA',
    marginTop: 4,
  },
  container: { flex: 1, backgroundColor: '#000', padding: 16 },
  profileHeader: { flexDirection: 'row', alignItems: 'center', marginTop: 40, marginBottom: 24 },
  avatarContainer: { marginRight: 16 },
  scrollContainer: { paddingBottom: 100 },
  avatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 2, borderColor: '#333' },
  profileInfo: { flex: 1 },
  userName: { fontSize: 22, fontWeight: 'bold', color: '#FFF', marginBottom: 4 },
  plantsInfo: { fontSize: 16, color: '#AAA' },
  tabsBlock: { backgroundColor: '#1E1E1E', borderRadius: 20, flexDirection: 'row', marginBottom: 16, overflow: 'hidden' },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  activeTab: { backgroundColor: '#333' },
  tabText: { fontSize: 14, color: '#888' },
  activeTabText: { color: '#FFF', fontWeight: 'bold' },
  contentBlock: { width: '100%', flex: 1, overflow: 'hidden' },
  contentContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  plantsContainer: { flex: 1, padding: 16 },
  emptyStateText: { color: '#888', fontSize: 16, textAlign: 'center', marginTop: 20 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: {
    flexDirection: 'row',
    backgroundColor: '#333',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  cardImage: {
    width: 100,
    height: 100,
  },
  cardTextContainer: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#AAA',
    marginTop: 4,
  },
  cardComment: {
    fontSize: 14,
    color: '#AAA',
    marginTop: 4,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16
  },
  addButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalView: {
    width: '90%',
    backgroundColor: '#1E1E1E',
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center'
  },
  labelText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 8
  },
  dateButton: {
    backgroundColor: '#2C2C2C',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#444',
    marginBottom: 15,
  },
  dateButtonText: {
    color: '#fff',
    textAlign: 'center'
  },
  input: {
    backgroundColor: '#2C2C2C',
    borderRadius: 10,
    padding: 15,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#444',
    marginBottom: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  button: {
    borderRadius: 15,
    padding: 12,
    elevation: 2,
    width: '48%'
  },
  buttonSave: {
    backgroundColor: '#32CD32'
  },
  buttonCancel: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#888'
  },
  buttonSaveText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center'
  },
  buttonCancelText: {
    color: '#888',
    fontWeight: 'bold',
    textAlign: 'center'
  },
  closeButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    margin: 20,
  },
  closeButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  deleteLotButton: {
    marginTop: 8,
    padding: 6,
    backgroundColor: '#FF3B30',
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  deleteLotButtonText: {
    color: '#FFF',
    fontSize: 12,
  },
});

export default ProfileScreen;