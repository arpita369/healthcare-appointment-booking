import { userMgmtApi, appointmentApi } from './api';
 
const tokenHeader = () => {
  const token = localStorage.getItem('healthcare_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};
 
async function listDoctors() {
  const res = await userMgmtApi.get('/app2/api/v1/doctors');
  return res.data || [];
}
 
async function listPatients() {
  const res = await userMgmtApi.get('/app2/api/v1/patients');
  return res.data || [];
}
 
async function resolvePatientIdByEmail(email) {
  const pts = await listPatients();
  const match = (pts || []).find((p) => p.emailId === email);
  return match?.id;
}
 
async function ensurePatientAndGetId(email, { homeAddress = '' } = {}) {
  let id = await resolvePatientIdByEmail(email);
  if (id != null) return id;
  const headers = tokenHeader();
  try {
    await userMgmtApi.post('/app2/api/v1/patients', { homeAddress }, { headers });
  } catch (err) {
    if (err?.response?.status !== 409) throw err;
  }
  id = await resolvePatientIdByEmail(email);
  return id;
}
 
async function resolveDoctorIdByEmail(email) {
  const docs = await listDoctors();
  const match = (docs || []).find((d) => d.emailId === email);
  return match?.id ?? (typeof match?.id === 'number' ? match.id : undefined);
}
 
async function bookAppointment({ appointmentDate, timeSlot, appointmentType, symptoms, additionalNotes, doctorId, patientId }) {
  const headers = tokenHeader();
  const payload = {
    appointmentDate,
    timeSlot,
    appointmentType,
    symptoms: symptoms || '',
    additionalNotes: additionalNotes || '',
    doctorId: Number(doctorId),
    patientId: Number(patientId),
  };
  const res = await appointmentApi.post('/app3/api/v1/appointments/book', payload, { headers });
  return res.data;
}
 
async function getAllAppointments() {
  const headers = tokenHeader();
  const res = await appointmentApi.get('/app3/api/v1/appointments', { headers });
  return res.data || [];
}
 
export default {
  listDoctors,
  listPatients,
  resolvePatientIdByEmail,
  resolveDoctorIdByEmail,
  ensurePatientAndGetId,
  bookAppointment,
  getAllAppointments,
};