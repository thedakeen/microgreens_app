import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Modal } from 'react-native';
import { X } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface NotificationFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (notification: {
    title: string;
    message: string;
    icon: string;
    date: Date;
  }) => void;
  initialData?: {
    title: string;
    message: string;
    icon: string;
    date: Date;
  };
}

const iconOptions = ['💧', '🌱', '🌿', '🌸', '🌞', '✂️', '🌵'];

const NotificationForm: React.FC<NotificationFormProps> = ({
  visible,
  onClose,
  onSubmit,
  initialData
}) => {
  const [formData, setFormData] = useState(
    initialData || {
      title: '',
      message: '',
      icon: '🌿',
      date: new Date()
    }
  );
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSubmit = () => {
    if (!formData.title.trim() || !formData.message.trim()) {
      alert('Пожалуйста, заполните все обязательные поля');
      return;
    }
    onSubmit(formData);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {initialData ? 'Редактировать уведомление' : 'Новое уведомление'}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="#FFF" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.content}>
            <TextInput
              style={styles.input}
              placeholder="Заголовок"
              placeholderTextColor="#888"
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
            />

            <TextInput
              style={[styles.input, styles.messageInput]}
              placeholder="Описание"
              placeholderTextColor="#888"
              multiline
              value={formData.message}
              onChangeText={(text) => setFormData({ ...formData, message: text })}
            />

            <Text style={styles.label}>Иконка</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {iconOptions.map((icon) => (
                <TouchableOpacity
                  key={icon}
                  style={[
                    styles.iconOption,
                    formData.icon === icon && styles.selectedIcon
                  ]}
                  onPress={() => setFormData({ ...formData, icon })}
                >
                  <Text style={styles.iconText}>{icon}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.label}>Дата и время</Text>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateText}>
                {formData.date.toLocaleString('ru-RU', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={formData.date}
                mode="datetime"
                display="default"
                onChange={(event, date) => {
                  setShowDatePicker(false);
                  if (date) {
                    setFormData({ ...formData, date });
                  }
                }}
              />
            )}
          </ScrollView>

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitText}>Сохранить</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  container: {
    backgroundColor: '#222',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333'
  },
  title: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold'
  },
  content: {
    padding: 16
  },
  input: {
    backgroundColor: '#333',
    color: '#FFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16
  },
  messageInput: {
    minHeight: 100,
    textAlignVertical: 'top'
  },
  label: {
    color: '#FFF',
    marginBottom: 8,
    fontSize: 16
  },
  iconOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8
  },
  selectedIcon: {
    backgroundColor: '#4CAF50'
  },
  iconText: {
    fontSize: 20
  },
  dateInput: {
    backgroundColor: '#333',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16
  },
  dateText: {
    color: '#FFF'
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    alignItems: 'center'
  },
  submitText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16
  }
});

export default NotificationForm;