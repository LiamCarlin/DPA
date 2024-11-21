import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Header from '../components/Header';
import Menu from '../components/Menu';
import ActiveRooms from '../components/ActiveRooms';
import ButtonSection from '../components/ButtonSection';
import GraphSection from '../components/GraphSection';

const HomeScreen: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <View style={styles.container}>
      <Menu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <Header onMenuPress={() => setMenuOpen(true)} />
      {!menuOpen && (
        <>
          <ButtonSection />
          <GraphSection />
          <ActiveRooms />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 15,
  },
});

export default HomeScreen;
