import axios from 'axios';
import * as Constants from './constants';
export const getAuthModes = async (healthId) => {
    let error = isValidHealthId(healthId);
    if (error) {
        return error;
    }
    const data = {
        "healthId": healthId,
        "purpose": Constants.purpose
    };

    try {
        const response = await axios.post(Constants.hipServiceUrl + Constants.authModesUrl, data, Constants.headers);
        return response.data;
    }
    catch (error) {
        if (error.response !== undefined)
            return error.response.data;
        else
            return Constants.serviceUnavailableError;
    }
};

export const saveDemographics = async (healthId,ndhmDetails) => {
    const data = {
            "healthId": healthId,
            "name": ndhmDetails.name,
            "gender": ndhmDetails.gender,
            "dateOfBirth": ndhmDetails.dateOfBirth,
            "phoneNumber": ndhmDetails.identifiers ? ndhmDetails.identifiers[0].value : null
    };

    try {
        const response = await axios.post(Constants.hipServiceUrl + Constants.ndhmDemographics, data, Constants.headers);
        return response.data;
    }
    catch (error) {
        if (error.response !== undefined)
            return error.response.data;
        else
            return Constants.serviceUnavailableError;
    }
};

export const authInit = async (healthId, authMode) => {
    let error = isValidAuthMode(authMode);
    if (error)
        return error;
    const data = {
        "healthId": healthId,
        "authMode": authMode,
        "purpose": Constants.purpose
    };
    try {
        const response = await axios.post(Constants.hipServiceUrl + Constants.authInitUrl, data, Constants.headers);
        return response;
    }
    catch (error) {
        if (error.response !== undefined)
            return error.response.data;
        else
            return Constants.serviceUnavailableError;
    }
};

export const authConfirm = async (healthId, otp, demographics) => {
    let error = otp != null ? isValidOTP(otp) : null;
    if (error) {
        return error;
    }
    const data = {
        "authCode": otp != null ? btoa(otp) : null,
        "healthId": healthId,
        "demographic": demographics
    };
    try {
        const response = await axios.post(Constants.hipServiceUrl + Constants.authConfirmUrl, data, Constants.headers);
        return response.data.patient;
    }
    catch (error) {
        if (error.response !== undefined)
            return error.response.data;
        else
            return Constants.serviceUnavailableError;
    }
}

export const aadhaarDemographicsAuth = async (demographics) => {
    try {
        const response = await axios.post(Constants.hipServiceUrl + Constants.hipAadhaarDemographicsUrl, demographics, Constants.headers);
        return response.data;
    }
    catch (error) {
        if (error.response !== undefined)
            return error.response.data;
        else
            return Constants.serviceUnavailableError;
    }
}

export const checkAndGetPatientDetails = async (healthId) => {
    try {
        const response = await axios.post(Constants.hipServiceUrl + Constants.getPatientForDirectAuthUrl + "?healthId=" + healthId ,Constants.headers);
        return response;
    }
    catch (error) {
        if (error.response !== undefined)
            return error.response.data;
        else
            return Constants.serviceUnavailableError;
    }
};

export const fetchPatientDetailsFromBahmni = async (patient) => {
    const params = {
        "patientName": patient.name,
        "patientYearOfBirth": new Date(patient.dateOfBirth).getFullYear(),
        "patientGender": patient.gender,
        "phoneNumber": encodeURI((patient?.identifiers !== undefined && patient?.identifiers.length > 0) ? patient?.identifiers[0].value : "")
    }
    try {
        const response = await axios.get(Constants.bahmniUrl + Constants.existingPatientUrl, { params }, Constants.headers);
        return response.data;
    }
    catch (error) {
        if (error.response !== undefined)
            return error.response.data;
        else
            return Constants.serviceUnavailableError;
    }
}

const isValidHealthId = (healthId) => {
    if (!(IsValidPHRAddress(healthId) || IsValidHealthId(healthId)))
        return Constants.invalidHealthId;
}

const isValidAuthMode = (authMode) => {
    if (authMode === '')
        return Constants.invalidAuthMode;
}

const isValidOTP = (otp) => {
    if (otp === '')
        return Constants.emptyOTP;
}

export const fetchPatientFromBahmniWithHealthId = async (healthId) => {
    try {
        const response = await axios.get(Constants.bahmniUrl + Constants.existingPatientUrl + "/" + healthId, Constants.headers);
        return response.data;
    } catch (error) {
        return Constants.openMrsDown;
    }
}

export const getHealthIdStatus = async (patientUuid) => {
    try {
        const response = await axios.get(Constants.bahmniUrl + Constants.existingPatientUrl + "/IdDeactivationStatus/" + patientUuid, Constants.headers);
        return response.data;
    } catch (error) {
        return Constants.openMrsDown;
    }
}
export const IsValidPHRAddress = (healthId) => {
    let pattern = "^[a-zA-Z]+(([a-zA-Z.0-9]+){2})[a-zA-Z0-9]+@[a-zA-Z]+$";
    return healthId.match(pattern);
}

export const IsValidHealthId = (healthId) => {
    let pattern = "^([0-9]{14})$|^[0-9]{2}[-][0-9]{4}[-][0-9]{4}[-][0-9]{4}$";
    return healthId.match(pattern);
}

export const getPatientQueue = async () => {
    try {
        const response = await axios.get(Constants.hipServiceUrl + Constants.patientProfileFetch);
        return response.data;
    }
    catch (error) {
        if (error.response !== undefined)
            return error.response.data;
        else
            return Constants.serviceUnavailableError;
    }
};

export const saveTokenOnQRScan = async (ndhmDetails) => {
    const data = {
        "healthId": ndhmDetails.id,
        "name": ndhmDetails.name,
        "gender": ndhmDetails.gender,
        "dateOfBirth": ndhmDetails.dateOfBirth,
        "phoneNumber": ndhmDetails.identifiers[0].value
    };
    try {
        const response = await axios.post(Constants.hipServiceUrl + Constants.authToken,data, Constants.headers);
        return response;
    }
    catch (error) {
        return Constants.serviceUnavailableError;
    }
};

export const generateAadhaarOtp = async (aadhaar) => {
    const data = {
        "aadhaar": aadhaar
    };
    try {
        const response = await axios.post(Constants.hipServiceUrl + Constants.generateAadhaarOtp,data, Constants.headers);
        return response;
    }
    catch (error) {
        if (error.response !== undefined)
            return error.response.data;
        else
            return Constants.serviceUnavailableError;
    }
}

export const verifyAadhaarOtpAndCreateABHA = async (otp,mobile) => {
    const data = {
        "otp": otp,
        "mobile": mobile
    };
    try {
        const response = await axios.post(Constants.hipServiceUrl + Constants.verifyAadhaarOtpAndCreateABHA,data, Constants.headers);
        return response;
    }
    catch (error) {
        if (error.response !== undefined)
            return error.response.data;
        else
            return Constants.serviceUnavailableError;
    }
}

export const generateMobileOtp = async (mobile) => {
    const data = {
        "mobile": mobile
    };
    try {
        const response = await axios.post(Constants.hipServiceUrl + Constants.generateABHAMobileOTP,data, Constants.headers);
        return response;
    }
    catch (error) {
        if (error.response !== undefined)
            return error.response.data;
        else
            return Constants.serviceUnavailableError;
    }
}

export const verifyMobileOtp = async (otp) => {
    const data = {
        "otp": otp
    };
    try {
        const response = await axios.post(Constants.hipServiceUrl + Constants.verifyMobileOTP,data, Constants.headers);
        return response;
    }
    catch (error) {
        if (error.response !== undefined)
            return error.response.data;
        else
            return Constants.serviceUnavailableError;
    }
}

export const getCard = async () => {
    try {
        const response = await axios.get(Constants.hipServiceUrl + Constants.getPngCard,{
            responseType: 'arraybuffer'
        });
        return response;
    }
    catch (error) {
        if (error.response !== undefined)
            return error.response.data;
        else
            return Constants.serviceUnavailableError;
    }
}

export const mobileEmailInit = async (mobile) => {
    const data = {
        "input": mobile
    };
    try {
        const response = await axios.post(Constants.hipServiceUrl + Constants.mobileEmailInit, data, Constants.headers);
        return response;
    }
    catch (error) {
        if (error.response !== undefined)
            return error.response.data;
        else
            return Constants.serviceUnavailableError;
    }
}

export const verifyOtpInput = async (otp, isHealthIdNumberOtp = false) => {
    const data = {
        "otp": otp,
        "isHealthIdNumberOtp": isHealthIdNumberOtp
    };
    try {
        const response = await axios.post(Constants.hipServiceUrl + Constants.mobileEmailPreverification, data, Constants.headers);
        return response;
    }
    catch (error) {
        if (error.response !== undefined)
            return error.response.data;
        else
            return Constants.serviceUnavailableError;
    }
}

export const getUserToken = async (phrAddress) => {
    const data = {
        "phrAddress": phrAddress
    };
    try {
        const response = await axios.post(Constants.hipServiceUrl + Constants.getUserToken, data, Constants.headers);
        return response;
    }
    catch (error) {
        if (error.response !== undefined)
            return error.response.data;
        else
            return Constants.serviceUnavailableError;
    }
}

export const linkORUnlinkABHAAddress = async (action) => {
    const data = {
        "action": action
    };
    try {
        const response = await axios.post(Constants.hipServiceUrl + Constants.linkABHAAddress, data, Constants.headers);
        return response;
    }
    catch (error) {
        if (error.response !== undefined)
            return error.response.data;
        else
            return Constants.serviceUnavailableError;
    }
}

export const getAuthMethods = async (healthIdNumber) => {
    const data = {
        "healhtIdNumber": healthIdNumber
    };
    try {
        const response = await axios.post(Constants.hipServiceUrl + Constants.authMethods, data, Constants.headers);
        return response;
    }
    catch (error) {
        if (error.response !== undefined)
            return error.response.data;
        else
            return Constants.serviceUnavailableError;
    }
}

export const transaction = async (authMethod) => {
    try {
        const response = await axios.post(Constants.hipServiceUrl + Constants.transaction + "?authMode=" + authMethod, Constants.headers);
        return response;
    }
    catch (error) {
        if (error.response !== undefined)
            return error.response.data;
        else
            return Constants.serviceUnavailableError;
    }
}

export const getAbhaAddressSuggestions = async () => {
    try {
        const response = await axios.get(Constants.hipServiceUrl + Constants.getAbhaAddressSuggestions);
        return response;
    }
    catch (error) {
        if (error.response !== undefined)
            return error.response.data;
        else
            return Constants.serviceUnavailableError;
    }
}

export const createABHAAddress = async (abhaAddress) => {
    const data = {
        "abhaAddress": abhaAddress
    };
    try {
        const response = await axios.post(Constants.hipServiceUrl + Constants.createABHAAddress, data, Constants.headers);
        return response;
    }
    catch (error) {
        if (error.response !== undefined)
            return error.response.data;
        else
            return Constants.serviceUnavailableError;
    }
}

export const searchHealthId = async (healthId) => {
    const data = {
        "healthId": healthId
    };
    try {
        const response = await axios.post(Constants.hipServiceUrl + Constants.searchHealthId,data, Constants.headers);
        return response;
    }
    catch (error) {
        if (error.response !== undefined)
            return error.response.data;
        else
            return Constants.serviceUnavailableError;
    }
}

export const healthIdAuthInit = async (healthId, authMode) => {
    const data = {
        "healthId": healthId,
        "authMethod": authMode,
    };
    try {
        const response = await axios.post(Constants.hipServiceUrl + Constants.healthIdAuthInit, data, Constants.headers);
        return response;
    }
    catch (error) {
        if (error.response !== undefined)
            return error.response.data;
        else
            return Constants.serviceUnavailableError;
    }
};

export const healthIdConfirmOtp = async (otp, authMode) => {
    const data = {
        "otp": otp,
        "authMethod": authMode,
    };
    try {
        const response = await axios.post(Constants.hipServiceUrl + Constants.healthIdConfirmOtp, data, Constants.headers);
        return response;
    }
    catch (error) {
        if (error.response !== undefined)
            return error.response.data;
        else
            return Constants.serviceUnavailableError;
    }
};

export const createDefaultHealthId = async () => {
    try {
        const response = await axios.get(Constants.hipServiceUrl + Constants.createDefaultHealthId, Constants.headers);
        return response;
    }
    catch (error) {
        if (error.response !== undefined)
            return error.response.data;
        else
            return Constants.serviceUnavailableError;
    }
};

export const updateHealthId = async (healthId) => {
    try {
        const response = await axios.post(Constants.hipServiceUrl + Constants.updateHealthId +"?healthId=" + healthId, Constants.headers);
        return response;
    }
    catch (error) {
        if (error.response !== undefined)
            return error.response.data;
        else
            return Constants.serviceUnavailableError;
    }
};

export const mobileGenerateOtp = async (mobileNumber) => {
    const data = {
        "mobile": mobileNumber
    };
    try {
        const response = await axios.post(Constants.hipServiceUrl + Constants.generateMobileOtp, data, Constants.headers);
        return response;
    }
    catch (error) {
        if (error.response !== undefined)
            return error.response.data;
        else
            return Constants.serviceUnavailableError;
    }
};


export const mobileVerifyOtp = async (otp) => {
    const data = {
        "otp": otp
    };
    try {
        const response = await axios.post(Constants.hipServiceUrl + Constants.verifyMobileOtp, data, Constants.headers);
        return response;
    }
    catch (error) {
        if (error.response !== undefined)
            return error.response.data;
        else
            return Constants.serviceUnavailableError;
    }
};

export const getPatientProfile = async (healthId) => {
    const data = {
        "healthId": healthId
    };
    try {
        const response = await axios.post(Constants.hipServiceUrl + Constants.getPatientProfileInfo, data, Constants.headers);
        return response;
    }
    catch (error) {
        if (error.response !== undefined)
            return error.response.data;
        else
            return Constants.serviceUnavailableError;
    }
};

export const fetchPatientFromBahmniWithUuid = async (patientUuid) => {
    try {
        const response = await axios.get(Constants.bahmniUrl + Constants.existingPatientWithUuid + "/" + patientUuid, Constants.headers);
        return response.data;
    } catch (error) {
        return Constants.openMrsDown;
    }
}

export const fetchGlobalProperty = async (property) => {
    try {
        const response = await axios.get(`${Constants.globalPropertyUrl}?property=${property}`)
        return response.data;
    } catch (error) {
        return Constants.openMrsDown;
    }
}

export const checkIfHealthNumberExists = async (patientUuid) => {
    try {
        const response = await axios.get(Constants.bahmniUrl + Constants.existingPatientUrl + "/checkHealthNumber/" + patientUuid, Constants.headers);
        return response.data;
    } catch (error) {
        return Constants.openMrsDown;
    }
}
