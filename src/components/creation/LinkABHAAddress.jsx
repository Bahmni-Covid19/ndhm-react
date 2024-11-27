import React, {useEffect, useRef, useState} from "react";
import './creation.scss';
import PatientDetails from "../patient-details/patientDetails";
import VerifyMobileEmail from "./VerifyMobileEmail";
import CreateABHAAddress from "./CreateABHAAddress";
import {enableLinkABHAAddress} from "../../api/constants";
import CheckIdentifierExists from "../Common/CheckIdentifierExists";
import {fetchGlobalProperty} from "../../api/hipServiceApi";

const LinkABHAAddress = (props) => {
    const patient = props.patient;
    const [abhaAddress, setAbhaAddress] = useState('');
    const [proceed, setProceed] = useState(false);
    const [link, setLink] = useState(false);
    const [createNewABHA, setcreateNewABHA] = useState(false);
    const [newAbhaAddress, setNewAbhaAddress] = useState('');
    const [abhaAddressCreated, setABHAAddressCreated]= useState(false);
    const [back, setBack] = useState(false);
    const [healthIdIsVoided, setHealthIdIsVoided] = useState(false);
    const [matchingPatientUuid, setMatchingPatientUuid] = useState(undefined);
    const [isAbhaSelected, setIsAbhaSelected] = useState(false);
    const [healthNumberAlreadyLinked, setHealthNumberAlreadyLinked] = useState(false);
    let isLinkingEnabled;
    const refEls = useRef({});
    
    function onProceed() {
        mapPatient();
        setProceed(true);
    }

    function fetchLinkAddressGlobalProperty(){
        fetchGlobalProperty(enableLinkABHAAddress).then(response => {
            isLinkingEnabled = response === "true";
        });
    }

    useEffect(() => {
        if (isLinkingEnabled === undefined) {
            fetchLinkAddressGlobalProperty()
        }
        document.addEventListener("click", handleClickOutside, false);
        return () => {
          document.removeEventListener("click", handleClickOutside, false);
        };
      }, []);
    
      const handleClickOutside = event => {
        if (refEls.current && !Object.values(Object.values(refEls.current)).includes(event.target)) {
            setIsAbhaSelected(false);
            setAbhaAddress('');
        } else {
            setIsAbhaSelected(true);
        }
      };

    let phrAddressList = patient.phrAddress !== undefined && patient.phrAddress.length > 0 && patient.phrAddress.map((item, i) => {
        return (
            <div>
                <button ref={(element) => refEls.current[i] = element} onClick={() => {setAbhaAddress(patient.phrAddress[i]); setIsAbhaSelected(true);}} className={abhaAddress === item ? "active" : "abha-list"}>{item}</button>
            </div>
        )
    });


    function mapPatient(){
        props.mappedPatient.id = abhaAddressCreated ? newAbhaAddress : abhaAddress;
    }

    function gotoLink(){
        setLink(true);
    }

    function gotoCreate(){
        setcreateNewABHA(true);
    }

    useEffect(() => {
        if(abhaAddressCreated){
            onProceed();
        }
        if(back){
            setcreateNewABHA(false);
            setLink(false);
            setProceed(false);
            setAbhaAddress('');
            setNewAbhaAddress('');
            setABHAAddressCreated(false);
            setBack(false);
        }
    },[abhaAddressCreated, back])

    useEffect(() => {
        props.mappedPatient.uuid = matchingPatientUuid;
    },[matchingPatientUuid])

    return (
        <div>
            {!createNewABHA && !link && !proceed &&
            <div>
                {(patient.phrAddress === undefined || patient.phrAddress.length === 0) &&
                <div className="no-abha-address">
                 <p className="note">You don't have ABHA Address/ Health Id linked to your ABHA Number</p>
                 <p className="note">
                     {isLinkingEnabled && <> Please proceed with linking the ABHA address that is already mapped to the mobile number or email, or </>}
                 create a new ABHA address</p>
                    {!isLinkingEnabled &&
                        <CreateABHAAddress setBack={setBack} newAbhaAddress={newAbhaAddress} setNewAbhaAddress={setNewAbhaAddress} setABHAAddressCreated={setABHAAddressCreated} />
                    }
                </div>}
                {patient.phrAddress !== undefined &&
                <div>
                    <div className="choose-abha-address">
                        <div className="abha-list-label">
                            <label htmlFor="abha-address">Choose from existing ABHA Addresses linked to ABHA Number.</label>
                        </div>
                            {phrAddressList}
                    </div>
                    {isAbhaSelected && <CheckIdentifierExists id={abhaAddress} setHealthIdIsVoided={setHealthIdIsVoided} setMatchingPatientUuid={setMatchingPatientUuid} setHealthNumberAlreadyLinked={setHealthNumberAlreadyLinked}/>}
                    {abhaAddress !== '' && <div className="center">
                        <button type="button" disabled={healthNumberAlreadyLinked || healthIdIsVoided || !isAbhaSelected? true : false} className="proceed" onClick={onProceed}>Proceed</button>
                    </div>}

                {isLinkingEnabled && <div className="left-button">
                    <button type="button" disabled={isAbhaSelected ? true : false} className="proceed" title="Link exisiting ABHA Address linked to Mobile/Email" onClick={gotoLink}>Link ABHA Address</button>
                </div>}

                <div className={isLinkingEnabled ? "right-button" :"create-new-abhaAddress"}>
                    <button type="button" disabled={isAbhaSelected ? true : false} className="proceed" title="Create new ABHA Address" onClick={gotoCreate}>Create ABHA Address</button>
                </div>
                </div>}
            </div>}
            {!proceed && createNewABHA &&
             <CreateABHAAddress setBack={setBack} newAbhaAddress={newAbhaAddress} setNewAbhaAddress={setNewAbhaAddress} setABHAAddressCreated={setABHAAddressCreated} />
            }
            {link && <VerifyMobileEmail patient={patient} setBack={setBack} mappedPatient={props.mappedPatient}/>}
            {proceed && <PatientDetails ndhmDetails={props.mappedPatient} setBack={ !abhaAddressCreated ? setBack : undefined} enableABHACardView={true}/>}
        </div>
    );
}

export default LinkABHAAddress;
