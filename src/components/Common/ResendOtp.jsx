import React, {useEffect, useState} from "react";

const ResendOtp = ({onResend}) => {
    const TIME_INTERVAL = 60;
    const [resendOtpDisabled, setResendOtpDisabled] = useState(true);
    const [timeLeft, setTimeLeft] = useState(TIME_INTERVAL);
    const [attemptsLeft, setAttemptsLeft] = useState(2);

    const styles = {
        info_text: {
            color: "#808080",
            fontSize: "14px",
            paddingBottom: "20px",
        }
    }

    useEffect(() => {
        if (timeLeft > 0) {
            const interval = setInterval(() => {
                setTimeLeft(timeLeft - 1);
            }, 1000);

            return () => clearInterval(interval);
        } else
            setResendOtpDisabled(false);
    }, [timeLeft]);

    const handleResendClick = () => {
        if (attemptsLeft > 0) {
            onResend();
            setAttemptsLeft(attemptsLeft - 1);
            setTimeLeft(TIME_INTERVAL);
            setResendOtpDisabled(true);
        }

    }


    return (
			<div>
				{attemptsLeft <= 0 ? (
					<div style={styles.info_text}>Maximum resend attempts reached</div>
				) : timeLeft > 0 ? (
					<div style={styles.info_text}>Resend OTP in {timeLeft} seconds</div>
				) : (
					<button
						type="button"
						disabled={resendOtpDisabled || attemptsLeft <= 0}
						onClick={handleResendClick}
					>
						Resend OTP
					</button>
				)}
			</div>
		);
};

export default ResendOtp;



