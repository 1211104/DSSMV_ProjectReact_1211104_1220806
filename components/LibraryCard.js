import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const LibraryCard=({
    name,
    address,
    openDays,
    openTime,
    closeTime,
})=>{
    return(
        <View style={styles.card}>
        <View style={styles.content}>
          <View style={styles.textContainer}>
            <Text style={styles.libraryName}>{name}</Text>
            <Text style={styles.libraryAddress}>Address: {address}</Text>
            <Text style={styles.libraryOpenDays}>Open Days: {openDays}</Text>
            <Text style={styles.libraryOpenTime}>Open Time: {openTime}</Text>
            <Text style={styles.libraryCloseTime}>Close Time: {closeTime}</Text>
          </View>
        </View>
      </View>
    )
}


const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.5)', 
    borderRadius: 10,
    elevation: 5,
    marginVertical: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3, 
    shadowRadius: 4,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
  },
  libraryName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000', 
  },
  libraryAddress: {
    fontSize: 14,
    color: '#333',
  },
  libraryOpenDays: {
    fontSize: 14,
    color: '#333',
  },
  libraryOpenTime: {
    fontSize: 14,
    color: '#333',
  },
  libraryCloseTime: {
    fontSize: 14,
    color: '#333',
  },
});

export default LibraryCard