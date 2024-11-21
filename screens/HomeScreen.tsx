import React from 'react';
import { View, StyleSheet } from 'react-native';
import Header from '../components/Header';
import ButtonSection from '../components/ButtonSection';
import GraphSection from '../components/GraphSection';
import ActiveRooms from '../components/ActiveRooms';

interface HomeScreenProps {
  openMenu: () => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ openMenu }) => {
  return (
    <View style={styles.container}>
      <Header onMenuPress={openMenu} />
      <ButtonSection />
      <GraphSection />
      <ActiveRooms />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
  },
});

export default HomeScreen;
