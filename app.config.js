import 'dotenv/config';

export default {
    expo: {
        name: "gym-mobile-app",
        slug: "gym-mobile-app",
        version: "1.0.1",

        android: {
            package: "com.abkr020.gymmobileapp",
        },

        extra: {
            BASE_URL: process.env.EXPO_PUBLIC_BASE_URL || "https://gym-mobile-app-backend.onrender.com",
            SSO_URL: process.env.EXPO_PUBLIC_SSO_URL || "https://sso-auth-backend.onrender.com",
            DEV_ALERTS: process.env.EXPO_PUBLIC_DEV_ALERTS || "false",

            eas: {
                projectId: "b91822f1-c4d2-4fa3-9467-884537c7631e",
            },
        },
    },
};