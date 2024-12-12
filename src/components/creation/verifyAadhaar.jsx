import React, {useEffect, useState} from "react";
import './creation.scss';
import Spinner from "../spinner/spinner";
import {generateAadhaarOtp} from "../../api/hipServiceApi";
import AadhaarConsent from "./AadhaarConsent";
import AuthModes from "./AuthModes";
import DemoAuth from "../demo-auth/demoAuth";
import VerifyOTPAndCreateABHA from "./VerifyOTPAndCreateABHA";
import { isAadhaarValid } from "../Common/AadhaarValidation";

const VerifyAadhaar = props => {

    const [aadhaar, setAadhaar] = useState('');
    const [loader, setLoader] = useState(false);
    const [showOtpInput, setShowOtpInput] = useState(false);
    const [error, setError] = useState('');
    const [otpReceivingNumber, setOtpReceivingNumber] = useState(false);
    const [back, setBack] = useState(false);
    const [isConsentGranted, setConsentGrated] = useState(false);
    const [aadhaarError, setAadhaarError] = useState('');
    const [showAuthMode, setShowAuthMode] = useState(false);
    const [showDemographics, setShowDemographics] = useState(false);


    function idOnChangeHandler(e) {
        const re = /^[0-9\b]+$/;
        if (e.target.value === '' || re.test(e.target.value)) {
            setAadhaar(e.target.value);
        }
        setAadhaarError('');
        setShowOtpInput(false);
    }

    async function getAuthModes(){
        setAadhaarError('');
        if(isAadhaarValid(aadhaar)) {
            setShowAuthMode(true);
        }
        else{
            setAadhaarError("Invalid Aadhaar Number");
        }
    }

    async function onVerify() {
        setShowOtpInput(false);
        setLoader(true);
        var response = await generateAadhaarOtp(aadhaar);
        if(response){
            setLoader(false);
            if(response.error){
                setError(response.error.message);
            }
            else {
                setShowOtpInput(true);
                let mobileNumber=response.data.message.split(" ").at(-1); 
                setOtpReceivingNumber(mobileNumber);
            }
        }
    }


    useEffect (() => {
        if (back) {
            setAadhaar('');
            setShowOtpInput(false);
            setError('');
            setLoader(false);
            setBack(false);
        }
    },[back]);

    async function onAuthModeSelected(authMode){
        setError('');
        if(authMode === "AADHAAR OTP") {
            await onVerify();
        }
        if(authMode === "AADHAAR DEMOGRAHICS") {
            setShowDemographics(true);
        }
    }


    return (
       <div className="abha-creation">
           {(!showDemographics && !showOtpInput) && <div>
            <h3>Aadhaar Consent and Authentication</h3>
           <div className="aadhaar">
                <label htmlFor="aadhaar" className="label">Enter AADHAAR Number</label>
                <div className="verify-aadhaar-input-btn">
                    <div className="verify-aadhaar-input">
                        <input type="text" id="aadhaar" name="aadhaar" value={aadhaar} onChange={idOnChangeHandler} />
                    </div>
                </div>
            </div>
            {aadhaarError !== '' && <h6 className="error">{aadhaarError}</h6>}
            {!showAuthMode && <AadhaarConsent setConsentGrated={setConsentGrated}/>}
            {!showAuthMode && !loader && <div className="center">
                <button type="button" disabled={!isConsentGranted} name="verify-btn" onClick={getAuthModes}>Accept & Proceed</button>
            </div>}
            {showAuthMode &&
                <AuthModes showOtpInput={showOtpInput} setSelectedAuthMode={onAuthModeSelected}/>
            }
            {error !== '' && <h6 className="error">{error}</h6>}
            {loader && <Spinner />}
           </div>}
           {showOtpInput && <VerifyOTPAndCreateABHA aadhaar={aadhaar} mobile={otpReceivingNumber}/>}
           {showDemographics && <DemoAuth aadhaar={aadhaar} isAadhaarDemoAuth={true} />}
        </div>

    );
}

export default VerifyAadhaar;
