import * as Constants from './constants';
export const parseAPIError = (error) => {
    if (!error.response?.data) {
        return Constants.serviceUnavailableError;
    }
    var errorObject = { "error": { "message": "An error occurred while processing your request", "status": error.response.status}}

    var errorResponseData = error.response.data;
    if (errorResponseData instanceof Array){
        errorResponseData = errorResponseData[0];
    }
    let extractedErrorMessage = extractErrorMessageFromPayload(errorResponseData)
    if (extractedErrorMessage)
    {
        errorObject.error.message = extractedErrorMessage;
        return errorObject;
    }
    if (error.response.status === 400)
    {
        errorObject.error.message = "Bad Request: Please verify the entered input";
        return errorObject;
    }
    if (error.response.status === 500)
    {
        errorObject.error.message = "Internal Server Error: Please try again later";
        return errorObject;
    }
    return errorObject;
}

const extractErrorMessageFromPayload = (errorResponseData) => {
    let errorMessage =  errorResponseData?.message || errorResponseData?.error?.message || errorResponseData?.details?.[0]?.message;
    if(errorMessage)
        return errorMessage
    if (typeof errorResponseData?.error === 'string') {
        return errorResponseData.error;
    }
    if (typeof errorResponseData === 'object')
        for (var key in errorResponseData) {
            if (key !== 'timestamp') {
                return { "error": { "message": errorResponseData[key] } }
            }
        }
    return undefined;
}