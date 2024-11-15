// components/HomePage/Header.js
import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import styles from './HeaderStyles';

const Header = ({ onMenuPress }) => (
  <View style={styles.headerContainer}>
    <TouchableOpacity onPress={onMenuPress} style={styles.hamburger}>
      <Text style={styles.hamburgerText}>☰</Text>
    </TouchableOpacity>
    <Text style={styles.logoText}>DPA</Text>
    <Image source={{ uri: 'https://placekitten.com/40/40' }} style={styles.profilePic} />
  </View>
);

export default Header;
