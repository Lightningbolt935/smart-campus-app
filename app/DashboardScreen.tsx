import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Module = {
  id: string;
  label: string;
  subtitle: string;
  icon: string;
  accent: string;
  bg: string;
  href: string;
};

const MODULES: Module[] = [
  { id: 'bus',      label: 'Bus Tracking', subtitle: 'Routes & Schedules', icon: '🚌', accent: '#FF6B35', bg: '#FFF4EF', href: '/BusTrackingScreen' },
  { id: 'canteen',  label: 'Canteen',      subtitle: 'Order Food',         icon: '🍱', accent: '#0EA5E9', bg: '#EFF8FF', href: '/canteen'           },
  { id: 'map',      label: 'Campus Map',   subtitle: 'Navigate Campus',    icon: '🗺️', accent: '#8B5CF6', bg: '#F5F3FF', href: '/CampusMapScreen'        },
  { id: 'parking',  label: 'Parking ID',   subtitle: 'Digital Pass',       icon: '🅿️', accent: '#F59E0B', bg: '#FFFBEB', href: '/parking-id'        },
  { id: 'helpline', label: 'Helpline',     subtitle: 'Important Contacts', icon: '📞', accent: '#10B981', bg: '#ECFDF5', href: '/helpline'           },
  { id: 'chat',     label: 'Campus Assistant', subtitle: 'Ask anything',   icon: '🤖', accent: '#4F46E5', bg: '#EEF2FF', href: '/ChatbotScreen'      },
];

function ModuleCard({ item, index }: { item: Module; index: number }) {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 350,
      delay: index * 60,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={() =>
          Animated.spring(scaleAnim, {
            toValue: 0.96,
            useNativeDriver: true,
          }).start()
        }
        onPressOut={() =>
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 4,
            useNativeDriver: true,
          }).start()
        }
        onPress={() => router.push(item.href as any)}
        style={styles.card}
      >
        <View style={[styles.iconBox, { backgroundColor: item.bg }]}>
          <Text style={styles.icon}>{item.icon}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardLabel}>{item.label}</Text>
          <Text style={styles.cardSub}>{item.subtitle}</Text>
        </View>
        <View style={[styles.arrow, { backgroundColor: item.accent + "18" }]}>
          <Text style={[styles.arrowText, { color: item.accent }]}>›</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function DashboardScreen() {
  const headerAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FB" />

      <Animated.View style={[styles.header, { opacity: headerAnim }]}>
        <View>
          <Text style={styles.headerTitle}>Smart Campus</Text>
          <Text style={styles.headerSub}>SRM KTR</Text>
        </View>
      </Animated.View>

      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {MODULES.map((item, i) => (
          <ModuleCard key={item.id} item={item} index={i} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FB" },

  header: {
    paddingTop: 58,
    paddingHorizontal: 22,
    paddingBottom: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: -0.5,
  },
  headerSub: { fontSize: 13, color: "#9CA3AF", marginTop: 2 },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#6366F1", fontWeight: "800", fontSize: 13 },

  list: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 40 },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  icon: { fontSize: 26 },
  cardLabel: { fontSize: 16, fontWeight: "700", color: "#111827" },
  cardSub: { fontSize: 13, color: "#9CA3AF", marginTop: 2 },
  arrow: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  arrowText: { fontSize: 22, fontWeight: "700", marginTop: -2 },
});
