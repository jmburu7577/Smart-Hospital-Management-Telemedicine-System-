import { useParams } from "react-router-dom";

const doctors = [
    { id: 1, name: "Dr. Sarah Kimani", specialty: "Cardiologist" },
    { id: 2, name: "Dr. James Mwangi", specialty: "Neurologist" },
    { id: 3, name: "Dr. Grace Odhiambo", specialty: "Pediatrician" },
];

export default function DoctorProfile() {
    const { id } = useParams();

    const doctor = doctors.find((d) => d.id === Number(id));

    if (!doctor) return <p>Doctor not found</p>;

    return (
        <div className="p-10">
            <h1 className="text-3xl font-bold">{doctor.name}</h1>
            <p className="text-gray-600">{doctor.specialty}</p>
        </div>
    );
}