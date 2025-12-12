import React from 'react';
import { View, Text, StyleSheet, ImageBackground, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const HomeScreen = () => {
    const navigation = useNavigation();

    return (
        <ImageBackground
            source={require('../assets/background.jpeg')}
            style={styles.background}
        >
            <View style={styles.container}>
                <Text style={styles.title}>Welcome to Library Management Mobile App</Text>
                <Text style={styles.subtitle}>Explore our collections!</Text>

                <View style={styles.buttonContainer}>
                    <Button
                        title="Go to Libraries List"
                        onPress={() => navigation.navigate("LibraryList")}
                        color="#333"
                    />
                </View>
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    background: {
        flex: 1,
        resizeMode: 'cover',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 16,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 18,
        color: '#ddd',
        marginBottom: 32,
        textAlign: 'center',
    },
    buttonContainer: {
        marginTop: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 8,
        padding: 10,
        width: '60%',
    },
});

export default HomeScreen;