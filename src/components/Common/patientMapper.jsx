import {getDate} from "./DateUtil";

export function mapPatient(patient){
    var identifier = patient?.mobile !== undefined ? [{
        type: "MOBILE",
        value: patient.mobile
    }] : undefined;
    var address =  {
        line: [patient?.address],
        city: patient?.townName,
        district: patient?.districtName,
        state: patient?.stateName,
        pincode: patient?.pincode
    };
    return {
        healthIdNumber: patient?.healthIdNumber,
        id: patient?.healthId,
        gender: patient.gender,
        name: patient.name,
        isBirthDateEstimated: patient?.birthdate !== undefined ? false : (patient?.monthOfBirth == null || patient?.dayOfBirth == null),
        dateOfBirth: patient?.birthdate === undefined ? getDate(patient) : patient?.birthdate.split('-').reverse().join('-'),
        address: address,
        identifiers: identifier,
        uuid: patient?.uuid
    };
}

export function getCityFromAddressLine(addressLine){
    let addressParts = addressLine.split(',');
    return addressParts.length > 3 ? addressParts[addressParts.length - 3].trim() : undefined;
}
