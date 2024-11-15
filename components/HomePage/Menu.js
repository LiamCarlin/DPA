// components/HomePage/Menu.js
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import styles from './MenuStyles';

const Menu = ({ onClose }) => (
  <View style={styles.menuContainer}>
    <TouchableOpacity onPress={onClose}>
      <Text style={styles.closeButton}>×</Text>
    </TouchableOpacity>
    <Text style={styles.menuText}>Menu Placeholder</Text>
  </View>
);

export default Menu;
