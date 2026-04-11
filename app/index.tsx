// import { Text, View } from "react-native";

// export default function Index() {
//   return (
//     <View
//       style={{
//         flex: 1,
//         justifyContent: "center",
//         alignItems: "center",
//       }}
//     >
//       <Text>Edit app/index.tsx to edit this screen.</Text>
//     </View>
//   );
// }
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Index() {
  const { user, loading } = useAuth();
  const [redirectPath, setRedirectPath] = useState<"/profile" | "/login" | null>(null);

  useEffect(() => {
    if (!loading) {
      setRedirectPath(user ? "/profile" : "/login");
    }
  }, [user, loading]);

  if (loading || !redirectPath) {
    return null; // or a loading screen
  }

  return <Redirect href={redirectPath} />;
}