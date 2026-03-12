import { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { updateMyProfilePicture } from "../services/userService";

export default function ProfileCard({ user }: { user: any }) {
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
    profileValue !== "defaultProfile.png";

  const handleSaveProfilePicture = async (nextProfileValue: string) => {
    if (!nextProfileValue.trim()) return;
    try {
      setSaving(true);
      const res = await updateMyProfilePicture(nextProfileValue.trim());
      setProfileValue(res?.profile || nextProfileValue.trim());
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
      });

      if (result.canceled || !result.assets?.[0]?.uri) return;
      const selectedUri = result.assets[0].uri;
      await handleSaveProfilePicture(selectedUri);
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
      });

      if (result.canceled || !result.assets?.[0]?.uri) return;
      const capturedUri = result.assets[0].uri;
      await handleSaveProfilePicture(capturedUri);
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
    backgroundColor: "#f5f5f5",
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
    color: "#4b5563",
    fontSize: 12,
  },
  fieldText: {
    color: "#111827",
    marginBottom: 2,
  },
  sectionWrap: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  sectionTitle: {
    fontWeight: "700",
    marginBottom: 4,
    color: "#1f2937",
  },
  actionsBox: {
    marginTop: 8,
  },
  button: {
    marginTop: 8,
    backgroundColor: "#2563eb",
    borderRadius: 8,
    alignItems: "center",
    paddingVertical: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  message: {
    marginTop: 8,
    color: "#374151",
    textAlign: "center",
  },
  secondaryButton: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    alignItems: "center",
    paddingVertical: 10,
    backgroundColor: "#fff",
  },
  secondaryButtonText: {
    color: "#111827",
    fontWeight: "600",
  },
});
