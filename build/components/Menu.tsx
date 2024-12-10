import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

type DrawerParamList = {
  Profile: undefined;
  Home: undefined;
  ActiveRooms: undefined;
  Room: { roomIndex: number } | undefined;
  Login: undefined;
};

interface MenuProps {
  isOpen: boolean;
  onClose: () => void;
  navigate: (screen: keyof DrawerParamList) => void;
}

const Menu: React.FC<MenuProps> = ({ isOpen, onClose, navigate }) => {
  if (!isOpen) return null;

  const handleNavigation = (screen: keyof DrawerParamList) => {
    navigate(screen);
    onClose();
  };

  return (
    <>
      <TouchableOpacity style={styles.backdrop} onPress={onClose} />
      <View style={styles.container}>
        <TouchableOpacity onPress={() => handleNavigation('Home')}>
          <Text style={styles.menuItem}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleNavigation('ActiveRooms')}>
          <Text style={styles.menuItem}>Active Rooms</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleNavigation('Profile')}> 
          <Text style={styles.menuItem}>Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleNavigation('Friends')}>
          <Text style={styles.menuItem}>Friends</Text>
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
