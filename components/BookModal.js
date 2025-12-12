import React from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity } from "react-native";

export const BookModal = ({ visible, onClose, options }) => {
  return (
    <Modal
      transparent={true}
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Opções</Text>

          {options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={styles.modalButton}
              onPress={() => {
                onClose();
                option.onPress();
              }}
            >
              <Text style={styles.modalButtonText}>{option.label}</Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={styles.modalButton} onPress={onClose}>
            <Text style={styles.modalButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  modalButton: {
    paddingVertical: 10,
    width: "100%",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    marginVertical: 5,
    borderRadius: 5,
  },
  modalButtonText: {
    fontSize: 16,
  },
});
