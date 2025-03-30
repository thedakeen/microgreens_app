import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image, ScrollView, TouchableOpacity, Dimensions, FlatList, Button } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import PhenologicalJournal from './phenologicalJournal';


const { width } = Dimensions.get('window');

const PlantDetailsScreen = () => {
  const [activeTab, setActiveTab] = useState('care');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const router = useRouter();

  const toggleFavorite = () => setIsFavorite(!isFavorite);
  // Пример данных растения
  const plantData = {
    name: "Монстера",
    latinName: "Monstera deliciosa",
    images: [
      "https://via.placeholder.com/400x300/1a1a1a/ffffff?text=Монстера+1",
      "https://via.placeholder.com/400x300/1a1a1a/ffffff?text=Монстера+2",
      "https://via.placeholder.com/400x300/1a1a1a/ffffff?text=Монстера+3",
    ],
    care: {
      watering: {
        text: "Умеренный полив, дать просохнуть верхнему слою почвы между поливами.",
        frequency: "1-2 раза в неделю летом, зимой реже",
        amount: "Средний",
        icon: "💧"
      },
      light: {
        text: "Яркий рассеянный свет, без прямых солнечных лучей. Может расти в полутени.",
        level: 70, // процент яркости
        icon: "☀️"
      },
      allergies: {
        text: "Содержит оксалат кальция, ядовита для домашних животных при проглатывании.",
        icons: ["🐱", "🐶", "👶"],
        icon: "⚠️"
      },
      humidity: {
        text: "Предпочитает высокую влажность.",
        level: 75, // процент влажности
        recommendation: "Регулярное опрыскивание или увлажнитель воздуха",
        icon: "💨"
      },
      problems: {
        list: [
          "Пожелтение листьев — переполив",
          "Коричневые кончики — низкая влажность",
          "Отсутствие прорезей в листьях — недостаток освещения"
        ],
        icon: "🔍"
      },
      soil: {
        text: "Рыхлый, питательный субстрат с хорошим дренажем.",
        components: [
          { name: "Универсальный грунт", ratio: "60%" },
          { name: "Перлит", ratio: "20%" },
          { name: "Кокосовое волокно", ratio: "20%" }
        ],
        icon: "🌱"
      },
      temperature: {
        summer: { min: 21, max: 30, icon: "🌞" },
        winter: { min: 16, max: 22, icon: "❄️" },
        indoors: { min: 18, max: 27, icon: "🏠" },
        outdoors: { min: 18, max: 32, icon: "🌳" },
        icon: "🌡️"
      },
      flowering: {
        text: "Редко цветет в домашних условиях.",
        period: "Весна-лето",
        icon: "🌸"
      },
      repotting: {
        text: "Каждые 2-3 года весной. Молодые растения можно пересаживать ежегодно.",
        nextDate: "Апрель 2026",
        icon: "🪴"
      },
      leafCleaning: {
        text: "Протирать влажной тканью для удаления пыли и поддержания фотосинтеза.",
        frequency: "Каждые 2-3 недели",
        icon: "🧹"
      },
      flowerColor: {
        text: "Кремово-белые соцветия (початок с покрывалом).",
        colors: ["#F5F5DC", "#FFFFFF"],
        icon: "🎨"
      },
      size: {
        text: "В домашних условиях может достигать 2-3 метров в высоту и 1-2 метра в ширину.",
        height: { min: 2, max: 3, unit: "м" },
        width: { min: 1, max: 2, unit: "м" },
        icon: "📏"
      },
      history: {
        text: "Родом из тропических лесов Центральной и Южной Америки. Популярное комнатное растение с 1950-х годов.",
        origin: "Центральная и Южная Америка",
        icon: "🌍"
      },
      difficulty: {
        text: "Средняя. Подходит для начинающих, но требует внимания к влажности и освещению.",
        level: 2, // по шкале от 1 до 5
        icon: "⭐"
      }
    },
  };

  const handleTabPress = (tab) => {
    setActiveTab(tab);
  };

  const handleImageScroll = (event) => {
    const slide = Math.ceil(event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width);
    if (slide !== activeImageIndex) {
      setActiveImageIndex(slide);
    }
  };

  // Компонент для отображения слайдера значений
  const ValueSlider = ({ value, min = 0, max = 100, label }) => (
    <View style={styles.sliderContainer}>
      <View style={styles.sliderTrack}>
        <View
          style={[
            styles.sliderFill,
            { width: `${((value - min) / (max - min)) * 100}%` }
          ]}
        />
      </View>
      <View style={styles.sliderLabels}>
        <Text style={styles.sliderMin}>{min}</Text>
        <Text style={styles.sliderValue}>{label}</Text>
        <Text style={styles.sliderMax}>{max}</Text>
      </View>
    </View>
  );

  // Компонент для отображения температурного диапазона
  const TemperatureRange = ({ min, max, icon, label }) => (
    <View style={styles.temperatureContainer}>
      <View style={styles.temperatureHeader}>
        <Text style={styles.temperatureIcon}>{icon}</Text>
        <Text style={styles.temperatureLabel}>{label}</Text>
      </View>
      <ValueSlider value={(min + max) / 2} min={0} max={40} label={`${min}°C - ${max}°C`} />
    </View>
  );
  const renderCareInfo = () => (
    <FlatList
      data={careItems}
      keyExtractor={(item) => item.title}
      renderItem={({ item }) => (
        <InfoModule title={item.title} icon={item.icon} content={item.content} />
      )}
    />
  );

  const careItems = [
    {
      title: "Полив",
      icon: plantData.care.watering.icon,
      content: (
        <View>
          <Text style={styles.infoModuleContent}>{plantData.care.watering.text}</Text>
          <View style={styles.infoDetails}>
            <View style={styles.infoDetail}>
              <Text style={styles.infoDetailLabel}>Частота:</Text>
              <Text style={styles.infoDetailValue}>{plantData.care.watering.frequency}</Text>
            </View>
            <View style={styles.infoDetail}>
              <Text style={styles.infoDetailLabel}>Количество:</Text>
              <Text style={styles.infoDetailValue}>{plantData.care.watering.amount}</Text>
            </View>
          </View>
        </View>
      ),
    },
    {
      title: "Освещение",
      icon: plantData.care.light.icon,
      content: (
        <View>
          <Text style={styles.infoModuleContent}>{plantData.care.light.text}</Text>
          <ValueSlider value={plantData.care.light.level} label="Яркость света" />
        </View>
      ),
    },
    {
      title: "Аллергии",
      icon: plantData.care.allergies.icon,
      content: (
        <View>
          <Text style={styles.infoModuleContent}>{plantData.care.allergies.text}</Text>
          <View style={styles.allergiesIcons}>
            {plantData.care.allergies.icons.map((icon, index) => (
              <View key={index} style={styles.allergyIcon}>
                <Text style={styles.allergyIconText}>{icon}</Text>
              </View>
            ))}
          </View>
        </View>),
    },
    {
      title: "Влажность",
      icon: plantData.care.humidity.icon,
      content: (
        <View>
          <Text style={styles.infoModuleContent}>{plantData.care.humidity.text}</Text>
          <ValueSlider value={plantData.care.humidity.level} label={`${plantData.care.humidity.level}%`} />
          <Text style={styles.infoModuleContent}>{plantData.care.humidity.recommendation}</Text>
        </View>
      ),
    },
    {
      title: "Частые проблемы",
      icon: plantData.care.problems.icon,
      content: (
        <View>
          {plantData.care.problems.list.map((problem, index) => (
            <View key={index} style={styles.problemItem}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.infoModuleContent}>{problem}</Text>
            </View>
          ))}
        </View>
      ),
    },
    {
      title: "Рекомендации по почве",
      icon: plantData.care.soil.icon,
      content: (
        <View>
          <Text style={styles.infoModuleContent}>{plantData.care.soil.text}</Text>
          <View style={styles.soilTable}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderCell}>Компонент</Text>
              <Text style={styles.tableHeaderCell}>Пропорция</Text>
            </View>
            {plantData.care.soil.components.map((component, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.tableCell}>{component.name}</Text>
                <Text style={styles.tableCell}>{component.ratio}</Text>
              </View>
            ))}
          </View>
        </View>
      ),
    },
    {
      title: "Температура",
      icon: plantData.care.temperature.icon,
      content: (
        <View>
          <TemperatureRange
            min={plantData.care.temperature.summer.min}
            max={plantData.care.temperature.summer.max}
            icon={plantData.care.temperature.summer.icon}
            label="Летом"
          />
          <TemperatureRange
            min={plantData.care.temperature.winter.min}
            max={plantData.care.temperature.winter.max}
            icon={plantData.care.temperature.winter.icon}
            label="Зимой"
          />
          <TemperatureRange
            min={plantData.care.temperature.indoors.min}
            max={plantData.care.temperature.indoors.max}
            icon={plantData.care.temperature.indoors.icon}
            label="В помещении"
          />
          <TemperatureRange
            min={plantData.care.temperature.outdoors.min}
            max={plantData.care.temperature.outdoors.max}
            icon={plantData.care.temperature.outdoors.icon}
            label="На улице"
          />
        </View>
      ),
    },
    {
      title: "Цветение",
      icon: plantData.care.flowering.icon,
      content: (
        <View>
          <Text style={styles.infoModuleContent}>{plantData.care.flowering.text}</Text>
          <View style={styles.infoDetail}>
            <Text style={styles.infoDetailLabel}>Период цветения:</Text>
            <Text style={styles.infoDetailValue}>{plantData.care.flowering.period}</Text>
          </View>
        </View>
      ),
    },
    {
      title: "Пересадка",
      icon: plantData.care.repotting.icon,
      content: (
        <View>
          <Text style={styles.infoModuleContent}>{plantData.care.repotting.text}</Text>
          <View style={styles.infoDetail}>
            <Text style={styles.infoDetailLabel}>Следующая пересадка:</Text>
            <Text style={styles.infoDetailValue}>{plantData.care.repotting.nextDate}</Text>
          </View>
        </View>
      ),
    },
    {
    },
    {
      title: "Размеры",
      icon: plantData.care.size.icon,
      content: (
        <View>
          <Text style={styles.infoModuleContent}>{plantData.care.size.text}</Text>
          <View style={styles.infoDetail}>
            <Text style={styles.infoDetailLabel}>Высота:</Text>
            <Text style={styles.infoDetailValue}>
              {plantData.care.size.height.min}-{plantData.care.size.height.max} {plantData.care.size.height.unit}
            </Text>
          </View>
          <View style={styles.infoDetail}>
            <Text style={styles.infoDetailLabel}>Ширина:</Text>
            <Text style={styles.infoDetailValue}>
              {plantData.care.size.width.min}-{plantData.care.size.width.max} {plantData.care.size.width.unit}
            </Text>
          </View>
        </View>
      ),
    },
    {
      title: "История",
      icon: plantData.care.history.icon,
      content: (
        <View>
          <Text style={styles.infoModuleContent}>{plantData.care.history.text}</Text>
          <View style={styles.infoDetail}>
            <Text style={styles.infoDetailLabel}>Происхождение:</Text>
            <Text style={styles.infoDetailValue}>{plantData.care.history.origin}</Text>
          </View>
        </View>
      ),
    },
    {
      title: "Сложность выращивания",
      icon: plantData.care.difficulty.icon,
      content: (
        <View>
          <Text style={styles.infoModuleContent}>{plantData.care.difficulty.text}</Text>
          <View style={styles.difficultyStars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Text
                key={star}
                style={[
                  styles.starIcon,
                  star <= plantData.care.difficulty.level ? styles.filledStar : styles.emptyStar
                ]}
              >
                ★
              </Text>
            ))}
          </View>
        </View>
      ),
    },
  ]
  const addNote = () => {
    router.push('/PhenologicalJournal');
  };


  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.tabContent}>
        {/* Слайдер с фотографиями */}
        <View style={styles.imageSliderContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleImageScroll}
            scrollEventThrottle={16}
          >
            {plantData.images.map((image, index) => (
              <Image
                key={index}
                source={{ uri: image }}
                style={styles.plantImage}
              />
            ))}
          </ScrollView>

          {/* Индикаторы слайдера */}
          <View style={styles.pagination}>
            {plantData.images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  index === activeImageIndex && styles.paginationDotActive
                ]}
              />
            ))}
          </View>
        </View>

        {/* Информация о растении */}
        <View style={styles.plantInfo}>
          <Text style={styles.plantName}>{plantData.name}</Text>
          <Text style={styles.plantLatinName}>{plantData.latinName}</Text>
        </View>

        {/* Переключатель вкладок */}
        <View style={styles.tabsBlock}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'care' && styles.activeTab]}
            onPress={() => handleTabPress('care')}
          >
            <Text style={[styles.tabText, activeTab === 'care' && styles.activeTabText]}>Информация о уходе</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'todo' && styles.activeTab]}
            onPress={() => handleTabPress('todo')}
          >
            <Text style={[styles.tabText, activeTab === 'todo' && styles.activeTabText]}>Todo</Text>
          </TouchableOpacity>
        </View>

        {/* Контент вкладки */}
        <View style={styles.contentBlock}>
          {activeTab === 'care' ? renderCareInfo() : <PhenologicalJournal plantName="Мой помидор" />}
        </View>
      </ScrollView>
      <View style={styles.footer}>
        {/* Кнопка "Add Plant" */}
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>Add Plant</Text>
        </TouchableOpacity>
        {/* Кнопка "Добавить в избранное" (сердечко) */}
        <TouchableOpacity onPress={toggleFavorite} style={styles.favoriteButton}>
          <FontAwesome
            name={isFavorite ? "heart" : "heart-o"}
            size={24}
            color={isFavorite ? "red" : "gray"}
          />
        </TouchableOpacity>


      </View>
    </SafeAreaView>

  );
};

// Компонент для модулей информации
const InfoModule = ({ title, icon, content }) => (
  <View style={styles.infoModule}>
    <View style={styles.infoModuleHeader}>
      <Text style={styles.moduleIcon}>{icon}</Text>
      <Text style={styles.infoModuleTitle}>{title}</Text>
    </View>
    <View style={styles.infoModuleBody}>
      {content}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 0,
  },
  imageSliderContainer: {
    height: 300,
    position: 'relative',
  },
  plantImage: {
    width,
    height: 300,
    resizeMode: 'cover',
  },
  pagination: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#FFF',
  },
  plantInfo: {
    padding: 16,
  },
  plantName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  plantLatinName: {
    fontSize: 16,
    color: '#AAA',
    fontStyle: 'italic',
  },
  tabsBlock: {
    backgroundColor: '#1E1E1E',
    borderRadius: 20,
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 12,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#333',
  },
  tabText: {
    fontSize: 14,
    color: '#888',
  },
  activeTabText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  contentBlock: {
    backgroundColor: '#000',
    borderRadius: 25,
    flex: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  infoModule: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 0,
    marginBottom: 16,
    overflow: 'hidden',
  },
  infoModuleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  moduleIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  infoModuleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  infoModuleBody: {
    padding: 16,
  },
  infoModuleContent: {
    fontSize: 14,
    color: '#CCC',
    lineHeight: 20,
  },
  infoDetails: {
    marginTop: 12,
  },
  infoDetail: {
    flexDirection: 'row',
    marginTop: 8,
  },
  infoDetailLabel: {
    fontSize: 14,
    color: '#888',
    width: 140,
  },
  infoDetailValue: {
    fontSize: 14,
    color: '#FFF',
    flex: 1,
  },
  sliderContainer: {
    marginTop: 16,
    marginBottom: 8,
  },
  sliderTrack: {
    height: 6,
    backgroundColor: '#444',
    borderRadius: 3,
  },
  sliderFill: {
    height: 6,
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  sliderMin: {
    fontSize: 12,
    color: '#888',
  },
  sliderMax: {
    fontSize: 12,
    color: '#888',
  },
  sliderValue: {
    fontSize: 12,
    color: '#CCC',
  },
  allergiesIcons: {
    flexDirection: 'row',
    marginTop: 12,
  },
  allergyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#444',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  allergyIconText: {
    fontSize: 20,
  },
  problemItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  bulletPoint: {
    fontSize: 16,
    color: '#CCC',
    marginRight: 8,
    lineHeight: 20,
  },
  soilTable: {
    marginTop: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#333',
    paddingVertical: 8,
  },
  tableHeaderCell: {
    flex: 1,
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    paddingHorizontal: 12,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#444',
    backgroundColor: '#222',
  },
  tableCell: {
    flex: 1,
    color: '#CCC',
    fontSize: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  temperatureContainer: {
    marginBottom: 16,
  },
  temperatureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  temperatureIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  temperatureLabel: {
    fontSize: 14,
    color: '#CCC',
  },
  colorSwatch: {
    flexDirection: 'row',
    marginTop: 12,
  },
  colorSample: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#444',
  },
  difficultyStars: {
    flexDirection: 'row',
    marginTop: 12,
  },
  starIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  filledStar: {
    color: '#FFD700',
  },
  emptyStar: {
    color: '#444',
  },
  todoItem: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  todoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  todoIcon: {
    fontSize: 20,
  },
  todoHeader: {
    flex: 1,
  },
  todoTask: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  todoFrequency: {
    fontSize: 14,
    color: '#AAA',
  },
  todoCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#666',
    marginLeft: 16,
  },
  footer: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E1E1E',
    paddingVertical: 12,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
  },
  favoriteButton: {
    padding: 10,
  },
  addButton: {
    flex: 1,
    backgroundColor: '#2E7D32',
    paddingVertical: 12,
    marginLeft: 20,
    borderRadius: 30,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default PlantDetailsScreen;