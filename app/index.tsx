import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import ActiveRoomsPage from '../screens/ActiveRoomsPage';
import RoomPage from '../screens/RoomPage';
import Menu from '../components/Menu';

const Index: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<'Home' | 'ActiveRooms' | 'Room'>('Home'); // Start at Home
  const [rooms, setRooms] = useState<{ name: string; participants: { name: string; winLoss: number }[] }[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const navigateTo = (screen: 'Home' | 'ActiveRooms' | 'Room', roomIndex?: number) => {
    setCurrentScreen(screen);
    if (roomIndex !== undefined) {
      setSelectedRoom(roomIndex);
    }
    setMenuOpen(false); // Close menu on navigation
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'Home':
        return <HomeScreen rooms={rooms} navigateTo={navigateTo} openMenu={() => setMenuOpen(true)} />;
      case 'ActiveRooms':
        return (
          <ActiveRoomsPage
            rooms={rooms}
            setRooms={setRooms}
            navigateTo={navigateTo}
            openMenu={() => setMenuOpen(true)}
          />
        );
      case 'Room':
        return (
          selectedRoom !== null && (
            <RoomPage
              room={rooms[selectedRoom]}
              roomIndex={selectedRoom}
              setRooms={setRooms}
              navigateTo={navigateTo}
            />
          )
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {menuOpen && (
        <Menu
          isOpen={menuOpen}
          onClose={() => setMenuOpen(false)}
          navigate={navigateTo} // Align types here
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
});

export default Index;
