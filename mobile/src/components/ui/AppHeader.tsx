import {
  Appbar,
  Avatar,
  Portal,
  Text,
  Divider,
  IconButton,
} from "react-native-paper";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Pressable,
  Animated,
  Dimensions,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import {
  useNavigation,
  TabActions,
  useRoute,
} from "@react-navigation/native";

import { colors } from "../../theme/colors";
import { useAuth } from "../../context/AuthContext";
import StaticLogo from "./StaticLogo";

type AppHeaderProps = {
  title?: string;
  subtitle?: string;
  showGreeting?: boolean;
  hideLogo?: boolean; // 👈 ahora SÍ se usa
};

const HEADER_HEIGHT = 56;
const SCREEN_WIDTH = Dimensions.get("window").width;

export default function AppHeader({
  title,
  subtitle,
  showGreeting,
  hideLogo: hideLogoProp,
}: AppHeaderProps) {
  const { user, logout } = useAuth();
  const navigation = useNavigation<any>();
  const route = useRoute();

  const [visible, setVisible] = useState(false);

  /* ================= LOGO VISIBILITY ================= */

  const hideLogoByRoute =
    route.name === "History" ||
    route.name === "Profile" ||
    route.name === "ProfileMain" ||
    route.name === "SettingsModal";

  // ✅ prioridad: prop > ruta
  const hideLogo = hideLogoProp ?? hideLogoByRoute;

  /* ================= ANIMATION ================= */

  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: visible ? 1 : 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-16, 0],
  });

  return (
    <>
      {/* ================= HEADER ================= */}
      <Appbar.Header style={styles.header}>
        {!hideLogo && <StaticLogo />}

        <View style={styles.left}>
          {title && <Text style={styles.title}>{title}</Text>}
        </View>

        {user && (
          <TouchableOpacity onPress={() => setVisible(true)}>
            <Avatar.Text
              size={36}
              label={user.name.charAt(0).toUpperCase()}
              style={styles.avatar}
            />
          </TouchableOpacity>
        )}
      </Appbar.Header>

      {/* ================= MENU ================= */}
      {user && (
        <Portal>
          {visible && (
            <>
              <Pressable
                style={styles.backdrop}
                onPress={() => setVisible(false)}
              />

              <Animated.View
                style={[
                  styles.panel,
                  { transform: [{ translateY }] },
                ]}
              >
                {showGreeting && (
                  <View style={styles.userBlock}>
                    <Avatar.Text
                      size={40}
                      label={user.name.charAt(0).toUpperCase()}
                      style={styles.bigAvatar}
                    />

                    <View style={styles.userText}>
                      <Text style={styles.userName}>
                        {user.name}
                      </Text>

                      {subtitle && (
                        <Text style={styles.subtitle}>
                          {subtitle}
                        </Text>
                      )}
                    </View>
                  </View>
                )}

                <Divider style={styles.divider} />

                <MenuItem
                  icon="account-outline"
                  label="Mi perfil"
                  onPress={() => {
                    setVisible(false);
                    navigation.dispatch(
                      TabActions.jumpTo("Profile")
                    );
                  }}
                />

                <MenuItem
                  icon="cog-outline"
                  label="Configuración"
                  onPress={() => {
                    setVisible(false);
                    navigation
                      .getParent()
                      ?.navigate("SettingsModal");
                  }}
                />

                <Divider style={styles.divider} />

                <MenuItem
                  icon="logout"
                  label="Cerrar sesión"
                  danger
                  onPress={async () => {
                    setVisible(false);
                    await logout();
                  }}
                />
              </Animated.View>
            </>
          )}
        </Portal>
      )}
    </>
  );
}

/* ================= MENU ITEM ================= */

function MenuItem({
  icon,
  label,
  onPress,
  danger,
}: {
  icon: string;
  label: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable style={styles.menuItem} onPress={onPress}>
      <IconButton
        icon={icon}
        size={20}
        iconColor={
          danger
            ? colors.textSecondary
            : colors.textPrimary
        }
      />
      <Text
        style={[
          styles.menuLabel,
          danger && { color: colors.textSecondary },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    elevation: 0,
    zIndex: 10,
  },
  left: {
    flex: 1,
    marginLeft: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  avatar: {
    backgroundColor: colors.primary,
    marginRight: 8,
  },

  backdrop: {
    position: "absolute",
    top: HEADER_HEIGHT,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.15)",
  },

  panel: {
    position: "absolute",
    top: HEADER_HEIGHT,
    width: SCREEN_WIDTH,
    backgroundColor: "#FFF",
    paddingVertical: 12,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 8,
  },

  userBlock: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  bigAvatar: {
    backgroundColor: colors.primary,
  },
  userText: {
    marginLeft: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
  },

  divider: {
    marginVertical: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    height: 48,
  },
  menuLabel: {
    fontSize: 15,
    color: colors.textPrimary,
  },
});

// import {
//   Appbar,
//   Avatar,
//   Portal,
//   Text,
//   Divider,
//   IconButton,
// } from "react-native-paper";
// import {
//   StyleSheet,
//   View,
//   TouchableOpacity,
//   Pressable,
//   Animated,
//   Dimensions,
// } from "react-native";
// import { useEffect, useRef, useState } from "react";
// import { useNavigation, TabActions } from "@react-navigation/native";
// import { canAccessSettings } from "../../utils/permissions";
// import { colors } from "../../theme/colors";
// import { useAuth } from "../../context/AuthContext";
// import AnimatedWavesLogo from "./AnimatedWavesLogo";
// import StaticLogo from "./StaticLogo";
// import { useRoute } from "@react-navigation/native";


// type AppHeaderProps = {
//   title?: string;
//   subtitle?: string;
//   showGreeting?: boolean;
// };

// const HEADER_HEIGHT = 56;
// const SCREEN_WIDTH = Dimensions.get("window").width;

//  const route = useRoute();

//   const hideLogo =
//     route.name === "Profile" ||
//     route.name === "History";

// export default function AppHeader({
//   title,
//   subtitle,
//   showGreeting,
// }: AppHeaderProps) {
//   const { user, logout } = useAuth();
//   const navigation = useNavigation<any>();

//   const [visible, setVisible] = useState(false);

  

//   /* ================= ANIMATION ================= */
//   const slideAnim = useRef(new Animated.Value(0)).current;

//   const route = useRoute();
//   const isHome = route.name === "Home";

//   useEffect(() => {
//     Animated.timing(slideAnim, {
//       toValue: visible ? 1 : 0,
//       duration: 220,
//       useNativeDriver: true,
//     }).start();
//   }, [visible]);

//   const translateY = slideAnim.interpolate({
//     inputRange: [0, 1],
//     outputRange: [-16, 0],
//   });

//   return (
//     <>
//       {/* ================= HEADER ================= */}
//       <Appbar.Header style={styles.header}>
//         <View style={styles.container}>
//       {!hideLogo && <StaticLogo />}
//     </View>
//         {/* <StaticLogo /> */}
//         {/* <AnimatedWavesLogo animate={isHome} /> */}


//         <View style={styles.left}>
//           {title && <Text style={styles.title}>{title}</Text>}
//         </View>

//         {user && (
//           <TouchableOpacity onPress={() => setVisible(true)}>
//             <Avatar.Text
//               size={36}
//               label={user.name.charAt(0).toUpperCase()}
//               style={styles.avatar}
//             />
//           </TouchableOpacity>
//         )}
//       </Appbar.Header>

//       {/* ================= MENU ================= */}
//       {user && (
//         <Portal>
//           {visible && (
//             <>
//               {/* Backdrop */}
//               <Pressable
//                 style={styles.backdrop}
//                 onPress={() => setVisible(false)}
//               />

//               {/* Panel */}
//               <Animated.View
//                 style={[
//                   styles.panel,
//                   { transform: [{ translateY }] },
//                 ]}
//               >
//                 {/* ===== USER INFO ===== */}
//                 {showGreeting && (
//                   <View style={styles.userBlock}>
//                     <Avatar.Text
//                       size={40}
//                       label={user.name
//                         .charAt(0)
//                         .toUpperCase()}
//                       style={styles.bigAvatar}
//                     />

//                     <View style={styles.userText}>
//                       <Text style={styles.userName}>
//                         {user.name}
//                       </Text>

//                       {subtitle && (
//                         <Text style={styles.subtitle}>
//                           {subtitle}
//                         </Text>
//                       )}
//                     </View>
//                   </View>
//                 )}

//                 <Divider style={styles.divider} />

//                 {/* ===== MI PERFIL (TAB REAL) ===== */}
//                 <MenuItem
//                   icon="account-outline"
//                   label="Mi perfil"
//                   onPress={() => {
//                     setVisible(false);
//                     navigation.dispatch(
//                       TabActions.jumpTo("Profile")
//                     );
//                   }}
//                 />

//                 {/* ===== CONFIGURACIÓN ===== */}
//                 <MenuItem
//                   icon="cog-outline"
//                   label="Configuración"
//                   onPress={() => {
//                     setVisible(false);

//                     const parent = navigation.getParent();
//                     parent?.navigate("SettingsModal");
//                   }}
//                 />
//                 {/* <MenuItem
//                   icon="cog-outline"
//                   label="Configuración"
//                   onPress={() => {
//                     setVisible(false);
//                     // Preparado para futuro Stack de Settings
//                     console.log("Ir a Configuración");
//                   }}
//                 /> */}

//                 <Divider style={styles.divider} />

//                 {/* ===== LOGOUT ===== */}
//                 <MenuItem
//                   icon="logout"
//                   label="Cerrar sesión"
//                   danger
//                   onPress={async () => {
//                     setVisible(false);
//                     await logout();
//                   }}
//                 />
//               </Animated.View>
//             </>
//           )}
//         </Portal>
//       )}
//     </>
//   );
// }

// /* ================= MENU ITEM ================= */
// function MenuItem({
//   icon,
//   label,
//   onPress,
//   danger,
// }: {
//   icon: string;
//   label: string;
//   onPress: () => void;
//   danger?: boolean;
// }) {
//   return (
//     <Pressable style={styles.menuItem} onPress={onPress}>
//       <IconButton
//         icon={icon}
//         size={20}
//         iconColor={
//           danger
//             ? colors.textSecondary
//             : colors.textPrimary
//         }
//       />
//       <Text
//         style={[
//           styles.menuLabel,
//           danger && { color: colors.textSecondary },
//         ]}
//       >
//         {label}
//       </Text>
//     </Pressable>
//   );
// }

// /* ================= STYLES ================= */
// const styles = StyleSheet.create({
//   header: {
//     backgroundColor: colors.surface,
//     borderBottomWidth: 1,
//     borderBottomColor: colors.border,
//     elevation: 0,
//     zIndex: 10,
//   },
//   left: {
//     flex: 1,
//     marginLeft: 8,
//   },
//   title: {
//     fontSize: 18,
//     fontWeight: "600",
//     color: colors.textPrimary,
//   },
//   avatar: {
//     backgroundColor: colors.primary,
//     marginRight: 8,
//   },

//   backdrop: {
//     position: "absolute",
//     top: HEADER_HEIGHT,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: "rgba(0,0,0,0.15)",
//   },

//   panel: {
//     position: "absolute",
//     top: HEADER_HEIGHT,
//     width: SCREEN_WIDTH,
//     backgroundColor: "#FFF",
//     paddingVertical: 12,
//     borderBottomLeftRadius: 20,
//     borderBottomRightRadius: 20,
//     elevation: 8,
//   },

//   userBlock: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 20,
//     paddingBottom: 12,
//   },
//   bigAvatar: {
//     backgroundColor: colors.primary,
//   },
//   userText: {
//     marginLeft: 12,
//   },
//   userName: {
//     fontSize: 16,
//     fontWeight: "700",
//     color: colors.textPrimary,
//   },
//   subtitle: {
//     fontSize: 13,
//     color: colors.textSecondary,
//   },

//   divider: {
//     marginVertical: 8,
//   },
//   menuItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 12,
//     height: 48,
//   },
//   menuLabel: {
//     fontSize: 15,
//     color: colors.textPrimary,
//   },
// });

// import {
//   Appbar,
//   Avatar,
//   Portal,
//   Text,
//   Divider,
//   IconButton,
// } from "react-native-paper";
// import {
//   StyleSheet,
//   View,
//   TouchableOpacity,
//   Pressable,
//   Animated,
//   Dimensions,
// } from "react-native";
// import { useEffect, useRef, useState } from "react";
// import { useNavigation, TabActions } from "@react-navigation/native";

// import { colors } from "../../theme/colors";
// import { useAuth } from "../../context/AuthContext";
// import AnimatedWavesLogo from "./AnimatedWavesLogo";


// type AppHeaderProps = {
//   title?: string;
//   subtitle?: string;
//   showGreeting?: boolean;
// };

// const HEADER_HEIGHT = 56;
// const SCREEN_WIDTH = Dimensions.get("window").width;

// export default function AppHeader({
//   title,
//   subtitle,
//   showGreeting,
// }: AppHeaderProps) {
//   const { user, logout } = useAuth();
//   const navigation = useNavigation<any>();

//   const [visible, setVisible] = useState(false);

//   /* ================= ANIMATION ================= */
//   const slideAnim = useRef(new Animated.Value(0)).current;

//   useEffect(() => {
//     Animated.timing(slideAnim, {
//       toValue: visible ? 1 : 0,
//       duration: 220,
//       useNativeDriver: true,
//     }).start();
//   }, [visible]);

//   const translateY = slideAnim.interpolate({
//     inputRange: [0, 1],
//     outputRange: [-16, 0],
//   });

//   return (
//     <>
//       {/* ================= HEADER ================= */}
//       <Appbar.Header style={styles.header}>
//         <AnimatedWavesLogo />

//         <View style={styles.left}>
//           {title && <Text style={styles.title}>{title}</Text>}
//         </View>

//         {/* Avatar */}
//         {user && (
//           <TouchableOpacity onPress={() => setVisible(true)}>
//             <Avatar.Text
//               size={36}
//               label={user.name.charAt(0).toUpperCase()}
//               style={styles.avatar}
//             />
//           </TouchableOpacity>
//         )}
//       </Appbar.Header>

//       {/* ================= MENU ================= */}
//       {user && (
//         <Portal>
//           {visible && (
//             <>
//               {/* Backdrop */}
//               <Pressable
//                 style={styles.backdrop}
//                 onPress={() => setVisible(false)}
//               />

//               {/* Panel */}
//               <Animated.View
//                 style={[
//                   styles.panel,
//                   { transform: [{ translateY }] },
//                 ]}
//               >
//                 {/* ===== USER INFO ===== */}
//                 {showGreeting && (
//                   <View style={styles.userBlock}>
//                     <Avatar.Text
//                       size={40}
//                       label={user.name
//                         .charAt(0)
//                         .toUpperCase()}
//                       style={styles.bigAvatar}
//                     />

//                     <View style={styles.userText}>
//                       <Text style={styles.userName}>
//                         {user.name}
//                       </Text>

//                       {subtitle && (
//                         <Text style={styles.subtitle}>
//                           {subtitle}
//                         </Text>
//                       )}
//                     </View>
//                   </View>
//                 )}

//                 <Divider style={styles.divider} />

//                 {/* ===== MENU ITEMS ===== */}
//                 <MenuItem
//                   icon="account-outline"
//                   label="Mi perfil"
//                   onPress={() => {
//                     setVisible(false);
//                     navigation.dispatch(TabActions.jumpTo("Profile"));
//                   }}
//                 />



//                 {/* <MenuItem
//                   icon="account-outline"
//                   label="Mi perfil"
//                   onPress={() => {
//                     setVisible(false);
//                     navigation.navigate("Profile"); // ✅ CORRECTO
//                   }}
//                 /> */}

//                 <MenuItem
//                   icon="cog-outline"
//                   label="Configuración"
//                   onPress={() => {
//                     setVisible(false);
//                     navigation.navigate("Profile"); // o futura screen
//                   }}
//                 />

//                 <Divider style={styles.divider} />

//                 <MenuItem
//                   icon="logout"
//                   label="Cerrar sesión"
//                   danger
//                   onPress={async () => {
//                     setVisible(false);
//                     await logout();
//                   }}
//                 />
//               </Animated.View>
//             </>
//           )}
//         </Portal>
//       )}
//     </>
//   );
// }

// /* ================= MENU ITEM ================= */
// function MenuItem({
//   icon,
//   label,
//   onPress,
//   danger,
// }: {
//   icon: string;
//   label: string;
//   onPress: () => void;
//   danger?: boolean;
// }) {
//   return (
//     <Pressable style={styles.menuItem} onPress={onPress}>
//       <IconButton
//         icon={icon}
//         size={20}
//         iconColor={
//           danger
//             ? colors.textSecondary
//             : colors.textPrimary
//         }
//       />
//       <Text
//         style={[
//           styles.menuLabel,
//           danger && { color: colors.textSecondary },
//         ]}
//       >
//         {label}
//       </Text>
//     </Pressable>
//   );
// }

// /* ================= STYLES ================= */
// const styles = StyleSheet.create({
//   header: {
//     backgroundColor: colors.surface,
//     borderBottomWidth: 1,
//     borderBottomColor: colors.border,
//     elevation: 0,
//     zIndex: 10,
//   },
//   left: {
//     flex: 1,
//     marginLeft: 8,
//   },
//   title: {
//     fontSize: 18,
//     fontWeight: "600",
//     color: colors.textPrimary,
//   },
//   avatar: {
//     backgroundColor: colors.primary,
//     marginRight: 8,
//   },

//   backdrop: {
//     position: "absolute",
//     top: HEADER_HEIGHT,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: "rgba(0,0,0,0.15)",
//   },

//   panel: {
//     position: "absolute",
//     top: HEADER_HEIGHT,
//     width: SCREEN_WIDTH,
//     backgroundColor: "#FFF",
//     paddingVertical: 12,
//     borderBottomLeftRadius: 20,
//     borderBottomRightRadius: 20,
//     elevation: 8,
//   },

//   userBlock: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 20,
//     paddingBottom: 12,
//   },
//   bigAvatar: {
//     backgroundColor: colors.primary,
//   },
//   userText: {
//     marginLeft: 12,
//   },
//   userName: {
//     fontSize: 16,
//     fontWeight: "700",
//     color: colors.textPrimary,
//   },
//   subtitle: {
//     fontSize: 13,
//     color: colors.textSecondary,
//   },

//   divider: {
//     marginVertical: 8,
//   },
//   menuItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 12,
//     height: 48,
//   },
//   menuLabel: {
//     fontSize: 15,
//     color: colors.textPrimary,
//   },
// });

