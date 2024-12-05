import React, {useEffect, useState} from "react";
import {
    fetchPatientFromBahmniWithHealthId,
    getPatientProfile,
    mobileGenerateOtp,
    mobileVerifyOtp,
    verifyAbhaAccount
} from '../../api/hipServiceApi';
import Spinner from '../spinner/spinner';
import './verifyHealthId.scss';
import {checkIfNotNull} from "./verifyHealthId";
import {mapPatient} from "../Common/patientMapper";
import { validateMobileNumber, validateOtp } from "../Common/FormatAndValidationUtils";

const VerifyHealthIdThroughMobileNumber = (props) => {
    const [mobileNumber, setMobileNumber] = useState('');
    const [showOtpInput, setShowOtpInput] = useState(false);
    const [otp, setOtp] = useState('');
    const [linkedABHANumber, setLinkedABHANumber] = useState([]);
    const [matchingPatientFound, setMatchingPatientFound] = useState(false);
    const [matchingpatientUuid, setMatchingPatientUuid] = useState('');
    const [showError, setShowError] = useState(false);
    const [loader, setLoader] = useState(false);
    const [back, setBack] = useState(false);
    const [isHealthIdNotLinked, setIsHealthIdNotLinked] = useState(false);
    const [error, setError] = useState('');
    const [selectedABHA, setSelectedABHA] = useState({});

    function idOnChangeHandler(e) {
        setShowError(false);
        setError('');
        setMobileNumber(e.target.value);
        setShowOtpInput(false);
    }

    function otpOnChangeHandler(e) {
        setOtp(e.target.value);
    }

    async function verifyMobileNumber() {
        let formattedMobileNumber = mobileNumber.trim();
        if(!validateMobileNumber(formattedMobileNumber)){
            setShowError(true);
            setError("Invalid Mobile Number. Mobile Number should be 10 digits");
            return;
        }
        setError('');
        setLoader(true);
        setShowError(false);
        const response = await mobileGenerateOtp(mobileNumber);
        if (response.data !== undefined) {
            setShowOtpInput(true);
            props.setIsDisabled(true);
        }
        else {
            setShowError(true);
            setError(response.error.message);
        }
        setLoader(false);
    }

    async function verifyOtp() {
        setError('');
        setShowError(false);
        if (!validateOtp(otp)) {
            setShowError(true);
            setError("Invalid OTP. OTP should be 6 digits");
        } else {
            setLoader(true);
            var response = await mobileVerifyOtp(otp);
            if(response){
                setLoader(false);
                if(response.data === undefined){
                    setShowError(true);
                    setError(response.error.message);
                }
                else {
                    props.setIsMobileOtpVerified(true);
                    setLinkedABHANumber(response.data.accounts);
                }
            }
        }
    }

    function redirectToPatientDashboard() {
        window.parent.postMessage({"patientUuid" : matchingpatientUuid}, "*");
    }

    function prepareMatchingPatientsList() {
        return linkedABHANumber.map((patient, i) => {
            return (
                <button onClick={() => setSelectedABHA(linkedABHANumber[i])} className={selectedABHA === patient ? "active" : "abha-list"}>
                    <p>
                        <strong>{patient?.name?.replace(null,"")} </strong>
                        {patient?.preferredAbhaAddress !== "" && <span><br/>ABHA Address: {patient?.preferredAbhaAddress}</span>}
                         <span><br/>ABHA Number: {patient.abhaNumber}</span>
                    </p>
                </button>
            );
        });
    }

    useEffect(async () => {
        setIsHealthIdNotLinked(false);
        setMatchingPatientFound(false);
        if (checkIfNotNull(selectedABHA)) {
            if (selectedABHA.abhaNumber === "") {
                setIsHealthIdNotLinked(true);
            }
            if(selectedABHA.abhaNumber !== "") {
                const matchingPatientId = await fetchPatientFromBahmniWithHealthId(selectedABHA.abhaNumber);
                if (matchingPatientId.Error === undefined && matchingPatientId.validPatient === true) {
                    setMatchingPatientFound(true);
                    setMatchingPatientUuid(matchingPatientId.patientUuid);
                } else {
                    if (matchingPatientId.Error !== undefined) {
                        setShowError(true);
                        setError(matchingPatientId.Error.message);
                    }
                }
            }
        }
    },[selectedABHA])

    async function getABHAProfile() {
        setError('');
        setShowError(false);
        setLoader(true);
        const response = await getPatientProfile();
        if (response) {
            setLoader(false);
            if (response.data === undefined) {
                setShowError(true);
                setError(response.error.message);
            }
            else {
                props.setNdhmDetails(mapPatient(response.data));
            }
        }
    }

    async function verifyingAbhaAccount() {
        setError('');
        setLoader(true);
        setShowError(false);

        try {
            const response = await verifyAbhaAccount(selectedABHA.abhaNumber);
            console.log(response.data);
            if (response.data !== undefined) {
                await getABHAProfile();
            } else {
                setShowError(true);
                setError(response.error.message);
            }
        } catch (error) {
            setShowError(true);
            setError(error.message || "An error occurred while verifying the account.");
        } finally {
            setLoader(false);
        }
    }

    useEffect(() => {
        if(back) {
            setMobileNumber('');
            setOtp('');
            setError('');
            setShowOtpInput('');
            setLinkedABHANumber([]);
            setSelectedABHA({});
            props.setIsMobileOtpVerified(false);
            props.setBack(true);
        }
    },[back])



    return (
        <div>
        {!checkIfNotNull(props.ndhmDetails) &&
            <div>
                {linkedABHANumber.length === 0 && <div>
                    <div className="verify-health-id">
                        <label htmlFor="mobileNumber" className="label">Enter Mobile Number: </label>
                        <div className="verify-health-id-input-btn">
                            <div className="verify-health-id-input">
                                <input type="text" id="mobileNumber" name="mobileNumber" value={mobileNumber} onChange={idOnChangeHandler} />
                            </div>
                            <button name="verify-btn" type="button" onClick={verifyMobileNumber} disabled={props.isDisabled || showOtpInput}>Verify</button>
                            {!showOtpInput && showError && <h6 className="error ">{error}</h6>}
                        </div>
                    </div>
                    {showOtpInput &&
                    <div className="otp-verify" >
                        <label htmlFor="otp">Enter OTP </label>
                        <div className="otp-verify-input-btn" >
                            <div className="otp-verify-input">
                                <input type="text" id="otp" name="otp" value={otp} onChange={otpOnChangeHandler} />
                            </div>
                            <button type="button" onClick={verifyOtp}>Confirm</button>
                            {showError && <h6 className="error ">{error}</h6>}
                        </div>
                    </div>}
                    {loader && <Spinner />}
                </div>}
                {linkedABHANumber.length > 0 &&
                <div>
                    <h3>ABHA numbers found for the given mobile number. Please select one of the following</h3>
                    {prepareMatchingPatientsList()}
                    {matchingPatientFound && <div className="patient-existed" onClick={redirectToPatientDashboard}>
                        Matching record with Health ID/PHR Address found
                    </div>}
                    {isHealthIdNotLinked && <div className="note health-id">
                        ABHA Number doesn't have ABHA Address linked.
                        Click on proceed to create new ABHA Address.
                    </div>}
                    <div className="create-confirm-btns">
                        {props.setBack !== undefined && <button onClick={() => setBack(true)}>Back</button>}
                        {checkIfNotNull(selectedABHA) && !matchingPatientFound && <button onClick={verifyingAbhaAccount}> {isHealthIdNotLinked ? "Proceed" : "Confirm"} </button>}
                    </div>
                    {showError && <h6 className="error-msg">{error}</h6>}
                    {loader && <Spinner />}
                </div>}
            </div>}
        </div>
    );
}
export default VerifyHealthIdThroughMobileNumber;
