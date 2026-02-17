import React from "react";
import { View, ScrollView, TouchableOpacity } from "react-native";
import { Text, Divider } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";

export default function CompanyLegalInfoScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { company } = route.params;

  /* =========================
     CHECK ITEM
  ========================= */
  const CheckItem = ({
    label,
    value,
  }: {
    label: string;
    value: boolean;
  }) => {
    const isOk = Boolean(value);

    return (
      <View className="flex-row items-center py-3">
        <View
          className={`w-10 h-10 rounded-xl items-center justify-center mr-4
            ${isOk ? "bg-green-100" : "bg-red-100"}
          `}
        >
          <MaterialCommunityIcons
            name={isOk ? "check-decagram" : "alert-circle-outline"}
            size={22}
            color={isOk ? "#16a34a" : "#dc2626"}
          />
        </View>

        <View className="flex-1">
          <Text className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            {label}
          </Text>
          <Text
            className={`text-xs mt-1
              ${isOk ? "text-green-600" : "text-red-600"}
            `}
          >
            {isOk
              ? "Verificado y vigente"
              : "Pendiente de verificación"}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950">
      {/* ================= HEADER ================= */}
      <View className="bg-nautic-primary dark:bg-slate-900 pt-14 pb-8 px-5 rounded-b-3xl">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="mb-4"
        >
          <Text className="text-white">← Volver</Text>
        </TouchableOpacity>

        <View className="items-center">
          <MaterialCommunityIcons
            name="shield-check"
            size={48}
            color="white"
          />
          <Text className="text-xl font-bold text-white mt-3 text-center">
            {company.name}
          </Text>
          <Text className="text-sm text-white/80 mt-1">
            Información legal y cumplimiento
          </Text>
        </View>
      </View>

      <ScrollView
        className="px-5"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ================= STATUS CARD ================= */}
        <View
          className={`mt-6 p-4 rounded-xl border-l-4
            ${
              company.isVerified
                ? "border-green-600 bg-white dark:bg-slate-900"
                : "border-amber-500 bg-white dark:bg-slate-900"
            }
          `}
        >
          <Text
            className={`font-bold text-sm mb-1
              ${
                company.isVerified
                  ? "text-green-600"
                  : "text-amber-500"
              }
            `}
          >
            {company.isVerified
              ? "EMPRESA VERIFICADA"
              : "VERIFICACIÓN EN PROCESO"}
          </Text>

          <Text className="text-sm text-slate-600 dark:text-slate-300">
            {company.isVerified
              ? "Esta empresa cumple con los requisitos legales para operar transporte fluvial."
              : "Esta empresa aún tiene documentos pendientes de validación."}
          </Text>
        </View>

        {/* ================= DOCUMENTACIÓN ================= */}
        <Text className="mt-8 mb-3 text-lg font-bold text-slate-800 dark:text-slate-100">
          Documentación legal
        </Text>

        <View className="bg-white dark:bg-slate-900 rounded-2xl p-4 mb-6 shadow-sm">
          <CheckItem
            label="Constitución legal (Cámara / RUT)"
            value={company.compliance?.hasLegalConstitution}
          />
          <Divider />
          <CheckItem
            label="Habilitación de transporte"
            value={company.compliance?.hasTransportLicense}
          />
          <Divider />
          <CheckItem
            label="Seguros de responsabilidad"
            value={company.compliance?.hasInsurance}
          />
        </View>

        {/* ================= SEGURIDAD ================= */}
        <Text className="mb-3 text-lg font-bold text-slate-800 dark:text-slate-100">
          Seguridad operacional
        </Text>

        <View className="bg-white dark:bg-slate-900 rounded-2xl p-4 mb-6 shadow-sm">
          <CheckItem
            label="Matrícula de embarcaciones"
            value={company.compliance?.hasVesselRegistration}
          />
          <Divider />
          <CheckItem
            label="Licencias de tripulación"
            value={company.compliance?.hasCrewLicenses}
          />
          <Divider />
          <CheckItem
            label="Protocolos de seguridad"
            value={company.compliance?.hasSafetyProtocols}
          />
        </View>

        {/* ================= EXTRA INFO ================= */}
        <View className="bg-slate-100 dark:bg-slate-800 rounded-xl p-4">
          <Text className="text-xs font-semibold text-slate-500 uppercase">
            NIT
          </Text>
          <Text className="text-base font-medium text-slate-800 dark:text-slate-100">
            {company.nit || "No registrado"}
          </Text>

          <View className="h-3" />

          <Text className="text-xs font-semibold text-slate-500 uppercase">
            Representante legal
          </Text>
          <Text className="text-base font-medium text-slate-800 dark:text-slate-100">
            {company.legalRepresentative || "No registrado"}
          </Text>

          {company.licenseNumber && (
            <>
              <View className="h-3" />
              <Text className="text-xs font-semibold text-slate-500 uppercase">
                Licencia / habilitación
              </Text>
              <Text className="text-base font-medium text-slate-800 dark:text-slate-100">
                {company.licenseNumber}
              </Text>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}



// import React from 'react';
// import { View, ScrollView, StyleSheet } from 'react-native';
// import { Text, Divider, Button } from 'react-native-paper';
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import { useNavigation, useRoute } from '@react-navigation/native';
// import { colors } from '../theme/colors';

// export default function CompanyLegalInfoScreen() {
//     const navigation = useNavigation();
//     const route = useRoute<any>();
//     const { company } = route.params; // Recibimos el objeto company completo

//     const renderCheckItem = (label: string, value: boolean, icon: any) => (
//         <View style={styles.itemRow}>
//             <View style={[styles.iconBox, { backgroundColor: value ? '#dcfce7' : '#fee2e2' }]}>
//                 <MaterialCommunityIcons 
//                     name={value ? "check-decagram" : "alert-circle-outline"} 
//                     size={24} 
//                     color={value ? "#16a34a" : "#dc2626"} 
//                 />
//             </View>
//             <View style={{ flex: 1 }}>
//                 <Text style={styles.itemLabel}>{label}</Text>
//                 <Text style={[styles.itemStatus, { color: value ? "#16a34a" : "#dc2626" }]}>
//                     {value ? "Verificado y Vigente" : "Pendiente de Verificación"}
//                 </Text>
//             </View>
//         </View>
//     );

//     return (
//         <View style={styles.container}>
//             {/* Header */}
//             <View style={styles.header}>
//                 <Button 
//                     icon="arrow-left" 
//                     mode="text" 
//                     textColor="white" 
//                     onPress={() => navigation.goBack()}
//                     style={{ alignSelf: 'flex-start', marginLeft: -10 }}
//                 >
//                     Volver
//                 </Button>
//                 <View style={styles.headerContent}>
//                     <MaterialCommunityIcons name="shield-check" size={48} color="white" />
//                     <Text style={styles.companyName}>{company.name}</Text>
//                     <Text style={styles.subtitle}>Información Legal y Cumplimiento</Text>
//                 </View>
//             </View>

//             <ScrollView contentContainerStyle={styles.content}>
                
//                 {/* Resumen de Estado */}
//                 <View style={[styles.statusCard, { borderColor: company.isVerified ? '#16a34a' : '#f59e0b' }]}>
//                     <Text style={[styles.statusTitle, { color: company.isVerified ? '#16a34a' : '#f59e0b' }]}>
//                         {company.isVerified ? "EMPRESA VERIFICADA" : "VERIFICACIÓN EN PROCESO"}
//                     </Text>
//                     <Text style={styles.statusDesc}>
//                         {company.isVerified 
//                             ? "Esta empresa cumple con los requisitos legales para operar transporte marítimo/fluvial."
//                             : "Esta empresa aún tiene documentos pendientes de validación."}
//                     </Text>
//                 </View>

//                 <Text style={styles.sectionTitle}>Documentación Legal</Text>
                
//                 <View style={styles.card}>
//                     {renderCheckItem("Constitución Legal (Cámara de Comercio / RUT)", company.compliance?.hasLegalConstitution, "file-document-outline")}
//                     <Divider style={styles.divider} />
//                     {renderCheckItem("Habilitación de Transporte (Dimar / MinTransporte)", company.compliance?.hasTransportLicense, "license")}
//                     <Divider style={styles.divider} />
//                     {renderCheckItem("Seguros de Responsabilidad Civil y Pasajeros", company.compliance?.hasInsurance, "shield-account")}
//                 </View>

//                 <Text style={styles.sectionTitle}>Seguridad Operacional</Text>

//                 <View style={styles.card}>
//                     {renderCheckItem("Matrícula de Embarcaciones", company.compliance?.hasVesselRegistration, "ferry")}
//                     <Divider style={styles.divider} />
//                     {renderCheckItem("Licencias de Tripulación (Capitanes)", company.compliance?.hasCrewLicenses, "account-tie-hat")}
//                     <Divider style={styles.divider} />
//                     {renderCheckItem("Protocolos de Seguridad (Chalecos, Extintores)", company.compliance?.hasSafetyProtocols, "lifebuoy")}
//                 </View>

//                 {/* Información Adicional */}
//                 <View style={styles.infoBox}>
//                     <Text style={styles.infoLabel}>NIT:</Text>
//                     <Text style={styles.infoValue}>{company.nit || "No registrado"}</Text>
                    
//                     <View style={{ height: 10 }} />
                    
//                     <Text style={styles.infoLabel}>Representante Legal:</Text>
//                     <Text style={styles.infoValue}>{company.legalRepresentative || "No registrado"}</Text>

//                     {company.licenseNumber && (
//                         <>
//                             <View style={{ height: 10 }} />
//                             <Text style={styles.infoLabel}>Licencia / Habilitación:</Text>
//                             <Text style={styles.infoValue}>{company.licenseNumber}</Text>
//                         </>
//                     )}
//                 </View>

//                 <View style={{ height: 40 }} />
//             </ScrollView>
//         </View>
//     );
// }

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: '#f8fafc',
//     },
//     header: {
//         backgroundColor: colors.primary,
//         paddingTop: 50,
//         paddingBottom: 30,
//         paddingHorizontal: 20,
//         borderBottomRightRadius: 30,
//         borderBottomLeftRadius: 30,
//     },
//     headerContent: {
//         alignItems: 'center',
//         marginTop: 10,
//     },
//     companyName: {
//         fontSize: 22,
//         fontWeight: 'bold',
//         color: 'white',
//         marginTop: 10,
//         textAlign: 'center',
//     },
//     subtitle: {
//         color: 'rgba(255,255,255,0.8)',
//         fontSize: 14,
//         marginTop: 4,
//     },
//     content: {
//         padding: 20,
//     },
//     statusCard: {
//         backgroundColor: 'white',
//         padding: 16,
//         borderRadius: 12,
//         borderLeftWidth: 5,
//         marginBottom: 24,
//         elevation: 2,
//     },
//     statusTitle: {
//         fontWeight: 'bold',
//         fontSize: 16,
//         marginBottom: 4,
//     },
//     statusDesc: {
//         color: '#64748b',
//         fontSize: 14,
//         lineHeight: 20,
//     },
//     sectionTitle: {
//         fontSize: 18,
//         fontWeight: 'bold',
//         color: '#334155',
//         marginBottom: 12,
//         marginLeft: 4,
//     },
//     card: {
//         backgroundColor: 'white',
//         borderRadius: 16,
//         padding: 16,
//         marginBottom: 24,
//         elevation: 1,
//         shadowColor: '#000',
//         shadowOpacity: 0.05,
//         shadowRadius: 5,
//     },
//     itemRow: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         paddingVertical: 8,
//     },
//     iconBox: {
//         width: 40,
//         height: 40,
//         borderRadius: 10,
//         justifyContent: 'center',
//         alignItems: 'center',
//         marginRight: 16,
//     },
//     itemLabel: {
//         fontSize: 15,
//         fontWeight: '600',
//         color: '#1e293b',
//     },
//     itemStatus: {
//         fontSize: 12,
//         marginTop: 2,
//     },
//     divider: {
//         marginVertical: 12,
//         backgroundColor: '#f1f5f9',
//     },
//     infoBox: {
//         backgroundColor: '#f1f5f9',
//         padding: 16,
//         borderRadius: 12,
//     },
//     infoLabel: {
//         fontSize: 12,
//         color: '#64748b',
//         fontWeight: '600',
//         textTransform: 'uppercase',
//     },
//     infoValue: {
//         fontSize: 16,
//         color: '#334155',
//         fontWeight: '500',
//     }
// });
