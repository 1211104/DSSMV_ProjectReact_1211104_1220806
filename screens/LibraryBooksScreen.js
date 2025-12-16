import React, { useEffect, useState, useCallback, useContext } from "react";
import { View, Text, StyleSheet, FlatList, ImageBackground, TouchableOpacity } from "react-native";
import BookCard from "../components/BookCard";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { BookModal } from "../components/BookModal";
import { LIB_API_URL } from "../utils/URL";
import { Ionicons } from "@expo/vector-icons";

// Flux Imports
import { AppContext } from "../store/AppProvider";
import { fetchBooksAction } from "../store/actions";

const LibraryBooksScreen = ({ route }) => {
    const { libraryId } = route?.params || {};

    // Consumir Contexto
    const { state, dispatch } = useContext(AppContext);
    const { currentBooks, isLoading } = state;

    const [selectedBook, setSelectedBook] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const navigation = useNavigation();

    // Função para carregar livros via Action
    const loadBooks = useCallback(() => {
        if (libraryId) {
            fetchBooksAction(dispatch, libraryId);
        }
    }, [dispatch, libraryId]);

    useEffect(() => {
        loadBooks();
    }, [loadBooks]);

    useFocusEffect(
        useCallback(() => {
            loadBooks();
        }, [loadBooks])
    );

    const handleBookPress = (book) => {
        setSelectedBook(book);
        setModalVisible(true);
    };


    const modalOptions = [
        {
            label: "Update Book Stock",
            onPress: () => navigation.navigate("UpdateBook", {
                book: { isbn: selectedBook.book.isbn, title: selectedBook.book.title, stock: selectedBook.stock },
                libraryId
            }),
        },
        {
            label: "CheckOut Book",
            onPress: () => {
                if (selectedBook.available > 0) {
                    navigation.navigate("CheckOutMenu", { book: { isbn: selectedBook.book.isbn }, libraryId });
                } else {
                    alert("This book is not available for checkout.");
                }
            },
        },
        {
            label: "CheckIn Book",
            onPress: () => {
                if (selectedBook.checkedOut > 0) {
                    navigation.navigate("CheckInMenu", { book: { isbn: selectedBook.book.isbn }, libraryId });
                } else {
                    alert("There are no books checked out for this book.");
                }
            },
        },
    ];

    const renderBookCard = ({ item }) => {

        const coverUrl = item.book.cover?.mediumUrl
            ? LIB_API_URL + item.book.cover.mediumUrl.replace("/api", "")
            : null;
        const cardBackgroundColor = item.available === 0 ? "rgba(240, 87, 87, 0.7)" : "rgba(87, 240, 87, 0.7)";

        return (
            <TouchableOpacity style={[styles.cardContainer, { backgroundColor: cardBackgroundColor }]} onPress={() => handleBookPress(item)}>
                <BookCard
                    title={item.book.title || "Without title"}
                    publishDate={item.book.publishDate || "N/A"}
                    numberOfPages={item.book.numberOfPages || "N/A"}
                    byStatement={item.book.byStatement || "Unknown author"}
                    isbn={item.book.isbn || "Without ISBN"}
                    checkedOut={item.checkedOut}
                    available={item.available}
                    stock={item.stock}
                    coverUrl={coverUrl}
                />
            </TouchableOpacity>
        );
    };

    return (
        <ImageBackground source={require("../assets/background.jpeg")} style={styles.background}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate("LibraryList")}>
                        <Ionicons name="arrow-back" size={22} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.title} numberOfLines={1}>Books in Library</Text>
                    <TouchableOpacity
                        style={styles.createButton}
                        onPress={() => navigation.navigate("LoadBook", { libraryId, libraryBooks: currentBooks.map((book) => book.book.isbn) })}
                    >
                        <Text style={styles.createButtonText}>Add New Book</Text>
                    </TouchableOpacity>
                </View>

                {currentBooks.length > 0 ? (
                    <FlatList
                        data={currentBooks}
                        keyExtractor={(item) => item.book.isbn}
                        renderItem={renderBookCard}
                        refreshing={isLoading}
                        onRefresh={loadBooks}
                    />
                ) : (
                    <Text style={styles.noBooksText}>No books found in this library.</Text>
                )}

                <BookModal visible={modalVisible} onClose={() => setModalVisible(false)} options={modalOptions} />
            </View>
        </ImageBackground>
    );
};


const styles = StyleSheet.create({
    // Copia os teus estilos originais aqui...
    background: { flex: 1, resizeMode: "cover" },
    container: { flex: 1, padding: 20, backgroundColor: "rgba(0, 0, 0, 0.5)" },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
    iconButton: { padding: 8, marginRight: 8 },
    createButton: { backgroundColor: "rgba(255, 255, 255, 0.7)", paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8 },
    createButtonText: { color: "#000", fontSize: 13 },
    title: { flexShrink: 1, fontSize: 22, fontWeight: "bold", color: "#fff", marginRight: 12 },
    noBooksText: { fontSize: 18, color: "#fff", textAlign: "center", marginTop: 20 },
    cardContainer: { borderRadius: 10, marginVertical: 8, padding: 16, elevation: 5 },
});

export default LibraryBooksScreen;