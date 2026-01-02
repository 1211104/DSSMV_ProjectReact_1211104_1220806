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
    const { state, dispatch } = useContext(AppContext);
    const { libraries, isLoading } = state;

    const [selectedLibrary, setSelectedLibrary] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const navigation = useNavigation();

    const isLibraryOpen = (library) => {
        // Verificação de Segurança: Se algum campo obrigatório for nulo, assume que está fechada
        if (!library.openDays || !library.openTime || !library.closeTime) {
            return false;
        }

        try {
            const now = new Date();
            const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            const currentDay = daysOfWeek[now.getDay()];

            // 1. Verificar se a biblioteca abre hoje
            const openDaysList = library.openDays.split(',').map(d => d.trim());
            if (!openDaysList.includes(currentDay)) return false;

            // 2. Comparar horários
            const currentMinutes = now.getHours() * 60 + now.getMinutes();

            const [openH, openM] = library.openTime.split(':').map(Number);
            const [closeH, closeM] = library.closeTime.split(':').map(Number);

            const openTimeMinutes = openH * 60 + openM;
            const closeTimeMinutes = closeH * 60 + closeM;

            return currentMinutes >= openTimeMinutes && currentMinutes <= closeTimeMinutes;
        } catch (error) {
            console.error("Error parsing library hours:", error);
            return false; // Em caso de formato de hora inválido, mantém como fechada
        }
    };

    const loadData = useCallback(() => {
        fetchLibrariesAction(dispatch);
    }, [dispatch]);

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

    const renderLibraryCard = ({ item }) => {
        // Se não houver dados de horário, usamos um cinzento ou vermelho suave
        const isOpen = isLibraryOpen(item);

        const backgroundColor = isOpen
            ? "rgba(87, 240, 87, 0.7)"  // Verde
            : "rgba(240, 87, 87, 0.7)"; // Vermelho

        return (
            <TouchableOpacity
                style={[styles.cardContainer, { backgroundColor }]}
                onPress={() => handleLibraryPress(item)}
            >
                <LibraryCard
                    name={item.name}
                    address={item.address}
                    // Garante que o texto não falha se os dados forem nulos
                    openDays={item.openDays || "N/A"}
                    openTime={item.openTime || "N/A"}
                    closeTime={item.closeTime || "N/A"}
                />
            </TouchableOpacity>
        );
    };

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
    cardContainer: {
        // backgroundColor original removida para permitir a cor dinâmica
        borderRadius: 10,
        marginVertical: 8,
        padding: 16,
        elevation: 5
    },
});

export default LibraryListScreen;