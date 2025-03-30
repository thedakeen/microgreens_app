import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Image,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Modal,
    Platform,
    Alert,
    SafeAreaView,
    Pressable,
    Dimensions
} from 'react-native';
import { Plus, X, Clock, Camera, Trash2, ChevronDown, ChevronUp } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { height: windowHeight } = Dimensions.get('window');

const PhenologicalJournal = ({ plantName = 'Мой росток' }) => {
    const [entries, setEntries] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [expandedEntries, setExpandedEntries] = useState({});
    const [currentEntry, setCurrentEntry] = useState({
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        height: '',
        visualChanges: '',
        watering: '',
        lighting: '',
        imageUri: null
    });

    useEffect(() => {
        loadEntries();
        requestPermissions();
    }, []);

    const requestPermissions = async () => {
        if (Platform.OS !== 'web') {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Ошибка', 'Для загрузки фото необходимы разрешения!');
            }
        }
    };

    const loadEntries = async () => {
        try {
            const data = await AsyncStorage.getItem('phenologicalEntries');
            if (data) {
                setEntries(JSON.parse(data));
            }
        } catch (error) {
            console.error('Error loading entries', error);
        }
    };

    const saveEntries = async (newEntries) => {
        try {
            await AsyncStorage.setItem('phenologicalEntries', JSON.stringify(newEntries));
        } catch (error) {
            console.error('Error saving entries', error);
        }
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setCurrentEntry({ ...currentEntry, imageUri: result.assets[0].uri });
        }
    };

    const addEntry = () => {
        const errors = [];

        if (!currentEntry.height.trim()) {
            errors.push('• Высота не заполнена');
        }

        if (!currentEntry.visualChanges.trim()) {
            errors.push('• Визуальные изменения не заполнены');
        }

        if (errors.length > 0) {
            Alert.alert('Пожалуйста, исправьте следующие ошибки:', errors.join('\n'));
            return;
        }

        const newEntries = [currentEntry, ...entries];
        setEntries(newEntries);
        saveEntries(newEntries);
        setModalVisible(false);
        setCurrentEntry({
            id: Date.now().toString(),
            date: new Date().toISOString().split('T')[0],
            height: '',
            visualChanges: '',
            watering: '',
            lighting: '',
            imageUri: null
        });
    };

    const getLatestImage = () => {
        for (let entry of entries) {
            if (entry.imageUri) {
                return entry.imageUri;
            }
        }
        return null;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const deleteEntry = (id) => {
        const newEntries = entries.filter(entry => entry.id !== id);
        setEntries(newEntries);
        saveEntries(newEntries);
    };

    const toggleEntryExpansion = (id) => {
        setExpandedEntries(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const latestImage = getLatestImage();

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.topContainer}>
                    <Text style={styles.greetingText}>{plantName}</Text>
                    <Text style={styles.greetingSubText}>Фенологический журнал роста</Text>
                </View>

                {latestImage && (
                    <View style={styles.latestImageContainer}>
                        <Image
                            source={{ uri: latestImage }}
                            style={styles.latestImage}
                        />
                    </View>
                )}

                <View style={styles.entriesBlock}>
                    {entries.length > 0 ? (
                        entries.map((entry) => (
                            <View key={entry.id} style={styles.entryItem}>
                                <View style={styles.entryHeader}>
                                    <View style={styles.entryDateContainer}>
                                        <Clock size={16} color="#AAA" />
                                        <Text style={styles.entryDate}>{formatDate(entry.date)}</Text>
                                    </View>
                                    
                                    <TouchableOpacity 
                                        onPress={() => toggleEntryExpansion(entry.id)}
                                        style={styles.expandButton}
                                    >
                                        {expandedEntries[entry.id] ? (
                                            <ChevronUp size={20} color="#AAA" />
                                        ) : (
                                            <ChevronDown size={20} color="#AAA" />
                                        )}
                                    </TouchableOpacity>
                                </View>

                                {expandedEntries[entry.id] && (
                                    <View style={styles.entryBody}>
                                        <View style={styles.entryDetailsRow}>
                                            {entry.imageUri && (
                                                <Image
                                                    source={{ uri: entry.imageUri }}
                                                    style={styles.entryImage}
                                                />
                                            )}
                                            <View style={styles.entryDetails}>
                                                <Text style={styles.entryLabel}>Высота:</Text>
                                                <Text style={styles.entryValue}>{entry.height} см</Text>
                                                
                                                <Text style={styles.entryLabel}>Изменения:</Text>
                                                <Text style={styles.entryValue}>{entry.visualChanges}</Text>
                                                
                                                <View style={styles.entryRow}>
                                                    <View style={styles.entryColumn}>
                                                        <Text style={styles.entryLabel}>Полив:</Text>
                                                        <Text style={styles.entryValue}>{entry.watering}</Text>
                                                    </View>
                                                    
                                                    <View style={styles.entryColumn}>
                                                        <Text style={styles.entryLabel}>Освещение:</Text>
                                                        <Text style={styles.entryValue}>{entry.lighting}</Text>
                                                    </View>
                                                </View>
                                            </View>
                                        </View>
                                        
                                        <TouchableOpacity 
                                            style={styles.deleteButton}
                                            onPress={() => deleteEntry(entry.id)}
                                        >
                                            <Trash2 size={16} color="#FF3B30" />
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        ))
                    ) : (
                        <Text style={styles.emptyText}>
                            Нет записей в журнале
                        </Text>
                    )}
                </View>
            </ScrollView>

            <TouchableOpacity
                style={styles.addButton}
                onPress={() => setModalVisible(true)}
            >
                <Plus size={24} color="#FFF" />
            </TouchableOpacity>

            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="fade"
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { maxHeight: windowHeight * 0.8 }]}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Новая запись</Text>
                            <Pressable onPress={() => setModalVisible(false)}>
                                <X size={24} color="#FFF" />
                            </Pressable>
                        </View>

                        <ScrollView style={styles.modalBodyScroll}>
                            <View style={styles.modalBody}>
                                <Text style={styles.label}>Дата:</Text>
                                <TextInput
                                    style={styles.input}
                                    value={currentEntry.date}
                                    onChangeText={(text) => setCurrentEntry({ ...currentEntry, date: text })}
                                    placeholder="ГГГГ-ММ-ДД"
                                    placeholderTextColor="#666"
                                />

                                <Text style={styles.label}>Высота (см):</Text>
                                <TextInput
                                    style={[styles.input, !currentEntry.height.trim() && styles.errorInput]}
                                    value={currentEntry.height}
                                    onChangeText={(text) => setCurrentEntry({ ...currentEntry, height: text })}
                                    keyboardType="numeric"
                                    placeholder="Например: 15"
                                    placeholderTextColor="#666"
                                />

                                <Text style={styles.label}>Визуальные изменения:</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea, !currentEntry.visualChanges.trim() && styles.errorInput]}
                                    value={currentEntry.visualChanges}
                                    onChangeText={(text) => setCurrentEntry({ ...currentEntry, visualChanges: text })}
                                    placeholder="Опишите изменения"
                                    placeholderTextColor="#666"
                                    multiline
                                />

                                <Text style={styles.label}>Полив:</Text>
                                <TextInput
                                    style={styles.input}
                                    value={currentEntry.watering}
                                    onChangeText={(text) => setCurrentEntry({ ...currentEntry, watering: text })}
                                    placeholder="Заметки о поливе"
                                    placeholderTextColor="#666"
                                />

                                <Text style={styles.label}>Освещение:</Text>
                                <TextInput
                                    style={styles.input}
                                    value={currentEntry.lighting}
                                    onChangeText={(text) => setCurrentEntry({ ...currentEntry, lighting: text })}
                                    placeholder="Заметки об освещении"
                                    placeholderTextColor="#666"
                                />

                                <Text style={styles.label}>Фотография:</Text>
                                <TouchableOpacity 
                                    style={styles.imagePickerButton} 
                                    onPress={pickImage}
                                >
                                    <Camera size={20} color="#FFF" />
                                    <Text style={styles.imagePickerText}>
                                        {currentEntry.imageUri ? 'Изменить фото' : 'Загрузить фото'}
                                    </Text>
                                </TouchableOpacity>

                                {currentEntry.imageUri && (
                                    <Image
                                        source={{ uri: currentEntry.imageUri }}
                                        style={styles.previewImage}
                                    />
                                )}
                            </View>
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={styles.saveButton}
                                onPress={addEntry}
                            >
                                <Text style={styles.saveButtonText}>Сохранить</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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
        paddingBottom: 100,
    },
    topContainer: {
        margin: 40,
        marginBottom: 20
    },
    greetingText: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#FFF',
    },
    greetingSubText: {
        fontSize: 20,
        color: '#AAA',
    },
    latestImageContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    latestImage: {
        width: 120,
        height: 120,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#4CAF50',
    },
    entriesBlock: {
        backgroundColor: '#222',
        borderRadius: 15,
        padding: 15,
        margin: 15,
    },
    entryItem: {
        backgroundColor: '#333',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
    },
    entryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    entryDateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    entryDate: {
        color: '#AAA',
        marginLeft: 8,
        fontSize: 14,
    },
    expandButton: {
        padding: 5,
    },
    entryBody: {
        marginTop: 10,
        position: 'relative',
    },
    entryDetailsRow: {
        flexDirection: 'row',
    },
    entryImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        marginRight: 15,
    },
    entryDetails: {
        flex: 1,
    },
    entryLabel: {
        color: '#AAA',
        fontSize: 14,
    },
    entryValue: {
        color: '#FFF',
        fontSize: 16,
        marginBottom: 8,
    },
    entryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    entryColumn: {
        flex: 1,
    },
    deleteButton: {
        position: 'absolute',
        top: 0,
        right: 0,
    },
    emptyText: {
        color: '#AAA',
        textAlign: 'center',
        marginVertical: 20,
    },
    addButton: {
        position: 'absolute',
        right: 30,
        bottom: 0,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#4CAF50',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    modalContent: {
        backgroundColor: '#222',
        borderRadius: 15,
        width: '90%',
        overflow: 'hidden',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    modalTitle: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    modalBodyScroll: {
        maxHeight: '70%',
    },
    modalBody: {
        padding: 20,
    },
    label: {
        color: '#FFF',
        fontSize: 16,
        marginBottom: 8,
        marginTop: 12,
    },
    input: {
        backgroundColor: '#333',
        color: '#FFF',
        borderRadius: 8,
        padding: 12,
        marginBottom: 15,
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    imagePickerButton: {
        flexDirection: 'row',
        backgroundColor: '#4CAF50',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 15,
    },
    imagePickerText: {
        color: '#FFF',
        marginLeft: 10,
        fontWeight: 'bold',
    },
    previewImage: {
        width: '100%',
        height: 150,
        borderRadius: 8,
        marginBottom: 15,
    },
    modalFooter: {
        borderTopWidth: 1,
        borderTopColor: '#333',
        padding: 15,
        alignItems: 'center',
    },
    saveButton: {
        backgroundColor: '#4CAF50',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        width: '100%',
    },
    saveButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
    errorInput: {
        borderColor: '#FF3B30',
        borderWidth: 1,
    },
});

export default PhenologicalJournal;