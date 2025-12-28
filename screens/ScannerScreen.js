import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Vibration } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useNavigation } from "@react-navigation/native";

// validação de ISBN-13
const isValidIsbn13 = (code) => {
    if (!/^\d{13}$/.test(code)) return false;
    const digits = code.split("").map(Number);
    const sum = digits
        .slice(0, 12)
        .reduce((acc, d, i) => acc + d * (i % 2 === 0 ? 1 : 3), 0);
    const check = (10 - (sum % 10)) % 10;
    return check === digits[12];
};

export default function ScannerScreen({ route }) {
    const [permission, requestPermission] = useCameraPermissions();
    const navigation = useNavigation();
    const lockRef = useRef(false);

    useEffect(() => {
        if (!permission) requestPermission();
    }, [permission]);

    if (!permission)
        return <Text style={styles.status}>Solicitando permissão…</Text>;
    if (!permission.granted)
        return <Text style={styles.status}>Sem acesso à câmara</Text>;

    const onBarcodeScanned = ({ data }) => {
        if (lockRef.current) return;
        // só ISBN-13 (EAN-13) iniciados por 978/979
        if (!/^(978|979)\d{10}$/.test(data) || !isValidIsbn13(data)) return;

        lockRef.current = true;
        Vibration.vibrate(50);

        // reenviar também o libraryId e libraryBooks recebidos
        navigation.navigate({
            name: "LoadBook",
            params: {
                isbn: data,
                fromScanner: true,
                libraryId: route?.params?.libraryId ?? null,
                libraryBooks: route?.params?.libraryBooks ?? [],
            },
            merge: true, // preserva qualquer param que já exista
        });

        setTimeout(() => (lockRef.current = false), 1000);
    };

    return (
        <View style={styles.container}>
            <View style={styles.scannerBox}>
                <CameraView
                    style={StyleSheet.absoluteFillObject}
                    facing="back"
                    barcodeScannerSettings={{ barcodeTypes: ["ean13"] }}
                    onBarcodeScanned={onBarcodeScanned}
                />
                <View style={styles.overlay}>
                    <Text style={styles.instructions}>
                        Aponte a câmara para o ISBN (EAN-13)
                    </Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    status: {
        flex: 1,
        color: "#fff",
        backgroundColor: "#000",
        textAlign: "center",
        paddingTop: 40,
    },
    container: { flex: 1, backgroundColor: "#000" },
    scannerBox: { flex: 1, overflow: "hidden" },
    overlay: {
        position: "absolute",
        top: 40,
        alignSelf: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 8,
    },
    instructions: { color: "#fff", fontSize: 16 },
});