import { Alert } from "react-native";

export const showAlert = (title: string, message: string) => {
  if (__DEV__) {
    Alert.alert(title, message);
  }
};
