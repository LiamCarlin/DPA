import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface MenuProps {
  isOpen: boolean;
  onClose: () => void;
  navigate: (screen: 'Home' | 'ActiveRooms' | 'Room' | 'Profile' | 'Login', roomIndex?: number) => void;
}

const Menu: React.FC<MenuProps> = ({ isOpen, onClose, navigate }) => {
  if (!isOpen) return null; // If menu is not open, don't render anything.

  const handleNavigation = (screen: 'Home' | 'ActiveRooms' | 'Room' | 'Profile' | 'Login') => {
    navigate(screen); // Trigger navigation
    onClose(); // Close the menu after navigation
  };

  return (
    <>
      {/* Backdrop to close the menu when clicked outside */}
      <TouchableOpacity style={styles.backdrop} onPress={onClose} />

      {/* Menu Content */}
      <View style={styles.container}>
        <TouchableOpacity onPress={() => handleNavigation('Home')}>
          <Text style={styles.menuItem}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleNavigation('ActiveRooms')}>
          <Text style={styles.menuItem}>Active Rooms</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleNavigation('Room')}>
          <Text style={styles.menuItem}>Room (Example)</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleNavigation('Profile')}> {/* Add Profile */}
          <Text style={styles.menuItem}>Profile</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 9,
  },
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '75%',
    height: '100%',
    backgroundColor: '#1E293B',
    padding: 20,
    zIndex: 10,
  },
  menuItem: {
    fontSize: 18,
    color: '#fff',
    marginVertical: 15,
  },
});

export default Menu;
