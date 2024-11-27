
export const headers = {
    'Content-Type': 'application/json'
};
export const purpose = "KYC_AND_LINK";
export const bahmniUrl = "/openmrs/ws/rest/v1/hip";
export const hipServiceUrl ="/hiprovider";
export const hipAadhaarDemographicsUrl = "/v1/hid/benefit/createHealthId/demo/auth";

export const authModesUrl = "/v0.5/hip/fetch-modes";
export const authInitUrl = "/v0.5/hip/auth/init";
export const authConfirmUrl = "/v0.5/hip/auth/confirm";
export const getPatientForDirectAuthUrl = "/v0.5/hip/auth/direct";
export const existingPatientUrl = "/existingPatients";
export const existingPatientWithUuid = "/existingPatientWithUuid";
export const ndhmDemographics = "/v0.5/hip/ndhm-demographics";
export const authToken = "/v0.5/hip/auth/demographics";
export const fetchPatientQueue ="/v3/hip/getPatientQueue";
export const generateAadhaarOtp = "/v3/hip/generateAadhaarOtp"
export const verifyAadhaarOtpAndCreateABHA = "/v3/hip/verifyOtpAndCreateABHA"
export const generateABHAMobileOTP = "/v3/hip/generateMobileOtp"
export const verifyMobileOTP = "/v3/hip/verifyMobileOtp"
export const getAbhaAddressSuggestions = "/v3/hip/getAbhaAddressSuggestions"
export const getPngCard = "/v3/hip/getAbhaCard";
export const searchHealthId = "/v2/search/searchHealthIdToLogin"
export const healthIdAuthInit = "/v2/auth/init"
export const healthIdConfirmOtp = "/v2/hip/confirmOTP"
export const createDefaultHealthId = "/v1/account/update/phr-address"
export const updateHealthId = "/v2/hip/profile/updatePhrAddress"
export const generateMobileOtp = "/v2/registration/mobile/login/generateOtp"
export const verifyMobileOtp = "/v2/registration/mobile/login/verifyOtp"
export const getPatientProfileInfo = "/v2/registration/mobile/login/userAuthorizedToken"
export const mobileEmailInit = "/v1/phr/login/mobileEmail/init";
export const mobileEmailPreverification = "/v1/phr/login/mobileEmail/preVerification";
export const getUserToken = "/v1/phr/login/mobileEmail/getUserToken";
export const linkABHAAddress = "/v1/phr/profile/link/hid";
export const authMethods = "/v1/phr/registration/hid/search/auth-methods";
export const transaction = "/v1/phr/login/init/transaction";
export const createABHAAddress = "/v3/hip/createAbhaAddress";
export const openmrsSession = "/openmrs/ws/rest/v1/session"
export const globalPropertyUrl = "/openmrs/ws/rest/v1/bahmnicore/sql/globalproperty"
export const cmSuffixProperty = 'bahmniHip.CM_SUFFIX'
export const enableHealthIdVerification = 'bahmniHip.enableHealthIdVerification'
export const enableHealthIdVerificationThroughMobileNumber = 'bahmniHip.enableHealthIdVerificationThroughMobileNumber'
export const enableDemographics = 'bahmniHip.enableDemographics'
export const enableLinkABHAAddress = 'bahmniHip.enableLinkABHAAddress'
export const serviceUnavailableError = {
    "error": {
        "message": "Service Unavailable. Please try again later"
    }
}
export const invalidHealthId = {
    "error": {
        "message": "Health Id/PHR Address is invalid. " +
            "Health Id must contain 14 digits. Eg. 57-0517-6745-1839, 57051767451839. " +
            "PHR Address must contain at least 4 letters. " +
            "Only alphabets and numbers are allowed and " +
            "special character are not allowed except dot(.). Eg. kamla.rani@sbx"
    }
}
export const invalidAuthMode = {
    "error": {
        "message": "Please choose a valid auth mode."
    }
}
export const emptyOTP = {
    "error": {
        "message": "OTP cannot be empty."
    }
}
export const openMrsDown = {
    "Error": {
        "message": "OpenMRS-REST is Unhealthy,OpenMRS-FHIR is Unhealthy"
    }
}
