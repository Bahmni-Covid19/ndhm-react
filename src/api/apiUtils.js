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
    if (errorResponseData.message)
    {
        errorObject.error.message = errorResponseData.message;
        return errorObject;
    }
    if (errorResponseData.error?.message)
    {
        errorObject.error.message = errorResponseData.error.message;
        return errorObject;
    }
    if (errorResponseData.details !== undefined && errorResponseData.details.length > 0){
        errorObject.error.message = errorResponseData.details[0].message;
        return errorObject;
    }
    if (errorResponseData.error !== undefined && typeof errorResponseData.error === 'string')
    {
        errorObject.error.message = errorResponseData.error;
        return errorObject;
    }
    let extractedErrorMessage = extractErrorMessage(errorResponseData)
    if (extractedErrorMessage !== undefined)
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

const extractErrorMessage = (errorResponseData) => {
    if (typeof errorResponseData === 'object')
        for (var key in errorResponseData) {
            if (key !== 'timestamp') {
                return { "error": { "message": errorResponseData[key] } }
            }
        }
    return undefined;
}