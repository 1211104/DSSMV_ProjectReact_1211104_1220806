import React, { useState, useContext } from "react";
import { View, Text, StyleSheet, ImageBackground, TextInput, TouchableOpacity, Alert, Image } from "react-native";
import { AppContext } from "../store/AppProvider";
import { updateBookAction } from "../store/actions";

const UpdateBookScreen = ({ route, navigation }) => {
    const { book, libraryId } = route.params || {};
    const { dispatch } = useContext(AppContext);

    const [isEditing, setIsEditing] = useState(false);
    const [stock, setStock] = useState(book?.stock || "");

    const toggleEdit = () => setIsEditing(!isEditing);

    const saveDetails = () => {
        updateBookAction(dispatch, libraryId, book.isbn, { stock })
            .then(() => {
                Alert.alert("Success", "Book details updated successfully!");
                setIsEditing(false);
                navigation.goBack();
            })
            .catch((error) => {
                Alert.alert("Error", "Failed to update book details.");
            });
    };

    return (
        <ImageBackground source={require("../assets/background.jpeg")} style={styles.background}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Update Book</Text>
                    <TouchableOpacity onPress={toggleEdit} style={styles.editButton}>
                        <Image source={require("../assets/edit-icon.png")} style={styles.editIcon} />
                    </TouchableOpacity>
                </View>

                {isEditing ? (
                    <>
                        <TextInput
                            style={styles.input}
                            placeholder="Stock"
                            keyboardType="numeric"
                            value={stock !== null ? stock.toString() : ""}
                            onChangeText={(value) => {
                                if (value === "") setStock(null);
                                else {
                                    const parsedValue = parseInt(value, 10);
                                    setStock(isNaN(parsedValue) ? null : parsedValue);
                                }
                            }}
                        />
                        <TouchableOpacity style={styles.saveButton} onPress={saveDetails}>
                            <Text style={styles.saveButtonText}>Save</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <Text style={styles.detailText}>
                        <Text style={styles.bold}>Stock: </Text>{stock || "Not specified"}
                    </Text>
                )}

                <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
            </View>
        </ImageBackground>
    );
};


const styles = StyleSheet.create({
    background: { flex: 1, resizeMode: "cover" },
    container: { flex: 1, padding: 20, backgroundColor: "rgba(0, 0, 0, 0.5)" },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
    title: { fontSize: 24, fontWeight: "bold", color: "#fff" },
    editButton: { backgroundColor: "rgba(255, 255, 255, 0.7)", padding: 10, borderRadius: 50 },
    editIcon: { width: 24, height: 24 },
    input: { backgroundColor: "rgba(255, 255, 255, 0.8)", padding: 10, borderRadius: 8, marginBottom: 20, fontSize: 16 },
    detailText: { fontSize: 16, color: "#fff", marginBottom: 10 },
    bold: { fontWeight: "bold" },
    saveButton: { backgroundColor: "#007BFF", padding: 15, borderRadius: 8, alignItems: "center", marginBottom: 20 },
    saveButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
    cancelButton: { backgroundColor: "#FF0000", padding: 15, borderRadius: 8, alignItems: "center" },
    cancelButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});

export default UpdateBookScreen;