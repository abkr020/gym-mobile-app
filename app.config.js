import 'dotenv/config';

export default {
    expo: {
        name: "gym-mobile-app",
        slug: "gym-mobile-app",
        version: "1.0.0",
        android: {
            package: "com.abkr020.gymmobileapp", // ✅ ADD THIS
        },
        extra: {
            BASE_URL: process.env.EXPO_PUBLIC_BASE_URL,
            SSO_URL: process.env.EXPO_PUBLIC_SSO_URL,
            DEV_ALERTS: process.env.EXPO_PUBLIC_DEV_ALERTS,

            // ✅ ADD THIS BLOCK
            eas: {
                projectId: "b91822f1-c4d2-4fa3-9467-884537c7631e",
            },
        },
    },
};