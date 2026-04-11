import { Alert } from "react-native";
// const BASE_URL = "http://YOUR_IP:8000"; // backend URL
const BASE_URL = "https://sso-auth-backend.onrender.com"; // backend URL

export const api = {
  login: async (email: string, password: string) => {
    const res = await fetch(`${BASE_URL}/sso/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    return res.json();
  },

  // signup: async (email: string, password: string) => {
  //   const res = await fetch(`${BASE_URL}/sso/api/auth/signup`, {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({ email, password }),
  //   });

  //   return res.json();
  // },


  signup: async (name: string, email: string, password: string) => {
    try {
      const res = await fetch(`${BASE_URL}/sso/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      // ✅ Check HTTP status first
      if (!res.ok) {
        Alert.alert("Error", data?.message || "Signup failed");
        return null;
      }

      if (!data?.success) {
        Alert.alert("Error", data?.message || "Something went wrong");
        return null;
      }

      // ✅ Success case
      Alert.alert("Success", "Account created successfully 🎉");
      return data;
    } catch (error) {
      // ✅ Network / unexpected error
      Alert.alert("Error", "Network error. Please try again.");
      return null;
    }
  },
};