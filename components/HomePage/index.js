// components/HomePage/index.js
import React, { useState } from 'react';
import { View, Text } from 'react-native';
import Header from './Header';
import Graph from './Graph';
import Menu from './Menu';
import Button from '../Button';
import styles from './styles';

const HomePage = () => {
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <View style={styles.container}>
      {/* Sidebar Menu */}
      {menuVisible && <Menu onClose={() => setMenuVisible(false)} />}
      
      {/* Header */}
      <Header onMenuPress={() => setMenuVisible(true)} />
      
      {/* Graph Section */}
      <Graph />
      
      {/* Buttons Section */}
      <View style={styles.buttonsContainer}>
        <Button text="Chip Scan" onPress={() => {}} />
        <Button text="Create Room" onPress={() => {}} />
        <Button text="Probability" onPress={() => {}} style={styles.probabilityButton} />
      </View>
    </View>
  );
};

export default HomePage;
