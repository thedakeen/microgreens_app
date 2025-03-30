import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Динамический URL для разных платформ
const API_BASE_URL = Platform.select({
  ios: 'http://192.168.1.179:8000', // Для iOS
  android: 'http://10.0.2.2:8000',   // Для Android эмулятора
  default: 'http://127.0.0.1:8000'   // Для веба
});

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 10000
});

const AuthPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('token');
      setIsAuth(!!token);
    };
    checkAuth();
  }, []);

  const handleAuth = async () => {
    if (isSignUp && password !== confirmPassword) {
      Alert.alert('Ошибка', 'Пароли не совпадают');
      return;
    }

    try {
      const endpoint = isSignUp ? '/user/register' : '/user/login';
      const response = await api.post(endpoint, { email, password });
    
      await AsyncStorage.setItem('token', response.data.token);
      setIsAuth(true);
      
      Alert.alert('Успех', isSignUp ? 'Регистрация успешна!' : 'Вход выполнен!');
    } catch (error) {
      console.error('Детали ошибки:', error);
      Alert.alert(
        'Ошибка', 
        `${error.response?.data?.message || 'Ошибка авторизации'}\nКод: ${error.response?.status || 'неизвестно'}`
      );
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    setIsAuth(false);
    Alert.alert('Успех', 'Вы вышли из системы');
  };

  if (isAuth) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Вы авторизованы</Text>
        <Text style={styles.email}>Email: {email}</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.buttonText}>Выйти</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Возвращаем форму входа/регистрации если не авторизованы
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isSignUp ? 'Регистрация' : 'Вход'}</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Пароль"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      {isSignUp && (
        <TextInput
          style={styles.input}
          placeholder="Подтвердите пароль"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
      )}
      
      <TouchableOpacity style={styles.button} onPress={handleAuth}>
        <Text style={styles.buttonText}>
          {isSignUp ? 'Зарегистрироваться' : 'Войти'}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
        <Text style={styles.toggleText}>
          {isSignUp ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  email: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
  },
  button: {
    height: 50,
    borderRadius: 8,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  logoutButton: {
    height: 50,
    borderRadius: 8,
    backgroundColor: '#dc3545',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  toggleText: {
    color: '#007bff',
    textAlign: 'center',
    marginTop: 10,
  },
  tokenText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
});

export default AuthPage;