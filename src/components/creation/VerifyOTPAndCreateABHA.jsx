import React, { useState, useEffect } from "react";
import "./creation.scss";
import Spinner from "../spinner/spinner";
import { verifyAadhaarOtpAndCreateABHA } from "../../api/hipServiceApi";
import VerifyMobile from "./VerifyMobile";
import LinkABHAAddress from "./LinkABHAAddress";
import {GoVerified} from "react-icons/all";
import { getCityFromAddressLine } from "../Common/patientMapper";

const VerifyOTPAndCreateABHA = (props) => {
	const [otp, setOtp] = useState("");
	const [mobile, setMobile] = useState("");
	const [confirmDisabled, setConfirmDisabled] = useState(true);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [requireMobileVerification, setRequireMobileVerification] =
		useState(false);
	const [isMobileVerified, setIsMobileVerified] = useState(false);
	const [patient, setPatient] = useState({});
	const [mappedPatient, setMappedPatient] = useState({});
	const [abhaCreationResponseData, setAbhaCreationResponseData] = useState(null);
	const [proceed, setProceed] = useState(false);

	function otpOnChangeHandler(e) {
		setOtp(e.target.value);
	}

	function mobileOnChangeHandler(e) {
		setMobile(e.target.value);
	}

	useEffect(() => {
		if (otp.length === 6 && mobile.length === 10) {
			setConfirmDisabled(false);
		} else {
			setConfirmDisabled(true);
		}
	}, [otp, mobile]);

	useEffect(() => {
		if (Object.keys(patient).length !== 0) {
			mapPatient();
		}
	}, [patient]);

	async function verifyOTP() {
        setError("");
		setIsLoading(true);
		var response = await verifyAadhaarOtpAndCreateABHA(otp, mobile);
		setIsLoading(false);
		if (response.error) {
			setError(response.error.message);
		} else {
			setConfirmDisabled(true);
			setAbhaCreationResponseData(response.data);
		}
	}

	function onProceed() {
		let abhaProfile = abhaCreationResponseData.abhaProfile;
		setPatient(abhaCreationResponseData.abhaProfile);
		if (!abhaProfile.mobile) {
			setRequireMobileVerification(true);
		} else {
			setIsMobileVerified(true);
		}
		setProceed(true);
	}

	function onMobileVerifySuccess() {
		setIsMobileVerified(true);
	}

	function mapPatient() {
		var identifier = [
			{
				type: "MOBILE",
				value: patient.mobile || mobile,
			},
		];
		var address = {
			city: getCityFromAddressLine(patient.address),
			district: patient?.districtName,
			state: patient?.stateName,
			pincode: patient?.pinCode,
		};
		const mappedPatientDetails = {
			healthIdNumber: patient?.abhaNumber,
			id: patient?.healthId,
			gender: patient.gender,
			name: [patient.firstName, patient.middleName, patient.lastName]
				.filter((i) => i !== "" && i !== null)
				.join(" "),
			isBirthDateEstimated: patient?.dob !== undefined ? false : true,
			dateOfBirth: patient?.dob.split("-").reverse().join("-"),
			address: address,
			identifiers: identifier,
			uuid: patient?.uuid,
		};
		setMappedPatient(mappedPatientDetails);
	}

	return (
		<div>
			{!requireMobileVerification && !isMobileVerified && (
				<div>
					<h3>Verify Aadhaar OTP</h3>
					<div className="input-and-label">
						<label htmlFor="otp" className="label">
							Enter OTP sent to the Mobile Number {props.mobile}
						</label>
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
						</div>
					</div>
					<div className="input-and-label">
						<label htmlFor="mobile" className="label">
							Mobile Number used for ABHA Communications
						</label>
						<div className="verify-mobile-input-btn">
							<div className="verify-mobile-input">
								<input
									type="text"
									id="mobile"
									name="mobile"
									value={mobile}
									onChange={mobileOnChangeHandler}
								/>
							</div>
						</div>
					</div>
					{error !== "" && <h6 className="error">{error}</h6>}
					<div className="center">
						<button
							type="button"
							disabled={confirmDisabled}
							onClick={verifyOTP}
						>
							Confirm
						</button>
					</div>
				</div>
			)}
			{isLoading && <Spinner />}
			{abhaCreationResponseData && !proceed && (
				<div>
					<p className="note success">
						<GoVerified /> <strong>{abhaCreationResponseData.message}</strong>
					</p>
					<p className="note">
						ABHA Number: {abhaCreationResponseData.abhaProfile.abhaNumber}
					</p>
					<div className="center">
						<button type="button" onClick={onProceed}>
							Proceed
						</button>
					</div>
				</div>
			)}
			{requireMobileVerification && (
				<VerifyMobile mobile={mobile} onVerifySuccess={onMobileVerifySuccess} />
			)}
			{isMobileVerified && (
				<LinkABHAAddress patient={patient} mappedPatient={mappedPatient} />
			)}
		</div>
	);
};

export default VerifyOTPAndCreateABHA;
