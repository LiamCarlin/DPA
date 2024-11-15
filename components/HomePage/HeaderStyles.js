// components/HomePage/HeaderStyles.js
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 15,
    paddingTop: 50,
    backgroundColor: 'white',
  },
  hamburger: {
    padding: 10,
  },
  hamburgerText: {
    fontSize: 24,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
});
