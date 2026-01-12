import React, { useState, useEffect, useContext } from "react";
import {
    StyleSheet,
    Alert,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    TextInput,
    ImageBackground,
    Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

// Flux Imports
import { AppContext } from "../store/AppProvider";
import { searchBookAction, clearSearchedBookAction } from "../store/actions";

const LoadBookScreen = ({ route }) => {
    const { libraryBooks = [], libraryId: incomingLibId, isbn: incomingIsbn } = route?.params || {};
    const navigation = useNavigation();

    // Consume Global Context
    const { state, dispatch } = useContext(AppContext);
    // Added 'error' to detect search failures
    const { searchedBook, isLoading, error } = state;

    // Local state for UI inputs and persistence
    const [persistedLibraryId, setPersistedLibraryId] = useState(incomingLibId ?? null);
    const [isbn, setIsbn] = useState("");

    // Update libraryId if new one comes via params
    useEffect(() => {
        if (incomingLibId != null && incomingLibId !== persistedLibraryId) {
            setPersistedLibraryId(incomingLibId);
        }
    }, [incomingLibId, persistedLibraryId]);

    // Clear previous search on mount
    useEffect(() => {
        clearSearchedBookAction(dispatch);
    }, []);

    // Detect ISBN from Scanner or params and trigger search
    useEffect(() => {
        if (!incomingIsbn) return;
        const code = String(incomingIsbn);
        setIsbn(code);

        // Trigger Action
        searchBookAction(dispatch, code);

        // Clear params to avoid loops
        navigation.setParams({ isbn: undefined, fromScanner: undefined });
    }, [incomingIsbn]);

    // NEW: Show error coming from API (e.g., Book not found)
    useEffect(() => {
        if (error) {
            // Displays the error from the state (ensure your actions.js sends English messages or handle it here)
            Alert.alert("Error", error);
        }
    }, [error]);

    const handleSearch = () => {
        if (!isbn) {
            Alert.alert("Validation Error", "ISBN is required");
            return;
        }
        searchBookAction(dispatch, isbn);
    };

    const handleAddBook = () => {
        // Security Validation
        if (!searchedBook || !searchedBook.isbn) {
            Alert.alert("Validation Error", "No valid book details loaded. Please click 'Load Book' first.");
            return;
        }

        // Check for duplicates
        if (libraryBooks.includes(searchedBook.isbn)) {
            Alert.alert("Validation Error", "This book already exists in the library.");
        } else {
            // Proceed only if everything is correct
            navigation.navigate("AddBook", {
                book: searchedBook,
                libraryId: persistedLibraryId
            });
        }
    };

    // Clear global state on unmount
    useEffect(() => {
        return () => {
            clearSearchedBookAction(dispatch);
        };
    }, []);

    return (
        <ImageBackground source={require("../assets/background.jpeg")} style={styles.background}>
            <SafeAreaView>
                <View style={styles.header}>
                    <Text style={styles.title}>Load a Book</Text>
                    <TouchableOpacity
                        onPress={() =>
                            navigation.navigate("Scanner", {
                                libraryId: persistedLibraryId ?? incomingLibId ?? null,
                                libraryBooks,
                            })
                        }
                    >
                        <Ionicons name="camera-outline" size={24} color="white" />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            <ScrollView>
                <TextInput
                    style={styles.input}
                    placeholder="Enter ISBN"
                    value={isbn}
                    onChangeText={(t) => {
                        setIsbn(t);
                    }}
                />

                <TouchableOpacity style={styles.loadButton} onPress={handleSearch}>
                    <Text style={styles.buttonText}>Load Book</Text>
                </TouchableOpacity>

                {isLoading && <Text style={styles.loadingText}>Loading...</Text>}

                {/* Render only if searchedBook exists in global state */}
                {searchedBook && (
                    <View style={styles.bookDetails}>
                        <Text style={styles.detailText}>ISBN: {searchedBook?.isbn || "N/A"}</Text>
                        <Text style={styles.detailText}>Title: {searchedBook?.title || "No Title"}</Text>
                        <Text style={styles.detailText}>Author: {searchedBook?.byStatement || "Unknown"}</Text>

                        {searchedBook?.coverUrl ? (
                            <Image source={{ uri: searchedBook.coverUrl }} style={styles.coverImage} resizeMode="cover" />
                        ) : null}

                        <TouchableOpacity style={styles.addButton} onPress={handleAddBook}>
                            <Text style={styles.addButtonText}>Add Book</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    background: { flex: 1, resizeMode: "cover" },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 14,
    },
    title: { fontSize: 24, fontWeight: "bold", color: "#fff" },
    input: {
        backgroundColor: "#fff",
        padding: 15,
        borderRadius: 8,
        marginBottom: 20,
        fontSize: 16,
        marginHorizontal: 20,
    },
    loadButton: {
        backgroundColor: "#007BFF",
        padding: 15,
        borderRadius: 8,
        alignItems: "center",
        marginBottom: 20,
        marginHorizontal: 20,
    },
    buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
    loadingText: { textAlign: "center", fontSize: 18, color: "#fff" },
    bookDetails: { marginTop: 20, paddingHorizontal: 20 },
    detailText: { fontSize: 16, marginBottom: 10, color: "#fff" },
    addButton: {
        backgroundColor: "#28a745",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 20,
    },
    addButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
    coverImage: { width: "100%", height: 200, borderRadius: 10, marginTop: 10 },
});

export default LoadBookScreen;