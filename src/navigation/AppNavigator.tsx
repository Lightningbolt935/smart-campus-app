import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";

import BusTrackingScreen from "../../app/BusTrackingScreen";
import CampusMapScreen from "../../app/CampusMapScreen";
import CanteenScreen from "../../app/CanteenScreen";
import ChatbotScreen from "../../app/ChatbotScreen";
import DashboardScreen from "../../app/DashboardScreen";
import HelplineScreen from "../../app/HelplineScreen";
import ParkingIDScreen from "../../app/parking-id";

export type RootStackParamList = {
  Dashboard: undefined;
  BusTracking: undefined;
  Canteen: undefined;
  CampusMap: undefined;
  ParkingID: undefined;
  Helpline: undefined;
  Chatbot: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Dashboard"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="BusTracking" component={BusTrackingScreen} />
        <Stack.Screen name="Canteen" component={CanteenScreen} />
        <Stack.Screen name="CampusMap" component={CampusMapScreen} />
        <Stack.Screen name="ParkingID" component={ParkingIDScreen} />
        <Stack.Screen name="Helpline" component={HelplineScreen} />
        <Stack.Screen name="Chatbot" component={ChatbotScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
