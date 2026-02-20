import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "../types/user";

const USER_KEY = "@auth_user";
const TOKEN_KEY = "@auth_token";

export async function saveSession(user: User, token: string) {
  try {
    await AsyncStorage.multiSet([
      [USER_KEY, JSON.stringify(user)],
      [TOKEN_KEY, token],
    ]);
  } catch {}
}

export async function loadSession() {
  try {
    const [[, user], [, token]] = await AsyncStorage.multiGet([
      USER_KEY,
      TOKEN_KEY,
    ]);

    let parsedUser: User | null = null;
    if (user) {
      try {
        parsedUser = JSON.parse(user) as User;
      } catch {
        // Keep token even if legacy/corrupted user payload cannot be parsed
        parsedUser = null;
      }
    }

    const normalizedToken =
      typeof token === "string" && token.trim().length > 0
        ? token.trim().replace(/^Bearer\s+/i, "")
        : null;

    return {
      user: parsedUser,
      token: normalizedToken,
    };
  } catch {
    return { user: null, token: null };
  }
}

export async function clearSession() {
  try {
    await AsyncStorage.multiRemove([USER_KEY, TOKEN_KEY]);
  } catch {}
}


// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { User } from "../types/user";

// const USER_KEY = "@auth_user";
// const TOKEN_KEY = "@auth_token";

// export async function saveSession(user: User, token: string) {
//   await AsyncStorage.multiSet([
//     [USER_KEY, JSON.stringify(user)],
//     [TOKEN_KEY, token],
//   ]);
// }

// export async function loadSession() {
//   const [[, user], [, token]] = await AsyncStorage.multiGet([
//     USER_KEY,
//     TOKEN_KEY,
//   ]);

//   return {
//     user: user ? (JSON.parse(user) as User) : null,
//     token,
//   };
// }

// export async function clearSession() {
//   await AsyncStorage.multiRemove([USER_KEY, TOKEN_KEY]);
// }
