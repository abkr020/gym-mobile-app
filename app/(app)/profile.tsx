import { View, Text, Button } from "react-native";
import { useAuth } from "../../context/AuthContext";

export default function Profile() {
  const { user, logout } = useAuth();

  return (
    <View style={{ padding: 20 }}>
      <Text>Welcome {user?.email}</Text>

      <Button title="Logout" onPress={logout} />
    </View>
  );
}