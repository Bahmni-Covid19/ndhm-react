import React, {useEffect, useState} from "react";
import {
    fetchPatientFromBahmniWithHealthId,
    getHealthIdStatus,
    saveTokenOnQRScan, searchAbhaAddress, fetchGlobalProperty
} from '../../api/hipServiceApi';
import AuthModes from '../auth-modes/authModes';
import Spinner from '../spinner/spinner';
import QrReader from 'react-qr-scanner';
import PatientDetails from '../patient-details/patientDetails';
import { FcWebcam } from 'react-icons/fc';
import './verifyHealthId.scss';
import DemoAuth from "../demo-auth/demoAuth";
import CreateHealthId from "../otp-verification/create-healthId";
import {enableHealthIdVerificationThroughMobileNumber} from "../../api/constants";
import VerifyHealthIdThroughMobileNumber from "./verifyHealthIdThroughMobileNumber";
import { formatAbhaNumber, validateAbhaNumber } from "../Common/FormatAndValidationUtils";
import VerifyThroughAadhaarNumber from "./verifyThroughAadhaarNumber";

const VerifyHealthId = () => {
    const [abhaNumber, setAbhaNumber] = useState('');
    const [abhaAddress, setAbhaAddress] = useState('');
    const [authModes, setAuthModes] = useState([]);
    const supportedHealthIdAuthModes = ["MOBILE_OTP", "AADHAAR_OTP"];
    const [showAuthModes, setShowAuthModes] = useState(false);
    const [matchingPatientFound, setMatchingPatientFound] = useState(false);
    const [matchingpatientUuid, setMatchingPatientUuid] = useState('');
    const [healthIdIsVoided, setHealthIdIsVoided] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [showError, setShowError] = useState(false);
    const [loader, setLoader] = useState(false);
    const [scanningStatus, setScanningStatus] = useState(false);
    const [ndhmDetails, setNdhmDetails] = useState({});
    const [back, setBack] = useState(false);
    const [isDemoAuth, setIsDemoAuth] = useState(false);
    const [isHealthIdCreated, setIsHealthIdCreated] = useState(false);
    const [isVerifyABHAThroughFetchModes, setIsVerifyABHAThroughFetchModes] = useState(false);
    const [isVerifyThroughABHASerice, setIsVerifyThroughABHAService] = useState(false);
    const [isVerifyThroughMobileNumberEnabled, setIsVerifyThroughMobileNumberEnabled] = useState(false);
    const [isDisabled, setIsDisabled] = useState(false);
    const [isMobileOtpVerified, setIsMobileOtpVerified] = useState(false);
    const [isVerifyByAbhaAddress, setIsVerifyByAbhaAddress] = useState(false);
    const [selectedIdentifierType, setSelectedIdentifierType] = useState('');
    const [enableABHACardView, setEnableABHACardView] = useState(true);


    function identifierTypeOnChangeHandler(e) {
        setShowError(false);
        setErrorMessage('');
        setAuthModes([]);
        setShowAuthModes(false);
        setMatchingPatientFound(false);
        setNdhmDetails({});
        setAbhaNumber('');
        setAbhaAddress('');
        setSelectedIdentifierType(e.target.value);
    }

    function abhaNumberOnChangeHandler(e) {
        setShowError(false);
        setErrorMessage('');
        setAbhaNumber(e.target.value);
    }

    function abhaAddressOnChangeHandler(e) {
        setAbhaAddress(e.target.value);
    }

      async function verifyAbhaNumber() {
        if(!validateAbhaNumber(abhaNumber)) {
            setShowError(true)
            setErrorMessage("Invalid ABHA Number. ABHA Number should be 14 digits");
            return;
        }
        const formattedAbhaNumber = formatAbhaNumber(abhaNumber);
        setLoader(true);
        setShowError(false);
        const matchingPatientId = await fetchPatientFromBahmniWithHealthId(formattedAbhaNumber);
        const healthIdStatus = matchingPatientId.Error !== undefined ? await getHealthIdStatus(matchingPatientId.patientUuid) : false;
        if (matchingPatientId.Error === undefined) {
            if(healthIdStatus === true)
                setHealthIdIsVoided(true);
            else if (matchingPatientId.validPatient === true) {
                setMatchingPatientFound(true);
                setMatchingPatientUuid(matchingPatientId.patientUuid);
            } else {
                setMatchingPatientFound(false);
                setShowAuthModes(true);
                setAuthModes(['AADHAAR_OTP','MOBILE_OTP']);

            }
        } else {
            setShowError(true)
            setErrorMessage(matchingPatientId.Error.message);
        }
        setLoader(false);
    }

    async function searchByAbhaAddress() {
        if(abhaAddress === ''){
            setShowError(true);
            setErrorMessage("Please enter ABHA Address");
            return;
        }
        setLoader(true);
        setShowError(false);
        setErrorMessage('');
        const matchingPatientId = await fetchPatientFromBahmniWithHealthId(abhaAddress);
        console.log(matchingPatientId);
        const healthIdStatus = matchingPatientId.Error !== undefined ? await getHealthIdStatus(matchingPatientId.patientUuid) : false;
        if (matchingPatientId.Error === undefined) {
            if (healthIdStatus === true)
                setHealthIdIsVoided(true);
            else if (matchingPatientId.validPatient === true) {
                setMatchingPatientFound(true);
                setMatchingPatientUuid(matchingPatientId.patientUuid);
            } else {
                const response = await searchAbhaAddress(abhaAddress);
                setLoader(false);
                setIsVerifyByAbhaAddress(true);
                if (response.data !== undefined) {
                    setIsVerifyThroughABHAService(true);
                    if (response.data.status === "ACTIVE") {
                        setShowAuthModes(true);
                        setAuthModes(response.data.authMethods !== undefined ?
                            response.data.authMethods.filter(e => supportedHealthIdAuthModes.includes(e)) : []);
                    } else {
                        setShowError(true)
                        setErrorMessage("Abha address is not active");
                    }
                }
            }
        }
        else {
            setShowError(true)
            setErrorMessage(matchingPatientId.error.message);
        }
        setLoader(false);
    }

    function getIfVaild(str){
        return (str && str !== '-') ? str : null;
    }

    function mapToNdhmDetails(scannedData) {
        var patient = JSON.parse(scannedData.text);
        var dob = patient['dob'].split(/[-/]+/).reverse().map(e => e !== "" ? e : "1");
        return {
            id: patient['phr'] || patient['hid'],
            gender: patient['gender'],
            name: patient['name'],
            dateOfBirth: dob.join('-'),
            isBirthDateEstimated: dob.length !== 3,
            address: {
                district: getIfVaild(patient['dist name'] || patient['district_name']),
                state: getIfVaild(patient['state name']) || patient['state_name'],
                pincode: getIfVaild(patient['pincode'])
            },
            identifiers: [
                {
                    "type": "MOBILE",
                    "value": patient['mobile']
                },
                {
                    "type": "HEALTH_NUMBER",
                    "value": getIfVaild(patient['hidn'])
                }
            ]
        };
    }

    async function handleScan(scannedData) {
        setEnableABHACardView(false);
        if (scannedData != null) {
            var ndhmDetails = mapToNdhmDetails(scannedData)
            setScanningStatus(false);
            const matchingPatientId = await fetchPatientFromBahmniWithHealthId(ndhmDetails.id);
            const healthIdStatus = matchingPatientId.Error !== undefined ? await getHealthIdStatus(matchingPatientId.patientUuid) : false;
            if (matchingPatientId.Error === undefined) {
                if (healthIdStatus === true)
                    setHealthIdIsVoided(true);
                else if (matchingPatientId.validPatient === true) {
                    setMatchingPatientFound(true);
                    setMatchingPatientUuid(matchingPatientId.patientUuid);
                } else {
                    setMatchingPatientFound(false);
                    setAbhaNumber(ndhmDetails.id);
                    setNdhmDetails(ndhmDetails);
                    setIsVerifyABHAThroughFetchModes(true);
                    await saveTokenOnQRScan(ndhmDetails);
                }
            } else {
                setShowError(true)
                setErrorMessage(matchingPatientId.Error.message);
            }
        }
    }


    function redirectToPatientDashboard() {
        window.parent.postMessage({"patientUuid" : matchingpatientUuid}, "*");
    }

    useEffect(() => {
        if(back){
            setNdhmDetails({});
            setAbhaNumber('');
            setShowError(false);
            setShowAuthModes(false);
            setAuthModes([]);
            setMatchingPatientFound(false);
            setHealthIdIsVoided(false);
            setLoader(false);
            setBack(false);
            setIsDemoAuth(false);
            setIsMobileOtpVerified(false);
        }

    },[back])

    useEffect(async () => {
        var resp = await fetchGlobalProperty(enableHealthIdVerificationThroughMobileNumber)
        if (resp.Error === undefined) {
            setIsVerifyThroughMobileNumberEnabled(resp);
        }
    },[])

    return (
        <div>
        {!isDemoAuth && !checkIfNotNull(ndhmDetails) &&
            <div>
                {!isMobileOtpVerified &&
                <div>
                    <div className="qr-code-scanner">
                        <button name="scan-btn" type="button" onClick={()=> setScanningStatus(!scanningStatus)} disabled={showAuthModes || checkIfNotNull(ndhmDetails) || isDisabled}>Scan Patient's QR code <span id="cam-icon"><FcWebcam /></span></button>
                        {scanningStatus && <QrReader
                            delay={10}
                            onScan={handleScan}
                            style={{ width: '60%', margin: '50px' }}
                        />}
                    </div>
                    <div className="alternative-text">
                        OR
                    </div>
                <div className="auth-modes">
                <label htmlFor="verify-type">Select identifier type for Verification</label>
                    <div className="auth-modes-select-btn">
                        <div className="auth-modes-select">
                            <select id="verify-type" onChange={identifierTypeOnChangeHandler}>
                                <option value=''>Select Identifier Type</option>
                                <option value="ABHA_NUMBER">ABHA Number</option>
                                <option value="ABHA_ADDRESS">ABHA Address</option>
                                {isVerifyThroughMobileNumberEnabled && <option value="MOBILE_NUMBER">Mobile Number</option> }
                                <option value="AADHAAR_NUMBER">Aadhaar Number</option>
                            </select>
                        </div>
                    </div>
                </div>
                {selectedIdentifierType ==="ABHA_NUMBER" &&
                <div className="verify-health-id">
                        <label htmlFor="healthId" className="label">Enter ABHA Number</label>
                        <div className="verify-health-id-input-btn">
                            <div className="verify-health-id-input">
                                <input type="text" id="abhaNumber" name="abhaNumber" value={abhaNumber} onChange={abhaNumberOnChangeHandler} />
                            </div>
                            <button name="verify-btn" type="button" onClick={verifyAbhaNumber} disabled={showAuthModes || checkIfNotNull(ndhmDetails) || isDisabled}>Proceed</button>
                        </div>
                </div>
                }
                {selectedIdentifierType ==="ABHA_ADDRESS" &&
                    <div className="verify-health-id">
                        <label htmlFor="healthId" className="label">Enter ABHA Address</label>
                        <div className="verify-health-id-input-btn">
                            <div className="verify-health-id-input">
                                <input type="text" id="abhaAddress" name="abhaAddress" value={abhaAddress} onChange={abhaAddressOnChangeHandler} />
                            </div>
                            <button name="verify-btn" type="button" onClick={searchByAbhaAddress} disabled={showAuthModes || checkIfNotNull(ndhmDetails) || isDisabled}>Verify</button>
                        </div>
                    </div>
                }
                {showError && <h6 className="error center">{errorMessage}</h6>}
                </div>}
                {selectedIdentifierType ==="MOBILE_NUMBER" &&
                <div>
                    <VerifyHealthIdThroughMobileNumber isDisabled={showAuthModes} setIsDisabled={setIsDisabled} setIsMobileOtpVerified={setIsMobileOtpVerified}
                                                       ndhmDetails={ndhmDetails} setNdhmDetails={setNdhmDetails} setBack={setBack}/>
                </div>}
                {selectedIdentifierType ==="AADHAAR_NUMBER" &&
                <div>
                    <VerifyThroughAadhaarNumber setIsDisabled={setIsDisabled} setNdhmDetails={setNdhmDetails}/>
                </div>
                }
                {matchingPatientFound && <div className="patient-existed" onClick={redirectToPatientDashboard}>
                    Matching record with Health ID/PHR Address found
                </div>}
                {healthIdIsVoided && <div className="id-deactivated">
                    Health ID is deactivated
                </div>}
                {loader && <Spinner />}
                {showAuthModes && <AuthModes id={isVerifyByAbhaAddress?abhaAddress:formatAbhaNumber(abhaNumber)} authModes={authModes} ndhmDetails={ndhmDetails} setNdhmDetails={setNdhmDetails} setIsDemoAuth={setIsDemoAuth} isVerifyByAbhaAddress={isVerifyByAbhaAddress}/>}
            </div>}
            {isDemoAuth && !checkIfNotNull(ndhmDetails) && <DemoAuth id={abhaNumber} ndhmDetails={ndhmDetails} setNdhmDetails={setNdhmDetails} setBack={setBack}/>}
            {(isVerifyThroughABHASerice || isVerifyThroughMobileNumberEnabled) && checkIfNotNull(ndhmDetails) && ndhmDetails.id === undefined  && <CreateHealthId ndhmDetails={ndhmDetails} setNdhmDetails={setNdhmDetails} setIsHealthIdCreated={setIsHealthIdCreated} />}
            {!matchingPatientFound && !healthIdIsVoided && checkIfNotNull(ndhmDetails) && (ndhmDetails.id !== undefined || isHealthIdCreated || isVerifyABHAThroughFetchModes)
                && <PatientDetails enableABHACardView={enableABHACardView} ndhmDetails={ndhmDetails} id={abhaNumber}
                                   setBack={setBack}
                                   isVerifyABHAThroughFetchModes={isVerifyABHAThroughFetchModes || !isHealthIdCreated}
                                   isVerifyByAbhaAddress={isVerifyByAbhaAddress}/>}
        </div>
    );
}

export const checkIfNotNull = (patient) => {
    return JSON.stringify(patient) !== JSON.stringify({})
}

export default VerifyHealthId;
