import React, { useState, useContext } from "react";
import { View, Text, StyleSheet, ImageBackground, TextInput, TouchableOpacity, Alert, Modal, Image, Platform, Keyboard } from "react-native";
import DateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";

// Flux Imports
import { AppContext } from "../store/AppProvider";
import { updateLibraryAction } from "../store/actions";

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const UpdateLibraryScreen = ({ route, navigation }) => {
    const { library } = route.params || {};
    const { dispatch } = useContext(AppContext);

    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(library?.name || "");
    const [address, setAddress] = useState(library?.address || "");
    const [openTime, setOpenTime] = useState(library?.openTime || "");
    const [closeTime, setCloseTime] = useState(library?.closeTime || "");
    const [selectedDays, setSelectedDays] = useState(library?.openDays?.split(", ") || []);

    const [showDays, setShowDays] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [isSelectingOpenTime, setIsSelectingOpenTime] = useState(true);
    const [pickerTime, setPickerTime] = useState(new Date());

    const toggleEdit = () => setIsEditing(!isEditing);

    // Lógica de dias e horas
    const toggleDay = (day) => {
        if (day === "All") {
            setSelectedDays(["All"]);
        } else {
            if (selectedDays.includes("All")) setSelectedDays([day]);
            else if (selectedDays.includes(day)) setSelectedDays(selectedDays.filter((d) => d !== day));
            else setSelectedDays([...selectedDays, day]);
        }
    };

    const openTimePicker = (isOpenTime) => {
        Keyboard.dismiss();
        setIsSelectingOpenTime(isOpenTime);
        const initial = new Date(); // simplificado para ex, lógica completa está no ficheiro original
        if (Platform.OS === "android") {
            DateTimePickerAndroid.open({
                value: initial,
                mode: "time",
                is24Hour: true,
                display: "clock",
                onChange: (event, selectedTime) => {
                    if (event.type === "set" && selectedTime) {
                        const pad = (n) => String(n).padStart(2, "0");
                        const hhmm = `${pad(selectedTime.getHours())}:${pad(selectedTime.getMinutes())}`;
                        if (isOpenTime) setOpenTime(hhmm);
                        else setCloseTime(hhmm);
                    }
                },
            });
        } else {
            setPickerTime(initial);
            setShowModal(true);
        }
    };

    const handleTimeSelect = (event, selectedTime) => {
        if (event.type === "set" && selectedTime) {
            const pad = (n) => String(n).padStart(2, "0");
            const hhmm = `${pad(selectedTime.getHours())}:${pad(selectedTime.getMinutes())}`;
            if (isSelectingOpenTime) setOpenTime(hhmm);
            else setCloseTime(hhmm);
            setShowModal(false);
        } else if (event.type === "dismissed") {
            setShowModal(false);
        }
    };


    const saveDetails = () => {
        if (selectedDays.length === 0) {
            Alert.alert("Validation Error", "You must select at least one open day!");
            return;
        }

        const openDaysValue = selectedDays.includes("All") ? "All" : selectedDays.join(", ");
        const updatedData = { name, address, openDays: openDaysValue, openTime, closeTime };

        updateLibraryAction(dispatch, library.id, updatedData)
            .then(() => {
                Alert.alert("Success", "Library details updated successfully!");
                setIsEditing(false);
                navigation.goBack();
            })
            .catch((error) => {
                Alert.alert("Error", "Failed to update library details.");
            });
    };

    return (
        <ImageBackground source={require("../assets/background.jpeg")} style={styles.background}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Update Library</Text>
                    <TouchableOpacity onPress={toggleEdit} style={styles.editButton}>
                        <Image source={require("../assets/edit-icon.png")} style={styles.editIcon} />
                    </TouchableOpacity>
                </View>

                {isEditing ? (
                    <>
                        <TextInput style={styles.input} placeholder="Library Name" value={name} onChangeText={setName} />
                        <TextInput style={styles.input} placeholder="Address" value={address} onChangeText={setAddress} />

                        {/* Secção de Dias e Horas */}
                        <View style={styles.daysHeader}>
                            <Text style={styles.label}>Open Days:</Text>
                            <TouchableOpacity style={styles.toggleButton} onPress={() => setShowDays(!showDays)}>
                                <Text style={styles.toggleButtonText}>{showDays ? "-" : "+"}</Text>
                            </TouchableOpacity>
                        </View>

                        {showDays && (
                            <View style={styles.daysContainer}>
                                {["All", ...daysOfWeek].map((day) => (
                                    <TouchableOpacity
                                        key={day}
                                        style={[styles.dayButton, selectedDays.includes(day) && styles.selectedDayButton]}
                                        onPress={() => toggleDay(day)}
                                    >
                                        <Text style={[styles.dayButtonText, selectedDays.includes(day) && styles.selectedDayButtonText]}>
                                            {day}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}

                        <Text style={styles.selectedDaysText}>Selected Days: {selectedDays.join(", ")}</Text>

                        <TouchableOpacity style={styles.input} onPress={() => openTimePicker(true)}>
                            <Text>{openTime || "Select Open Time"}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.input} onPress={() => openTimePicker(false)}>
                            <Text>{closeTime || "Select Close Time"}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.saveButton} onPress={saveDetails}>
                            <Text style={styles.saveButtonText}>Save</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <>
                        <Text style={styles.detailText}><Text style={styles.bold}>Name: </Text>{name || "Not specified"}</Text>
                        <Text style={styles.detailText}><Text style={styles.bold}>Address: </Text>{address || "Not specified"}</Text>
                        <Text style={styles.detailText}><Text style={styles.bold}>Open Days: </Text>{selectedDays.join(", ") || "Not specified"}</Text>
                        <Text style={styles.detailText}><Text style={styles.bold}>Open Time: </Text>{openTime || "Not specified"}</Text>
                        <Text style={styles.detailText}><Text style={styles.bold}>Close Time: </Text>{closeTime || "Not specified"}</Text>
                    </>
                )}

                <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <Modal visible={showModal} transparent animationType="slide">
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <DateTimePicker
                                value={pickerTime}
                                mode="time"
                                display={Platform.OS === "ios" ? "spinner" : "clock"}
                                is24Hour={true}
                                onChange={handleTimeSelect}
                            />
                        </View>
                    </View>
                </Modal>
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
    input: { backgroundColor: "rgba(255, 255, 255, 0.8)", padding: 15, borderRadius: 10, marginBottom: 15, fontSize: 16 },
    detailText: { fontSize: 16, color: "#fff", marginBottom: 10 },
    bold: { fontWeight: "bold" },
    saveButton: { backgroundColor: "#007BFF", padding: 15, borderRadius: 10, alignItems: "center", marginTop: 10 },
    saveButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
    cancelButton: { backgroundColor: "#FF0000", padding: 15, borderRadius: 10, alignItems: "center", marginTop: 10 },
    cancelButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
    modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0, 0, 0, 0.5)" },
    modalContent: { width: "80%", padding: 20, backgroundColor: "#fff", borderRadius: 10, alignItems: "center" },
    daysHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
    toggleButton: { backgroundColor: "#007BFF", borderRadius: 8, padding: 10 },
    toggleButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
    daysContainer: { width: "100%", marginBottom: 20 },
    dayButton: { padding: 10, marginVertical: 5, backgroundColor: "#fff", borderRadius: 8, alignItems: "center" },
    selectedDayButton: { backgroundColor: "#007BFF" },
    dayButtonText: { color: "#000", fontSize: 16 },
    selectedDayButtonText: { color: "#fff" },
    selectedDaysText: { fontSize: 16, color: "#fff", marginBottom: 20 },
    label: { fontSize: 16, fontWeight: "bold", color: "#fff" },
});

export default UpdateLibraryScreen;