import {
    GetLibraries,
    CreateLibrary,
    DeleteLibrary,
    UpdateLibrary,
    GetBooks,
    LoadBook,
    AddNewBook,
    UpdateBook,
    CheckOutBook,
    CheckInBook,
} from "../service/LibraryService";

import { getFriendlyErrorMessage } from "../utils/errorHandler";

// Action Types
export const SET_LOADING = "SET_LOADING";
export const SET_ERROR = "SET_ERROR";
export const FETCH_LIBRARIES_SUCCESS = "FETCH_LIBRARIES_SUCCESS";
export const FETCH_BOOKS_SUCCESS = "FETCH_BOOKS_SUCCESS";
export const SEARCH_BOOK_SUCCESS = "SEARCH_BOOK_SUCCESS";
export const CLEAR_SEARCHED_BOOK = "CLEAR_SEARCHED_BOOK";


// 1. Bibliotecas
export const fetchLibrariesAction = async (dispatch) => {
    dispatch({ type: SET_LOADING, payload: true });
    try {
        const response = await GetLibraries();
        dispatch({ type: FETCH_LIBRARIES_SUCCESS, payload: response.data || [] });
    } catch (error) {
        const msg = getFriendlyErrorMessage(error);
        console.log("Fetch Libraries Error:", msg); // Log limpo
        dispatch({ type: SET_ERROR, payload: msg });
    }
};

export const createLibraryAction = async (dispatch, libraryData) => {
    dispatch({ type: SET_LOADING, payload: true });
    try {
        await CreateLibrary(libraryData);
        await fetchLibrariesAction(dispatch);
    } catch (error) {
        const msg = getFriendlyErrorMessage(error);
        console.log("Create Library Error:", msg);
        dispatch({ type: SET_ERROR, payload: msg });
        throw error; // Re-lança para o ecrã tratar se necessário
    }
};

export const updateLibraryAction = async (dispatch, id, libraryData) => {
    dispatch({ type: SET_LOADING, payload: true });
    try {
        await UpdateLibrary(id, libraryData);
        await fetchLibrariesAction(dispatch);
    } catch (error) {
        const msg = getFriendlyErrorMessage(error);
        console.log("Update Library Error:", msg);
        dispatch({ type: SET_ERROR, payload: msg });
        throw error;
    }
};

export const deleteLibraryAction = async (dispatch, id) => {
    try {
        await DeleteLibrary(id);
        await fetchLibrariesAction(dispatch);
    } catch (error) {
        const msg = getFriendlyErrorMessage(error);
        console.log("Delete Library Error:", msg);
        dispatch({ type: SET_ERROR, payload: msg });
        throw error;
    }
};

// 2. Livros
export const fetchBooksAction = async (dispatch, libraryId) => {
    dispatch({ type: SET_LOADING, payload: true });
    try {
        const response = await GetBooks(libraryId);
        dispatch({ type: FETCH_BOOKS_SUCCESS, payload: response.data || [] });
    } catch (error) {
        const msg = getFriendlyErrorMessage(error);
        console.log("Fetch Books Error:", msg);
        dispatch({ type: SET_ERROR, payload: msg });
    }
};

export const addBookAction = async (dispatch, libraryId, isbn, bookData) => {
    dispatch({ type: SET_LOADING, payload: true });
    try {
        await AddNewBook(libraryId, isbn, bookData);
        await fetchBooksAction(dispatch, libraryId);
    } catch (error) {
        const msg = getFriendlyErrorMessage(error);
        console.log("Add Book Error:", msg);
        dispatch({ type: SET_ERROR, payload: msg });
        throw error;
    }
};

export const updateBookAction = async (dispatch, libraryId, isbn, bookData) => {
    try {
        await UpdateBook(libraryId, isbn, bookData);
        await fetchBooksAction(dispatch, libraryId);
    } catch (error) {
        console.log("Update Book Error:", getFriendlyErrorMessage(error));
        throw error;
    }
};

// CheckIn / CheckOut
export const checkoutBookAction = async (dispatch, libraryId, isbn, userId) => {
    try {
        await CheckOutBook(libraryId, isbn, userId);
        await fetchBooksAction(dispatch, libraryId);
    } catch (error) {
        // Não fazemos dispatch de erro aqui porque o ecrã CheckOutScreen trata disso individualmente,
        // mas podes adicionar se quiseres.
        throw error;
    }
};

export const checkinBookAction = async (dispatch, libraryId, isbn, userId) => {
    try {
        await CheckInBook(libraryId, isbn, userId);
        await fetchBooksAction(dispatch, libraryId);
    } catch (error) {
        throw error;
    }
};

export const searchBookAction = async (dispatch, isbn) => {
    console.log(">>> SEARCHING ISBN:", isbn); // Log informativo normal

    dispatch({ type: SET_LOADING, payload: true });
    try {
        const response = await LoadBook(isbn);

        if (response && response.data) {
            dispatch({ type: SEARCH_BOOK_SUCCESS, payload: response.data });
        } else {
            throw new Error("Invalid or empty book data.");
        }

    } catch (error) {
        // 1. Obter a mensagem limpa
        const friendlyMsg = getFriendlyErrorMessage(error);

        console.log("Search failed (handled):", friendlyMsg);

        dispatch({ type: SET_ERROR, payload: friendlyMsg });

        dispatch({ type: CLEAR_SEARCHED_BOOK });
    }
};

export const clearSearchedBookAction = (dispatch) => {
    dispatch({ type: CLEAR_SEARCHED_BOOK });
};