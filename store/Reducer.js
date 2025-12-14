import {
    SET_LOADING,
    SET_ERROR,
    FETCH_LIBRARIES_SUCCESS,
    FETCH_BOOKS_SUCCESS,
    SEARCH_BOOK_SUCCESS, // <--- Novo
    CLEAR_SEARCHED_BOOK, // <--- Novo
} from "./actions";

export const initialState = {
    libraries: [],
    currentBooks: [],
    isLoading: false,
    searchedBook: null,
    error: null,
};

export const reducer = (state, action) => {
    switch (action.type) {
        case SET_LOADING:
            return { ...state, isLoading: action.payload, error: null };

        case SET_ERROR:
            return { ...state, isLoading: false, error: action.payload };

        case FETCH_LIBRARIES_SUCCESS:
            return {
                ...state,
                isLoading: false,
                libraries: action.payload,
            };

        case FETCH_BOOKS_SUCCESS:
            return {
                ...state,
                isLoading: false,
                currentBooks: action.payload,
            };

        case SEARCH_BOOK_SUCCESS:
            return {
                ...state,
                isLoading: false,
                searchedBook: action.payload,
                error: null,
            };

        case CLEAR_SEARCHED_BOOK:
            return {
                ...state,
                searchedBook: null, 
                error: null,
            };

        default:
            return state;
    }
};