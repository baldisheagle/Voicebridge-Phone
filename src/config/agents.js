// Agent Templates

// Receptionist template
export const PHONE_RECEPTIONIST_TEMPLATE = {
    id: "phone-receptionist",
    name: "Sally",
    voiceId: "11labs-Myra",
    language: "en-US",
    model: "gpt-4o",
    includeDisclaimer: true,
    calendar: "cal.com",
    ambientSound: "none",
    boostedKeywords: "",
    endCallOnSilence: 10,
    maxDuration: 10,
    calCom: {
        apiKey: "cal_live_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
        eventId: 1234567,
    },
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
    },
};
