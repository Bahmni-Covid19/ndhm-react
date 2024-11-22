import React from "react";
import {GENDER} from "../../FhirPatient";
import {getHealthNumber} from "./patientDetails";

const PatientInfo = (props) => {

    const patient = props.patient;
    function getCustomAddress(patient) {
        var customAddress = [];
        if(typeof(patient.address) == 'string')
           return patient.address;
        for (var key in patient.address) {
            if(patient.address[key] && typeof(patient.address[key]) === 'object') {
                patient.address[key] = patient.address[key].filter(e => e !== null && e !== undefined && e !== "");
            }
            if (patient.address[key] && patient.address[key] !== '-' && patient.address[key] !== '' && patient.address[key] !== undefined) {
                customAddress.push(patient.address[key]);
            }
        }
        return customAddress.toString().split(',').join(', ');
    }

    function getPatientGender(gender) {
        switch(gender) {
            case "M":
                return GENDER.MALE;
            case "F":
                return GENDER.FEMALE;
            case "U":
                return GENDER.UNKNOWN;
            default:
                return GENDER.OTHER;
        }
    }

    function calculateAge(birthDate) {
        const dob = new Date(birthDate);
        var dobYear = dob.getYear();
        var dobMonth = dob.getMonth();
        var dobDate = dob.getDate();
        var now = new Date();
        var currentYear = now.getYear();
        var currentMonth = now.getMonth();
        var currentDate = now.getDate();
        var monthAge;
        var yearAge = currentYear - dobYear;
        if (currentMonth >= dobMonth) monthAge = currentMonth - dobMonth;
        else {
            yearAge--;
            monthAge = 12 + currentMonth - dobMonth;
        }
        var dateAge;
        if (currentDate >= dobDate) dateAge = currentDate - dobDate;
        else {
            monthAge--;
            dateAge = 31 + currentDate - dobDate;
            if (monthAge < 0) {
                monthAge = 11;
                yearAge--;
            }
        }

        return {
            'years': yearAge,
            'months': monthAge,
            'days': dateAge
        };
    }

    function getBirthDate(patient) {
        if(patient?.dateOfBirth !== undefined)
            return patient.dateOfBirth;
        return  new Date(patient.yearOfBirth,(patient?.monthOfBirth ?? 1) - 1,patient?.dayOfBirth ?? 1)
    }

    function getPhoneNumber(){
        if(patient?.phoneNumber !== undefined)
            return patient.phoneNumber;
        const mobileIdentifier = patient.identifiers !== undefined && patient.identifiers.find(identifier => {
            return identifier.type === 'MOBILE' || identifier.type === 'MR';
        });

        return mobileIdentifier ? mobileIdentifier.value : '-';
    }

    const address = getCustomAddress(patient);
    const healthIdNumber = getHealthNumber(patient);
    const age = calculateAge(getBirthDate(patient)).years;
    return (
        <p>
            <strong>{patient?.name?.replace(null,"")} </strong>
            ({props.showExistingPatient && (<span><strong>{patient.patientId}</strong>) ,</span>)} Age:<strong> {!isNaN(age) ? age : '-'} </strong>,
            Gender:<strong> {getPatientGender(patient?.gender) || '-'}</strong>
            {!props.showExistingPatient && <span> ) </span>}<br/>
            {address.length !== 0 && <span>Address: {address}<br/></span>}
            Mobile: {getPhoneNumber()}
            {patient?.id !== undefined && <span><br/>ABHA Address: {patient?.id}</span>}
            {patient?.healthId !== undefined && <span><br/>ABHA Address: {patient?.healthId}</span>}
            {patient?.abhaAddress !== undefined && <span><br/>ABHA Address: {patient?.abhaAddress}</span>}
            {healthIdNumber !== undefined && healthIdNumber !== null && <span><br/>ABHA Number: {healthIdNumber}</span>}
        </p>
    )
}

export default PatientInfo;