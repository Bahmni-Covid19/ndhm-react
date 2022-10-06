import {fetchPatientFromBahmniWithHealthId, getPatientQueue} from "../../api/hipServiceApi";
import {useEffect, useState} from "react";
import './patientQueue.scss';
import PatientDetails from "../patient-details/patientDetails";
import {checkIfNotNull} from "../verifyHealthId/verifyHealthId";
import Time from "./Time";
import PatientInfo from "../patient-details/patientInfo";


const PatientQueue = (props) => {

    const [patient,setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState({});
    const [matchFound, setMatchFound] = useState(null);

    useEffect(() => {
        getPatient()
    },[]);

    async function getPatient(){
        const res = await getPatientQueue();
        if (res.error === undefined) {
            setPatients(res);
        }
    }
    function getBirthDate(patient) {
        return  new Date(patient.yearOfBirth,(patient?.monthOfBirth ?? 1) - 1,patient?.dayOfBirth ?? 1)
    }

    async function getMatchingPatient(patient) {
        const matchingPatientId = await fetchPatientFromBahmniWithHealthId(patient.healthId);
        if (matchingPatientId.error === undefined){
           setMatchFound(matchingPatientId);
        }
        const ndhm = {
            id:  patient.healthId,
            gender: patient.gender,
            name: patient.name,
            isBirthDateEstimated: patient?.monthOfBirth == null || patient?.dayOfBirth == null,
            dateOfBirth: getBirthDate(patient),
            address: patient.address,
            identifiers: patient.identifiers
        };
       setSelectedPatient(ndhm);
    }

    function redirectToPatientDashboard() {
        window.parent.postMessage({"patientUuid" : matchFound }, "*");
    }

    return(
        <div>
            {!checkIfNotNull(selectedPatient) && <table>
                <tbody>
                <th>Patient</th>
                <th>check-in time</th>
                {patient.map((p,i) => {
                    return <tr>
                        <td><PatientInfo patient={p.profile} /></td>
                        <td> <Time time={p.dateTimeStamp}/></td>
                        <td>
                            <button type='submit' onClick={() => getMatchingPatient(p.profile)}>Register</button>
                        </td>
                    </tr>
                })}

                </tbody>
            </table>}
            {!matchFound && checkIfNotNull(selectedPatient) && <PatientDetails ndhmDetails={selectedPatient}></PatientDetails>}
            {matchFound && <div>
                <b>ABDM Record: </b>
                <PatientInfo patient={selectedPatient}/><br/>
                <div className="patient-existed" onClick={redirectToPatientDashboard}>
                    Matching record with Health ID/PHR Address found
                </div>
            </div>}
        </div>
    )
}

export default PatientQueue;