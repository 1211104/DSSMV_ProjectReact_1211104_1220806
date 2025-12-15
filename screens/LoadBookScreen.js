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

    // Consumir Contexto Global
    const { state, dispatch } = useContext(AppContext);
    const { searchedBook, isLoading } = state; // Lemos o livro pesquisado do estado global

    // Estado local apenas para inputs de UI e persistência de navegação
    const [persistedLibraryId, setPersistedLibraryId] = useState(incomingLibId ?? null);
    const [isbn, setIsbn] = useState("");

    // Atualiza libraryId se vier novo via params
    useEffect(() => {
        if (incomingLibId != null && incomingLibId !== persistedLibraryId) {
            setPersistedLibraryId(incomingLibId);
        }
    }, [incomingLibId, persistedLibraryId]);

    // Limpar pesquisa anterior ao entrar no ecrã (mount)
    useEffect(() => {
        clearSearchedBookAction(dispatch);
    }, []); // Array vazio = apenas no mount

    // Detetar ISBN vindo do Scanner ou params e disparar pesquisa
    useEffect(() => {
        if (!incomingIsbn) return;
        const code = String(incomingIsbn);
        setIsbn(code);

        // Disparar Action em vez de chamar função local
        searchBookAction(dispatch, code);

        // Limpar params para evitar loops
        navigation.setParams({ isbn: undefined, fromScanner: undefined });
    }, [incomingIsbn]);

    const handleSearch = () => {
        if (!isbn) {
            Alert.alert("Validation Error", "ISBN is required");
            return;
        }
        searchBookAction(dispatch, isbn);
    };

    const handleAddBook = () => {
        // Usamos 'searchedBook' do estado global
        if (!searchedBook) {
            Alert.alert("Validation Error", "No book details loaded. Please load a book first.");
            return;
        }

        if (libraryBooks.includes(searchedBook.isbn)) {
            Alert.alert("Validation Error", "This book already exists in the library.");
        } else {
            // Passamos o livro do estado global para o próximo ecrã
            navigation.navigate("AddBook", { book: searchedBook, libraryId: persistedLibraryId });
        }
    };

    // Limpar estado global ao sair do ecrã
    useEffect(() => {
        return () => {
            // Unmount cleanup
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
                        // Se o utilizador limpar o input, podemos limpar o resultado visualmente se quisermos
                        // mas geralmente espera-se clicar em Load
                    }}
                />

                <TouchableOpacity style={styles.loadButton} onPress={handleSearch}>
                    <Text style={styles.buttonText}>Load Book</Text>
                </TouchableOpacity>

                {isLoading && <Text style={styles.loadingText}>Loading...</Text>}

                {/* Renderiza apenas se existir um searchedBook no estado global */}
                {searchedBook && (
                    <View style={styles.bookDetails}>
                        <Text style={styles.detailText}>ISBN: {searchedBook.isbn}</Text>
                        <Text style={styles.detailText}>Title: {searchedBook.title}</Text>
                        <Text style={styles.detailText}>Publish Date: {searchedBook.publishDate}</Text>
                        <Text style={styles.detailText}>Number of Pages: {searchedBook.numberOfPages}</Text>
                        <Text style={styles.detailText}>Author: {searchedBook.byStatement}</Text>

                        {searchedBook.coverUrl && (
                            <Image
                                source={{ uri: searchedBook.coverUrl }}
                                style={styles.coverImage}
                                resizeMode="cover"
                            />
                        )}

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