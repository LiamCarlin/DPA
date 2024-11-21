import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface MenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const Menu: React.FC<MenuProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <>
      <TouchableOpacity style={styles.backdrop} onPress={onClose} />

      <View style={styles.container}>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.hamburger}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.menuItem}>Home</Text>
        <Text style={styles.menuItem}>Profile</Text>
        <Text style={styles.menuItem}>Settings</Text>
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
  hamburger: {
    fontSize: 24,
    color: '#fff',
    marginBottom: 20,
  },
  menuItem: {
    fontSize: 20,
    color: '#fff',
    marginVertical: 15,
  },
});

export default Menu;
