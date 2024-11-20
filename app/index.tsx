import React from 'react';
import { View, StyleSheet } from 'react-native';
import Header from '../components/Header';
import ButtonSection from '../components/ButtonSection';
import GraphSection from '../components/GraphSection';
import ActiveRooms from '../components/ActiveRooms';

export default function Index(): JSX.Element {
  return (
    <View style={styles.container}>
      <Header />
      <ButtonSection />
      <GraphSection />
      <ActiveRooms />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
  },
});
