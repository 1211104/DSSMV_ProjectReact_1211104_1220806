import axios from "axios";
import { LIB_API_URL,ENDPOINTS } from "../utils/URL";

const api=axios.create({
    baseURL: LIB_API_URL,
    timeout: 5000,
})

const GetLibraries=()=> api.get(ENDPOINTS.GET_LIBRARY);
const CreateLibrary = (libraryData) =>
    api.post(ENDPOINTS.GET_LIBRARY, libraryData);
const DeleteLibrary = (libraryId) =>
    api.delete(`${ENDPOINTS.GET_LIBRARY}/${libraryId}`);
const UpdateLibrary = (libraryId, libraryData) =>
    api.put(`${ENDPOINTS.GET_LIBRARY}/${libraryId}`, libraryData);
const GetBooks = (libraryId) =>
    api.get(`${ENDPOINTS.GET_LIBRARY}/${libraryId}/book`);
const LoadBook = (isbn) => api.get(`${ENDPOINTS.LOAD_BOOK}/${isbn}`);
const AddNewBook = (libraryId, isbn, bookData) =>
    api.post(`${ENDPOINTS.GET_LIBRARY}/${libraryId}/book/${isbn}`, bookData);
const UpdateBook = (libraryId, isbn, bookData) =>
    api.put(`${ENDPOINTS.GET_LIBRARY}/${libraryId}/book/${isbn}`, bookData);
const CheckOutBook = (libraryId, isbn, userId) =>
    api.post(
        `${ENDPOINTS.GET_LIBRARY}/${libraryId}/book/${isbn}/checkout`,
        null,
        {
            params: { userId: userId },
        }
    );
const CheckInBook = (libraryId, isbn, userId) =>
    api.post(
        `${ENDPOINTS.GET_LIBRARY}/${libraryId}/book/${isbn}/checkin`,
        null,
        {
            params: { userId: userId },
        }
    );


export {
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
};