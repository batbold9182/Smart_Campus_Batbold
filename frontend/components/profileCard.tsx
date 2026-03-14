import { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { updateMyProfilePicture, type AppUserProfile } from "../services/userService";
import { theme } from "../styles/theme";

const isRenderableImageUri = (value: string) => {
  const uri = value.trim().toLowerCase();
  if (!uri) return false;

  // blob URLs are not stable across app/device contexts.
  if (uri.startsWith("blob:")) return false;

  if (
    uri.startsWith("https://") ||
    uri.startsWith("http://") ||
    uri.startsWith("data:image/")
  ) {
    return true;
  }

  if (Platform.OS === "web") {
    return false;
  }

  return (
    uri.startsWith("file://") ||
    uri.startsWith("ph://") ||
    uri.startsWith("content://") ||
    uri.startsWith("assets-library://")
  );
};

const buildPersistedImageValue = (asset: ImagePicker.ImagePickerAsset) => {
  if (asset?.base64 && asset?.mimeType) {
    return `data:${asset.mimeType};base64,${asset.base64}`;
  }

  if (asset?.base64) {
    return `data:image/jpeg;base64,${asset.base64}`;
  }

  return "";
};

type ProfileCardProps = {
  user: AppUserProfile;
};

export default function ProfileCard({ user }: ProfileCardProps) {
  const [profileValue, setProfileValue] = useState(user?.profile || "defaultProfile.png");
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [showPickerActions, setShowPickerActions] = useState(false);

  useEffect(() => {
    setProfileValue(user?.profile || "defaultProfile.png");
  }, [user?.profile]);

  const hasCustomProfile =
    typeof profileValue === "string" &&
    profileValue.trim().length > 0 &&
    profileValue !== "defaultProfile.png" &&
    isRenderableImageUri(profileValue);

  const handleSaveProfilePicture = async (nextProfileValue: string) => {
    if (!nextProfileValue.trim()) return;

    if (!isRenderableImageUri(nextProfileValue) && nextProfileValue !== "defaultProfile.png") {
      setStatusMessage("Selected image format is not supported on this device.");
      return;
    }

    try {
      setSaving(true);
      const res = await updateMyProfilePicture(nextProfileValue.trim());
      const savedProfile = String(res?.profile || nextProfileValue.trim());
      setProfileValue(
        savedProfile === "defaultProfile.png" || isRenderableImageUri(savedProfile)
          ? savedProfile
          : "defaultProfile.png"
      );
      setStatusMessage("Profile picture updated");
      setShowPickerActions(false);
    } catch (err: any) {
      setStatusMessage(err?.response?.data?.message || "Failed to update profile picture");
    } finally {
      setSaving(false);
    }
  };

  const chooseFromGallery = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setStatusMessage("Gallery permission is required");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.7,
        base64: true,
      });

      if (result.canceled || !result.assets?.[0]) return;
      const selectedValue = buildPersistedImageValue(result.assets[0]);

      if (!selectedValue) {
        setStatusMessage("Could not process selected image. Please try another image.");
        return;
      }

      await handleSaveProfilePicture(selectedValue);
    } catch {
      setStatusMessage("Failed to choose image from gallery");
    }
  };

  const chooseFromCamera = async () => {
    if (Platform.OS === "web") {
      setStatusMessage("Camera capture is limited on web. Use gallery upload.");
      return;
    }

    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        setStatusMessage("Camera permission is required");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.7,
        base64: true,
      });

      if (result.canceled || !result.assets?.[0]) return;
      const capturedValue = buildPersistedImageValue(result.assets[0]);

      if (!capturedValue) {
        setStatusMessage("Could not process captured image. Please try again.");
        return;
      }

      await handleSaveProfilePicture(capturedValue);
    } catch {
      setStatusMessage("Failed to capture image from camera");
    }
  };

  const displayValue = (value: any) => {
    if (value === null || value === undefined || value === "") return "-";
    return String(value);
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>👤 Profile</Text>
      <TouchableOpacity onPress={() => setShowPickerActions((prev) => !prev)}>
        <Image
          source={
            hasCustomProfile
              ? { uri: profileValue }
              : require("../assets/images/defaultProfile.png")
          }
          style={styles.avatar}
          resizeMode="cover"
        />
      </TouchableOpacity>
      <Text style={styles.helperText}>Change photo</Text>
      <Text style={styles.fieldText}>Name: {displayValue(user.name)}</Text>
      <Text style={styles.fieldText}>Email: {displayValue(user.email)}</Text>
      <Text style={styles.fieldText}>Role: {displayValue(user.role)}</Text>
      <Text style={styles.fieldText}>Status: {user.isActive ? "Active" : "Disabled"}</Text>

      {user.role === "faculty" ? (
        <View style={styles.sectionWrap}>
          <Text style={styles.sectionTitle}>Faculty Info</Text>
          <Text style={styles.fieldText}>School: {displayValue(user.school)}</Text>
          <Text style={styles.fieldText}>Department: {displayValue(user.department)}</Text>
          <Text style={styles.fieldText}>Title: {displayValue(user.title)}</Text>
          <Text style={styles.fieldText}>Employee ID: {displayValue(user.employeeId)}</Text>
        </View>
      ) : null}

      {user.role === "student" ? (
        <View style={styles.sectionWrap}>
          <Text style={styles.sectionTitle}>Student Info</Text>
          <Text style={styles.fieldText}>Program: {displayValue(user.program)}</Text>
          <Text style={styles.fieldText}>Year Level: {displayValue(user.yearLevel)}</Text>
          <Text style={styles.fieldText}>Student ID: {displayValue(user.studentId)}</Text>
          <Text style={styles.fieldText}>School: {displayValue(user.school)}</Text>
          <Text style={styles.fieldText}>Department: {displayValue(user.department)}</Text>
        </View>
      ) : null}

      {showPickerActions ? (
        <View style={styles.actionsBox}>
          <TouchableOpacity style={styles.button} onPress={chooseFromCamera} disabled={saving}>
            <Text style={styles.buttonText}>{saving ? "Saving..." : "Take Photo"}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={chooseFromGallery} disabled={saving}>
            <Text style={styles.buttonText}>{saving ? "Saving..." : "Upload From Gallery"}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => handleSaveProfilePicture("defaultProfile.png")}
            disabled={saving}
          >
            <Text style={styles.secondaryButtonText}>Use Default Picture</Text>
          </TouchableOpacity>
        </View>
      ) : null}
      {!!statusMessage && <Text style={styles.message}>{statusMessage}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
    borderRadius: 8,
    backgroundColor: theme.colors.appBg,
    marginTop: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginBottom: 10,
    alignSelf: "center",
  },
  helperText: {
    marginBottom: 10,
    textAlign: "center",
    color: theme.colors.muted,
    fontSize: 12,
  },
  fieldText: {
    color: theme.colors.text,
    marginBottom: 2,
  },
  sectionWrap: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  sectionTitle: {
    fontWeight: "700",
    marginBottom: 4,
    color: theme.colors.text,
  },
  actionsBox: {
    marginTop: 8,
  },
  button: {
    marginTop: 8,
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    alignItems: "center",
    paddingVertical: 10,
  },
  buttonText: {
    color: theme.colors.surface,
    fontWeight: "600",
  },
  message: {
    marginTop: 8,
    color: theme.colors.muted,
    textAlign: "center",
  },
  secondaryButton: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    alignItems: "center",
    paddingVertical: 10,
    backgroundColor: theme.colors.surface,
  },
  secondaryButtonText: {
    color: theme.colors.text,
    fontWeight: "600",
  },
});
