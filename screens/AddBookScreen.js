import React, { useEffect, useState, useContext } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ImageBackground } from "react-native";
import { AppContext } from "../store/AppProvider";
import { addBookAction } from "../store/actions";

const AddBookScreen = ({ route, navigation }) => {
    const { libraryId: incomingLibId, book } = route.params || {};
    const { dispatch } = useContext(AppContext);

    if (!book) {
        return (
            <ImageBackground source={require("../assets/background.jpeg")} style={styles.background}>
                <View style={styles.container}>
                    <Text style={{color: 'white', fontSize: 18, textAlign: 'center'}}>
                        Error: No book data received.
                    </Text>
                    <TouchableOpacity
                        style={[styles.addButton, { marginTop: 20 }]}
                        onPress={() => navigation.goBack()}>
                        <Text style={styles.addButtonText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </ImageBackground>
        );
    }

    const [libraryId, setLibraryId] = useState(incomingLibId ?? null);
    const [stock, setStock] = useState("");

    const stockNumber = Number.isFinite(parseInt(stock, 10)) ? parseInt(stock, 10) : NaN;
    const isStockValid = Number.isInteger(stockNumber) && stockNumber >= 0;

    useEffect(() => {
        if (incomingLibId != null && incomingLibId !== libraryId) {
            setLibraryId(incomingLibId);
        }
    }, [incomingLibId]);

    const handleAddBook = () => {
        if (!libraryId || !book?.isbn || !isStockValid) {
            Alert.alert("Validation Error", "Please check inputs.");
            return;
        }

        addBookAction(dispatch, libraryId, book.isbn, { stock: stockNumber })
            .then(() => {
                Alert.alert("Success", `The book "${book.title}" was added successfully.`);
                // Navega de volta para a lista, que será atualizada automaticamente por causa do fetchBooksAction chamado no addBookAction
                navigation.navigate("LibraryBooks", { libraryId });
            })
            .catch((error) => {
                Alert.alert("Error", "Failed to add the book.");
            });
    };

    return (
        <ImageBackground source={require("../assets/background.jpeg")} style={styles.background}>
            <View style={styles.container}>
                <Text style={styles.title}>Add Book</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter Stock"
                    value={stock}
                    onChangeText={setStock}
                    keyboardType="numeric"
                    returnKeyType="done"
                />

                {book && (
                    <View style={styles.reviewCard}>
                        {/* ... Detalhes do livro ... */}
                        <Text style={styles.reviewTitle}>Confirm details</Text>
                        <Text style={styles.row}><Text style={styles.label}>ISBN:</Text> {book.isbn}</Text>
                        <Text style={styles.row}><Text style={styles.label}>Title:</Text> {book.title}</Text>
                        <Text style={styles.row}><Text style={styles.label}>Stock to add:</Text> {isStockValid ? stockNumber : "-"}</Text>
                    </View>
                )}

                <TouchableOpacity
                    style={[styles.addButton, (!isStockValid || !libraryId) && { opacity: 0.6 }]}
                    onPress={handleAddBook}
                    disabled={!isStockValid || !libraryId}
                >
                    <Text style={styles.addButtonText}>Confirm and Add</Text>
                </TouchableOpacity>
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    background: { flex: 1, resizeMode: "cover" },
    container: { flex: 1, padding: 20, justifyContent: "center", backgroundColor: "rgba(0, 0, 0, 0.35)" },
    title: { fontSize: 26, fontWeight: "bold", color: "#fff", textAlign: "center", marginBottom: 20 },
    input: { backgroundColor: "#fff", padding: 12, borderRadius: 8, fontSize: 16, marginBottom: 16 },
    reviewCard: { backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 10, padding: 14, marginBottom: 20 },
    reviewTitle: { color: "#fff", fontSize: 18, fontWeight: "600", marginBottom: 10 },
    row: { color: "#fff", fontSize: 16, marginBottom: 6 },
    label: { color: "#B0C4DE", fontWeight: "600" },
    addButton: { backgroundColor: "#28a745", paddingVertical: 14, borderRadius: 10, alignItems: "center" },
    addButtonText: { color: "#fff", fontSize: 17, fontWeight: "bold" },
});

export default AddBookScreen;