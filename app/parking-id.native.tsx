import { Picker } from "@react-native-picker/picker";
import React, { useState } from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import * as Location from "expo-location";
import MapView, { Marker } from "react-native-maps";

import { buildings } from "../src/parking/buildings";
import { calculateDistance } from "../src/parking/distanceUtils";
import { parkingAreas } from "../src/parking/parkingLocations";

export default function ParkingIDScreen() {
  const [selectedBuilding, setSelectedBuilding] = useState(buildings[0]);
  const [parkingResult, setParkingResult] = useState<any>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [carLocation, setCarLocation] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<any>(null);

  const handleSuggestion = () => {
    let bestParking = parkingAreas[0];
    let shortestDistance = Infinity;

    for (let i = 0; i < parkingAreas.length; i++) {
      const parking = parkingAreas[i];
      const dist = calculateDistance(
        selectedBuilding.lat,
        selectedBuilding.lng,
        parking.lat,
        parking.lng
      );
      if (dist < shortestDistance) {
        shortestDistance = dist;
        bestParking = parking;
      }
    }

    setParkingResult(bestParking);
    setDistance(shortestDistance);
  };

  const saveParkingSpot = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      alert("Location permission denied");
      return;
    }
    const location = await Location.getCurrentPositionAsync({});
    const coords = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
    setCarLocation(coords);
    alert("Parking location saved!");
  };

  const findMyCar = async () => {
    if (!carLocation) {
      alert("No saved parking spot!");
      return;
    }
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      alert("Location permission denied");
      return;
    }
    const location = await Location.getCurrentPositionAsync({});
    setUserLocation({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });
  };

  return (
    <ScrollView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FB" />

      <Text style={styles.headerTitle}>Parking ID</Text>
      <Text style={styles.headerSub}>Smart parking assistant</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Select Destination Building</Text>

        <View style={styles.pickerBox}>
          <Picker
            selectedValue={selectedBuilding}
            onValueChange={(itemValue) => setSelectedBuilding(itemValue)}
          >
            {buildings.map((building, index) => (
              <Picker.Item key={index} label={building.name} value={building} />
            ))}
          </Picker>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSuggestion}>
          <Text style={styles.buttonText}>Find Best Parking</Text>
        </TouchableOpacity>
      </View>

      {parkingResult && (
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>Suggested Parking</Text>
          <Text style={styles.resultText}>
            Destination: {selectedBuilding.name}
          </Text>
          <Text style={styles.resultText}>
            Parking Area: {parkingResult.name}
          </Text>
          <Text style={styles.resultText}>
            Distance: {(distance! * 1000).toFixed(0)} meters
          </Text>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.label}>Save your parking location</Text>

        <TouchableOpacity style={styles.saveButton} onPress={saveParkingSpot}>
          <Text style={styles.buttonText}>Save My Parking Spot</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={findMyCar}>
          <Text style={styles.buttonText}>Find My Car</Text>
        </TouchableOpacity>
      </View>

      {userLocation && carLocation && (
        <MapView
          style={styles.map}
          showsUserLocation={true}
          initialRegion={{
            latitude: (userLocation.latitude + carLocation.latitude) / 2,
            longitude: (userLocation.longitude + carLocation.longitude) / 2,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          <Marker
            coordinate={userLocation}
            title="You are here"
            pinColor="blue"
          />
          <Marker coordinate={carLocation} title="Your Car" pinColor="green" />
        </MapView>
      )}

      {carLocation && (
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>Saved Parking Location</Text>
          <Text style={styles.resultText}>
            Latitude: {carLocation.latitude.toFixed(5)}
          </Text>
          <Text style={styles.resultText}>
            Longitude: {carLocation.longitude.toFixed(5)}
          </Text>
        </View>
      )}
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
  label: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 10,
  },
  pickerBox: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#F59E0B",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  saveButton: {
    backgroundColor: "#10B981",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  map: {
    height: 320,
    borderRadius: 16,
    marginBottom: 20,
  },
  resultCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },
  resultText: {
    fontSize: 15,
    color: "#374151",
    marginBottom: 4,
  },
});

