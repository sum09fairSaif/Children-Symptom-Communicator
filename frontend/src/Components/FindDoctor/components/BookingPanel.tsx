import type { Doctor } from "../FindDoctor";
import { useState } from "react";

type Props = {
  doctor: Doctor | null;
  onConfirm: () => void;
  userInsurance?: string;
};

export default function BookingPanel({ doctor, onConfirm, userInsurance }: Props) {
  const [selectedInsurance, setSelectedInsurance] = useState(userInsurance || doctor?.accepts || "");
  const [selectedTime, setSelectedTime] = useState("");
  const disabled = !doctor;

  return (
    <div className="card pad">
      <h3 style={{ margin: 0, marginBottom: 10 }}>Booking Summary</h3>

      {!doctor ? (
        <p style={{ margin: 0, color: "rgba(44,44,52,0.65)" }}>
          Select a doctor to see appointment details.
        </p>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          <div style={{ fontWeight: 800 }}>{doctor.name}</div>
          <div style={{ color: "rgba(44,44,52,0.7)" }}>
            {doctor.specialty} • 15 min video consultation
          </div>

          <div style={{ display: "grid", gap: 6, marginTop: 8 }}>
            <label style={labelStyle}>Insurance</label>
            <select
              style={selectStyle}
              value={selectedInsurance}
              onChange={(e) => setSelectedInsurance(e.target.value)}
            >
              <option value="">Select Insurance</option>
              {userInsurance && <option value={userInsurance}>{userInsurance}</option>}
              <option value="Cigna">Cigna</option>
              <option value="Aetna">Aetna</option>
              <option value="Blue Cross Blue Shield">Blue Cross Blue Shield</option>
              <option value="UnitedHealthcare">UnitedHealthcare</option>
              <option value="Humana">Humana</option>
              <option value="Kaiser Permanente">Kaiser Permanente</option>
            </select>

            <label style={labelStyle}>Appointment Time</label>
            <select
              style={selectStyle}
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
            >
              <option value="">Select Time</option>
              <optgroup label="Monday">
                <option value="Monday, 9:00 AM">Monday, 9:00 AM</option>
                <option value="Monday, 10:00 AM">Monday, 10:00 AM</option>
                <option value="Monday, 11:00 AM">Monday, 11:00 AM</option>
                <option value="Monday, 2:00 PM">Monday, 2:00 PM</option>
                <option value="Monday, 3:00 PM">Monday, 3:00 PM</option>
                <option value="Monday, 4:00 PM">Monday, 4:00 PM</option>
              </optgroup>
              <optgroup label="Tuesday">
                <option value="Tuesday, 9:00 AM">Tuesday, 9:00 AM</option>
                <option value="Tuesday, 10:00 AM">Tuesday, 10:00 AM</option>
                <option value="Tuesday, 11:00 AM">Tuesday, 11:00 AM</option>
                <option value="Tuesday, 2:00 PM">Tuesday, 2:00 PM</option>
                <option value="Tuesday, 3:00 PM">Tuesday, 3:00 PM</option>
                <option value="Tuesday, 4:00 PM">Tuesday, 4:00 PM</option>
              </optgroup>
              <optgroup label="Wednesday">
                <option value="Wednesday, 9:00 AM">Wednesday, 9:00 AM</option>
                <option value="Wednesday, 10:00 AM">Wednesday, 10:00 AM</option>
                <option value="Wednesday, 11:00 AM">Wednesday, 11:00 AM</option>
                <option value="Wednesday, 2:00 PM">Wednesday, 2:00 PM</option>
                <option value="Wednesday, 3:00 PM">Wednesday, 3:00 PM</option>
                <option value="Wednesday, 4:00 PM">Wednesday, 4:00 PM</option>
              </optgroup>
              <optgroup label="Thursday">
                <option value="Thursday, 9:00 AM">Thursday, 9:00 AM</option>
                <option value="Thursday, 10:00 AM">Thursday, 10:00 AM</option>
                <option value="Thursday, 11:00 AM">Thursday, 11:00 AM</option>
                <option value="Thursday, 2:00 PM">Thursday, 2:00 PM</option>
                <option value="Thursday, 3:00 PM">Thursday, 3:00 PM</option>
                <option value="Thursday, 4:00 PM">Thursday, 4:00 PM</option>
              </optgroup>
              <optgroup label="Friday">
                <option value="Friday, 9:00 AM">Friday, 9:00 AM</option>
                <option value="Friday, 10:00 AM">Friday, 10:00 AM</option>
                <option value="Friday, 11:00 AM">Friday, 11:00 AM</option>
                <option value="Friday, 2:00 PM">Friday, 2:00 PM</option>
                <option value="Friday, 3:00 PM">Friday, 3:00 PM</option>
                <option value="Friday, 4:00 PM">Friday, 4:00 PM</option>
              </optgroup>
            </select>
          </div>
        </div>
      )}

      <button
        onClick={onConfirm}
        disabled={disabled}
        style={{
          marginTop: 14,
          width: "100%",
          padding: "12px 14px",
          borderRadius: 14,
          border: "none",
          fontWeight: 800,
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.55 : 1,
          color: "white",
          background: "linear-gradient(135deg, #8B7CF6, #F6B8D8)",
        }}
      >
        Confirm Appointment
      </button>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  color: "rgba(44,44,52,0.65)",
};

const selectStyle: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 14,
  border: "1px solid rgba(140,120,246,0.22)",
  background: "rgba(255,255,255,0.7)",
  outline: "none",
};
