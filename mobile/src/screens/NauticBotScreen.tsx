/**
 * NauticBot — AI Conversational Assistant
 * Features: intent detection, real API data, voice recording (expo-av),
 *           TTS (expo-speech), trip booking flow, human personality.
 */
import React, {
    useState, useRef, useCallback, useEffect,
} from "react";
import {
    View, Text, TextInput, TouchableOpacity, FlatList,
    KeyboardAvoidingView, Platform, Animated, Easing,
    ActivityIndicator, Keyboard, StatusBar, Pressable,
    useColorScheme, ImageBackground, StyleSheet
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Bot, Send, X, Mic, MicOff, Volume2, VolumeX } from "lucide-react-native";
import { Audio } from "expo-av";
import * as Speech from "expo-speech";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { tripService } from "../services/trip.service";
import { getAllRoutes } from "../services/route.service";
import { useAuth } from "../context/AuthContext";

/* ═══════════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════════ */
type Role = "bot" | "user";
type BookingStep = "idle" | "select_trip" | "confirm" | "done";

interface TripOption {
    id: string;
    origin: string;
    destination: string;
    date: string;
    time: string;
    price: number;
    capacity: number;
    soldSeats: number;
    company: string;
}

interface Message {
    id: string;
    role: Role;
    text: string;
    timestamp: Date;
    quickReplies?: string[];
    tripOptions?: TripOption[];    // for booking cards
    isVoice?: boolean;
}

/* ═══════════════════════════════════════════════════════════════
   HUMAN PERSONALITY — varied phrases for each intent
═══════════════════════════════════════════════════════════════ */
const PHRASES = {
    greeting: [
        "¡Hola! 👋 Soy **NauticBot**, tu asistente acuático. ¿En qué te ayudo hoy?",
        "¡Qué bueno verte por aquí! 🌊 Soy **NauticBot**. ¿Buscas un viaje, información de rutas o algo más?",
        "¡Bienvenido/a a bordo! ⚓ Cuéntame, ¿qué necesitas saber?",
    ],
    thinking: [
        "Déjame ver eso... 🔍",
        "Un momento, consultando la información... ⏳",
        "Buscando lo mejor para ti... 🌊",
        "Ya mismo te digo... 🤿",
    ],
    noTrips: [
        "En este momento no hay viajes activos. 😕 Intenta más tarde o cambia el municipio seleccionado.",
        "No encontré viajes disponibles justo ahora. Puede que en un rato hayan más opciones. 🚢",
    ],
    bookingStart: [
        "¡Claro! Vamos a reservar tu viaje. 🎉 Estos son los que tenemos disponibles:",
        "Con gusto te ayudo a reservar. ⚓ Elige el viaje que más te conviene:",
        "¡Perfecto! Mira las opciones disponibles y escoge la que prefieras: 🛥️",
    ],
    bookingConfirm: [
        "¿Confirmamos este viaje? Es tu turno de decidir. 😊",
        "Revisemos juntos: ¿todo se ve bien para ti?",
        "Solo dime **Confirmar** y enseguida lo reservamos.",
    ],
    bookingDone: [
        "¡Listo! ✅ Tu reserva quedó hecha. ⚠️ ATENCIÓN: Si no pagas el ticket de una vez corres el riesgo de perder tu cupo si se compran todos los puestos. Te recomiendo que te pongas en contacto con la empresa operadora a través de WhatsApp o del chat interno de NauticGo.",
        "¡Reservado con éxito! 🎊 ⚠️ RECUERDA: Si no pagas el ticket pronto, podrías perder tu cupo si el viaje se llena. Te recomiendo contactar a la empresa operadora por WhatsApp o por nuestro chat interno.",
    ],
    bookingCancel: [
        "De acuerdo, cancelamos. Si cambias de opinión, aquí estaré. 😊",
        "Sin problema, reserva cancelada. ¿Puedo ayudarte con algo más?",
    ],
    unknown: [
        "Hmm, no te entendí del todo. 🤔 ¿Puedes reformularlo? Puedo ayudarte con **viajes, rutas, precios, horarios** y **reservas**.",
        "No capté bien eso. Intenta preguntarme sobre **viajes disponibles**, **precios** o **cómo reservar**.",
        "¿Podrías ser un poco más específico? Soy bueno con **viajes, rutas, disponibilidad y reservas**. 🧭",
    ],
    voiceReceived: [
        "Escuché tu nota de voz 🎙️. Por ahora solo proceso texto, pero pronto podré entenderte por voz. ¿Qué necesitas?",
        "¡Nota de voz recibida! 🎙️ La transcripción automática llega pronto. Mientras tanto, ¿qué te puedo ayudar?",
    ],
};

function pick(arr: string[]) {
    return arr[Math.floor(Math.random() * arr.length)];
}

/* ═══════════════════════════════════════════════════════════════
   INTENT DETECTION
═══════════════════════════════════════════════════════════════ */
function norm(t: string) {
    return t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

const KW: Record<string, string[]> = {
    greeting: ["hola", "buenos", "buenas", "hey", "ola", "buen dia", "inicio"],
    book: ["reservar", "reserva", "quiero reservar", "comprar tiquete", "como reservo", "quiero un viaje", "apartar"],
    prices: ["precio", "precios", "costo", "costos", "tarifa", "vale", "cuanto cuesta", "cuanto vale"],
    times: ["hora", "horas", "horario", "cuando sale", "salen", "que hora"],
    availability: ["disponible", "disponibles", "cupos", "silla", "sillas", "quedan", "hay cupo"],
    trips: ["viaje", "viajes", "lancha", "lanchas", "embarcacion", "activos"],
    routes: ["ruta", "rutas", "origen", "destino", "trayecto", "trayectos"],
    help: ["ayuda", "ayudame", "que puedes", "puedes hacer", "opciones", "info"],
    cancel: ["cancelar", "cancela", "no quiero", "olvida", "volver"],
    confirm: ["confirmar", "confirmo", "si", "sí", "acepto", "dale", "listo", "ok", "adelante"],
};

function detectIntent(text: string, bookingStep: BookingStep): string {
    const t = norm(text);

    // while in booking flow
    if (bookingStep === "select_trip") return "booking_select";
    if (bookingStep === "confirm") {
        if (t.includes("pagar al abordar") || t.includes("efectivo") || t.includes("luego")) return "booking_pay_on_board";
        if (t.includes("comprar") || t.includes("wompi") || t.includes("tarjeta") || t.includes("pagar ahora")) return "booking_buy_now";
        if (KW.cancel.some(k => t.includes(k))) return "booking_cancelled";
        return "booking_confirm_prompt";
    }

    for (const [intent, kws] of Object.entries(KW)) {
        if (kws.some(k => t.includes(k))) return intent;
    }
    return "unknown";
}

/* ═══════════════════════════════════════════════════════════════
   TRIP UTILITIES
═══════════════════════════════════════════════════════════════ */
async function fetchActiveTrips(): Promise<TripOption[]> {
    const raw = await tripService.getAll();
    return raw
        .filter((t: any) => t.isActive)
        .map((t: any) => ({
            id: t._id || t.id,
            origin: t.route?.origin || "Origen",
            destination: t.route?.destination || "Destino",
            date: t.date || "",
            time: t.departureTime || "--:--",
            price: t.price || 0,
            capacity: t.capacity || 0,
            soldSeats: t.soldSeats || 0,
            company: typeof t.company === "object" ? t.company?.name : "Empresa",
        }));
}

/* ═══════════════════════════════════════════════════════════════
   BOOKING SERVICE (conecta con la API real de reservas)
═══════════════════════════════════════════════════════════════ */
async function createPayOnBoardTicket(tripId: string, user: any): Promise<boolean> {
    try {
        const { api } = await import("../services/api");
        // 1. Auto-assign and lock 1 seat
        const lockRes = await api.post("/seats/reserve", { tripId, seats: 1 });
        const seatNumbers = lockRes.data?.seatNumbers || [];
        if (!seatNumbers.length) return false;

        // 2. Create the ticket
        await api.post("/tickets/reserve", {
            tripId,
            passengerName: user.name || "Usuario App",
            passengerId: user.identificationNumber || "00000000",
            passengerPhone: user.phone || "0000000000",
            passengerEmail: user.email || "correo@ejemplo.com",
            seatNumbers
        });
        return true;
    } catch (e) {
        console.log("Error creating POB ticket:", e);
        return false;
    }
}

async function reserveSeatForBuyNow(tripId: string): Promise<number | null> {
    try {
        const { api } = await import("../services/api");
        // Auto-assign and lock 1 seat for 5 mins
        const lockRes = await api.post("/seats/reserve", { tripId, seats: 1 });
        const seatNumbers = lockRes.data?.seatNumbers || [];
        return seatNumbers.length ? seatNumbers[0] : null;
    } catch {
        return null;
    }
}

/* ═══════════════════════════════════════════════════════════════
   BOT BRAIN
═══════════════════════════════════════════════════════════════ */
interface BotState {
    bookingStep: BookingStep;
    tripOptions: TripOption[];
    selectedTrip: TripOption | null;
}

async function generateResponse(
    intent: string,
    state: BotState,
    user: any,
): Promise<{
    text: string;
    quickReplies?: string[];
    tripOptions?: TripOption[];
    newState?: Partial<BotState>;
}> {
    try {
        switch (intent) {

            case "greeting":
                return {
                    text: pick(PHRASES.greeting),
                    quickReplies: ["🛥️ Viajes disponibles", "💰 Ver precios", "📅 Horarios", "🎟️ Reservar viaje"],
                };

            case "book": {
                const trips = await fetchActiveTrips();
                if (!trips.length) return { text: pick(PHRASES.noTrips) };
                return {
                    text: pick(PHRASES.bookingStart),
                    tripOptions: trips.slice(0, 5),
                    newState: { bookingStep: "select_trip", tripOptions: trips },
                };
            }

            case "trips": {
                const trips = await fetchActiveTrips();
                if (!trips.length) return { text: pick(PHRASES.noTrips), quickReplies: ["🔄 Intentar de nuevo"] };
                const lines = trips.slice(0, 5).map(t =>
                    `• 🛥️ **${t.origin} → ${t.destination}**\n  🕐 ${t.time}  |  💰 $${t.price.toLocaleString()}  |  🪑 ${t.capacity - t.soldSeats} cupos`
                );
                return {
                    text: `Encontré **${trips.length}** viaje(s) activo(s):\n\n${lines.join("\n\n")}`,
                    quickReplies: ["🎟️ Quiero reservar", "💰 Más detalles de precios", "🪑 Disponibilidad"],
                };
            }

            case "prices": {
                const trips = await fetchActiveTrips();
                if (!trips.length) return { text: pick(PHRASES.noTrips) };
                const lines = trips.slice(0, 5).map(t =>
                    `• ${t.origin} → ${t.destination}: **$${t.price.toLocaleString()}**`
                );
                const min = Math.min(...trips.map(t => t.price));
                const max = Math.max(...trips.map(t => t.price));
                return {
                    text: `💰 Tarifas actuales:\n\n${lines.join("\n")}\n\nRango: $${min.toLocaleString()} – $${max.toLocaleString()}`,
                    quickReplies: ["🎟️ Reservar ahora", "📅 Horarios", "🪑 Disponibilidad"],
                };
            }

            case "times": {
                const trips = await fetchActiveTrips();
                const sorted = trips.sort((a, b) => a.time.localeCompare(b.time)).slice(0, 6);
                if (!sorted.length) return { text: pick(PHRASES.noTrips) };
                const lines = sorted.map(t =>
                    `• 🕐 **${t.time}** — ${t.origin} → ${t.destination}`
                );
                return {
                    text: `Horarios de hoy:\n\n${lines.join("\n")}`,
                    quickReplies: ["🎟️ Reservar", "💰 Precios", "🪑 Disponibilidad"],
                };
            }

            case "availability": {
                const trips = await fetchActiveTrips();
                if (!trips.length) return { text: pick(PHRASES.noTrips) };
                const lines = trips.slice(0, 5).map(t => {
                    const avail = t.capacity - t.soldSeats;
                    const dot = avail > 5 ? "🟢" : avail > 2 ? "🟡" : "🔴";
                    return `• ${t.origin} → ${t.destination}: ${dot} **${avail} cupo(s)**`;
                });
                return {
                    text: `Disponibilidad actual:\n\n${lines.join("\n")}`,
                    quickReplies: ["🎟️ Reservar un cupo", "💰 Precios", "📅 Horarios"],
                };
            }

            case "routes": {
                const routes = await getAllRoutes();
                if (!routes.length) return { text: "No encontré rutas registradas en este momento." };
                const lines = routes.slice(0, 6).map((r: any) =>
                    `• ⛵ **${r.origin}** → **${r.destination}**`
                );
                return {
                    text: `Rutas habilitadas:\n\n${lines.join("\n")}\n\n¿Quieres saber precios u horarios de alguna en particular? 🗺️`,
                    quickReplies: ["💰 Precios por ruta", "📅 Horarios", "🎟️ Reservar"],
                };
            }

            case "help":
                return {
                    text: "Puedo ayudarte con:\n\n🛥️ **Viajes** — cuáles están activos\n💰 **Precios** — tarifas por ruta\n📅 **Horarios** — cuándo salen\n🪑 **Disponibilidad** — cuántos cupos quedan\n🗺️ **Rutas** — todos los trayectos\n🎟️ **Reservar** — reserva un viaje aquí mismo\n\n¿Qué necesitas?",
                    quickReplies: ["🛥️ Viajes", "🎟️ Reservar", "💰 Precios", "📅 Horarios"],
                };

            // ── BOOKING FLOW ──
            case "booking_confirm_prompt":
                return {
                    text: pick(PHRASES.bookingConfirm),
                    quickReplies: ["💵 Pagar al abordar", "💳 Comprar tiquete", "❌ Cancelar"],
                };

            case "booking_pay_on_board": {
                if (!state.selectedTrip) return { text: "No había ningún viaje seleccionado. ¿Quieres empezar de nuevo?" };
                const ok = await createPayOnBoardTicket(state.selectedTrip.id, user);
                return {
                    text: ok ? pick(PHRASES.bookingDone) : "Hubo un problema procesando tu reserva 😔. Intenta de nuevo o contáctanos directamente.",
                    quickReplies: ok ? ["🏠 Ir al inicio", "🛥️ Ver más viajes"] : ["🔄 Intentar de nuevo"],
                    newState: { bookingStep: "done", selectedTrip: null },
                };
            }

            case "booking_buy_now": {
                if (!state.selectedTrip) return { text: "No había ningún viaje seleccionado. ¿Quieres empezar de nuevo?" };
                const seatNumber = await reserveSeatForBuyNow(state.selectedTrip.id);
                if (!seatNumber) {
                     return {
                        text: "Lo siento, no pude reservar el asiento para tu compra 😔. Puede que el viaje esté lleno. Intenta de nuevo.",
                        quickReplies: ["🔄 Intentar de nuevo", "🛥️ Ver viajes"],
                        newState: { bookingStep: "done", selectedTrip: null },
                    };
                }
                
                // When this intent fires, the component will intercept the text response and trigger navigation
                return {
                    text: `¡Listo! He apartado el asiento #${seatNumber} por 5 minutos ⏳.\n\nTe llevaré a la pantalla de pago para que finalices la compra y el tiquete sea tuyo. 💳`,
                    quickReplies: ["✅ Entendido"],
                    newState: { bookingStep: "done", selectedTrip: null },
                };
            }

            case "booking_cancelled":
                return {
                    text: pick(PHRASES.bookingCancel),
                    quickReplies: ["🏠 Inicio", "🛥️ Ver viajes", "💰 Precios"],
                    newState: { bookingStep: "idle", selectedTrip: null },
                };

            case "cancel":
                return {
                    text: pick(PHRASES.bookingCancel),
                    quickReplies: ["🏠 Inicio", "🛥️ Ver viajes"],
                    newState: { bookingStep: "idle", selectedTrip: null, tripOptions: [] },
                };

            default:
                return {
                    text: pick(PHRASES.unknown),
                    quickReplies: ["🛥️ Viajes", "🎟️ Reservar", "💰 Precios", "🆘 Ayuda"],
                };
        }
    } catch {
        return { text: "Tuve un problema consultando la información 😔. Revisa tu conexión e intenta de nuevo." };
    }
}

/* ═══════════════════════════════════════════════════════════════
   TYPING INDICATOR
═══════════════════════════════════════════════════════════════ */
function BotTyping() {
    const isDark = useColorScheme() === "dark";
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
        <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 8 }}>
            <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: isDark ? "#0284c7" : "#1e3a8a", justifyContent: "center", alignItems: "center", marginRight: 8 }}>
                <Bot size={17} color="white" />
            </View>
            <View style={{ backgroundColor: isDark ? "#202c33" : "white", borderRadius: 18, borderBottomLeftRadius: 4, paddingHorizontal: 16, paddingVertical: 12, flexDirection: "row", alignItems: "center", gap: 6, elevation: 1 }}>
                {dots.map((v, i) => (
                    <Animated.View key={i} style={{ transform: [{ translateY: v }] }}>
                        <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: isDark ? "#8294a0" : "#94a3b8" }} />
                    </Animated.View>
                ))}
            </View>
        </View>
    );
}

/* ═══════════════════════════════════════════════════════════════
   MARKDOWN-LITE
═══════════════════════════════════════════════════════════════ */
function BotText({ text, white, isDark }: { text: string; white?: boolean; isDark?: boolean }) {
    const color = white ? "white" : (isDark ? "#e9edef" : "#111b21");
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return (
        <View style={{ flexShrink: 1, width: "100%" }}>
            <Text style={{ 
                fontSize: 14.5, lineHeight: 22, color, flexShrink: 1, flexWrap: "wrap",
                ...(Platform.OS === 'web' ? { wordBreak: 'break-word' } : {}) as any 
            }}>
                {parts.map((p, i) =>
                    p.startsWith("**") && p.endsWith("**")
                        ? <Text key={i} style={{ fontWeight: "bold" }}>{p.slice(2, -2)}</Text>
                        : <Text key={i}>{p}</Text>
                )}
            </Text>
        </View>
    );
}

/* ═══════════════════════════════════════════════════════════════
   TRIP BOOKING CARD
═══════════════════════════════════════════════════════════════ */
function TripCard({ trip, onSelect, isDark }: { trip: TripOption; onSelect: (t: TripOption) => void; isDark: boolean }) {
    const avail = trip.capacity - trip.soldSeats;
    const status = avail > 5 ? "#22c55e" : avail > 2 ? "#f59e0b" : "#ef4444";

    // Colores dinámicos
    const bgColor = isDark ? "#111b21" : "white";
    const bgPressed = isDark ? "#202c33" : "#eff6ff";
    const borderColor = isDark ? "#202c33" : "#dbeafe";
    const titleColor = isDark ? "#38bdf8" : "#1e3a8a";
    const textColor = isDark ? "#8696a0" : "#64748b";

    return (
        <Pressable
            onPress={() => onSelect(trip)}
            style={({ pressed }) => ({
                backgroundColor: pressed ? bgPressed : bgColor,
                borderRadius: 16, borderWidth: 1.5, borderColor: borderColor,
                padding: 12, marginBottom: 8, marginRight: 4,
                shadowColor: "#000", shadowOpacity: isDark ? 0.3 : 0.04, shadowRadius: 6, elevation: 1,
            })}
        >
            <Text style={{ fontSize: 13, fontWeight: "800", color: titleColor }}>{trip.origin} → {trip.destination}</Text>
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 6, gap: 12 }}>
                <Text style={{ fontSize: 12, color: textColor }}>🕐 {trip.time}</Text>
                <Text style={{ fontSize: 12, fontWeight: "700", color: titleColor }}>💰 ${trip.price.toLocaleString()}</Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                    <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: status }} />
                    <Text style={{ fontSize: 11, color: status, fontWeight: "700" }}>{avail} cupos</Text>
                </View>
            </View>
            <Text style={{ fontSize: 10, color: textColor, marginTop: 4 }}>{trip.company}</Text>
        </Pressable>
    );
}

/* ═══════════════════════════════════════════════════════════════
   MESSAGE BUBBLE
═══════════════════════════════════════════════════════════════ */
function Bubble({ msg, onQuickReply, onTripSelect }: {
    msg: Message;
    onQuickReply: (t: string) => void;
    onTripSelect: (t: TripOption) => void;
}) {
    const isDark = useColorScheme() === "dark";
    const anim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.spring(anim, { toValue: 1, tension: 60, friction: 9, useNativeDriver: true }).start();
    }, []);

    const isBot = msg.role === "bot";

    // Colores dinámicos
    const botBubbleColor = isDark ? "#202c33" : "white";
    const userBubbleColors: readonly [string, string, ...string[]] = isDark
        ? (msg.isVoice ? ["#005c4b", "#005c4b"] : ["#005c4b", "#005c4b"])
        : (msg.isVoice ? ["#7c3aed", "#4f46e5"] : ["#1e3a8a", "#2563eb"]);
    const timeColor = isDark ? "#8696a0" : "#94a3b8";

    const qrBgColor = isDark ? "#111b21" : "#eff6ff";
    const qrBorderColor = isDark ? "#374151" : "#bfdbfe";
    const qrTextColor = isDark ? "#38bdf8" : "#1d4ed8";

    return (
        <Animated.View style={{
            opacity: anim,
            transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }],
            marginBottom: 10, paddingHorizontal: 12,
            alignItems: isBot ? "flex-start" : "flex-end",
        }}>
            <View style={{ flexDirection: isBot ? "row" : "row-reverse", alignItems: "flex-end", maxWidth: "88%" }}>
                {isBot && (
                    <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: isDark ? "#0284c7" : "#1e3a8a", justifyContent: "center", alignItems: "center", marginRight: 8, marginBottom: 2 }}>
                        <Bot size={17} color="white" />
                    </View>
                )}
                <View style={{ flex: 1 }}>
                    {isBot ? (
                        <View style={{ backgroundColor: botBubbleColor, borderRadius: 18, borderBottomLeftRadius: 4, paddingHorizontal: 14, paddingVertical: 10, shadowColor: "#000", shadowOpacity: isDark ? 0.3 : 0.05, shadowRadius: 3, elevation: 1, flexShrink: 1 }}>
                            <BotText text={msg.text} isDark={isDark} />
                        </View>
                    ) : (
                        <LinearGradient
                            colors={userBubbleColors}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                            style={{ borderRadius: 18, borderBottomRightRadius: 4, paddingHorizontal: 14, paddingVertical: 10, shadowColor: "#000", shadowOpacity: isDark ? 0.3 : 0.1, shadowRadius: 3, elevation: 1, flexShrink: 1 }}
                        >
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flexShrink: 1 }}>
                                {msg.isVoice && <Mic size={12} color="rgba(255,255,255,0.8)" />}
                                <BotText text={msg.text} white />
                            </View>
                        </LinearGradient>
                    )}

                    <Text style={{ fontSize: 10, color: timeColor, marginTop: 4, textAlign: isBot ? "left" : "right", marginHorizontal: 2 }}>
                        {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        {!isBot && isDark && " ✓✓"}
                    </Text>

                    {/* Trip booking cards */}
                    {isBot && msg.tripOptions && msg.tripOptions.length > 0 && (
                        <View style={{ marginTop: 8 }}>
                            {msg.tripOptions.map(t => (
                                <TripCard key={t.id} trip={t} onSelect={onTripSelect} isDark={isDark} />
                            ))}
                        </View>
                    )}

                    {/* Quick replies */}
                    {isBot && msg.quickReplies && msg.quickReplies.length > 0 && (
                        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                            {msg.quickReplies.map(q => (
                                <TouchableOpacity
                                    key={q} onPress={() => onQuickReply(q)}
                                    style={{ backgroundColor: qrBgColor, borderWidth: 1, borderColor: qrBorderColor, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 }}
                                >
                                    <Text style={{ fontSize: 12, color: qrTextColor, fontWeight: "bold" }}>{q}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>
            </View>
        </Animated.View>
    );
}

/* ═══════════════════════════════════════════════════════════════
   MIC BUTTON
═══════════════════════════════════════════════════════════════ */
function MicButton({ onVoiceMessage }: { onVoiceMessage: (text: string) => void }) {
    const [recording, setRecording] = useState(false);
    const [rec, setRec] = useState<Audio.Recording | null>(null);
    const pulseAnim = useRef(new Animated.Value(1)).current;

    const startPulse = () => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.3, duration: 500, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1.0, duration: 500, useNativeDriver: true }),
            ])
        ).start();
    };
    const stopPulse = () => { pulseAnim.stopAnimation(); pulseAnim.setValue(1); };

    const startRecording = async () => {
        try {
            const { granted } = await Audio.requestPermissionsAsync();
            if (!granted) return;
            await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
            const { recording: r } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
            setRec(r);
            setRecording(true);
            startPulse();
        } catch { }
    };

    const stopRecording = async () => {
        try {
            stopPulse();
            setRecording(false);
            if (!rec) return;
            await rec.stopAndUnloadAsync();
            setRec(null);
            // For now, trigger a voice placeholder message (n8n transcription hook goes here)
            onVoiceMessage(pick(PHRASES.voiceReceived));
        } catch { setRecording(false); }
    };

    return (
        <TouchableOpacity
            onPressIn={startRecording}
            onPressOut={stopRecording}
            style={{ width: 44, height: 44, borderRadius: 22, overflow: "hidden" }}
        >
            <Animated.View style={{ transform: [{ scale: pulseAnim }], flex: 1 }}>
                <LinearGradient
                    colors={recording ? ["#7c3aed", "#4f46e5"] : ["#475569", "#64748b"]}
                    style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
                >
                    {recording ? <MicOff size={18} color="white" /> : <Mic size={18} color="white" />}
                </LinearGradient>
            </Animated.View>
        </TouchableOpacity>
    );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN SCREEN
═══════════════════════════════════════════════════════════════ */
const WELCOME: Message = {
    id: "welcome",
    role: "bot",
    text: pick(["¡Hola! 👋 Soy **NauticBot**, tu asistente para viajes acuáticos.\n\nPuedo darte información sobre rutas, precios, horarios y también **reservar tu viaje aquí mismo**. ¿En qué te ayudo?",
        "¡Bienvenido/a a bordo! ⚓ Soy **NauticBot**.\n\nConsulta rutas, precios, horarios o **reserva un viaje** directamente desde el chat. ¿Qué necesitas?"]),
    timestamp: new Date(),
    quickReplies: ["🛥️ Viajes disponibles", "🎟️ Reservar viaje", "💰 Precios", "📅 Horarios"],
};

export default function NauticBotScreen() {
    const navigation = useNavigation<any>();
    const { user } = useAuth();
    const flatListRef = useRef<FlatList>(null);

    const [messages, setMessages] = useState<Message[]>([WELCOME]);
    const [input, setInput] = useState("");
    const [typing, setTyping] = useState(false);
    const [ttsEnabled, setTtsEnabled] = useState(false);

    const botStateRef = useRef<BotState>({
        bookingStep: "idle",
        tripOptions: [],
        selectedTrip: null,
    });

    const speak = (text: string) => {
        if (!ttsEnabled) return;
        const clean = text.replace(/\*\*/g, "").replace(/[🛥️🎟️💰📅⚓🌊⛵🗺️🪑🔍⏳🤿🎉🕐🟢🟡🔴🎙️✅🎊🏠]/gu, "");
        Speech.speak(clean, { language: "es-CO", rate: 0.92, pitch: 1.05 });
    };

    const addBotMessage = (msg: Partial<Message>) => {
        const full: Message = {
            id: Date.now().toString(),
            role: "bot",
            text: "",
            timestamp: new Date(),
            ...msg,
        };
        setMessages(prev => [...prev, full]);
        if (full.text) speak(full.text);
    };

    const send = useCallback(async (text: string, isVoiceBot?: boolean) => {
        const trimmed = text.trim();
        if (!trimmed || typing) return;

        Keyboard.dismiss();
        setInput("");

        if (!isVoiceBot) {
            const userMsg: Message = {
                id: Date.now().toString(),
                role: "user",
                text: trimmed,
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, userMsg]);
        }

        setTyping(true);

        const delay = 600 + Math.random() * 800 + Math.min(trimmed.length * 8, 600);
        await new Promise(r => setTimeout(r, delay));

        const intent = detectIntent(trimmed, botStateRef.current.bookingStep);
        const { text: botText, quickReplies, tripOptions, newState } = await generateResponse(
            intent,
            botStateRef.current,
            user || {}, // Passing the full user object to the bot instead of just userId
        );

        if (newState) {
            botStateRef.current = { ...botStateRef.current, ...newState };
        }

        addBotMessage({ text: botText, quickReplies, tripOptions });
        setTyping(false);

        // Si eligió comprar ahora, después del mensaje lo mandamos a SeatSelection
        if (intent === "booking_buy_now" && botText.includes("pantalla de pago")) {
            setTimeout(() => {
                navigation.navigate("SeatSelection", { tripId: botStateRef.current.selectedTrip?.id || "" });
            }, 2500);
        }
    }, [typing, ttsEnabled]);

    // When user taps a trip card → auto-select it
    const handleTripSelect = useCallback((trip: TripOption) => {
        botStateRef.current = { ...botStateRef.current, selectedTrip: trip, bookingStep: "confirm" };
        const userMsg: Message = {
            id: Date.now().toString(),
            role: "user",
            text: `Seleccioné: ${trip.origin} → ${trip.destination} a las ${trip.time}`,
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, userMsg]);

        setTimeout(async () => {
            setTyping(true);
            await new Promise(r => setTimeout(r, 700));
            addBotMessage({
                text: `Perfecto ✨\n\n🛥️ **${trip.origin} → ${trip.destination}**\n🕐 Salida: ${trip.time}\n💰 Precio: $${trip.price.toLocaleString()}\n🪑 Cupos disponibles: ${trip.capacity - trip.soldSeats}\n🏢 Empresa: ${trip.company}\n\nSelecciona cómo deseas proceder:`,
                quickReplies: ["💵 Pagar al abordar", "💳 Comprar tiquete", "❌ Cancelar"],
            });
            setTyping(false);
        }, 200);
    }, [ttsEnabled]);

    // Voice: bot received note, post as a bot-side reply
    const handleVoiceMessage = useCallback((text: string) => {
        const voiceUserMsg: Message = {
            id: Date.now().toString(),
            role: "user",
            text: "🎙️ Nota de voz enviada",
            timestamp: new Date(),
            isVoice: true,
        };
        setMessages(prev => [...prev, voiceUserMsg]);
        setTimeout(async () => {
            setTyping(true);
            await new Promise(r => setTimeout(r, 900));
            addBotMessage({ text, quickReplies: ["🛥️ Viajes", "🎟️ Reservar", "💰 Precios"] });
            setTyping(false);
        }, 300);
    }, [ttsEnabled]);

    useEffect(() => {
        if (messages.length > 0) {
            setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 120);
        }
    }, [messages, typing]);

    // Stop TTS on unmount
    useEffect(() => () => { Speech.stop(); }, []);

    const isDark = useColorScheme() === "dark";

    // Global colors
    const bgContainer = isDark ? "#0b141a" : "#efeae2";
    const headerGradient: readonly [string, string, ...string[]] = isDark ? ["#202c33", "#111b21", "#111b21"] : ["#0f172a", "#1e3a8a", "#1d4ed8"];
    const inputBarBg = isDark ? "#202c33" : "#f0f2f5";
    const inputAreaBg = isDark ? "#2a3942" : "white";
    const inputTextColor = isDark ? "#d1d5db" : "#111827";
    const outlineColor = isDark ? "transparent" : "#e2e8f0";

    return (
        <ImageBackground
            source={require("../assets/bot_bg.png")}
            style={{ flex: 1, overflow: 'hidden' }}
            resizeMode="cover"
        >
            {/* Overlay de color sobre el fondo */}
            <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: isDark ? "rgba(11,20,26,0.88)" : "rgba(239,234,226,0.88)" }} />

            <StatusBar barStyle="light-content" />

            {/* ── Header ── */}
            <LinearGradient
                colors={headerGradient}
                start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
                style={{ paddingTop: Platform.OS === "ios" ? 56 : 48, paddingBottom: 16, paddingHorizontal: 16, elevation: 4 }}
            >
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4, alignSelf: "flex-start", marginBottom: 12 }}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
                </TouchableOpacity>

                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                        <View>
                            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: isDark ? "#0284c7" : "rgba(255,255,255,0.15)", justifyContent: "center", alignItems: "center" }}>
                                <Bot size={24} color="white" />
                            </View>
                            <View style={{ position: "absolute", bottom: 0, right: 0, width: 12, height: 12, borderRadius: 6, backgroundColor: "#22c55e", borderWidth: 2, borderColor: isDark ? "#202c33" : "#1e3a8a" }} />
                        </View>
                        <View>
                            <Text style={{ color: "white", fontWeight: "bold", fontSize: 18 }}>NauticBot</Text>
                            <Text style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, marginTop: 1 }}>Asistente virtual</Text>
                        </View>
                    </View>
                    <View style={{ flexDirection: "row", gap: 8 }}>
                        {/* TTS toggle */}
                        <TouchableOpacity
                            onPress={() => { setTtsEnabled(p => !p); Speech.stop(); }}
                            style={{ width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center" }}
                        >
                            {ttsEnabled ? <Volume2 size={22} color="white" /> : <VolumeX size={22} color="rgba(255,255,255,0.5)" />}
                        </TouchableOpacity>
                    </View>
                </View>
            </LinearGradient>

            {/* ── Chat ── */}
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={m => m.id}
                    renderItem={({ item }) => (
                        <Bubble msg={item} onQuickReply={send} onTripSelect={handleTripSelect} />
                    )}
                    contentContainerStyle={{ paddingTop: 16, paddingBottom: 16 }}
                    showsVerticalScrollIndicator={false}
                    ListFooterComponent={typing ? <BotTyping /> : null}
                    style={{ flex: 1 }}
                />

                {/* ── Input bar ── */}
                <View style={{
                    flexDirection: "row", alignItems: "flex-end",
                    paddingHorizontal: 10, paddingVertical: 10,
                    backgroundColor: inputBarBg, gap: 8,
                }}>
                    <View style={{
                        flex: 1, backgroundColor: inputAreaBg, borderRadius: 24,
                        paddingHorizontal: 16, paddingVertical: Platform.OS === 'ios' ? 12 : 8, minHeight: 48,
                        flexDirection: "row", alignItems: "center",
                        shadowColor: "#000", shadowOpacity: isDark ? 0 : 0.05, shadowRadius: 4, elevation: 1
                    }}>
                        <TextInput
                            value={input}
                            onChangeText={setInput}
                            placeholder="Escribe un mensaje..."
                            placeholderTextColor={isDark ? "#8696a0" : "#94a3b8"}
                            style={[
                                { fontSize: 15, color: inputTextColor, maxHeight: 120, flex: 1 },
                                Platform.OS === 'web' ? { outlineStyle: 'none' } as any : {},
                            ]}
                            cursorColor={isDark ? "#00a884" : "#2563eb"}
                            selectionColor={isDark ? "rgba(0,168,132,0.3)" : "rgba(37,99,235,0.3)"}
                            multiline
                            returnKeyType="send"
                            onSubmitEditing={() => { if (input.trim()) send(input); }}
                            blurOnSubmit={false}
                        />
                    </View>

                    {/* Botón enviar interactivo o Mic */}
                    {input.trim() ? (
                        <TouchableOpacity
                            onPress={() => { if (input.trim()) send(input); }}
                            style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: isDark ? "#00a884" : "#2563eb", justifyContent: "center", alignItems: "center", elevation: 2 }}
                        >
                            <Send size={20} color="white" style={{ marginLeft: -2 }} />
                        </TouchableOpacity>
                    ) : (
                        <View style={{ transform: [{ scale: 1.05 }] }}>
                            <MicButton onVoiceMessage={handleVoiceMessage} />
                        </View>
                    )}
                </View>
            </KeyboardAvoidingView>
        </ImageBackground>
    );
}
