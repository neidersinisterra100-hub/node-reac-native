import { useEffect, useMemo, useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import { Text, Snackbar } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";

import { mobilityServices } from "../../data/mobilityServices";
import { MunicipalitySelector } from "../../components/home/MunicipalitySelector";
import { useMunicipalityDetection } from "../../hooks/useMunicipalityDetection";
import { useMobilityStore } from "../../store/mobilityStore";
import { MunicipalityCatalogItem } from "../../data/municipalityCatalog";

export default function ModularHomeScreen() {
  const navigation = useNavigation<any>();
  const [selectorVisible, setSelectorVisible] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const municipalityId = useMobilityStore((state) => state.municipalityId);
  const municipalityName = useMobilityStore((state) => state.municipalityName);
  const isManualSelectionRequired = useMobilityStore(
    (state) => state.isManualSelectionRequired
  );
  const setMunicipality = useMobilityStore((state) => state.setMunicipality);
  const setSelectedService = useMobilityStore((state) => state.setSelectedService);

  const { status } = useMunicipalityDetection();

  useEffect(() => {
    if (isManualSelectionRequired && !municipalityId) {
      setSelectorVisible(true);
    }
  }, [isManualSelectionRequired, municipalityId]);

  const subtitle = useMemo(() => {
    if (status === "loading") return "Detectando municipio por geolocalizacion...";
    if (!municipalityName) return "Selecciona tu municipio para continuar";
    return municipalityName;
  }, [municipalityName, status]);

  const handleMunicipalitySelect = (municipality: MunicipalityCatalogItem) => {
    setMunicipality({ id: municipality.id, name: municipality.name });
    setSelectedService(null);
  };

  const handleServicePress = (serviceId: string) => {
    const service = mobilityServices.find((item) => item.id === serviceId);
    if (!service) return;

    setSelectedService(service.id);

    if (!service.enabled || !service.routeName) {
      setSnackbarVisible(true);
      return;
    }

    navigation.navigate(service.routeName);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerLabel}>Municipio actual</Text>
          <Text style={styles.headerMunicipality}>{subtitle}</Text>
        </View>

        <TouchableOpacity
          style={styles.changeButton}
          onPress={() => setSelectorVisible(true)}
          accessibilityRole="button"
          accessibilityLabel="Cambiar municipio"
        >
          <Text style={styles.changeButtonText}>Cambiar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {mobilityServices.map((service) => (
          <TouchableOpacity
            key={service.id}
            style={[styles.serviceCard, !service.enabled && styles.serviceDisabled]}
            activeOpacity={0.85}
            onPress={() => handleServicePress(service.id)}
            accessibilityRole="button"
            accessibilityState={{ disabled: !service.enabled }}
          >
            <View style={styles.cardTopRow}>
              <Text style={styles.serviceTitle}>
                {service.emoji} {service.title}
              </Text>
              {!service.enabled && <Text style={styles.badge}>Proximamente</Text>}
            </View>
            <Text style={styles.serviceDescription}>{service.description}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <MunicipalitySelector
        visible={selectorVisible}
        currentMunicipalityId={municipalityId}
        onClose={() => setSelectorVisible(false)}
        onSelect={handleMunicipalitySelect}
      />

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={1800}
      >
        Proximamente disponible
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    backgroundColor: "#0B4F9C",
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingHorizontal: 18,
    paddingTop: 56,
    paddingBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLabel: {
    fontSize: 12,
    color: "#DBEAFE",
    fontWeight: "500",
  },
  headerMunicipality: {
    marginTop: 4,
    fontSize: 17,
    color: "#FFFFFF",
    fontWeight: "700",
    maxWidth: 220,
  },
  changeButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  changeButtonText: {
    color: "#0B4F9C",
    fontSize: 14,
    fontWeight: "700",
  },
  content: {
    padding: 18,
    gap: 14,
  },
  serviceCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  serviceDisabled: {
    opacity: 0.7,
    backgroundColor: "#F1F5F9",
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  serviceTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
  },
  badge: {
    fontSize: 11,
    fontWeight: "700",
    color: "#7C2D12",
    backgroundColor: "#FFEDD5",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    overflow: "hidden",
  },
  serviceDescription: {
    fontSize: 14,
    color: "#475569",
    fontWeight: "500",
  },
});
