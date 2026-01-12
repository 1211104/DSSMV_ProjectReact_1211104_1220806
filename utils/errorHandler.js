
export const getFriendlyErrorMessage = (error) => {
    if (error.response) {
        const data = error.response.data;


        const isHtml = typeof data === 'string' && data.trim().startsWith('<');

        if (!isHtml && data && (data.message || data.error)) {
            return data.message || data.error;
        }

        switch (error.response.status) {
            case 400:
                return "Invalid data. Please check your inputs.";
            case 401:
                return "Unauthorized. Please login again.";
            case 403:
                return "You do not have permission to perform this action.";
            case 404:
                return "Book or resource not found (404).";
            case 409:
                return "Conflict error (e.g., duplicate record).";
            case 500:
                return "Internal server error. Please try again later.";
            default:
                return `Server error (${error.response.status}).`;
        }
    }

    // 2. Sem resposta (Timeout ou Sem Internet)
    else if (error.request) {
        return "Unable to contact the server. Check your internet connection.";
    }

    // 3. Erro interno da App
    else {
        console.log("App Internal Error:", error.message);
        return "An unexpected error occurred.";
    }
};