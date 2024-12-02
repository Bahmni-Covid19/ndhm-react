export const validateAbhaNumber = (abhaNumber) => {
    return /^\d{14}$/.test(abhaNumber);
};
export const formatAbhaNumber = (abhaNumber) => {
    let ABHA_NUMBER_REGEX = /^(\d{2})(\d{4})(\d{4})(\d{4})$/;
    const match = abhaNumber.match(ABHA_NUMBER_REGEX);
    if (match) {
        return `${match[1]}-${match[2]}-${match[3]}-${match[4]}`;
    }
    return abhaNumber;
};

export const validateOtp = (otp) => {
    return /^\d{6}$/.test(otp);
}

export const validateMobileNumber = (mobileNumber) => {
    return /^\d{10}$/.test(mobileNumber);
}