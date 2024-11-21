import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import StatisticsScreen from '../screens/StatisticsScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import Menu from '../components/Menu';

const Index: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<'Home' | 'Statistics' | 'Leaderboard'>('Home');
  const [menuOpen, setMenuOpen] = useState(false);

  const navigateToScreen = (screen: 'Home' | 'Statistics' | 'Leaderboard') => {
    setCurrentScreen(screen); // Navigate to the selected screen
    setMenuOpen(false); // Close the menu automatically
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'Home':
        return <HomeScreen openMenu={() => setMenuOpen(true)} />;
      case 'Statistics':
        return <StatisticsScreen openMenu={() => setMenuOpen(true)} />;
      case 'Leaderboard':
        return <LeaderboardScreen openMenu={() => setMenuOpen(true)} />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {menuOpen && (
        <Menu
          isOpen={menuOpen}
          onClose={() => setMenuOpen(false)}
          navigate={navigateToScreen} // Pass the navigation handler
        />
      )}
      {renderScreen()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
});

export default Index;
