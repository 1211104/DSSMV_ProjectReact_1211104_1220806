import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";

const BookCard = ({
  title,
  isbn,
  publishDate,
  numberOfPages,
  byStatement,
  available,
  checkedOut,
  stock,
  coverUrl,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={styles.bookTitle}>{title}</Text>
          <Text style={styles.bookDetail}>ISBN: {isbn}</Text>
          <Text style={styles.bookDetail}>Published: {publishDate}</Text>
          <Text style={styles.bookDetail}>Pages: {numberOfPages}</Text>
          <Text style={styles.bookDetail}>Author: {byStatement}</Text>
          <Text style={styles.bookDetail}>Available: {available}</Text>
          <Text style={styles.bookDetail}>Checked Out: {checkedOut}</Text>
          <Text style={styles.bookDetail}>Stock: {stock}</Text>
        </View>
        {coverUrl && (
          <Image
            source={{ uri: coverUrl }}
            style={styles.coverImage}
            resizeMode="cover"
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 10,
    elevation: 5,
    marginVertical: 8,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  content: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  textContainer: {
    flex: 3,
  },
  bookTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
  },
  bookDetail: {
    fontSize: 14,
    color: "#555",
    marginBottom: 2,
  },
  coverImage: {
    flex: 1,
    width: 80,
    height: 120,
    borderRadius: 8,
    marginLeft: 16,
  },
});

export default BookCard;
