import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import ProfileScreen from '../screens/ProfileScreen';
import HomeScreen from '../screens/HomeScreen';
import ActiveRoomsPage from '../screens/ActiveRoomsPage';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Define the drawer param list type
type DrawerParamList = {
  Profile: undefined;
  Home: undefined;
  ActiveRooms: undefined;
  Room: { roomIndex: number } | undefined;
  Login: undefined;
};

const Drawer = createDrawerNavigator<DrawerParamList>();

function CustomDrawerContent({ navigation }: any) {
  return (
    <View style={styles.drawerContent}>
      <TouchableOpacity 
        style={styles.drawerItem} 
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.drawerItemText}>Home</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.drawerItem} 
        onPress={() => navigation.navigate('ActiveRooms')}
      >
        <Text style={styles.drawerItemText}>Active Rooms</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.drawerItem} 
        onPress={() => navigation.navigate('Profile')}
      >
        <Text style={styles.drawerItemText}>Profile</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerActiveTintColor: '#4ADE80',
        drawerInactiveTintColor: '#666',
      }}
    >
      <Drawer.Screen 
        name="Home" 
        component={HomeScreen}
      />
      <Drawer.Screen 
        name="ActiveRooms" 
        component={ActiveRoomsPage}
      />
      <Drawer.Screen 
        name="Profile" 
        component={ProfileScreen}
      />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
    backgroundColor: '#1E293B',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  drawerItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#2D3748',
  },
  drawerItemText: {
    color: '#fff',
    fontSize: 18,
  },
}); 