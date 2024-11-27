import {fetchPatientFromBahmniWithHealthId, getPatientQueue} from "../../api/hipServiceApi";
import {useEffect, useState} from "react";
import './patientQueue.scss';
import PatientDetails from "../patient-details/patientDetails";
import {checkIfNotNull} from "../verifyHealthId/verifyHealthId";
import Time from "./Time";
import PatientInfo from "../patient-details/patientInfo";
import {getDate} from "../Common/DateUtil";
import Spinner from "../spinner/spinner";


const PatientQueue = (props) => {

    const [patient,setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState({});
    const [matchFound, setMatchFound] = useState(null);
    const [back, setBack] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        getPatient()
    },[]);

    async function getPatient(){
        setLoading(true);
        const res = await getPatientQueue();
        setLoading(false);
        if (res.error === undefined) {
            setPatients(res);
            setError("");
        }
        else {
            setError("Something went wrong while fetching patient queue. Please try again later");
        }
    }

    async function getMatchingPatient(patient) {
        const matchingPatientId = await fetchPatientFromBahmniWithHealthId(patient.abhaAddress);
        if (matchingPatientId.Error === undefined && matchingPatientId.validPatientId === true){
           setMatchFound(matchingPatientId.patientUuid);
        }
        const ndhm = {
            id:  patient.abhaAddress,
            gender: patient.gender,
            name: patient.name,
            isBirthDateEstimated: patient?.monthOfBirth == null || patient?.dayOfBirth == null,
            dateOfBirth: getDate(patient),
            address: {"district": patient.address?.district, "state": patient.address?.state},
            identifiers: patient.identifiers,
            healthIdNumber: patient.abhaNumber,
            phoneNumber: patient.phoneNumber
        };
       setSelectedPatient(ndhm);
    }

    function redirectToPatientDashboard() {
        window.parent.postMessage({"patientUuid" : matchFound }, "*");
    }

    useEffect(() => {
        if(back){
            setSelectedPatient({});
            setMatchFound(null);
            setBack(false);
        }
    },[back])

    return(
        <div>
            {loading && <Spinner/>}
            {error !== "" && <h6 className="error">{error}</h6>}
            {patient.length == 0 && !loading && error === "" && 
                <center><h3>No patient found</h3></center>
            }
            {patient.length > 0 && !checkIfNotNull(selectedPatient) && <table>
                <tbody>
                <th>Token Number</th>
                <th>Patient</th>
                <th>check-in time</th>
                {patient.map((p,i) => {
                    return <tr>
                        <td> {p.tokenNumber}</td>
                        <td><PatientInfo patient={p.profile} /></td>
                        <td> <Time time={p.dateTimeStamp}/></td>
                        <td>
                            <button type='submit' onClick={() => getMatchingPatient(p.profile)}>Register</button>
                        </td>
                    </tr>
                })}

                </tbody>
            </table>}
            {!matchFound && checkIfNotNull(selectedPatient) && <PatientDetails ndhmDetails={selectedPatient} setBack={setBack} enableABHACardView={false}/>}
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