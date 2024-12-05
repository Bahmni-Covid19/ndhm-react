import React, {useEffect, useState} from "react";

const ResendOtp = ({onResend}) => {
    const TIME_INTERVAL = 3;
    const [resendOtpDisabled, setResendOtpDisabled] = useState(true);
    const [timeLeft, setTimeLeft] = useState(TIME_INTERVAL);
    const [attemptsLeft, setAttemptsLeft] = useState(2);

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
        <button
            type="button"
            disabled={resendOtpDisabled || attemptsLeft <=0 }
            onClick={handleResendClick}
        >
            Resend
        </button>
    )
};

export default ResendOtp;



