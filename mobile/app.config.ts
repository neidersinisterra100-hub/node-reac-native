import "dotenv/config";

export default {
  expo: {
    name: "Transmilenio",
    slug: "transmilenio",
    extra: {
      API_URL: process.env.EXPO_PUBLIC_API_URL,
    },
  },
};
