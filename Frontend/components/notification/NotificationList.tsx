import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import NotificationItem from './NotificationItem';

interface NotificationListProps {
  notifications: Array<{
    id: string;
    icon: string;
    title: string;
    message: string;
    completed: boolean;
    scheduledDate: Date;
  }>;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onPressItem: (notification: any) => void;
  onAddNotification: () => void;
}

const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  onToggle,
  onDelete,
  onPressItem,
  onAddNotification
}) => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed'>('upcoming');

  const filteredNotifications = notifications.filter(notification =>
    activeTab === 'upcoming' ? !notification.completed : notification.completed
  );

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>
            Предстоящие
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'completed' && styles.activeTab]}
          onPress={() => setActiveTab('completed')}
        >
          <Text style={[styles.tabText, activeTab === 'completed' && styles.activeTabText]}>
            Завершенные
          </Text>
        </TouchableOpacity>
      </View>

      {filteredNotifications.length > 0 ? (
        <FlatList
          data={filteredNotifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <NotificationItem
              notification={item}
              onToggle={onToggle}
              onDelete={onDelete}
              onPress={() => onPressItem(item)}
            />
          )}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <Text style={styles.emptyText}>
          {activeTab === 'upcoming' ? 'Нет предстоящих уведомлений' : 'Нет завершенных уведомлений'}
        </Text>
      )}

      <TouchableOpacity style={styles.addButton} onPress={onAddNotification}>
        <Text style={styles.addButtonText}>+ Добавить уведомление</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#222',
    borderRadius: 12,
    padding: 16
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#333',
    borderRadius: 8,
    marginBottom: 16,
    padding: 4
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center'
  },
  activeTab: {
    backgroundColor: '#444'
  },
  tabText: {
    color: '#AAA',
    fontWeight: '600'
  },
  activeTabText: {
    color: '#FFF'
  },
  listContent: {
    paddingBottom: 16
  },
  emptyText: {
    color: '#AAA',
    textAlign: 'center',
    marginVertical: 20
  },
  addButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8
  },
  addButtonText: {
    color: '#FFF',
    fontWeight: 'bold'
  }
});

export default NotificationList;