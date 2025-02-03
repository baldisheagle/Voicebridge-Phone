// Agent Templates

// Receptionist template
export const PHONE_RECEPTIONIST_TEMPLATE = {
    id: "phone-receptionist",
    title: "Phone Receptionist",
    description: "A phone receptionist agent that answers caller questions, takes messages, and schedules appointments.",
    icon: '/assets/agents/phone-receptionist-with-cal-com.svg',
    name: "Sally",
    voiceId: "11labs-Myra",
    language: "en-US",
    model: "gpt-4o",
    includeDisclaimer: true,
    calCom: {
        apiKey: "API Key",
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

// Defaults for Basic Phone Receptionist
export const BASIC_PHONE_RECEPTIONIST_TEMPLATE = {
    id: "basic-phone-receptionist",
    title: "Basic Phone Receptionist",
    name: "Sally",
    description: "A basic receptionist agent that answers caller questions, takes messages, and notes appointment requests.",
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

// Defaults for Phone Receptionist with Cal.com
export const PHONE_RECEPTIONIST_WITH_CAL_COM_TEMPLATE = {
    id: "phone-receptionist-with-cal-com",
    title: "Phone Receptionist with Cal.com scheduling",
    description: "A phone receptionist agent that answers caller questions, takes messages, and uses Cal.com for scheduling appointments.",
    icon: '/assets/agents/phone-receptionist-with-cal-com.svg',
    name: "Ken",
    voiceId: "11labs-Adrian",
    language: "en-US",
    model: "gpt-4o",
    includeDisclaimer: true,
    calCom: {
        apiKey: "API Key",
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