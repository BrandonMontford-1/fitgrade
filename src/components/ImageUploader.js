import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { uploadImage } from '../services/firebaseService';
import { PALETTE } from '../ui/theme';

export default function ImageUploader({ uid, type = 'profile', currentUrl, onUploaded, size = 88, label }) {
  const [uploading, setUploading] = useState(false);

  const handlePick = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photo library to upload an image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: type === 'profile' ? [1, 1] : [3, 1],
      quality: 0.8,
    });

    if (result.canceled) return;

    setUploading(true);
    const uri = result.assets[0].uri;
    const upload = await uploadImage(uid, uri, type);
    setUploading(false);

    if (upload.success) {
      onUploaded?.(upload.url);
    } else {
      Alert.alert('Upload failed', upload.message || 'Could not upload image.');
    }
  };

  if (type === 'logo') {
    return (
      <TouchableOpacity style={styles.logoWrap} onPress={handlePick} activeOpacity={0.8}>
        {uploading ? (
          <ActivityIndicator color={PALETTE.accent} />
        ) : currentUrl ? (
          <Image source={{ uri: currentUrl }} style={styles.logoImage} resizeMode="contain" />
        ) : (
          <View style={styles.logoPlaceholder}>
            <MaterialCommunityIcons name="image-plus" size={22} color={PALETTE.muted} />
            <Text style={styles.logoPlaceholderText}>{label || 'Add logo'}</Text>
          </View>
        )}
        {currentUrl && !uploading && (
          <View style={styles.editBadge}>
            <MaterialCommunityIcons name="pencil" size={10} color="#fff" />
          </View>
        )}
      </TouchableOpacity>
    );
  }

  // Profile picture
  return (
    <TouchableOpacity onPress={handlePick} activeOpacity={0.8} style={{ alignItems: 'center' }}>
      <View style={[styles.avatarWrap, { width: size, height: size, borderRadius: size / 2 }]}>
        {uploading ? (
          <ActivityIndicator color={PALETTE.accent} />
        ) : currentUrl ? (
          <Image
            source={{ uri: currentUrl }}
            style={{ width: size, height: size, borderRadius: size / 2 }}
          />
        ) : (
          <View style={[styles.avatarPlaceholder, { width: size, height: size, borderRadius: size / 2 }]}>
            <MaterialCommunityIcons name="account" size={size * 0.45} color={PALETTE.muted} />
          </View>
        )}
        <View style={styles.cameraBadge}>
          <MaterialCommunityIcons name="camera" size={12} color="#fff" />
        </View>
      </View>
      <Text style={styles.changeText}>{currentUrl ? 'Change photo' : 'Add photo'}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  avatarWrap: {
    backgroundColor: PALETTE.panel,
    borderWidth: 2,
    borderColor: PALETTE.accent,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PALETTE.panelAlt,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 2, right: 2,
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: PALETTE.accent,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: PALETTE.background,
  },
  changeText: {
    color: PALETTE.accent,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 8,
  },

  logoWrap: {
    backgroundColor: PALETTE.panel,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: PALETTE.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minWidth: 120,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  logoImage: {
    width: 120,
    height: 40,
  },
  logoPlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  logoPlaceholderText: {
    color: PALETTE.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  editBadge: {
    position: 'absolute',
    top: -4, right: -4,
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: PALETTE.accent,
    alignItems: 'center', justifyContent: 'center',
  },
});
