import React from "react";
import './creation.scss';

const Footer = (props) => {
    const setProceed = props.setProceed;
    const setBack = props.setBack;

    function onClick() {
        setProceed(true);
    }

    function goBack() {
        setBack(true);
    }
    return (
        <div className={props.setProceed !== undefined ? 'footer no-right-margin' : 'footer no-left-margin'}  >
            {props.setBack !== undefined && <div className={props.setProceed !== undefined ? 'left-button' : 'center' }>
                <button type="button" className="back" onClick={goBack}>Back</button>
            </div>}
            {props.setProceed !== undefined && <div className="right-button">
                <button type="button" className="proceed" onClick={onClick}>Proceed</button>
            </div>}
        </div>
    );
}

export default Footer;