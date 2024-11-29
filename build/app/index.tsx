import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import ActiveRoomsPage from '../screens/ActiveRoomsPage';
import RoomPage from '../screens/RoomPage';
import ProfileScreen from '../screens/ProfileScreen'; // Import Profile Screen
import LoginScreen from '../screens/LoginScreen';
import Menu from '../components/Menu';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebaseConfig';

const Index: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<
    'Home' | 'ActiveRooms' | 'Room' | 'Profile' | 'Login'
  >('Login'); // Add 'Profile' to valid screens
  const [rooms, setRooms] = useState<{ name: string; participants: { name: string; winLoss: number }[] }[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false); // Controls the menu visibility
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentScreen('Home'); // Redirect to Home if authenticated
      } else {
        setCurrentScreen('Login'); // Redirect to Login if not authenticated
      }
      setLoading(false); // Stop the loading spinner after determining auth state
    });

    return unsubscribe; // Cleanup on unmount
  }, []);

  const openMenu = () => setMenuOpen(true); // Function to open the menu

  const closeMenu = () => setMenuOpen(false); // Function to close the menu

  const navigateTo = (screen: 'Home' | 'ActiveRooms' | 'Room' | 'Profile' | 'Login', roomIndex?: number) => {
    setCurrentScreen(screen);
    if (roomIndex !== undefined) {
      setSelectedRoom(roomIndex);
    }
    closeMenu(); // Close menu on navigation
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'Login':
        return <LoginScreen navigateTo={navigateTo} />;
      case 'Home':
        return <HomeScreen rooms={rooms} navigateTo={navigateTo} openMenu={openMenu} />;
      case 'ActiveRooms':
        return (
          <ActiveRoomsPage
            rooms={rooms}
            setRooms={setRooms}
            navigateTo={navigateTo}
            openMenu={openMenu}
          />
        );
      case 'Room':
        return (
          selectedRoom !== null &&
          selectedRoom < rooms.length && (
            <RoomPage
              room={rooms[selectedRoom]}
              roomIndex={selectedRoom}
              setRooms={setRooms}
              navigateTo={navigateTo}
            />
          )
        );
      case 'Profile':
        return <ProfileScreen openMenu={openMenu} />; // Pass `openMenu` to ProfileScreen
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4ADE80" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {menuOpen && (
        <Menu
          isOpen={menuOpen}
          onClose={closeMenu} // Pass `closeMenu` to Menu
          navigate={navigateTo} // Pass navigateTo for menu navigation
        />
      )}
      {renderScreen()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
});

export default Index;
