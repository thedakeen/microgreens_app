import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CheckCircle, Trash2, Clock } from 'lucide-react-native';

interface NotificationItemProps {
    notification: {
      id: string;
      icon: string;
      title: string;
      message: string;
      completed: boolean;
      scheduledDate?: Date | string; // Делаем опциональным и добавляем string
    };
    onToggle: (id: string) => void;
    onDelete: (id: string) => void;
    onPress: () => void;
  }
  
  const NotificationItem: React.FC<NotificationItemProps> = ({
    notification,
    onToggle,
    onDelete,
    onPress
  }) => {
    // Функция для безопасного форматирования даты
    const formatDate = (date?: Date | string) => {
      if (!date) return 'Дата не указана';
      
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      
      if (isNaN(dateObj.getTime())) return 'Некорректная дата';
      
      return dateObj.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit'
      });
    };
  
    return (
      <TouchableOpacity style={styles.container} onPress={onPress}>
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={(e) => {
            e.stopPropagation();
            onToggle(notification.id);
          }}
        >
          <View style={[
            styles.checkbox,
            notification.completed ? styles.checkboxCompleted : styles.checkboxIncomplete
          ]}>
            {notification.completed && <CheckCircle size={16} color="#4CAF50" />}
          </View>
        </TouchableOpacity>
  
        <Text style={styles.icon}>{notification.icon}</Text>
  
        <View style={styles.details}>
          <Text style={[
            styles.title,
            notification.completed && styles.completedText
          ]}>
            {notification.title}
          </Text>
          <Text style={[
            styles.message,
            notification.completed && styles.completedText
          ]}>
            {notification.message}
          </Text>
          <View style={styles.dateRow}>
            <Clock size={14} color="#999" />
            <Text style={styles.dateText}>
              {formatDate(notification.scheduledDate)}
            </Text>
          </View>
        </View>
  
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={(e) => {
            e.stopPropagation();
            onDelete(notification.id);
          }}
        >
          <Trash2 size={18} color="#FF3B30" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333'
  },
  checkboxContainer: {
    marginRight: 12
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center'
  },
  checkboxIncomplete: {
    borderColor: '#FFF'
  },
  checkboxCompleted: {
    borderColor: '#4CAF50'
  },
  icon: {
    fontSize: 24,
    marginRight: 12
  },
  details: {
    flex: 1
  },
  title: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4
  },
  message: {
    color: '#AAA',
    fontSize: 14,
    marginBottom: 4
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  dateText: {
    color: '#999',
    fontSize: 12,
    marginLeft: 4
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#888'
  },
  deleteButton: {
    padding: 8
  }
});

export default NotificationItem;