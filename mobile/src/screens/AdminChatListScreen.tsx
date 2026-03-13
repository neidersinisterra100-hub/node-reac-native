/**
 * AdminChatListScreen — Lista de conversaciones para admin/owner.
 * Shows all user conversations in real-time. Tap to open chat.
 * Floating pulsing chat button in CompanyDashboard opens this screen.
 */
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View, Text, TouchableOpacity, FlatList, StatusBar,
  useColorScheme, ActivityIndicator, ImageBackground, StyleSheet,
  Platform, Animated, Easing, TextInput, KeyboardAvoidingView,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Send, Headphones, ChevronsDown } from "lucide-react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useAuth } from "../context/AuthContext";
import { getConversations, getMessages, markConversationRead, ChatConversation, ChatMessage } from "../services/chat.service";
import {
  connectChat, sendMessage as socketSend,
  sendTypingStart, sendTypingStop, sendMessageRead,
  setListeners, leaveConversation,
} from "../services/chatSocket.service";

// Define local route type if not imported
type AdminChatRoute = any; 

interface LocalMessage extends ChatMessage { isOffline?: boolean }

/* ─── Typing indicator (reuse exact dots from NauticBot) ── */
function TypingDots({ isDark }: { isDark: boolean }) {
  const dots = [useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current];
  useEffect(() => {
    const loop = Animated.loop(
      Animated.stagger(160, dots.map(v =>
        Animated.sequence([
          Animated.timing(v, { toValue: -7, duration: 280, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.timing(v, { toValue: 0, duration: 280, easing: Easing.in(Easing.quad), useNativeDriver: true }),
        ])
      ))
    );
    loop.start();
    return () => loop.stop();
  }, []);
  return (
    <View style={{ flexDirection: "row", paddingHorizontal: 16, paddingBottom: 8 }}>
      <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: "#2563eb", justifyContent: "center", alignItems: "center", marginRight: 8 }}>
        <Text style={{ color: "white", fontSize: 12, fontWeight: "bold" }}>U</Text>
      </View>
      <View style={{ backgroundColor: isDark ? "#202c33" : "white", borderRadius: 18, borderBottomLeftRadius: 4, paddingHorizontal: 16, paddingVertical: 12, flexDirection: "row", gap: 6, elevation: 1 }}>
        {dots.map((v, i) => (
          <Animated.View key={i} style={{ transform: [{ translateY: v }] }}>
            <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: isDark ? "#8294a0" : "#94a3b8" }} />
          </Animated.View>
        ))}
      </View>
    </View>
  );
}

/* ─── WhatsApp-style ticks (admin outgoing) ─── */
function StatusTick({ status, isDark }: { status: string; isDark: boolean }) {
  const grey = isDark ? "#8696a0" : "#94a3b8";
  const blue = "#38bdf8";
  if (status === "pending") return <Text style={{ fontSize: 11, color: grey, marginLeft: 3 }}>{"⏳"}</Text>;
  if (status === "sent")    return <Text style={{ fontSize: 12, color: grey, marginLeft: 3, letterSpacing: -3 }}>{"✓"}</Text>;
  if (status === "delivered") return <Text style={{ fontSize: 12, color: grey, marginLeft: 3, letterSpacing: -3 }}>{"✓✓"}</Text>;
  if (status === "read")    return <Text style={{ fontSize: 12, color: blue, marginLeft: 3, fontWeight: "bold", letterSpacing: -3 }}>{"✓✓"}</Text>;
  return null;
}

/* ─── Message bubble for admin chat room ─── */
function Bubble({ msg, isDark }: { msg: LocalMessage; isDark: boolean }) {
  const anim = useRef(new Animated.Value(0)).current;
  const isAdmin = msg.senderRole === "admin";
  useEffect(() => {
    Animated.spring(anim, { toValue: 1, tension: 60, friction: 9, useNativeDriver: true }).start();
  }, []);
  const timeColor = isDark ? "#8696a0" : "#94a3b8";
  return (
    <Animated.View style={{
      opacity: anim,
      transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }],
      marginBottom: 10, paddingHorizontal: 12,
      alignItems: isAdmin ? "flex-end" : "flex-start",
    }}>
      <View style={{ flexDirection: isAdmin ? "row-reverse" : "row", alignItems: "flex-end", maxWidth: "85%" }}>
        {!isAdmin && (
          <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: "#2563eb", justifyContent: "center", alignItems: "center", marginRight: 8, marginBottom: 2 }}>
            <Text style={{ color: "white", fontSize: 13, fontWeight: "bold" }}>
              {msg.senderName?.substring(0, 1).toUpperCase() || "U"}
            </Text>
          </View>
        )}
        <View style={{ flex: 1 }}>
          {isAdmin ? (
            <LinearGradient
              colors={isDark ? ["#1e3a5f", "#2563eb"] : ["#1e3a8a", "#2563eb"]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={{ borderRadius: 18, borderBottomRightRadius: 4, paddingHorizontal: 14, paddingVertical: 10, elevation: 1 }}
            >
              <Text style={{ fontSize: 14.5, lineHeight: 22, color: "white" }}>{msg.text}</Text>
            </LinearGradient>
          ) : (
            <View style={{ backgroundColor: isDark ? "#202c33" : "white", borderRadius: 18, borderBottomLeftRadius: 4, paddingHorizontal: 14, paddingVertical: 10, elevation: 1 }}>
              <Text style={{ fontSize: 14.5, lineHeight: 22, color: isDark ? "#e9edef" : "#111b21" }}>{msg.text}</Text>
            </View>
          )}
          <Text style={{ fontSize: 10, color: timeColor, marginTop: 4, marginHorizontal: 2, textAlign: isAdmin ? "right" : "left", flexDirection: "row" }}>
            {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </Text>
          {isAdmin && (
            <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 2, marginRight: 2 }}>
              <StatusTick status={msg.status} isDark={isDark} />
            </View>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

/* ─── Conversation list item ────────────── */
function ConvItem({ conv, onPress, isDark }: { conv: ChatConversation; onPress: () => void; isDark: boolean }) {
  const bg = isDark ? "#1e293b" : "white";
  const time = conv.lastMessageAt
    ? new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";
  return (
    <TouchableOpacity onPress={onPress} style={{
      flexDirection: "row", alignItems: "center", padding: 16, marginHorizontal: 12, marginBottom: 8,
      backgroundColor: bg, borderRadius: 16, elevation: 1,
    }}>
      <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: "#2563eb", justifyContent: "center", alignItems: "center", marginRight: 12 }}>
        <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>
          {conv.userName?.substring(0, 1).toUpperCase() || "U"}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ fontWeight: "bold", fontSize: 15, color: isDark ? "#e9edef" : "#111b21" }} numberOfLines={1}>
            {conv.userName}
          </Text>
          <Text style={{ fontSize: 11, color: isDark ? "#8696a0" : "#94a3b8" }}>{time}</Text>
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 2 }}>
          <Text style={{ fontSize: 13, color: isDark ? "#8696a0" : "#64748b" }} numberOfLines={1}>
            {conv.lastMessage || "Iniciar conversación..."}
          </Text>
          {conv.unreadByAdmin > 0 && (
            <View style={{ backgroundColor: "#10b981", borderRadius: 10, minWidth: 20, height: 20, justifyContent: "center", alignItems: "center", paddingHorizontal: 4 }}>
              <Text style={{ color: "white", fontSize: 11, fontWeight: "bold" }}>{conv.unreadByAdmin}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

/* ─── Main screen ─────────────────────────── */
export default function AdminChatListScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<AdminChatRoute>();
  const { user } = useAuth();
  const isDark = useColorScheme() === "dark";

  // If opened with a specific conversationId → go directly to chat room
  const directConvId = (route.params as any)?.conversationId;

  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [userTyping, setUserTyping] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const headerGradient: readonly [string, string, ...string[]] = isDark
    ? ["#1e1b4b", "#312e81", "#1e1b4b"]
    : ["#1e3a8a", "#2563eb", "#1d4ed8"];

  /* ── Load conversations list ── */
  const loadConversations = useCallback(async () => {
    try {
      const convs = await getConversations();
      setConversations(convs);

      // If deep-linked to a specific conversation
      if (directConvId) {
        const found = convs.find(c => c._id === directConvId);
        if (found) openConversation(found);
      }
    } catch (e) {
      console.log("[AdminChat] load error", e);
    } finally {
      setLoading(false);
    }
  }, [directConvId]);

  useEffect(() => {
    loadConversations();

    // Connect socket so admin receives events from "admins" room (e.g. messages_read)
    // even while browsing the conversation list
    setListeners({
      onConversationUpdated: (data) => {
        setConversations(prev => prev.map(c =>
          c._id === data.conversationId ? { ...c, ...data } : c
        ));
      },
      // When user reads admin"s messages → update tick status in any open conv view
      onRead: ({ conversationId }) => {
        if (selectedConv?._id === conversationId) {
          setMessages(prev => prev.map(m =>
            m.senderRole === "admin" && m.status !== "read" ? { ...m, status: "read" } : m
          ));
        }
        // Update conversation preview
        setConversations(prev => prev.map(c =>
          c._id === conversationId ? { ...c, unreadByUser: 0 } : c
        ));
      },
    });
    connectChat(""); // connect without a conv room — joins "admins" room by default
  }, []);

  /* ── Open a conversation (chat room view) ── */
  const openConversation = useCallback(async (conv: ChatConversation) => {
    // Immediately reset unread badge in the list UI
    setConversations(prev => prev.map(c =>
      c._id === conv._id ? { ...c, unreadByAdmin: 0 } : c
    ));
    setSelectedConv(conv);
    setMessages([]);
    setLoading(true);

    try {
      const history = await getMessages(conv._id);
      setMessages(history as LocalMessage[]);
      // Mark as read in DB
      await markConversationRead(conv._id);
    } catch (e) { /* noop */ }

    setListeners({
      onMessage: (msg) => {
        setMessages(prev => {
          const idx = prev.findIndex(m => m.clientId && m.clientId === msg.clientId);
          if (idx !== -1) { const u = [...prev]; u[idx] = msg; return u; }
          return [...prev, msg];
        });
        setConversations(prev => prev.map(c =>
          c._id === conv._id ? { ...c, lastMessage: msg.text, lastMessageAt: msg.createdAt, unreadByAdmin: 0 } : c
        ));
        // Admin is actively viewing this conversation → mark as read immediately
        // so the user sees blue ticks without admin needing to re-enter
        sendMessageRead(conv._id);
      },
      onTyping: () => setUserTyping(true),
      onTypingStop: () => setUserTyping(false),
      onAck: ({ clientId, messageId, status }) => {
        setMessages(prev => prev.map(m =>
          m.clientId === clientId ? { ...m, _id: messageId, status: status as any } : m
        ));
      },
      onConversationUpdated: (data) => {
        setConversations(prev => prev.map(c =>
          c._id === data.conversationId
            ? { ...c, ...data, unreadByAdmin: 0 }
            : c
        ));
      },
      // User read our messages → turn admin"s ticks blue
      onRead: () => {
        setMessages(prev => prev.map(m =>
          m.senderRole === "admin" && m.status !== "read" ? { ...m, status: "read" } : m
        ));
      },
    });

    await connectChat(conv._id);
    // Mark all messages as read via socket
    sendMessageRead(conv._id);
    setLoading(false);
  }, []);

  // Auto scroll
  useEffect(() => {
    if (selectedConv && messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 120);
    }
  }, [messages, userTyping]);

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const contentHeight = event.nativeEvent.contentSize.height;
    const layoutHeight = event.nativeEvent.layoutMeasurement.height;
    if (contentHeight - layoutHeight - offsetY > 100) {
      setShowScrollButton(true);
    } else {
      setShowScrollButton(false);
    }
  };

  /* ── Send (admin → user) ── */
  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || !selectedConv) return;
    setInput("");
    sendTypingStop(selectedConv._id);

    const optimistic: LocalMessage = {
      _id: `opt_${Date.now()}`,
      conversationId: selectedConv._id,
      senderId: user?.id || "",
      senderRole: "admin",
      senderName: user?.name || "Admin",
      text,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimistic]);

    const { clientId } = await socketSend(selectedConv._id, text);
    setMessages(prev => prev.map(m =>
      m._id === optimistic._id ? { ...m, clientId, status: "sent" } : m
    ));
  }, [input, selectedConv, user]);

  const handleInputChange = (text: string) => {
    setInput(text);
    if (!selectedConv) return;
    sendTypingStart(selectedConv._id);
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => sendTypingStop(selectedConv!._id), 1500);
  };

  const inputBarBg = isDark ? "#202c33" : "#f0f2f5";
  const inputAreaBg = isDark ? "#2a3942" : "white";
  const inputTextColor = isDark ? "#d1d5db" : "#111827";

  /* ── Chat Room View (when a conversation is selected) ── */
  if (selectedConv) {
    return (
      <ImageBackground source={require("../assets/bot_bg.png")} style={{ flex: 1, overflow: "hidden" }} resizeMode="cover">
        <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: isDark ? "rgba(11,20,26,0.88)" : "rgba(239,234,226,0.88)" }} />
        <StatusBar barStyle="light-content" />
        <LinearGradient colors={headerGradient} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
          style={{ paddingTop: Platform.OS === "ios" ? 56 : 48, paddingBottom: 16, paddingHorizontal: 16 }}>
          <TouchableOpacity
          onPress={() => {
            // Tell server + user we left the chat room
            if (selectedConv) leaveConversation(selectedConv._id);
            setSelectedConv(null);
          }}
          style={{ padding: 4, alignSelf: "flex-start", marginBottom: 12 }}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
          </TouchableOpacity>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.15)", justifyContent: "center", alignItems: "center" }}>
              <Text style={{ color: "white", fontWeight: "bold", fontSize: 18 }}>
                {selectedConv.userName?.substring(0, 1).toUpperCase() || "U"}
              </Text>
            </View>
            <View>
              <Text style={{ color: "white", fontWeight: "bold", fontSize: 18 }}>{selectedConv.userName}</Text>
              <Text style={{ color: "rgba(255,255,255,0.75)", fontSize: 13 }}>Usuario · Soporte</Text>
            </View>
          </View>
        </LinearGradient>

        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
          {loading ? (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
              <ActivityIndicator color="#2563eb" />
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              data={messages}
              keyExtractor={m => m._id}
              renderItem={({ item }) => <Bubble msg={item} isDark={isDark} />}
              contentContainerStyle={{ paddingTop: 16, paddingBottom: 16 }}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={{ alignItems: "center", marginTop: 60, paddingHorizontal: 32 }}>
                  <Text style={{ color: isDark ? "#8696a0" : "#64748b", textAlign: "center", fontSize: 15 }}>
                    No hay mensajes aún. Responde al usuario.
                  </Text>
                </View>
              }
              ListFooterComponent={userTyping ? <TypingDots isDark={isDark} /> : null}
              style={{ flex: 1 }}
            />
          )}

          {showScrollButton && (
            <TouchableOpacity
              onPress={() => flatListRef.current?.scrollToEnd({ animated: true })}
              style={{
                position: "absolute", bottom: 80, right: 16,
                width: 40, height: 40, borderRadius: 20,
                backgroundColor: isDark ? "#374151" : "white",
                justifyContent: "center", alignItems: "center",
                elevation: 4, shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 4,
                zIndex: 10
              }}
            >
              <ChevronsDown size={24} color={isDark ? "#e9edef" : "#54656f"} />
            </TouchableOpacity>
          )}

          <View style={{ flexDirection: "row", alignItems: "flex-end", paddingHorizontal: 10, paddingVertical: 10, backgroundColor: inputBarBg, gap: 8 }}>
            <View style={{ flex: 1, backgroundColor: inputAreaBg, borderRadius: 24, paddingHorizontal: 16, paddingVertical: Platform.OS === "ios" ? 12 : 8, minHeight: 48, flexDirection: "row", alignItems: "center", elevation: 1 }}>
              <TextInput
                nativeID="admin-chat-input"
                value={input}
                onChangeText={handleInputChange}
                placeholder="Responder al usuario..."
                placeholderTextColor={isDark ? "#8696a0" : "#94a3b8"}
                style={[{ fontSize: 15, color: inputTextColor, maxHeight: 120, flex: 1 },
                  Platform.OS === "web" ? { outlineStyle: "none" } as any : {}]}
                cursorColor={isDark ? "#60a5fa" : "#2563eb"}
                selectionColor={isDark ? "rgba(96,165,250,0.3)" : "rgba(37,99,235,0.3)"}
                multiline returnKeyType="send" onSubmitEditing={handleSend} blurOnSubmit={false}
              />
            </View>
            <TouchableOpacity onPress={handleSend} disabled={!input.trim()}
              style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: input.trim() ? "#2563eb" : (isDark ? "#374151" : "#cbd5e1"), justifyContent: "center", alignItems: "center", elevation: 2 }}>
              <Send size={20} color="white" style={{ marginLeft: -2 }} />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </ImageBackground>
    );
  }

  /* ── Conversations List View ── */
  return (
    <View style={{ flex: 1, backgroundColor: isDark ? "#0b141a" : "#f1f5f9" }}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={headerGradient} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
        style={{ paddingTop: Platform.OS === "ios" ? 56 : 48, paddingBottom: 20, paddingHorizontal: 16 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4, alignSelf: "flex-start", marginBottom: 12 }}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.15)", justifyContent: "center", alignItems: "center" }}>
            <Headphones size={24} color="white" />
          </View>
          <View>
            <Text style={{ color: "white", fontWeight: "bold", fontSize: 20 }}>Soporte — Mensajes</Text>
            <Text style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, marginTop: 1 }}>
              {conversations.length} conversación{conversations.length !== 1 ? "es" : ""} activa{conversations.length !== 1 ? "s" : ""}
            </Text>
          </View>
        </View>
      </LinearGradient>

      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator color="#2563eb" size="large" />
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={c => c._id}
          renderItem={({ item }) => (
            <ConvItem conv={item} onPress={() => openConversation(item)} isDark={isDark} />
          )}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={{ alignItems: "center", marginTop: 80, paddingHorizontal: 32 }}>
              <Headphones size={48} color={isDark ? "#2563eb" : "#1e3a8a"} />
              <Text style={{ color: isDark ? "#8696a0" : "#64748b", textAlign: "center", marginTop: 16, fontSize: 15 }}>
                No hay conversaciones activas.{'\n'}Los usuarios verán un botón de chat en su pantalla.
              </Text>
            </View>
          }
          onRefresh={loadConversations}
          refreshing={false}
        />
      )}
    </View>
  );
}