import { useAuth } from "../context/AuthContext";
import { useNotes } from "../context/NotesContext";
import { ImageBackground } from "react-native";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
export default function ProfileScreen() {
  const { user, loading, signOut } = useAuth();
  const { notes } = useNotes();

  return (
    <ImageBackground
      source={{
        uri: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400",
      }}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.3)" }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            padding: 15,
          }}
        >
          <Text style={{ fontSize: 25, fontWeight: "bold", color: "white" }}>
            Profile
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
            }}
            onPress={signOut}
          >
            <Text style={{ color: "white", fontSize: 14, fontWeight: "600" }}>
              Sign Out
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}
