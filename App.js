import React from 'react';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AppProvider } from './store/AppProvider';

import HomeScreen from './screens/HomeScreen';
import LibraryListScreen from './screens/LibraryListScreen';
import LibraryBooksScreen from './screens/LibraryBooksScreen';
import CreateLibraryScreen from './screens/CreateLibraryScreen';
import UpdateLibraryScreen from "./screens/UpdateLibraryScreen";
import LoadBookScreen from './screens/LoadBookScreen';
import ScannerScreen from './screens/ScannerScreen';
import AddBookScreen from './screens/AddBookScreen';
import UpdateBookScreen from './screens/UpdateBookScreen';
import CheckOutScreen from './screens/CheckOutScreen';
import CheckInScreen from './screens/CheckInScreen';

const Stack = createNativeStackNavigator();

const App = () => {
    return (
        <AppProvider>
            <NavigationContainer>
                <Stack.Navigator initialRouteName='Home'>
                    <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="LibraryList" component={LibraryListScreen} options={{ headerShown: false }}/>
                    <Stack.Screen name="LibraryBooks" component={LibraryBooksScreen} options={{ headerShown: false }}/>
                    <Stack.Screen name="CreateLibrary" component={CreateLibraryScreen} options={{ headerShown: false }}/>
                    <Stack.Screen name="UpdateLibrary" component={UpdateLibraryScreen} options={{ headerShown: false }}/>
                    <Stack.Screen name="LoadBook" component={LoadBookScreen} options={{ headerShown: false }}/>
                    <Stack.Screen name="Scanner" component={ScannerScreen} options={{ headerShown: false }}/>
                    <Stack.Screen name="AddBook" component={AddBookScreen} options={{ headerShown: false }}/>
                    <Stack.Screen name="UpdateBook" component={UpdateBookScreen} options={{ headerShown: false }}/>
                    <Stack.Screen name="CheckOutMenu" component={CheckOutScreen} options={{ headerShown: false }}/>
                    <Stack.Screen name="CheckInMenu" component={CheckInScreen} options={{ headerShown: false }}/>
                </Stack.Navigator>
            </NavigationContainer>
        </AppProvider>
    );
}

export default App;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
});