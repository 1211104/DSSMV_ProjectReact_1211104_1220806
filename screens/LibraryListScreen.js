import React, { useEffect, useState, useCallback, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, ImageBackground, TouchableOpacity, Alert } from 'react-native';
import LibraryCard from '../components/LibraryCard';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { LibraryModal } from '../components/LibraryModal';
import { SafeAreaView } from "react-native-safe-area-context";

// Flux Imports
import { AppContext } from '../store/AppProvider';
import { fetchLibrariesAction, deleteLibraryAction } from '../store/actions';

const LibraryListScreen = () => {
    // Consumir Contexto
    const { state, dispatch } = useContext(AppContext);
    const { libraries, isLoading } = state;

    const [selectedLibrary, setSelectedLibrary] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const navigation = useNavigation();

    // Função para carregar dados via Action
    const loadData = useCallback(() => {
        fetchLibrariesAction(dispatch);
    }, [dispatch]);

    // Carregar ao montar e ao focar
    useEffect(() => {
        loadData();
    }, [loadData]);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [loadData])
    );

    const handleLibraryPress = (library) => {
        setSelectedLibrary(library);
        setModalVisible(true);
    };

    const modalOptions = [
        {
            label: "Get Books",
            onPress: () =>
                navigation.navigate("LibraryBooks", { libraryId: selectedLibrary.id }),
        },
        {
            label: "Delete Library",
            onPress: () => {
                // Usar Action de Delete
                deleteLibraryAction(dispatch, selectedLibrary.id)
                    .then(() => {
                        setModalVisible(false);
                        Alert.alert("Success", "Library successfully deleted");
                    })
                    .catch((error) => {
                        Alert.alert("Error", "Failed to delete library");
                    });
            },
        },
        {
            label: "Update Library",
            onPress: () =>
                navigation.navigate("UpdateLibrary" , { library: selectedLibrary }),
        },
    ];

    const renderLibraryCard = ({ item }) => (
        <TouchableOpacity
            style={styles.cardContainer}
            onPress={() => handleLibraryPress(item)}
        >
            <LibraryCard
                name={item.name}
                address={item.address}
                openDays={item.openDays || "N/A"}
                openTime={item.openTime || "N/A"}
                closeTime={item.closeTime || "N/A"}
            />
        </TouchableOpacity>
    );

    return (
        <ImageBackground
            source={require("../assets/background.jpeg")}
            style={styles.background}
        >
            <SafeAreaView style={styles.container} edges={["top"]}>
                <TouchableOpacity
                    style={styles.createButton}
                    onPress={() => navigation.navigate("CreateLibrary")}
                >
                    <Text style={styles.createButtonText}>Create Library</Text>
                </TouchableOpacity>

                <Text style={styles.text}>Libraries</Text>

                {/* Usamos 'libraries' vindo do Contexto Global */}
                <FlatList
                    data={libraries}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderLibraryCard}
                    showsHorizontalScrollIndicator={false}
                    refreshing={isLoading}
                    onRefresh={loadData}
                />

                <LibraryModal
                    visible={modalVisible}
                    onClose={() => setModalVisible(false)}
                    options={modalOptions}
                />
            </SafeAreaView>
        </ImageBackground>
    );
};


const styles = StyleSheet.create({

    background: { flex: 1, resizeMode: "cover" },
    container: { flex: 1, padding: 16, backgroundColor: "rgba(0, 0, 0, 0.5)" },
    createButton: { position: "absolute", top: 45, right: 16, backgroundColor: "#c4c4c4ff", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, minWidth: 120, alignItems: "center", borderWidth: 1, borderColor: "#eaeaea", zIndex: 10 },
    createButtonText: { color: "#111", fontSize: 12, fontWeight: "600" },
    text: { fontSize: 24, fontWeight: "bold", color: "#fff", marginBottom: 16 },
    cardContainer: { backgroundColor: "rgba(255, 255, 255, 0.5)", borderRadius: 10, marginVertical: 8, padding: 16, elevation: 5 },
});

export default LibraryListScreen;