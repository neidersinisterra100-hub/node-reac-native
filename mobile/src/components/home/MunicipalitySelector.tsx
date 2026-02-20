import { useMemo } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Text } from "react-native-paper";
import {
  MUNICIPALITY_CATALOG,
  MunicipalityCatalogItem,
} from "../../data/municipalityCatalog";

type MunicipalitySelectorProps = {
  visible: boolean;
  currentMunicipalityId: string | null;
  onClose: () => void;
  onSelect: (municipality: MunicipalityCatalogItem) => void;
};

export function MunicipalitySelector({
  visible,
  currentMunicipalityId,
  onClose,
  onSelect,
}: MunicipalitySelectorProps) {
  const municipalities = useMemo(() => MUNICIPALITY_CATALOG, []);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <Text style={styles.title}>Selecciona tu municipio</Text>
          <ScrollView contentContainerStyle={styles.content}>
            {municipalities.map((municipality) => {
              const active = municipality.id === currentMunicipalityId;
              return (
                <TouchableOpacity
                  key={municipality.id}
                  style={[styles.item, active && styles.itemActive]}
                  activeOpacity={0.8}
                  onPress={() => {
                    onSelect(municipality);
                    onClose();
                  }}
                >
                  <Text style={[styles.itemLabel, active && styles.itemLabelActive]}>
                    {municipality.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(2, 6, 23, 0.35)",
  },
  backdrop: {
    flex: 1,
  },
  sheet: {
    maxHeight: "70%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0B1E35",
    marginBottom: 12,
  },
  content: {
    gap: 10,
  },
  item: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#F8FAFC",
  },
  itemActive: {
    borderColor: "#0B4F9C",
    backgroundColor: "#E8F1FB",
  },
  itemLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#334155",
  },
  itemLabelActive: {
    color: "#0B4F9C",
  },
});
