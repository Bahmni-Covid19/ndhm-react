import React, { useState } from "react";
import {
    authConfirm,
    abhaNumberVerifyOtp,
    getPatientProfile,
    abhaAddressVerifyOtp,
    getAbhaAddressProfile
} from '../../api/hipServiceApi';
import Spinner from '../spinner/spinner';
import {checkIfNotNull} from "../verifyHealthId/verifyHealthId";
import {getDate} from "../Common/DateUtil";
import {mapPatient} from "../Common/patientMapper";

const OtpVerification = (props) => {
    const [otp, setOtp] = useState('');
    const [ndhmDetails, setNdhmDetails] = [props.ndhmDetails,props.setNdhmDetails];
    const [errorHealthId, setErrorHealthId] = useState('');
    const [showError, setShowError] = useState(false);
    const [loader, setLoader] = useState(false);


    async function confirmAuth() {
        setLoader(true);
        setShowError(false);
        if(!props.isHealthNumberNotLinked){
            if(props.isVerifyByAbhaAddress){
                const response = await abhaAddressVerifyOtp(otp);
                if(response.data !== undefined) {
                    const getProfileResponse= await getAbhaAddressProfile();
                    if(getProfileResponse.data != undefined) {
                        setNdhmDetails(mapPatient(getProfileResponse.data));
                    }
                    else {
                        console.log("error");
                    }

                }
                else {
                    setShowError(true);
                    setErrorHealthId(response.details[0].message || response.message);
                }
            }
            else{
                const response = await abhaNumberVerifyOtp(otp);
                if(response.data !== undefined) {
                    const getProfileResponse= await getPatientProfile();
                    if(getProfileResponse.data != undefined) {
                        setNdhmDetails(mapPatient(getProfileResponse.data));
                    }
                    else {
                        console.log("error");
                    }

                }
                else {
                    setShowError(true);
                    setErrorHealthId(response.details[0].message || response.message);
                }
            }

        }
        else {
            const response = await authConfirm(props.id, otp);
            if (response.error !== undefined || response.Error !== undefined) {
                setShowError(true)
                setErrorHealthId((response.Error && response.Error.Message) || response.error.message);
            }
            else {
                setNdhmDetails(parseNdhmDetails(response));
            }
        }


        setLoader(false);
    }

    function otpOnChangeHandler(e) {
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
            {!checkIfNotNull(ndhmDetails) && <div className="otp-verify" >
                <label htmlFor="otp">Enter OTP </label>
                <div className="otp-verify-input-btn" >
                    <div className="otp-verify-input">
                        <input type="text" id="otp" name="otp" value={otp} onChange={otpOnChangeHandler} />
                    </div>
                    <button type="button" disabled={checkIfNotNull(ndhmDetails)} onClick={confirmAuth}>Fetch ABDM Data</button>
                    {showError && <h6 className="error">{errorHealthId}</h6>}
                </div>
            </div>}
            {loader && <Spinner />}
        </div>
    );
}

export default OtpVerification;
