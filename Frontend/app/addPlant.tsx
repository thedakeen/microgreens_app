import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
    Modal,
    Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { launchImageLibrary } from 'react-native-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';

const LOCATION_OPTIONS = [
    { id: 'indoor', label: 'В доме', icon: 'home' },
    { id: 'outdoor', label: 'На улице', icon: 'tree' },
    { id: 'balcony', label: 'На балконе', icon: 'umbrella' },
    { id: 'greenhouse', label: 'В теплице', icon: 'thermometer' },
];

const AddPlantScreen = () => {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [plantData, setPlantData] = useState<any>(null);

    const [plantName, setPlantName] = useState('Мое растение');
    const [customName, setCustomName] = useState('');
    const [plantingDate, setPlantingDate] = useState(new Date());
    const [lastWatered, setLastWatered] = useState(new Date());
    const [location, setLocation] = useState('В доме');
    const [image, setImage] = useState(null);
    const [showLocationPicker, setShowLocationPicker] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // Для даты посадки
    const [showPlantingDatePicker, setShowPlantingDatePicker] = useState(Platform.OS === 'ios');
    // Для даты последнего полива
    const [showWateredDatePicker, setShowWateredDatePicker] = useState(Platform.OS === 'ios');

    useEffect(() => {
        if (params.plantData) {
            try {
                const data = JSON.parse(params.plantData as string);
                setPlantData(data);
                setPlantName(data.defaultName);
            } catch (e) {
                console.error('Error parsing plant data:', e);
            }
        }
    }, [params]);

    const handleImagePicker = () => {
        launchImageLibrary({ mediaType: 'photo' }, (response) => {
            if (!response.didCancel) {
                setImage(response.assets[0].uri);
            }
        });
    };

    const handleSubmit = () => {
        setShowSuccessModal(true);
    };

    const handleCloseModal = () => {
        setShowSuccessModal(false);
        router.push('/'); // Возврат на главную
    };

    if (!plantData) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Загрузка данных о растении...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            {/* Заголовок с названием растения */}
            <View style={styles.header}>
                <Text style={styles.plantName}>{plantName}</Text>
            </View>

            {/* Блок с фото */}
            <TouchableOpacity style={styles.imagePicker} onPress={handleImagePicker}>
                {image ? (
                    <Image source={{ uri: image }} style={styles.image} />
                ) : plantData.image ? (
                    <Image source={{ uri: plantData.image }} style={styles.image} />
                ) : (
                    <View style={styles.imagePlaceholder}>
                        <Ionicons name="camera" size={40} color="#555" />
                        <Text style={styles.imagePlaceholderText}>Добавить фото</Text>
                    </View>
                )}
            </TouchableOpacity>

            {/* Форма ввода данных */}
            <View style={styles.formContainer}>
                <Text style={styles.label}>Дайте имя вашему растению</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Например, Соня или Зеленый"
                    value={customName}
                    onChangeText={setCustomName}
                />

                <Text style={styles.label}>Где находится растение?</Text>
                <TouchableOpacity
                    style={styles.locationInput}
                    onPress={() => setShowLocationPicker(true)}
                >
                    <Text style={location ? styles.locationTextSelected : styles.locationTextPlaceholder}>
                        {location || 'Выберите местоположение'}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color="#555" />
                </TouchableOpacity>

                {/* Дата посадки */}
                <Text style={styles.label}>Дата посадки</Text>
                <DateTimePicker
                    value={plantingDate}
                    mode="date"
                    display="default"
                    onChange={(event, date) => date && setPlantingDate(date)}
                    style={styles.datePicker}
                />

                {/* Дата последнего полива */}
                <Text style={styles.label}>Последний полив</Text>
                <DateTimePicker
                    value={lastWatered}
                    mode="date"
                    display="default"
                    onChange={(event, date) => date && setLastWatered(date)}
                    style={styles.datePicker}
                />

                {/* Кнопка сохранения */}
                <TouchableOpacity
                    style={[styles.saveButton, (!customName || !location) && styles.saveButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={!customName || !location}
                >
                    <Text style={styles.saveButtonText}>Сохранить растение</Text>
                </TouchableOpacity>


                {/* Модальное окно выбора местоположения */}
                <Modal
                    visible={showLocationPicker}
                    transparent={true}
                    animationType="slide"
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Выберите местоположение</Text>
                            {LOCATION_OPTIONS.map((option) => (
                                <TouchableOpacity
                                    key={option.id}
                                    style={styles.locationOption}
                                    onPress={() => {
                                        setLocation(option.label);
                                        setShowLocationPicker(false);
                                    }}
                                >
                                    <Ionicons name={option.icon} size={20} color="#555" />
                                    <Text style={styles.locationOptionText}>{option.label}</Text>
                                </TouchableOpacity>
                            ))}
                            <TouchableOpacity
                                style={styles.modalCloseButton}
                                onPress={() => setShowLocationPicker(false)}
                            >
                                <Text style={styles.modalCloseButtonText}>Отмена</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                {/* Модальное окно успешного сохранения */}
                <Modal
                    visible={showSuccessModal}
                    transparent={true}
                    animationType="fade"
                >
                    <View style={styles.successModalOverlay}>
                        <View style={styles.successModalContent}>
                            {image || plantData.image ? (
                                <Image
                                    source={{ uri: image || plantData.image }}
                                    style={styles.successImage}
                                />
                            ) : (
                                <View style={styles.successImagePlaceholder}>
                                    <Ionicons name="leaf" size={40} color="#27ae60" />
                                </View>
                            )}

                            <Text style={styles.successPlantName}>{plantName}</Text>
                            <Text style={styles.successCustomName}>{customName}</Text>

                            <View style={styles.successInfoRow}>
                                <Ionicons name="calendar" size={16} color="#555" />
                                <Text style={styles.successInfoText}>
                                    Посажено: {plantingDate.toLocaleDateString()}
                                </Text>
                            </View>

                            <View style={styles.successButtonContainer}>
                                <TouchableOpacity
                                    style={styles.successButton}
                                    onPress={handleCloseModal}
                                >
                                    <Text style={styles.successButtonText}>Закрыть</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.successButton, styles.successButtonPrimary]}
                                    onPress={() => {
                                        setShowSuccessModal(false);
                                        router.push('/');
                                    }}
                                >
                                    <Text style={[styles.successButtonText, styles.successButtonPrimaryText]}>
                                        На главную
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        marginBottom: 20,
        alignItems: 'center',
    },
    plantName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    imagePicker: {
        height: 200,
        backgroundColor: '#f9f9f9',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#ddd',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        marginBottom: 20,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    imagePlaceholder: {
        alignItems: 'center',
        padding: 20,
    },
    imagePlaceholderText: {
        marginTop: 10,
        color: '#555',
    },
    formContainer: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
        color: '#555',
        fontWeight: '500',
    },
    input: {
        backgroundColor: '#f9f9f9',
        padding: 14,
        borderRadius: 8,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#ddd',
        fontSize: 16,
    },
    locationInput: {
        backgroundColor: '#f9f9f9',
        padding: 14,
        borderRadius: 8,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#ddd',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    locationTextSelected: {
        fontSize: 16,
        color: '#333',
    },
    locationTextPlaceholder: {
        fontSize: 16,
        color: '#999',
    },
    dateInput: {
        backgroundColor: '#f9f9f9',
        padding: 14,
        borderRadius: 8,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#ddd',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    saveButton: {
        backgroundColor: '#27ae60',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 30,
    },
    saveButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    // Стили для модального окна выбора местоположения
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        paddingBottom: 30,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    locationOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    locationOptionText: {
        fontSize: 16,
        marginLeft: 10,
    },
    modalCloseButton: {
        marginTop: 20,
        padding: 15,
        alignItems: 'center',
    },
    modalCloseButtonText: {
        color: '#27ae60',
        fontSize: 16,
        fontWeight: 'bold',
    },
    // Стили для модального окна успеха
    successModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    successModalContent: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 25,
        width: '85%',
        alignItems: 'center',
    },
    successImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 15,
    },
    successImagePlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    successPlantName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    successCustomName: {
        fontSize: 18,
        color: '#27ae60',
        marginBottom: 15,
    },
    successInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    successInfoText: {
        fontSize: 14,
        color: '#555',
        marginLeft: 5,
    },
    successButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    successButton: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginHorizontal: 5,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    successButtonPrimary: {
        backgroundColor: '#27ae60',
        borderColor: '#27ae60',
    },
    successButtonText: {
        fontSize: 16,
        color: '#555',
    },
    successButtonPrimaryText: {
        color: 'white',
    },
    datePickerContainer: {
        marginBottom: 20,
    },
    datePicker: {
        alignSelf: 'flex-start',
        marginBottom: 10,
    },
});

export default AddPlantScreen;