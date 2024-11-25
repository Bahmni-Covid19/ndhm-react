import * as Constants from './constants';
export const parseAPIError = (error) => {
    if (!error.response?.data) {
        return Constants.serviceUnavailableError;
    }
    var errorResponseData = error.response.data
    if (errorResponseData.message)
        return { "error": { "message": errorResponseData.message } }
    if (errorResponseData.error?.message)
        return { "error": { "message": errorResponseData.error.message } }
    if (errorResponseData.details !== undefined && errorResponseData.details.length > 0)
        return { "error": { "message": errorResponseData.details[0].message } }
    if (errorResponseData.error !== undefined && typeof errorResponseData.error === 'string')
        return { "error": { "message": errorResponseData.error } }
    let extractedErrorMessage = extractErrorMessage(errorResponseData)
    if (extractedErrorMessage !== undefined)
        return extractedErrorMessage
    if (error.status === 400)
        return { "error": { "message": "Bad Request: Please verify the entered input" } }
    if (error.status === 500)
        return { "error": { "message": "Internal Server Error: Please try again later" } }
    return { "error": { "message": "An error occurred while processing your request" } }
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