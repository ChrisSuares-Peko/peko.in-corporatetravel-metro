// Metro domain types.
//
// These shapes are written to match what a real Metro fare/booking API would
// return, so the mock layer in `../api` can later be swapped for real
// `ApiClient` calls (see the `// TODO: replace with ApiClient...` markers
// there) without touching hooks, slices, or components.

export type MetroCity = {
    id: string;
    name: string;
};

export type MetroStation = {
    id: string;
    cityId: string;
    name: string;
};

export type FareBreakdown = {
    amount: number;
    currency: string;
    /** Marks this as placeholder fare logic until a real fare API exists. */
    isMock: true;
};

export type MetroTicket = {
    id: string;
    cityId: string;
    boardingStationId: string;
    boardingStationName: string;
    dropStationId: string;
    dropStationName: string;
    passengerCount: number;
    fare: FareBreakdown;
    bookedAt: string; // ISO timestamp
    qrPayload: string; // mock string encoded into the placeholder QR
};

export type SmartCard = {
    cardNumber: string; // 6–12 digit numeric string
    label?: string;
};

export type SmartCardRecharge = {
    cardNumber: string;
    amount: number;
    rechargedAt: string; // ISO timestamp
};
