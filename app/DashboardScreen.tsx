import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { RootStackParamList } from '../src/navigation/AppNavigator';

const { width } = Dimensions.get('window');

type DashboardScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Dashboard'
>;

type Props = {
  navigation: DashboardScreenNavigationProp;
};

type Module = {
  id: string;
  label: string;
  subtitle: string;
  icon: string;
  accent: string;
  screen: keyof RootStackParamList;
};

const MODULES: Module[] = [
  {
    id: 'bus',
    label: 'Bus Tracking',
    subtitle: 'Routes & Schedules',
    icon: '🚌',
    accent: '#FF6B35',
    screen: 'BusTracking',
  },
  {
    id: 'canteen',
    label: 'Canteen',
    subtitle: 'Order Food',
    icon: '🍱',
    accent: '#2EC4B6',
    screen: 'Canteen',
  },
  {
    id: 'map',
    label: 'Campus Map',
    subtitle: 'Navigate Campus',
    icon: '🗺️',
    accent: '#5C6BC0',
    screen: 'CampusMap',
  },
  {
    id: 'parking',
    label: 'Parking ID',
    subtitle: 'Your Digital Pass',
    icon: '🅿️',
    accent: '#FFB703',
    screen: 'ParkingID',
  },
  {
    id: 'helpline',
    label: 'Helpline',
    subtitle: 'Important Contacts',
    icon: '📞',
    accent: '#E63946',
    screen: 'Helpline',
  },
];

type ModuleCardProps = {
  item: Module;
  index: number;
  navigation: DashboardScreenNavigationProp;
};

function ModuleCard({ item, index, navigation }: ModuleCardProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 80,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay: index * 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
        flex: 1,
        margin: 6,
      }}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => navigation.navigate(item.screen)}
        style={[styles.card, { borderLeftColor: item.accent }]}
      >
        <View style={[styles.iconBadge, { backgroundColor: item.accent + '1A' }]}>
          <Text style={styles.icon}>{item.icon}</Text>
        </View>
        <Text style={styles.cardLabel}>{item.label}</Text>
        <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
        <View style={[styles.cardAccentLine, { backgroundColor: item.accent }]} />
      </TouchableOpacity>
    </Animated.View>
  );
}

function DashboardScreen({ navigation }: Props) {
  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  
  

  const rows: Module[][] = [];
  for (let i = 0; i < MODULES.length; i += 2) {
    rows.push(MODULES.slice(i, i + 2));
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0F1E" />

      <Animated.View style={[styles.header, { opacity: headerAnim }]}>
        <View>
          
          <Text style={styles.headerTitle}>Smart Campus</Text>
          <Text style={styles.headerSub}>What do you need today?</Text>
        </View>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>SC</Text>
        </View>
      </Animated.View>

      <View style={styles.divider} />

      <ScrollView
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
      >
        {rows.map((row: Module[], rowIndex: number) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((item: Module, colIndex: number) => (
              <ModuleCard
                key={item.id}
                item={item}
                index={rowIndex * 2 + colIndex}
                navigation={navigation}
              />
            ))}
            {row.length === 1 && <View style={{ flex: 1, margin: 6 }} />}
          </View>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>SRM KTR Campus</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0F1E',
  },
  header: {
    paddingTop: 56,
    paddingHorizontal: 22,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
 
  headerTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 14,
    color: '#8892A4',
    marginTop: 2,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1E2A45',
    borderWidth: 1.5,
    borderColor: '#2E3D5C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#5C7AEA',
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: '#1A2238',
    marginHorizontal: 22,
    marginBottom: 6,
  },
  grid: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 30,
  },
  row: {
    flexDirection: 'row',
  },
  card: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 18,
    borderLeftWidth: 3,
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: '#1E2A3A',
    borderRightColor: '#1E2A3A',
    borderBottomColor: '#1E2A3A',
    minHeight: 140,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 6,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  icon: {
    fontSize: 22,
  },
  cardLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#E8EDF5',
    letterSpacing: -0.2,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#6B7A8D',
    marginTop: 2,
    fontWeight: '400',
  },
  cardAccentLine: {
    height: 2,
    borderRadius: 2,
    width: 28,
    marginTop: 12,
  },
  footer: {
    marginTop: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    color: '#3A4558',
    letterSpacing: 0.5,
  },
});

export default DashboardScreen;