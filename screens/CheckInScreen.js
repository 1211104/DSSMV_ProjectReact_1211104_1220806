import React, { useEffect, useState, useContext } from "react";
import { View, Text, TextInput, Button, StyleSheet, ImageBackground, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback, Alert, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { initUserTable, findUserByUsername, findUserByCC } from "../database/userStore";

// Flux Imports
import { AppContext } from "../store/AppProvider";
import { checkinBookAction } from "../store/actions";

const MODES = { USER_ID: "USER_ID", CC_LOOKUP: "CC_LOOKUP" };

export default function CheckInScreen({ route }) {
    const { libraryId, book } = route.params;
    const { dispatch } = useContext(AppContext);
    const navigation = useNavigation();

    const [mode, setMode] = useState(MODES.USER_ID);
    const [userId, setUserId] = useState("");
    const [cc, setCC] = useState("");

    useEffect(() => {
        initUserTable().catch(() => {});
        AsyncStorage.getItem("userId").then((saved) => saved && setUserId(saved));
    }, []);

    const resolveUsername = async () => {
        if (mode === MODES.USER_ID) {
            if (!userId.trim()) throw new Error("Enter a User ID.");
            const u = await findUserByUsername(userId.trim());
            if (!u) throw new Error("User not found.");
            return u.username;
        } else {
            if (!cc.trim()) throw new Error("Enter CC.");
            const u = await findUserByCC(cc.trim());
            if (!u) throw new Error("No user with that CC.");
            return u.username;
        }
    };

    const handleCheckIn = async () => {
        try {
            const username = await resolveUsername();

            // Dispara a Action
            await checkinBookAction(dispatch, libraryId, book.isbn, username);

            await AsyncStorage.setItem("userId", username);
            Keyboard.dismiss();
            Alert.alert("Success", `${username} checked-in successfully.`);
            navigation.goBack();
        } catch (e) {
            console.error("Check-in error:", e);
            Alert.alert("Error", e?.message ?? "Failed to check in book.");
        }
    };

    const ModeChip = ({ label, value }) => (
        <TouchableOpacity onPress={() => setMode(value)} style={[styles.modeChip, mode === value && styles.modeChipActive]}>
            <Text style={mode === value ? styles.modeTextActive : styles.modeText}>{label}</Text>
        </TouchableOpacity>
    );

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ImageBackground source={require("../assets/background.jpeg")} style={styles.background}>
                <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
                    <Text style={styles.title}>Check In Book</Text>

                    <View style={styles.block}>
                        <View style={styles.modeRow}>
                            <ModeChip label="1) User ID" value={MODES.USER_ID} />
                            <ModeChip label="2) Existing CC" value={MODES.CC_LOOKUP} />
                        </View>
                    </View>

                    {mode === MODES.USER_ID ? (
                        <TextInput style={styles.input} placeholder="User ID" value={userId} onChangeText={setUserId} />
                    ) : (
                        <TextInput style={styles.input} placeholder="CC" value={cc} onChangeText={setCC} keyboardType="number-pad" />
                    )}

                    <Button title="Done" onPress={handleCheckIn} color="#007BFF" />
                </KeyboardAvoidingView>
            </ImageBackground>
        </TouchableWithoutFeedback>
    );
}


const styles = StyleSheet.create({
    background: { flex: 1, resizeMode: "cover" },
    container: { flex: 1, justifyContent: "center", padding: 20, backgroundColor: "rgba(0,0,0,0.5)" },
    title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center", color: "#fff" },
    block: { marginBottom: 18 },
    input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, fontSize: 16, color: "#fff", backgroundColor: "rgba(255,255,255,0.2)" },
    modeRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
    modeChip: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 16, borderWidth: 1, borderColor: "#ccc" },
    modeChipActive: { backgroundColor: "#fff" },
    modeText: { color: "#fff" },
    modeTextActive: { color: "#000", fontWeight: "600" },
});