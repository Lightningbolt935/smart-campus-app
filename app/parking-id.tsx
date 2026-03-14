import React from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function ParkingIDScreen() {
  return (
    <ScrollView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FB" />
      <Text style={styles.headerTitle}>Parking ID (Web)</Text>
      <Text style={styles.headerSub}>Smart parking assistant</Text>
      <View style={styles.card}>
        <Text style={styles.info}>
          Parking map and GPS features are only available on the mobile app.
          Please run this app on an Android or iOS device to use Parking ID.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FB",
    paddingTop: 60,
    paddingHorizontal: 20,
  },

  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#111827",
  },

  headerSub: {
    fontSize: 13,
    color: "#9CA3AF",
    marginBottom: 20,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  info: {
    fontSize: 15,
    color: "#374151",
  },
});
