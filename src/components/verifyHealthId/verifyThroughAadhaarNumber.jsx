import React, { useState } from "react";
import {
	aadhaarNumberRequestOtp,
	aadhaarNumberVerifyOtp,
	fetchPatientFromBahmniWithHealthId,
	getPatientProfile,
} from "../../api/hipServiceApi";
import Spinner from "../spinner/spinner";
import "./verifyHealthId.scss";
import { mapPatient } from "../Common/patientMapper";
import { validateOtp } from "../Common/FormatAndValidationUtils";
import ResendOtp from "../Common/ResendOtp";
import { isAadhaarValid } from "../Common/AadhaarValidation";

const VerifyThroughAadhaarNumber = (props) => {
	const [aadhaarNumber, setAadhaarNumber] = useState("");
	const [showOtpInput, setShowOtpInput] = useState(false);
	const [otp, setOtp] = useState("");
	const [matchingPatientFound, setMatchingPatientFound] = useState(false);
	const [matchingpatientUuid, setMatchingPatientUuid] = useState("");
	const [showError, setShowError] = useState(false);
	const [loader, setLoader] = useState(false);
	const [error, setError] = useState("");
	const [showResendSuccessMessage, setShowResendSuccessMessage] =
		useState(false);

	function idOnChangeHandler(e) {
		setShowError(false);
		setError("");
		setAadhaarNumber(e.target.value);
		setShowOtpInput(false);
	}

	function otpOnChangeHandler(e) {
		setOtp(e.target.value);
	}

	async function onResendOtp() {
		setError("");
		setLoader(true);
		setShowError(false);
		var response = await aadhaarNumberRequestOtp(aadhaarNumber);
		setLoader(false);
		if (response.error) {
			setShowError(true);
			setError(response.error.message);
		} else {
			setShowResendSuccessMessage(true);
			setTimeout(() => {
				setShowResendSuccessMessage(false);
			}, 3000);
		}
	}

	async function verifyAadhaarNumber() {
		let formattedAadhaarNumber = aadhaarNumber.trim();
		if (!isAadhaarValid(formattedAadhaarNumber)) {
			setShowError(true);
			setError("Invalid Aadhaar Number");
			return;
		}
		setError("");
		setLoader(true);
		setShowError(false);
		const response = await aadhaarNumberRequestOtp(aadhaarNumber);
		if (response.data !== undefined) {
			setShowOtpInput(true);
			props.setIsDisabled(true);
		} else {
			setShowError(true);
			setError(response.error.message);
		}
		setLoader(false);
	}

	async function verifyOtp() {
		setError("");
		setShowError(false);
		if (!validateOtp(otp)) {
			setShowError(true);
			setError("Invalid OTP. OTP should be 6 digits");
		} else {
			setLoader(true);
			var response = await aadhaarNumberVerifyOtp(otp);
			if (response) {
				setLoader(false);
				if (response.data === undefined) {
					setShowError(true);
					setError(response.error.message);
				} else {
					if (response.data.authResult === "success") await getABHAProfile();
					else {
						setError(response.data.message);
						setShowError(true);
					}
				}
			}
		}
	}

	function redirectToPatientDashboard() {
		window.parent.postMessage({ patientUuid: matchingpatientUuid }, "*");
	}

	async function getABHAProfile() {
		setError("");
		setShowError(false);
		setLoader(true);
		const response = await getPatientProfile();
		if (response) {
			setLoader(false);
			if (response.data === undefined) {
				setShowError(true);
				setError(response.error.message);
			} else {
				const matchingPatientId = await fetchPatientFromBahmniWithHealthId(
					response.data.abhaNumber
				);
				if (
					matchingPatientId.Error === undefined &&
					matchingPatientId.validPatient === true
				) {
					setMatchingPatientFound(true);
					setMatchingPatientUuid(matchingPatientId.patientUuid);
				} else {
					if (matchingPatientId.Error !== undefined) {
						setShowError(true);
						setError(matchingPatientId.Error.message);
					} else {
						props.setNdhmDetails(mapPatient(response.data));
					}
				}
			}
		}
	}

	return (
		<div>
			<div className="verify-health-id">
				<label htmlFor="aadhaarNumber" className="label">
					Enter Aadhaar Number:{" "}
				</label>
				<div className="verify-health-id-input-btn">
					<div className="verify-health-id-input">
						<input
							type="text"
							id="aadhaarNumber"
							name="aadhaarNumber"
							value={aadhaarNumber}
							onChange={idOnChangeHandler}
						/>
					</div>
					<button
						name="verify-btn"
						type="button"
						onClick={verifyAadhaarNumber}
						disabled={showOtpInput}
					>
						Verify
					</button>
					{!showOtpInput && showError && <h6 className="error ">{error}</h6>}
				</div>
			</div>
			{showOtpInput && (
				<div>
					<div className="otp-verify">
						<label htmlFor="otp">Enter OTP </label>
						<div className="otp-verify-input-btn">
							<div className="otp-verify-input">
								<input
									type="text"
									id="otp"
									name="otp"
									value={otp}
									onChange={otpOnChangeHandler}
								/>
							</div>
							<ResendOtp onResend={onResendOtp} />
							{showResendSuccessMessage && (
								<div className="success_text">OTP Sent Successfully</div>
							)}
							{showError && <h6 className="error ">{error}</h6>}
						</div>
					</div>
					<div className="qr-code-scanner">
						{" "}
						<button type="button" onClick={verifyOtp}>
							Fetch ABDM Data
						</button>
					</div>
				</div>
			)}
			{matchingPatientFound && (
				<div className="patient-existed" onClick={redirectToPatientDashboard}>
					Matching record with Health ID/PHR Address found
				</div>
			)}
			{loader && <Spinner />}
		</div>
	);
};
export default VerifyThroughAadhaarNumber;
