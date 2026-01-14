import "dotenv/config";

export default {
  expo: {
    name: "NauticGo",
    slug: "NauticGo",
    splash: {
      backgroundColor: "#FFFFFF",
      resizeMode: "contain",
      image: "./assets/splash.png",
    },
    extra: {
      API_URL: process.env.EXPO_PUBLIC_API_URL,
    },
  },
};
