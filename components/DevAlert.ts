import Constants from "expo-constants";
import { Alert } from "react-native";
const DEV_ALERTS = Constants.expoConfig?.extra?.DEV_ALERTS === "true";
// const DEV_ALERTS = process.env.EXPO_PUBLIC_DEV_ALERTS === "true";

export const showAlert = (title: string, message: string) => {
     //   if (__DEV__ && DEV_ALERTS) {
    //     Alert.alert(title, message);
    //   }
  return new Promise<void>((resolve) => {
    Alert.alert(title, message, [
      { text: 'OK', onPress: () => resolve() }
    ]);
  });
};
