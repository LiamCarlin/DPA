import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface MenuProps {
  isOpen: boolean;
  onClose: () => void;
  navigate: (screen: 'Home' | 'Statistics' | 'Leaderboard') => void;
}

const Menu: React.FC<MenuProps> = ({ isOpen, onClose, navigate }) => {
  if (!isOpen) return null;

  const handleNavigation = (screen: 'Home' | 'Statistics' | 'Leaderboard') => {
    navigate(screen); // Navigate to the selected screen
    onClose(); // Close the menu
  };

  return (
    <>
      <TouchableOpacity style={styles.backdrop} onPress={onClose} />
      <View style={styles.container}>
        <TouchableOpacity onPress={() => handleNavigation('Home')}>
          <Text style={styles.menuItem}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleNavigation('Statistics')}>
          <Text style={styles.menuItem}>Statistics</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleNavigation('Leaderboard')}>
          <Text style={styles.menuItem}>Leaderboard</Text>
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
