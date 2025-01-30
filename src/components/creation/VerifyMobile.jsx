import React, {useEffect, useState} from "react";
import './creation.scss';
import VerifyOTP from "./verifyOtp";
import Spinner from "../spinner/spinner";
import {generateMobileOtp, verifyMobileOtp} from "../../api/hipServiceApi";
import {GoVerified} from "react-icons/all";
import ResendOtp from "../Common/ResendOtp";

const VerifyMobile = (props) => {
    const mobile = props.mobile;
    const onVerifySuccess = props.onVerifySuccess; 
    const [loader, setLoader] = useState(false);
    const [showOtpInput, setShowOtpInput] = useState(false);
    const [error, setError] = useState('');
    const [proceed, setProceed] = useState(false);
    const [otp, setOtp] = useState('');
    const [otpVerified, setOtpVerified] = useState(false);
    const [showResendOtp, setshowResendOtp] = useState(false);
    const [showResendSuccessMessage,setShowResendSuccessMessage] = useState(false);


    function resetToDefault(){
        setError('');
        setShowOtpInput(false);
        setOtp('');
        setOtpVerified(false);
    }

    async function onVerify() {
			resetToDefault();
			setLoader(true);
			var response = await generateMobileOtp(mobile);
			setLoader(false);
			if (response.error) {
                setError(response.error.message);
			}
            else{
                setshowResendOtp(true);
                setShowOtpInput(true);
            }
		}

        async function onResendOtp() {
            setError("");
			setLoader(true);
			var response = await generateMobileOtp(mobile);
			setLoader(false);
			if (response.error) {
                if(response.error.status === 429)
                    setshowResendOtp(false);
				setError(response.error.message);
			}
            else{
                setShowResendSuccessMessage(true);
			    setTimeout(()=>{setShowResendSuccessMessage(false);},3000)
            }
		}

    async function verifyOtp() {
        if (otp === '') {
            setError("otp cannot be empty")
        } else {
            setLoader(true);
            var response = await verifyMobileOtp(otp);
            if (response) {
                setLoader(false);
                if (response.error) {
                    setError(response.error.message);
                }
                else {
                    if(response.data.authResult === "success"){
                        setOtpVerified(true);
                        setTimeout(() => {
                            setProceed(true);
                            onVerifySuccess();
                        }, 1000);
                    }
                    else{
                        setOtpVerified(false);
                        setError(response.data.message);
                    }
                }
            }
        }
    }


    useEffect(() => {
        setError('');
        if(otp !== '')
            verifyOtp();
        },[otp]);


    return (
        <div>
            {!proceed &&
                <div>
                    <h3>Verify ABHA Communication Mobile Number</h3>
                    <div>
                        <div className="mobile">
                            <label htmlFor="mobile" className="label">Mobile Number:</label>
                            <div className="verify-mobile-input-btn">
                                <div className="verify-mobile-input">
                                    <input type="text" id="mobile" name="mobile" value={props.mobile} disabled={true}/>
                                </div>
                                <button name="verify-btn" type="submit" onClick={onVerify} disabled={loader || otpVerified || showOtpInput}>Verify</button>
                            </div>
                        </div>
                    </div>
            
                    {showResendOtp && <div className="center"><ResendOtp onResend={onResendOtp}/> </div>}
                    {showResendSuccessMessage && <div className="success_text center">OTP Sent Successfully</div>}
                    {showOtpInput && <VerifyOTP setOtp={setOtp} disabled={otpVerified} mobile={mobile}/>}
                    {error !== '' && <h6 className="error">{error}</h6>}
                    {loader && <Spinner/>}
                    {otpVerified && <p className="note success"><GoVerified/> <strong>OTP Verfied Successfully</strong></p>}
                </div>}
            </div>
    );
}
export default VerifyMobile;
