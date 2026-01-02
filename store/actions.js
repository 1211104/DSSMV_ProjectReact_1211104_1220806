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

// Action Types
export const SET_LOADING = "SET_LOADING";
export const SET_ERROR = "SET_ERROR";
export const FETCH_LIBRARIES_SUCCESS = "FETCH_LIBRARIES_SUCCESS";
export const FETCH_BOOKS_SUCCESS = "FETCH_BOOKS_SUCCESS";
export const SEARCH_BOOK_SUCCESS = "SEARCH_BOOK_SUCCESS";
export const CLEAR_SEARCHED_BOOK = "CLEAR_SEARCHED_BOOK";
// Nota: Delete, Create e Update muitas vezes apenas recarregam a lista,
// mas podemos ter tipos específicos se quisermos atualizar o estado localmente sem refetch.

// --- ACTION CREATORS ---

// 1. Bibliotecas
export const fetchLibrariesAction = async (dispatch) => {
    dispatch({ type: SET_LOADING, payload: true });
    try {
        const response = await GetLibraries();
        dispatch({ type: FETCH_LIBRARIES_SUCCESS, payload: response.data || [] });
    } catch (error) {
        console.error(error);
        dispatch({ type: SET_ERROR, payload: "Erro ao carregar bibliotecas." });
    }
};

export const createLibraryAction = async (dispatch, libraryData) => {
    dispatch({ type: SET_LOADING, payload: true });
    try {
        await CreateLibrary(libraryData);
        // Após criar, recarregamos a lista para garantir dados frescos
        await fetchLibrariesAction(dispatch);
    } catch (error) {
        console.error(error);
        dispatch({ type: SET_ERROR, payload: "Erro ao criar biblioteca." });
        throw error; // Re-lança para o ecrã poder mostrar alertas se necessário
    }
};

export const updateLibraryAction = async (dispatch, id, libraryData) => {
    dispatch({ type: SET_LOADING, payload: true });
    try {
        await UpdateLibrary(id, libraryData);
        await fetchLibrariesAction(dispatch);
    } catch (error) {
        console.error(error);
        dispatch({ type: SET_ERROR, payload: "Erro ao atualizar biblioteca." });
        throw error;
    }
};

export const deleteLibraryAction = async (dispatch, id) => {
    try {
        await DeleteLibrary(id);
        // Aqui podíamos despachar um DELETE_SUCCESS e filtrar localmente,
        // mas recarregar garante sincronia com o servidor.
        await fetchLibrariesAction(dispatch);
    } catch (error) {
        console.error(error);
        dispatch({ type: SET_ERROR, payload: "Erro ao apagar biblioteca." });
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
        console.error(error);
        dispatch({ type: SET_ERROR, payload: "Erro ao carregar livros." });
    }
};

export const addBookAction = async (dispatch, libraryId, isbn, bookData) => {
    dispatch({ type: SET_LOADING, payload: true });
    try {
        await AddNewBook(libraryId, isbn, bookData);
        await fetchBooksAction(dispatch, libraryId);
    } catch (error) {
        console.error(error);
        dispatch({ type: SET_ERROR, payload: "Erro ao adicionar livro." });
        throw error;
    }
};

export const updateBookAction = async (dispatch, libraryId, isbn, bookData) => {
    try {
        await UpdateBook(libraryId, isbn, bookData);
        await fetchBooksAction(dispatch, libraryId);
    } catch (error) {
        console.error(error);
        throw error;
    }
};

// CheckIn / CheckOut (apenas recarregam os livros após sucesso)
export const checkoutBookAction = async (dispatch, libraryId, isbn, userId) => {
    try {
        await CheckOutBook(libraryId, isbn, userId);
        await fetchBooksAction(dispatch, libraryId);
    } catch (error) {
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

    console.log(">>> A PESQUISAR ISBN:", isbn, " (Tipo:", typeof isbn, ")");

    dispatch({ type: SET_LOADING, payload: true });
    try {
        const response = await LoadBook(isbn);


        // Garante que response e response.data existem antes de enviar para o estado
        if (response && response.data) {
            dispatch({ type: SEARCH_BOOK_SUCCESS, payload: response.data });
        } else {
            // Se a API responder OK mas sem dados de livro (ex: objeto vazio)
            throw new Error("Dados do livro inválidos ou vazios.");
        }

    } catch (error) {
        console.error("Erro na pesquisa:", error);
        dispatch({ type: SET_ERROR, payload: "Livro não encontrado ou erro na API." });

        // limpar qualquer "lixo" anterior se a pesquisa falhar
        dispatch({ type: CLEAR_SEARCHED_BOOK });
    }
};

// limpar o livro pesquisado ao sair do ecrã
export const clearSearchedBookAction = (dispatch) => {
    dispatch({ type: CLEAR_SEARCHED_BOOK });
};