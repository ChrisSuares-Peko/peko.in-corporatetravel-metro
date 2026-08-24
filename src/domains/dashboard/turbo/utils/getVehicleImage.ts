import car from '../assets/car.png';
import muv from '../assets/muv.png'
import sedan from '../assets/sedan.png';
import suv from '../assets/suv.png'
import truck from '../assets/truck.png';

const vehicleImageMap: Record<string, string> = {
    // Cars / Sedans
    'MOTOR CAR': car,
    'M/C': car,
    SEDAN: sedan,
    COUPE: sedan,
    // SUVs / Jeeps
    JEEP: suv,
    SUV: suv,
    'STATION WAGON': muv,
    // Trucks / Heavy vehicles
    TRUCK: truck,
    LORRY: truck,
    TRAILER: truck,
    'ARTICULATED VEHICLE': truck,
    'LIGHT MOTOR VEHICLE': truck,
    // Buses — replace with bus asset when available
    BUS: car,
    'MAXI CAB': car,
    'MINI BUS': car,
    // Motorcycles — replace with motorcycle asset when available
    'MOTOR CYCLE': car,
    SCOOTER: car,
    MOPED: car,
    // Three-wheelers — replace with auto asset when available
    'AUTO RICKSHAW': car,
    'THREE WHEELER': car,
    'E-RICKSHAW': car,
    // Tractors / Agricultural — replace with tractor asset when available
    TRACTOR: car,
    'POWER TILLER': car,
    // Vans — replace with van asset when available
    VAN: car,
    'GOODS VAN': car,
};

export default function getVehicleImage(bodyType?: string): string {
    if (!bodyType) return car;
    const normalized = bodyType.trim().toUpperCase();
    return vehicleImageMap[normalized] ?? car;
}
