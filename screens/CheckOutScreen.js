import React, { useEffect, useState, useContext } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert, ImageBackground, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFriendlyErrorMessage } from "../utils/errorHandler";
import { findUserByCC, findUserByUsername, createUser, dumpUsers, initUserTable } from "../database/userStore";

import { AppContext } from "../store/AppProvider";
import { checkoutBookAction } from "../store/actions";
import { CheckOutBook } from "../service/LibraryService";

const ROLES = ["Client", "Librarian", "Admin"];
const MODES = { USER_ID: "USER_ID", CC_LOOKUP: "CC_LOOKUP", CREATE_USER: "CREATE_USER" };

const CheckOutScreen = ({ route }) => {
    const { libraryId, book } = route.params;
    const { dispatch } = useContext(AppContext);
    const navigation = useNavigation();

    const [mode, setMode] = useState(MODES.USER_ID);
    const [userId, setUserId] = useState("");
    const [cc, setCC] = useState("");
    const [firstName, setFirstName] = useState("");
    const [phone, setPhone] = useState("");
    const [role, setRole] = useState("Client");
    const [checkoutData, setCheckoutData] = useState(null);

    useEffect(() => {
        initUserTable().catch((e) => console.warn("initUserTable error:", e));
        AsyncStorage.getItem("userId").then((stored) => stored && setUserId(stored));
    }, []);

    const resolveUsername = async () => {

        if (mode === MODES.USER_ID) {
            const inputId = userId.trim();
            if (!inputId) throw new Error("Enter a User ID.");

            const u = await findUserByUsername(inputId);

            if (u) {
                return u.username;
            }

            if (inputId === "Wonderful User") {
                return inputId;
            }

            throw new Error("User ID not found locally.");
        }

        if (mode === MODES.CC_LOOKUP) {
            if (!cc.trim()) throw new Error("Indicate CC.");
            const u = await findUserByCC(cc.trim());
            if (!u) throw new Error("No user with that CC.");
            return u.username;
        }
        if (!cc.trim() || !firstName.trim() || !phone.trim()) throw new Error("Enter details.");
        const existing = await findUserByCC(cc.trim());
        if (existing) return existing.username;
        const newUser = await createUser({ cc: cc.trim(), firstName: firstName.trim(), phone: phone.trim(), role });
        return newUser.username;
    };

    const handleCheckout = async () => {
        try {
            const username = await resolveUsername();

            console.log("Enviando Checkout:", { libraryId, isbn: book.isbn, username });

            const response = await CheckOutBook(libraryId, book.isbn, username);

            setCheckoutData({
                id: response.data.id,
                isbn: response.data.book.isbn,
                dueDate: response.data.dueDate
            });

            Alert.alert("Sucesso", "Livro requisitado com sucesso.");

        } catch (err) {

            console.error("Erro no Checkout:", err);

            const userMessage = getFriendlyErrorMessage(err);

            Alert.alert("Atenção", userMessage);
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
                    <Text style={styles.title}>Check Out Book</Text>
                    {/* ... Inputs de User ID, CC, Create User (iguais ao original) ... */}
                    <View style={styles.block}>
                        <View style={styles.modeRow}>
                            <ModeChip label="1) User ID" value={MODES.USER_ID} />
                            <ModeChip label="2) Existing CC" value={MODES.CC_LOOKUP} />
                            <ModeChip label="3) Create user" value={MODES.CREATE_USER} />
                        </View>
                    </View>

                    {mode === MODES.USER_ID && (
                        <TextInput style={styles.input} placeholder="User ID" value={userId} onChangeText={setUserId} />
                    )}
                    {mode === MODES.CC_LOOKUP && (
                        <TextInput style={styles.input} placeholder="CC" value={cc} onChangeText={setCC} keyboardType="number-pad" />
                    )}
                    {mode === MODES.CREATE_USER && (
                        <>
                            <TextInput style={styles.input} placeholder="CC" value={cc} onChangeText={setCC} keyboardType="number-pad"/>
                            <TextInput style={styles.input} placeholder="First Name" value={firstName} onChangeText={setFirstName} />
                            <TextInput style={styles.input} placeholder="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad"/>
                        </>
                    )}

                    <Button title="Done" onPress={handleCheckout} color="#007BFF" />

                    {checkoutData && (
                        <View style={styles.resultContainer}>
                            <Text style={styles.resultText}>Checkout ID: {checkoutData.id}</Text>
                            <Text style={styles.resultText}>Due Date: {new Date(checkoutData.dueDate).toLocaleDateString()}</Text>
                            <View style={styles.goBackButton}>
                                <Button title="Go Back" onPress={() => navigation.goBack()} color="#007BFF" />
                            </View>
                        </View>
                    )}
                </KeyboardAvoidingView>
            </ImageBackground>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    background: { flex: 1, resizeMode: "cover" },
    container: { flex: 1, padding: 20, justifyContent: "center", backgroundColor: "rgba(0, 0, 0, 0.5)" },
    title: { fontSize: 24, fontWeight: "bold", color: "#fff", textAlign: "center", marginBottom: 16 },
    block: { marginBottom: 18 },
    input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, fontSize: 16, color: "#fff", backgroundColor: "rgba(255,255,255,0.2)", marginTop: 8 },
    modeRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
    modeChip: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 16, borderWidth: 1, borderColor: "#ccc" },
    modeChipActive: { backgroundColor: "#fff" },
    modeText: { color: "#fff" },
    modeTextActive: { color: "#000", fontWeight: "600" },
    resultContainer: { marginTop: 24, padding: 15, borderRadius: 8, backgroundColor: "rgba(255,255,255,0.85)", alignItems: "center" },
    resultText: { fontSize: 16, color: "#333", marginBottom: 5 },
    goBackButton: { marginTop: 16, width: "50%" },
});

export default CheckOutScreen;