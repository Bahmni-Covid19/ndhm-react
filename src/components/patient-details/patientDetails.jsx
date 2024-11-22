import React, {useEffect, useState} from 'react';
import {fetchPatientDetailsFromBahmni, saveDemographics, fetchPatientFromBahmniWithUuid} from '../../api/hipServiceApi';
import './patientDetails.scss';
import {Address, FhirPatient, Identifier, Name, Telecom, Type} from "../../FhirPatient";
import ConfirmPopup from "./confirmPopup";
import {checkIfNotNull} from "../verifyHealthId/verifyHealthId";
import PatientInfo from "./patientInfo";
import ABHACard from "../creation/ABHACard";

const PatientDetails = (props) => {
    const [selectedPatient, setSelectedPatient] = useState({});
    const [patients, setPatients] = useState([]);
    const [showABHACard, setShowABHACard] = useState(false);

    const ndhmDetails = props.ndhmDetails;

    useEffect(() => {
        if(ndhmDetails?.uuid === undefined || ndhmDetails?.uuid === "") {
            fetchBahmniDetails();
        } else {
            fetchPatientDetailsFromBahmniWithUuid();
        }
    }, []);

    async function fetchPatientDetailsFromBahmniWithUuid() {
        const response = []
        const existingPatient = await fetchPatientFromBahmniWithUuid(ndhmDetails.uuid)
        if (existingPatient.Error === undefined && existingPatient !== null) {
            response.push(existingPatient);
            const parsedPatients = response.map(patient => {parsePatient(patient); return patient});
            setPatients(parsedPatients);
        }
    }

    async function fetchBahmniDetails() {
        const response = await fetchPatientDetailsFromBahmni(ndhmDetails);
        if (response.Error === undefined && response.length > 0) {
            const parsedPatients = response.map(patient => {parsePatient(patient); return patient});
            setPatients(parsedPatients);
        }
    }

    function parsePatient(patient) {
        patient.address = patient.address.replace(/null,|null/gm, "").trim();
        patient.address = patient.address.replace(",", ", ");
        patient.name = patient.name.replace(null,"");
    }

    function updateRecord(){
        save(false);
    }

    function confirmSelection(){
        save(true);
    }

    function concatCountryCode(phoneNumber) {
        if(phoneNumber.startsWith("+91")){
            return phoneNumber;
        }
        return "+91".concat(phoneNumber);
    }

    function getPhoneNumber() {
        if(ndhmDetails.phoneNumber){
            return concatCountryCode(ndhmDetails.phoneNumber);
        }
        else if(ndhmDetails?.identifiers !== undefined && ndhmDetails?.identifiers.length > 0){
            var phoneNumber = ndhmDetails?.identifiers[0].value;
            return concatCountryCode(phoneNumber);
        }
        return null;
    }

    function save(isConfirmSelected) {
        var healthNumber = new Identifier(new Type("ABHA Number"),getHealthNumber(ndhmDetails))
        var healthId = new Identifier(new Type("ABHA Address"),ndhmDetails?.id || '-')

        var names = null;
        if(ndhmDetails.name) {
            const name = ndhmDetails?.name?.split(" ", 3);
            var familyName = name?.length === 3 ? name[2] : (name?.length > 1 ? name[1] : null)
            var middleName = name?.length === 3 ? name[1] : null
            var firstName= name?.length > 0 ? name[0]: null;
            names = new Name(familyName,[firstName,middleName]);
        }
        
        var gender = ndhmDetails?.gender
        var dob = ndhmDetails?.dateOfBirth

        var telecom = getPhoneNumber() ? new Telecom("phone",getPhoneNumber()) : null
        var address = new Address(ndhmDetails.address?.line,ndhmDetails.address?.city,ndhmDetails.address?.district,ndhmDetails.address?.state,ndhmDetails.address?.pincode,"IN")

        var id;
        if(isConfirmSelected && selectedPatient.uuid !== undefined){
           id = selectedPatient.uuid;
        }

        let patient = new FhirPatient(id,[healthId,healthNumber],names,gender,dob,ndhmDetails?.isBirthDateEstimated, address,telecom,"")

        window.parent.postMessage({ "patient": patient }, "*");
        saveDemographics(ndhmDetails?.id,ndhmDetails)
    }

    function prepareMatchingPatientsList() {
        return patients.map((patient, i) => {
            return (
                <button onClick={() => setSelectedPatient(patients[i])} disabled={checkIfNotNull(selectedPatient)} className='matching-patient'><PatientInfo patient={patient} showExistingPatient={true}/></button>
            );
        });
    }

    return (
        <div className="matching-patients">
                <div className={checkIfNotNull(selectedPatient) ? 'greyed-out' : ''}>
                    <b>ABDM Record: </b>
                    <PatientInfo patient={ndhmDetails}/><br/>
                    <div className='center'><button onClick={()=> setShowABHACard(true)} disabled={showABHACard}>Get ABHA Card</button></div>
                    {(!props.isVerifyABHAThroughFetchModes && props.isVerifyABHAThroughFetchModes !== undefined) || showABHACard &&
                    <div className="abha-card">
                        <ABHACard  healthIdNumber={ndhmDetails?.healthIdNumber}/>
                    </div>}
                    {patients.length === 0 && <b>No Bahmni Record Found</b>}
                    {patients.length > 0 && ndhmDetails.uuid == undefined &&
                    <div>
                        <b>Following Matched Bahmni Record Found:</b>
                        <div className="matched-record-note">
                            <p>Select the appropriate <b>matched</b> Bahmni record to update the data for that patient in the system, or click on <b>Create New Record</b>, if you want to create a fresh patient record</p>
                        </div>
                        {prepareMatchingPatientsList()}
                    </div>}
                    {patients.length > 0 && ndhmDetails.uuid != undefined &&
                    <div>
                    <div className="matched-record-note">
                        <p>The Bahmni record below will be updated with the ABDM details above. Please click on the record to proceed.</p>
                    </div>
                        {prepareMatchingPatientsList()}
                    </div>}
                    <div className="create-confirm-btns">
                        {props.setBack !== undefined && <button onClick={() => props.setBack(true)}>back</button>}
                        {(ndhmDetails.uuid == undefined || ndhmDetails.uuid == "") && <button onClick={updateRecord}> Create New Record </button>}
                    </div>
                </div>
                {checkIfNotNull(selectedPatient) && <ConfirmPopup selectedPatient={selectedPatient} close={() => setSelectedPatient({})} onConfirm={confirmSelection}/>}
        </div>
    );
};
export default PatientDetails;

export const getHealthNumber = (ndhmDetails) => {
    if(ndhmDetails?.healthIdNumber)
        return ndhmDetails?.healthIdNumber;
    if(ndhmDetails?.abhaNumber)
        return ndhmDetails?.abhaNumber;
    let healthNumber;
    if(ndhmDetails?.identifiers !== undefined) {
        ndhmDetails?.identifiers.forEach(id => {
            if (id.type.localeCompare("HEALTH_NUMBER") === 0) {
                healthNumber = id.value;
            }
        })
    }
    return healthNumber;
}
