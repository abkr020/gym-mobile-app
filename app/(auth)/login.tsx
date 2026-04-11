import { useState } from "react";
import { View, TextInput, Button, Text } from "react-native";
// import { api } from "../../services/api.js";
import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { Link } from "expo-router";

export default function Login() {
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    const res = await api.login(email, password);
    login(res);
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Login</Text>

      <TextInput placeholder="Email" onChangeText={setEmail} />
      <TextInput placeholder="Password" secureTextEntry onChangeText={setPassword} />

      <Button title="Login" onPress={handleLogin} />

      <Link href="/signup">Go to Signup</Link>
    </View>
  );
}