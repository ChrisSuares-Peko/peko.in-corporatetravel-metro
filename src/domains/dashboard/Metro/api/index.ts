// Mock-backed "API" for the Metro prototype.
//
// Every function here has the same async signature a real endpoint would have
// (payload in, Promise<Response> out) and simulates network latency. When a
// real backend exists, swap the body of each function for an `ApiClient`
// call (see `@src/services/config`, and `BusTickets/api/index.ts` for the
// established pattern) — hooks and components that call these functions
// don't need to change.

import {
    FareBreakdown,
    MetroCity,
    MetroStation,
    MetroTicket,
    SmartCard,
    SmartCardRecharge,
} from '../types/metro';
import { MOCK_CITIES, MOCK_STATIONS } from './mockData';

const MOCK_DELAY_MS = 300;

const delay = <T>(value: T): Promise<T> =>
    new Promise(resolve => {
        setTimeout(() => resolve(value), MOCK_DELAY_MS);
    });

export async function getMetroCities(): Promise<MetroCity[]> {
    // TODO: replace with ApiClient.get(`${userType}/${userId}/travel/metro/cities`)
    return delay(MOCK_CITIES);
}

export async function getMetroStations(cityId: string): Promise<MetroStation[]> {
    // TODO: replace with ApiClient.get(`${userType}/${userId}/travel/metro/stations`, { cityId })
    return delay(MOCK_STATIONS.filter(station => station.cityId === cityId));
}

export async function calculateMetroFare(payload: {
    boardingStationId: string;
    dropStationId: string;
    passengerCount: number;
}): Promise<FareBreakdown> {
    // TODO: replace with ApiClient.get(`${userType}/${userId}/travel/metro/fare`, payload)
    //
    // PLACEHOLDER FARE LOGIC — a simple distance-tier stub based on how many
    // stations apart the boarding/drop points are in the mock station list.
    // Replace entirely once a real fare API exists.
    const boardingIndex = MOCK_STATIONS.findIndex(s => s.id === payload.boardingStationId);
    const dropIndex = MOCK_STATIONS.findIndex(s => s.id === payload.dropStationId);
    const stationGap = Math.abs(boardingIndex - dropIndex);

    let perPassengerFare = 10;
    if (stationGap > 5) perPassengerFare = 30;
    else if (stationGap > 2) perPassengerFare = 20;

    return delay({
        amount: perPassengerFare * Math.max(payload.passengerCount, 1),
        currency: 'INR',
        isMock: true,
    });
}

export async function bookMetroQrTicket(payload: {
    cityId: string;
    boardingStationId: string;
    boardingStationName: string;
    dropStationId: string;
    dropStationName: string;
    passengerCount: number;
    fare: FareBreakdown;
}): Promise<MetroTicket> {
    // TODO: replace with ApiClient.post(`${userType}/${userId}/travel/metro/book`, payload)
    const id = `MTKT${Date.now()}`;
    return delay({
        id,
        cityId: payload.cityId,
        boardingStationId: payload.boardingStationId,
        boardingStationName: payload.boardingStationName,
        dropStationId: payload.dropStationId,
        dropStationName: payload.dropStationName,
        passengerCount: payload.passengerCount,
        fare: payload.fare,
        bookedAt: new Date().toISOString(),
        qrPayload: id,
    });
}

export async function addSmartCard(payload: SmartCard): Promise<SmartCard> {
    // TODO: replace with ApiClient.post(`${userType}/${userId}/travel/metro/smart-card`, payload)
    return delay(payload);
}

export async function rechargeSmartCard(payload: {
    cardNumber: string;
    amount: number;
}): Promise<SmartCardRecharge> {
    // TODO: replace with ApiClient.post(`${userType}/${userId}/travel/metro/smart-card/recharge`, payload)
    return delay({
        cardNumber: payload.cardNumber,
        amount: payload.amount,
        rechargedAt: new Date().toISOString(),
    });
}
