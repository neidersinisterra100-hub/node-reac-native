/**
 * SupportChatScreen — Chat de Soporte (role: user)
 * Visually consistent with NauticBotScreen (same theme, colors, input bar).
 * Features: real-time Socket.IO, offline queue, typing indicator, read receipts.
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  KeyboardAvoidingView, Platform, Animated, Easing,
  StatusBar, useColorScheme, ImageBackground, StyleSheet, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Send, Headphones, ChevronsDown } from 'lucide-react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useAuth } from '../context/AuthContext';
import {
  getOrCreateConversation, getMessages,
  ChatMessage, ChatConversation,
} from '../services/chat.service';
import {
  connectChat, disconnectChat, sendMessage as socketSend,
  sendTypingStart, sendTypingStop, setListeners, isSocketConnected,
  leaveConversation, sendMessageRead,
} from '../services/chatSocket.service';

/* ─── Types ──────────────────────────────────── */
interface LocalMessage extends ChatMessage {
  isOffline?: boolean;
}

/* ─── Typing indicator ───────────────────────── */
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
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 8 }}>
      <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: '#10b981', justifyContent: 'center', alignItems: 'center', marginRight: 8 }}>
        <Headphones size={17} color="white" />
      </View>
      <View style={{ backgroundColor: isDark ? '#202c33' : 'white', borderRadius: 18, borderBottomLeftRadius: 4, paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', gap: 6, elevation: 1 }}>
        {dots.map((v, i) => (
          <Animated.View key={i} style={{ transform: [{ translateY: v }] }}>
            <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: isDark ? '#8294a0' : '#94a3b8' }} />
          </Animated.View>
        ))}
      </View>
    </View>
  );
}

/* ─── WhatsApp-style tick ───────────────────── */
function StatusTick({ status, isDark }: { status: string; isDark: boolean }) {
  const grey = isDark ? '#8696a0' : '#94a3b8';
  const blue = '#38bdf8';
  if (status === 'pending') {
    return (
      <Text style={{ fontSize: 11, color: grey, marginLeft: 3 }}>
        {'⏳'}
      </Text>
    );
  }
  if (status === 'sent') {
    return (
      <Text style={{ fontSize: 12, color: grey, marginLeft: 3, letterSpacing: -3 }}>
        {'✓'}
      </Text>
    );
  }
  if (status === 'delivered') {
    return (
      <Text style={{ fontSize: 12, color: grey, marginLeft: 3, letterSpacing: -3 }}>
        {'✓✓'}
      </Text>
    );
  }
  if (status === 'read') {
    return (
      <Text style={{ fontSize: 12, color: blue, marginLeft: 3, fontWeight: 'bold', letterSpacing: -3 }}>
        {'✓✓'}
      </Text>
    );
  }
  return null;
}

/* ─── Message Bubble ─────────────────────────── */
function Bubble({ msg, isDark }: { msg: LocalMessage; isDark: boolean }) {
  const anim = useRef(new Animated.Value(0)).current;
  const isMe = msg.senderRole === 'user';

  useEffect(() => {
    Animated.spring(anim, { toValue: 1, tension: 60, friction: 9, useNativeDriver: true }).start();
  }, []);

  const botBg = isDark ? '#202c33' : 'white';
  const userColors: readonly [string, string] = isDark ? ['#005c4b', '#005c4b'] : ['#1e3a8a', '#2563eb'];
  const timeColor = isDark ? '#8696a0' : '#94a3b8';

  return (
    <Animated.View style={{
      opacity: anim,
      transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }],
      marginBottom: 10, paddingHorizontal: 12,
      alignItems: isMe ? 'flex-end' : 'flex-start',
    }}>
      <View style={{ flexDirection: isMe ? 'row-reverse' : 'row', alignItems: 'flex-end', maxWidth: '85%' }}>
        {!isMe && (
          <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: '#10b981', justifyContent: 'center', alignItems: 'center', marginRight: 8, marginBottom: 2 }}>
            <Headphones size={17} color="white" />
          </View>
        )}
        <View style={{ flex: 1 }}>
          {isMe ? (
            <LinearGradient
              colors={userColors}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={{ borderRadius: 18, borderBottomRightRadius: 4, paddingHorizontal: 14, paddingVertical: 10, elevation: 1 }}
            >
              <Text style={{ fontSize: 14.5, lineHeight: 22, color: 'white' }}>{msg.text}</Text>
            </LinearGradient>
          ) : (
            <View style={{ backgroundColor: botBg, borderRadius: 18, borderBottomLeftRadius: 4, paddingHorizontal: 14, paddingVertical: 10, elevation: 1 }}>
              <Text style={{ fontSize: 14.5, lineHeight: 22, color: isDark ? '#e9edef' : '#111b21' }}>{msg.text}</Text>
            </View>
          )}
          <View style={{ flexDirection: 'row', justifyContent: isMe ? 'flex-end' : 'flex-start', marginTop: 4, marginHorizontal: 2 }}>
            <Text style={{ fontSize: 10, color: timeColor }}>
              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
            {isMe && <StatusTick status={msg.status} isDark={isDark} />}
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

/* ─── Main Screen ────────────────────────────── */
export default function SupportChatScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const isDark = useColorScheme() === 'dark';
  const flatListRef = useRef<FlatList>(null);

  const [conversation, setConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [adminTyping, setAdminTyping] = useState(false);
  const [adminOnline, setAdminOnline] = useState(false);
  const [connected, setConnected] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const hasMountedRef = useRef(false);

  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── Scroll handler for scroll-to-bottom button ── */
  const handleScroll = useCallback((event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent || {};
    if (!layoutMeasurement || !contentSize) return;
    const paddingToBottom = 24;
    const isNearBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
    setShowScrollButton(!isNearBottom);
  }, []);

  // Colors (same as NauticBotScreen)
  const bgContainer = isDark ? '#0b141a' : '#efeae2';
  const headerGradient: readonly [string, string, ...string[]] = isDark
    ? ['#1a2e1a', '#0f2010', '#0a180a']
    : ['#064e3b', '#065f46', '#047857'];
  const inputBarBg = isDark ? '#202c33' : '#f0f2f5';
  const inputAreaBg = isDark ? '#2a3942' : 'white';
  const inputTextColor = isDark ? '#d1d5db' : '#111827';

  /* ── Load conversation + history ── */
  useEffect(() => {
    (async () => {
      try {
        const conv = await getOrCreateConversation();
        setConversation(conv);
        const history = await getMessages(conv._id);
        setMessages(history as LocalMessage[]);

        // Register socket listeners then connect
        setListeners({
          onMessage: (msg) => {
            setMessages(prev => {
              const idx = prev.findIndex(m => m.clientId && m.clientId === msg.clientId);
              if (idx !== -1) {
                const updated = [...prev];
                updated[idx] = { ...msg, isOffline: false };
                return updated;
              }
              return [...prev, msg];
            });
            // Admin sent a message while user is viewing → mark as read immediately
            if (msg.senderRole !== 'user') {
              sendMessageRead(conv._id);
            }
          },
          onTyping: () => setAdminTyping(true),
          onTypingStop: () => setAdminTyping(false),
          // Ack from server — resolve optimistic _id but never downgrade status
          onAck: ({ clientId, messageId, status }) => {
            const ORDER: Record<string, number> = { pending: 0, sent: 1, delivered: 2, read: 3 };
            setMessages(prev => prev.map(m => {
              if (m.clientId !== clientId) return m;
              const currentRank = ORDER[m.status] ?? 0;
              const newRank = ORDER[status] ?? 0;
              // Resolve the temp _id; keep the highest status
              return { ...m, _id: messageId, status: (newRank > currentRank ? status : m.status) as any, isOffline: false };
            }));
          },
          // Single message delivered immediately (admin was in room)
          onDelivered: ({ messageId, clientId: cId }) => {
            setMessages(prev => prev.map(m =>
              (m._id === messageId || (cId && m.clientId === cId))
                ? { ...m, status: 'delivered' } : m
            ));
          },
          // Bulk delivered when admin joins room
          onBulkDelivered: ({ messageIds }) => {
            const idSet = new Set(messageIds.map(String));
            setMessages(prev => prev.map(m =>
              idSet.has(String(m._id)) && m.status === 'sent'
                ? { ...m, status: 'delivered' } : m
            ));
          },
          onAdminPresence: ({ online }) => {
            setAdminOnline(online);
            if (!online) setAdminTyping(false);
          },
          onRead: () => {
            setMessages(prev => prev.map(m =>
              m.senderRole === 'user' && m.status !== 'read' ? { ...m, status: 'read' } : m
            ));
          },
          // Real-time socket connection status → drives the header subtitle
          onConnectionChange: (isConnected) => {
            setConnected(isConnected);
            if (!isConnected) setAdminOnline(false);
          },
        });

        await connectChat(conv._id);
        setConnected(isSocketConnected());
        // Tell server all existing messages are read (turns admin's ticks blue)
        sendMessageRead(conv._id);
      } catch (e) {
        console.log('[Support Chat] init error', e);
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      // Tell server + other party we left
      if (conversation) leaveConversation(conversation._id);
      disconnectChat();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-scroll on new messages
  useEffect(() => {
    if (messages.length > 0) {
      if (!hasMountedRef.current) {
        hasMountedRef.current = true;
        return;
      }
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 120);
    }
  }, [messages, adminTyping]);

  /* ── Send ── */
  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || !conversation) return;
    setInput('');
    sendTypingStop(conversation._id);

    // Optimistic message
    const optimistic: LocalMessage = {
      _id: `opt_${Date.now()}`,
      conversationId: conversation._id,
      senderId: user?.id || '',
      senderRole: 'user',
      senderName: user?.name || '',
      text,
      status: 'pending',
      createdAt: new Date().toISOString(),
      isOffline: false,
    };
    setMessages(prev => [...prev, optimistic]);

    const { clientId, isOffline } = await socketSend(conversation._id, text);
    setMessages(prev => prev.map(m =>
      m._id === optimistic._id ? { ...m, clientId, isOffline, status: isOffline ? 'pending' : 'sent' } : m
    ));
  }, [input, conversation, user]);

  /* ── Typing ── */
  const handleInputChange = (text: string) => {
    setInput(text);
    if (!conversation) return;
    sendTypingStart(conversation._id);
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => sendTypingStop(conversation._id), 1500);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: bgContainer }}>
        <ActivityIndicator color="#10b981" size="large" />
      </View>
    );
  }

  return (
    <ImageBackground
      source={require('../assets/bot_bg.png')}
      style={{ flex: 1, overflow: 'hidden' }}
      resizeMode="cover"
    >
      <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: isDark ? 'rgba(11,20,26,0.88)' : 'rgba(239,234,226,0.88)' }} />
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <LinearGradient
        colors={headerGradient}
        start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
        style={{ paddingTop: Platform.OS === 'ios' ? 56 : 48, paddingBottom: 16, paddingHorizontal: 16 }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4, alignSelf: 'flex-start', marginBottom: 12 }}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View>
            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(16,185,129,0.25)', justifyContent: 'center', alignItems: 'center' }}>
              <Headphones size={24} color="white" />
            </View>
            {/* Online indicator */}
            <View style={{ position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, borderRadius: 6, backgroundColor: adminOnline ? '#22c55e' : '#94a3b8', borderWidth: 2, borderColor: isDark ? '#0a180a' : '#065f46' }} />
          </View>
          <View>
            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>Soporte NauticGo</Text>
            <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, marginTop: 1 }}>
              {adminOnline ? '🟢 En línea' : connected ? 'Conectado' : '⚠️ Sin conexión — cola activa'}
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Chat area */}
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={m => m.clientId || m._id}
          renderItem={({ item }) => <Bubble msg={item} isDark={isDark} />}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 16 }}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 60, paddingHorizontal: 32 }}>
              <Headphones size={48} color={isDark ? '#10b981' : '#065f46'} />
              <Text style={{ color: isDark ? '#8696a0' : '#64748b', textAlign: 'center', marginTop: 16, fontSize: 15 }}>
                ¡Hola! 👋 Escríbenos y un administrador estará contigo en breve.
              </Text>
            </View>
          }
          ListFooterComponent={adminTyping ? <TypingDots isDark={isDark} /> : null}
          style={{ flex: 1 }}
        />


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

        {/* Input bar */}
        <View style={{
          flexDirection: 'row', alignItems: 'flex-end',
          paddingHorizontal: 10, paddingVertical: 10,
          backgroundColor: inputBarBg, gap: 8,
        }}>
          <View style={{
            flex: 1, backgroundColor: inputAreaBg, borderRadius: 24,
            paddingHorizontal: 16, paddingVertical: Platform.OS === 'ios' ? 12 : 8, minHeight: 48,
            flexDirection: 'row', alignItems: 'center',
            shadowColor: '#000', shadowOpacity: isDark ? 0 : 0.05, shadowRadius: 4, elevation: 1,
          }}>
            <TextInput
              nativeID="support-chat-input"
              value={input}
              onChangeText={handleInputChange}
              placeholder="Escribe un mensaje..."
              placeholderTextColor={isDark ? '#8696a0' : '#94a3b8'}
              style={[
                { fontSize: 15, color: inputTextColor, maxHeight: 120, flex: 1 },
                Platform.OS === 'web' ? { outlineStyle: 'none' } as any : {},
              ]}
              cursorColor={isDark ? '#10b981' : '#065f46'}
              selectionColor={isDark ? 'rgba(16,185,129,0.3)' : 'rgba(6,95,70,0.3)'}
              multiline
              returnKeyType="send"
              onSubmitEditing={handleSend}
              blurOnSubmit={false}
            />
          </View>
          <TouchableOpacity
            onPress={handleSend}
            disabled={!input.trim()}
            style={{
              width: 48, height: 48, borderRadius: 24,
              backgroundColor: input.trim() ? '#10b981' : (isDark ? '#374151' : '#cbd5e1'),
              justifyContent: 'center', alignItems: 'center', elevation: 2,
            }}
          >
            <Send size={20} color="white" style={{ marginLeft: -2 }} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}
