import { View, StyleSheet, Share, Pressable, Platform } from "react-native";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRoute, useNavigation } from "@react-navigation/native";

import AppContainer from "../../components/ui/AppContainer";
import AppHeader from "../../components/ui/AppHeader";

import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";
import { colors } from "../../theme/colors";

import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import { useState } from "react";

export default function TicketReceiptModal() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();

  const { routeName, price, date, code } = route.params;
  const formattedPrice = Number(price).toLocaleString("es-CO");


  const [downloaded, setDownloaded] = useState(false);

  /* ================= ACTIONS ================= */

  const handleShare = async () => {
    await Share.share({
      message: `
🧾 Tiquete confirmado

Ruta: ${routeName}
Transporte: Lancha rápida
Precio: $${price}
Fecha: ${new Date(date).toLocaleString()}
Código: ${code}
      `,
    });
  };

  const handleDownload = async () => {
    const html = `
    <html>
      <body style="font-family: monospace; padding: 24px;">
        <h2>🧾 FACTURA TIQUETE</h2>
        <hr />
        <p><strong>Ruta:</strong> ${routeName}</p>
        <p><strong>Transporte:</strong> Lancha rápida</p>
        <p><strong>Precio:</strong> $${Number(price).toLocaleString("es-CO")}</p>
        <p><strong>Fecha:</strong> ${new Date(date).toLocaleString()}</p>
        <hr />
        <h3>Código</h3>
        <p style="font-size:18px;"><strong>${code}</strong></p>
      </body>
    </html>
  `;

    // ✅ WEB: DESCARGA REAL
    if (Platform.OS === "web") {
      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `factura-${code}.html`;
      a.click();

      URL.revokeObjectURL(url);
      return;
    }

    // ✅ MOBILE: PDF + GUARDAR / COMPARTIR
    const { uri } = await Print.printToFileAsync({ html });

    await Sharing.shareAsync(uri, {
      mimeType: "application/pdf",
      dialogTitle: "Descargar factura",
      UTI: "com.adobe.pdf",
    });
  };

  return (
    <AppContainer>
      {/* ❌ Header desaparece tras descargar */}
      {!downloaded && (
        <AppHeader title="Factura" hideLogo />
      )}

      <View style={styles.container}>
        {/* ✅ CHULO GRANDE */}
        <MaterialCommunityIcons
          name="check-circle"
          size={96}
          color={colors.success}
          style={{ marginBottom: spacing.md }}
        />

        <Text style={styles.success}>
          Compra confirmada
        </Text>

        {/* ===== FACTURA ===== */}
        <View style={styles.receipt}>
          <Text style={styles.route}>{routeName}</Text>
          <Text style={styles.transport}>
            Lancha rápida
          </Text>

          <View style={styles.divider} />

          <Text style={styles.label}>Precio</Text>
          <Text style={styles.value}>${formattedPrice}</Text>
          {/* <Text style={styles.value}>${price}</Text> */}
          {/* <Text style={styles.value}>
            ${Number(price).toLocaleString("es-CO")}
          </Text> */}


          <Text style={styles.label}>Fecha</Text>
          <Text style={styles.value}>
            {new Date(date).toLocaleString()}
          </Text>

          <View style={styles.divider} />

          <Text style={styles.code}>
            Código: {code}
          </Text>
        </View>

        {/* ===== BOTONES (SOLO ANTES DE DESCARGAR) ===== */}
        {!downloaded && (
          <View style={styles.actions}>
            <ActionButton
              icon="share-variant"
              label="Compartir"
              onPress={handleShare}
            />

            <ActionButton
              icon="download"
              label="Descargar"
              onPress={handleDownload}
            />

            <ActionButton
              icon="close-circle"
              label="Cerrar"
              danger
              onPress={() => navigation.goBack()}
            />
          </View>
        )}
      </View>
    </AppContainer>
  );
}

/* ================= ACTION BUTTON ================= */

function ActionButton({
  icon,
  label,
  onPress,
  danger,
}: {
  icon: any;
  label: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionButton,
        pressed && { opacity: 0.7 },
      ]}
    >
      <MaterialCommunityIcons
        name={icon}
        size={32}
        color={danger ? colors.error : colors.primary}
      />
      <Text
        style={[
          styles.actionLabel,
          danger && { color: colors.error },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    alignItems: "center",
  },

  success: {
    ...typography.title,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },

  receipt: {
    width: "100%",
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },

  route: {
    ...typography.title,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },

  transport: {
    ...typography.body,
    color: colors.primary,
    marginBottom: spacing.md,
  },

  label: {
    ...typography.label,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },

  value: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: "600",
  },

  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },

  code: {
    ...typography.body,
    fontWeight: "700",
    textAlign: "center",
    marginTop: spacing.sm,
  },

  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: spacing.sm,
  },

  actionButton: {
    alignItems: "center",
    flex: 1,
  },

  actionLabel: {
    marginTop: spacing.xs,
    fontSize: 13,
    color: colors.primary,
  },
});
