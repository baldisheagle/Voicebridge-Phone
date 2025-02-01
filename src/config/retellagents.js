// Retell Templates

// Defaults for Basic Phone Receptionist
export const BASIC_PHONE_RECEPTIONIST_TEMPLATE = {
    id: "basic-phone-receptionist",
    name: "Sally",
    description: "Create a basic new phone receptionist that answers calls, responds to routine questions, and summarizes caller's intent for proper and timely follow up.",
    includeDisclaimer: true,
    voiceId: "11labs-Myra",
    language: "en-US",
    model: "gpt-4o",
    icon: '/assets/agents/basic-phone-receptionist.svg',
    businessInfo: {
        name: "Clinic",
        timezone: -8,
        businessHours: {
            monday: { id: 'monday', value: 'monday', label: 'Monday', isOpen: true, open: '09:00', close: '17:00' },
            tuesday: { id: 'tuesday', value: 'tuesday', label: 'Tuesday', isOpen: true, open: '09:00', close: '17:00' },
            wednesday: { id: 'wednesday', value: 'wednesday', label: 'Wednesday', isOpen: true, open: '09:00', close: '17:00' },
            thursday: { id: 'thursday', value: 'thursday', label: 'Thursday', isOpen: true, open: '09:00', close: '17:00' },
            friday: { id: 'friday', value: 'friday', label: 'Friday', isOpen: true, open: '09:00', close: '17:00' },
            saturday: { id: 'saturday', value: 'saturday', label: 'Saturday', isOpen: false, open: '09:00', close: '17:00' },
            sunday: { id: 'sunday', value: 'sunday', label: 'Sunday', isOpen: false, open: '09:00', close: '17:00' },
        },
        description: "",
        website: "",
        location: "",
        phoneNumber: "",
        services: "",
        insuranceAccepted: "",
        email: "",
    },
};

export const VOICES = [
    { value: "11labs-Myra", label: "US Female" },
    { value: "11labs-Adrian", label: "US Male" },
];

export const LANGUAGES = [
    { value: "en-US", label: "English (US)" },
];

export const MODELS = [
    { value: "gpt-4o", label: "GPT-4o" },
    { value: "gpt-4o-mini", label: "GPT-4o Mini" },
];

export const REVIEW_PLATFORMS = [
    { value: 'Google', label: 'Google Business' },
    { value: 'Yelp', label: 'Yelp' },
    { value: 'Zocdoc', label: 'Zocdoc' },
];

export const CALL_PURPOSES = [
    { value: 'book_appointment', label: 'Book Appointment' },
    { value: 'cancel_appointment', label: 'Cancel Appointment' },
    { value: 'reschedule_appointment', label: 'Reschedule Appointment' },
    { value: 'billing_question', label: 'Billing Question' },
    { value: 'insurance_question', label: 'Insurance Question' },
    { value: 'lab_results_question', label: 'Lab Results Question' },
    { value: 'prescription_refill_request', label: 'Prescription Refill Request' },
    { value: 'clinic_hours_location_question', label: 'Clinic Question' },
    { value: 'seek_advice', label: 'Seek Advice' },
    { value: 'request_medical_records', label: 'Request Medical Records' },
    { value: 'unknown', label: 'Unknown' },
];

export const TIMEZONE_OFFSETS = [
    { value: -10, label: 'Honolulu, Hawaii (HST) -10:00', timezone: 'Pacific/Honolulu' },
    { value: -9, label: 'Anchorage, Alaska (AKST) -9:00', timezone: 'America/Anchorage' },
    { value: -8, label: 'Los Angeles, USA (PST) -8:00', timezone: 'America/Los_Angeles' },
    { value: -7, label: 'Denver, USA (MST) -7:00', timezone: 'America/Denver' },
    { value: -6, label: 'Chicago, USA (CST) -6:00', timezone: 'America/Chicago' },
    { value: -5, label: 'New York, USA (EST) -5:00', timezone: 'America/New_York' },
    { value: -4, label: 'Santiago, Chile (CLT) -4:00', timezone: 'America/Santiago' },
    { value: -3, label: 'São Paulo, Brazil (BRT) -3:00', timezone: 'America/Sao_Paulo' },
    { value: -2, label: 'Fernando de Noronha, Brazil (FNT) -2:00', timezone: 'America/Noronha' },
    { value: -1, label: 'Azores (AZOT) -1:00', timezone: 'Atlantic/Azores' },
    { value: 0, label: 'London, United Kingdom (GMT) 0:00', timezone: 'Europe/London' },
    { value: 1, label: 'Paris, France (CET) +1:00', timezone: 'Europe/Paris' },
    { value: 2, label: 'Cairo, Egypt (EET) +2:00', timezone: 'Africa/Cairo' },
    { value: 3, label: 'Moscow, Russia (MSK) +3:00', timezone: 'Europe/Moscow' },
    { value: 3.5, label: 'Tehran, Iran (IRST) +3:30', timezone: 'Asia/Tehran' },
    { value: 4, label: 'Dubai, UAE (GST) +4:00', timezone: 'Asia/Dubai' },
    { value: 5, label: 'Karachi, Pakistan (PKT) +5:00', timezone: 'Asia/Karachi' },
    { value: 5.5, label: 'Mumbai, India (IST) +5:30', timezone: 'Asia/Kolkata' },
    { value: 6, label: 'Dhaka, Bangladesh (BST) +6:00', timezone: 'Asia/Dhaka' },
    { value: 7, label: 'Bangkok, Thailand (ICT) +7:00', timezone: 'Asia/Bangkok' },
    { value: 8, label: 'Hong Kong (HKT) +8:00', timezone: 'Asia/Hong_Kong' },
    { value: 9, label: 'Tokyo, Japan (JST) +9:00', timezone: 'Asia/Tokyo' },
    { value: 10, label: 'Sydney, Australia (AEST) +10:00', timezone: 'Australia/Sydney' },
    { value: 11, label: 'Noumea, New Caledonia (NCT) +11:00', timezone: 'Pacific/Noumea' },
    { value: 12, label: 'Auckland, New Zealand (NZST) +12:00', timezone: 'Pacific/Auckland' },
];

export const HOURS = [
    { value: '00:00', label: '12:00 AM' },
    { value: '01:00', label: '1:00 AM' },
    { value: '02:00', label: '2:00 AM' },
    { value: '03:00', label: '3:00 AM' },
    { value: '04:00', label: '4:00 AM' },
    { value: '05:00', label: '5:00 AM' },
    { value: '06:00', label: '6:00 AM' },
    { value: '07:00', label: '7:00 AM' },
    { value: '08:00', label: '8:00 AM' },
    { value: '09:00', label: '9:00 AM' },
    { value: '10:00', label: '10:00 AM' },
    { value: '11:00', label: '11:00 AM' },
    { value: '12:00', label: '12:00 PM' },
    { value: '13:00', label: '1:00 PM' },
    { value: '14:00', label: '2:00 PM' },
    { value: '15:00', label: '3:00 PM' },
    { value: '16:00', label: '4:00 PM' },
    { value: '17:00', label: '5:00 PM' },
    { value: '18:00', label: '6:00 PM' },
    { value: '19:00', label: '7:00 PM' },
    { value: '20:00', label: '8:00 PM' },
    { value: '21:00', label: '9:00 PM' },
    { value: '22:00', label: '10:00 PM' },
    { value: '23:00', label: '11:00 PM' },
];

export const APPOINTMENT_TYPES = [
    { value: 'annual_physical', label: 'Annual Physical' },
    { value: 'follow_up', label: 'Follow-up' },
    { value: 'new_patient', label: 'New Patient' },
    { value: 'routine_checkup', label: 'Routine Check-up' },
    { value: 'vaccination', label: 'Vaccination' },
    { value: 'lab_results', label: 'Lab Results Review' },
    { value: 'prescription_refill', label: 'Prescription Refill' },
    { value: 'consultation', label: 'Consultation' },
    { value: 'urgent_care', label: 'Urgent Care' },
    { value: 'wellness_visit', label: 'Wellness Visit' },
    { value: 'chronic_care', label: 'Chronic Care Management' },
    { value: 'preventive_care', label: 'Preventive Care' },
    { value: 'telehealth', label: 'Telehealth Visit' },
    { value: 'eye_exam', label: 'Eye Exam' },
    { value: 'other', label: 'Other' },
];