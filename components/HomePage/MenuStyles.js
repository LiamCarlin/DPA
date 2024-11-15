// components/HomePage/MenuStyles.js
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  menuContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: 250,
    backgroundColor: '#ffffff',
    borderRightColor: '#4CAF50',
    borderRightWidth: 2,
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  closeButton: {
    fontSize: 28,
    alignSelf: 'flex-end',
  },
  menuText: {
    fontSize: 18,
    marginTop: 20,
  },
});
