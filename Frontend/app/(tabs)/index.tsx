import React, { useState, useEffect } from 'react';
import {View, Text, SafeAreaView, ScrollView, Platform} from 'react-native';
import NotificationList from '../../components/notification/NotificationList';
import NotificationForm from '../../components/notification/NotificationForm';
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const MainScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
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
    const fetchNotifications = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) throw new Error('Токен не найден');

        const response = await api.get('/notifications', {
          headers: { Authorization: `Bearer ${token}` }
        });

        const loadedNotifications = response.data.map((n: any) => {
          const scheduledDate = n.scheduledDate
            ? new Date(n.scheduledDate) 
            : new Date(Date.now() + 86400000); // Дефолтная дата +1 день если нет
            
          return {
            ...n,
            id: n.id || Date.now().toString(), // Дефолтный ID если нет
            scheduledDate,
            createdAt: n.createdAt ? new Date(n.createdAt) : new Date(),
            completed: n.completed || false
          };
        });

        setNotifications(loadedNotifications);
      } catch (err) {
        console.error('Ошибка загрузки уведомлений:', err);
        setError('Не удалось загрузить уведомления');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const handleAddNotification = (newNotification) => {
    setNotifications([
      ...notifications,
      {
        id: Date.now().toString(),
        ...newNotification,
        completed: false
      }
    ]);
  };


  const handleToggle = (id) => {
    setNotifications(
      notifications.map((n) =>
        n.id === id ? { ...n, completed: !n.completed } : n
      )
    );
  };

  const handleDelete = (id) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
      <ScrollView>
        <View style={{ padding: 16 }}>
          <Text style={{ color: '#FFF', fontSize: 24, marginBottom: 16 }}>
            Все уведомления
          </Text>

          <NotificationList
            notifications={notifications}
            onToggle={handleToggle}
            onDelete={handleDelete}
            onPressItem={(item) => console.log('Pressed', item)}
            onAddNotification={() => setIsFormVisible(true)}
          />
        </View>
      </ScrollView>

      <NotificationForm
        visible={isFormVisible}
        onClose={() => setIsFormVisible(false)}
        onSubmit={handleAddNotification}
      />
    </SafeAreaView>
  );
};

export default MainScreen;
