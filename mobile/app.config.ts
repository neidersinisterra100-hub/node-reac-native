import "dotenv/config";

export default {
  expo: {
    name: "NauticGo",
    slug: "nauticgo", // ⚠️ slug SIEMPRE en minúscula
    splash: {
      backgroundColor: "#FFFFFF",
      resizeMode: "contain",
      image: "./assets/splash.png",
    },

    /**
     * =====================================================
     * VARIABLES DISPONIBLES EN RUNTIME (Expo Constants)
     * =====================================================
     *
     * Se leen desde:
     * Constants.expoConfig.extra.api
     */
    extra: {
      api: {
        cloudflare:
          process.env.EXPO_PUBLIC_API_URL_CLOUDFLARE ??
          null,

        render:
          process.env.EXPO_PUBLIC_API_URL_RENDER ??
          null,
      },
    },
  },
};
