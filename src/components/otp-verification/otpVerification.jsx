import React, { useState } from "react";
import {
    authConfirm,
    abhaNumberVerifyOtp,
    getPatientProfile,
    abhaAddressVerifyOtp,
    getAbhaAddressProfile, abhaNumberRequestOtp, abhaAddressRequestOtp
} from '../../api/hipServiceApi';
import Spinner from '../spinner/spinner';
import {checkIfNotNull} from "../verifyHealthId/verifyHealthId";
import {getDate} from "../Common/DateUtil";
import {mapPatient} from "../Common/patientMapper";
import { validateOtp } from "../Common/FormatAndValidationUtils";
import ResendOtp from "../Common/ResendOtp";

const OtpVerification = (props) => {
    const [otp, setOtp] = useState('');
    const [ndhmDetails, setNdhmDetails] = [props.ndhmDetails,props.setNdhmDetails];
    const [errorMessage, setErrorMessage] = useState('');
    const [showError, setShowError] = useState(false);
    const [loader, setLoader] = useState(false);
    const [showResendSuccessMessage, setShowResendSuccessMessage] = useState(false);
    const isVerifyByAbhaAddress = props.isVerifyByAbhaAddress;


    async function onResendOtp() {
        setErrorMessage("");
        setLoader(true);
        const response = isVerifyByAbhaAddress
            ? await abhaAddressRequestOtp(props.id, props.selectedAuthMode)
            : await abhaNumberRequestOtp(props.id, props.selectedAuthMode);
        setLoader(false);
        if (response.error) {
            setShowError(true);
            setErrorMessage(response.error.message);
        }
        else{
            setShowResendSuccessMessage(true);
            setTimeout(()=>{setShowResendSuccessMessage(false);},3000)
        }
    }



    async function confirmAuth() {
        let formattedOtp = otp.trim();
        if(!validateOtp(formattedOtp)){
            setShowError(true);
            setErrorMessage("Invalid OTP. OTP should be 6 digits");
            return;
        }
        setLoader(true);
        setShowError(false);
        if(!props.isHealthNumberNotLinked){
            if(props.isVerifyByAbhaAddress){
                const response = await abhaAddressVerifyOtp(otp);
                if(response.data !== undefined) {
                    if(response.data.authResult === "success"){
                    const getProfileResponse= await getAbhaAddressProfile();
                    if(getProfileResponse.data != undefined) {
                        setNdhmDetails(mapPatient(getProfileResponse.data));
                    }
                    else {
                        setShowError(true);
                        setErrorMessage(getProfileResponse.error.message);
                    }}
                    else{
                        setShowError(true);
                        setErrorMessage(response.data.message);
                    }

                }
                else {
                    setShowError(true);
                    setErrorMessage(response.error.message);
                }
            }
            else{
                const response = await abhaNumberVerifyOtp(otp);
                if(response.data !== undefined) {
                    if(response.data.authResult === "success"){
                    const getProfileResponse= await getPatientProfile();
                    if(getProfileResponse.data != undefined) {
                        setNdhmDetails(mapPatient(getProfileResponse.data));
                    }
                    else {
                        setShowError(true);
                        setErrorMessage(getProfileResponse.error.message);
                    }}
                    else{
                        setShowError(true);
                        setErrorMessage(response.data.message);
                    }

                }
                else {
                    setShowError(true);
                    setErrorMessage(response.error.message);
                }
            }

        }
        else {
            const response = await authConfirm(props.id, otp);
            if (response.error !== undefined || response.Error !== undefined) {
                setShowError(true)
                setErrorMessage((response.Error && response.Error.Message) || response.error.message);
            }
            else {
                setNdhmDetails(parseNdhmDetails(response));
            }
        }


        setLoader(false);
    }

    function otpOnChangeHandler(e) {
        setShowError(false);
        setErrorMessage('');
        setOtp(e.target.value);
    }

    function parseNdhmDetails(patient) {
        const ndhm = {
            id: patient.id,
            gender: patient.gender,
            name: patient.name,
            isBirthDateEstimated: patient?.monthOfBirth == null || patient?.dayOfBirth == null,
            dateOfBirth: getDate(patient),
            address: patient.address,
            identifiers: patient.identifiers
        };
        return ndhm;
    }


    return (
        <div>
            {!checkIfNotNull(ndhmDetails) &&
                <div>
                    <div className="otp-verify">
                        <label htmlFor="otp">Enter OTP </label>
                        <div className="otp-verify-input-btn">
                            <div className="otp-verify-input">
                                <input type="text" id="otp" name="otp" value={otp} onChange={otpOnChangeHandler}/>
                            </div>
                            <ResendOtp onResend={onResendOtp}/>
                            {showResendSuccessMessage && <div className="success_text">OTP Sent Successfully</div>}
                            {showError && <h6 className="error">{errorMessage}</h6>}
                        </div>
                    </div>
                    <div className="qr-code-scanner">
                        <button type="button" style={{marginTop: "10px"}} disabled={checkIfNotNull(ndhmDetails)}
                                onClick={confirmAuth}>Fetch ABDM Data
                        </button>
                    </div>
                </div>
            }
            {loader && <Spinner/>}
        </div>
    );
}

export default OtpVerification;
