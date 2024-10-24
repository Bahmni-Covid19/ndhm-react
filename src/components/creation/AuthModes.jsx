import React, { useEffect, useState } from "react";
import Spinner from '../spinner/spinner';
import {fetchGlobalProperty } from "../../api/hipServiceApi";
import { enableDemographics } from "../../api/constants";

const AuthModes = (props) => {
    
    const [authModes, setAuthModes] = useState(['AADHAAR OTP']);
    const [selectedAuthMode, setSelectedAuthMode] = useState('AADHAAR OTP');
    const [loader, setLoader] = useState(false);
    const [isInitialised, setIsInitialised] = useState(false);

    function onAuthModeSelected(e) {
        setSelectedAuthMode(e.target.value);
    }

    async function checkIfDemoAuthSupported() {
        if(isInitialised){
            return;
        }
        setLoader(true);
        const response = await fetchGlobalProperty(enableDemographics);
        if (response.Error === undefined && response !== "" && response) {
            setAuthModes([...authModes, 'AADHAAR DEMOGRAPHICS']);
        }
        setLoader(false);
        setIsInitialised(true);
    }

    useEffect(() => {
        checkIfDemoAuthSupported();
    },[isInitialised])

    function proceed() {
        props.setSelectedAuthMode(selectedAuthMode);
    }

    return (
        <div>
            <div className="select-option">
                <label htmlFor="auth-modes">Preferred mode of Authentication</label>
                {loader && <Spinner />}
                {!loader && (
                <div className="select-btn">
                    <div className="select">
                        <select id="auth-modes" onChange={onAuthModeSelected}>
                            {authModes.map((mode, index) => {
                                return <option key={index} value={mode}>{mode}</option>
                            })}
                        </select>
                    </div>
                    <button type="button" disabled={props.showOtpInput} onClick={proceed}>Proceed</button>
                </div>)}
            </div>
        </div>
    );
}
export default AuthModes;
