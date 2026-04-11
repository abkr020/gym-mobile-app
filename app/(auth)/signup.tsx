import { useState } from "react";
import { View, TextInput, Button, Text } from "react-native";
import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { Link } from "expo-router";

export default function Signup() {
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async () => {
    const res = await api.signup(email, password);
    login(res);
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Signup</Text>

      <TextInput placeholder="Email" onChangeText={setEmail} />
      <TextInput placeholder="Password" secureTextEntry onChangeText={setPassword} />

      <Button title="Signup" onPress={handleSignup} />

      <Link href="/login">Go to Login</Link>
    </View>
  );
}