import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

interface HeaderProps {
  title: string;
  onMenuPress?: () => void;
  onBack?: () => void;
  onUpdate?: () => void;
  rightComponent?: React.ReactNode;
  profileImageUrl?: string;
  onFriendRequestsPress?: () => void; // Add this line
}

const Header: React.FC<HeaderProps> = ({ title, onMenuPress, onBack, onUpdate, rightComponent, profileImageUrl, onFriendRequestsPress }) => {
  return (
    <View style={styles.header}>
      {onBack ? (
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.menuIcon}>←</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={onMenuPress}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
      )}
      <Text style={styles.title}>{title}</Text>
      {onUpdate && (
        <TouchableOpacity onPress={onUpdate}>
          <Text style={styles.updateIcon}>⟳</Text>
        </TouchableOpacity>
      )}
      {rightComponent && <View style={styles.rightComponent}>{rightComponent}</View>}
      {profileImageUrl && (
        <Image source={{ uri: profileImageUrl }} style={styles.profileImage} />
      )}
      {onFriendRequestsPress && (
        <TouchableOpacity onPress={onFriendRequestsPress}>
          <Text style={styles.friendRequestsIcon}>👥</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 60,
    backgroundColor: '#1E293B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  menuIcon: {
    fontSize: 24,
    color: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    flex: 1,
  },
  updateIcon: {
    fontSize: 24,
    color: '#fff',
  },
  rightComponent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 10,
  },
  friendRequestsIcon: {
    fontSize: 24,
    color: '#fff',
    marginLeft: 10,
  },
});

export default Header;
