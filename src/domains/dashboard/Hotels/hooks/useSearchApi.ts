import { useState } from 'react';

import { useDispatch } from 'react-redux';

import { useAppSelector } from '@src/hooks/store';

import { getHotels } from '../Api';
import { sethotelArr, sethotelPriceRange } from '../slices/getHotelSlice';
import { Hotels } from '../types/types';

export default function useSearchApi() {
    const dispatch = useDispatch();
    const { role, id } = useAppSelector(state => state.reducer.auth);
    const { hotelsRequest } = useAppSelector(state => state.reducer.hotels);
    const [isLoading, setIsLoading] = useState(true);
    const [hotelData, setHotelData] = useState<Hotels[]>([]);
    const [searchKey, setSearchKey] = useState<string>('');
    const [conversationId, setConversationId] = useState<string>('');

    const hotelsList = async (payload?: {
        City?: string;
        CheckIn: string;
        CheckOut: string;
        GuestNationality: string;
    }) => {
        const transformedArray = hotelsRequest.rooms.map(({ adult, child, childAge }: any) => ({
            Adults: adult,
            Children: child,
            ChildrenAges: childAge.length > 0 ? childAge : [],
        }));

        const payloadData = payload
            ? {
                  ...payload,
                  PaxRooms: transformedArray,
              }
            : hotelsRequest;

        const data: any = await getHotels({
            userId: id,
            userType: role,
            ...payloadData,
        });

        if (data) {
            const hotelDetails = data as any;
            const hotelArr = hotelDetails.searchResults as any[];
            const hotelCodes = hotelDetails.hotelCodeList;
            const detailedArray = hotelDetails.hotelDetails;

            // Create a Set of HotelCodes from hotelArr for quick lookup
            const hotelArrCodes = new Set(hotelArr.map(hotel => hotel.HotelCode));

            // Filter `hotelCodes` to include only those whose `HotelCode` exists in `hotelArr`
            const commonHotels = hotelCodes.filter((hotel: any) =>
                hotelArrCodes.has(hotel.HotelCode)
            );

            // Filter `detailedArray` to include only relevant HotelCodes
            const relevantDetails = detailedArray.filter((detail: any) =>
                hotelArrCodes.has(detail.HotelCode)
            );

            // Create a Map of relevantDetails for quick lookup by HotelCode
            const detailedMap = new Map(
                relevantDetails.map((detail: any) => [detail.HotelCode, detail])
            );
            let lowestPrice = 0;
            let highestPrice = 0;

            // Merge data from hotelCodes, hotelArr, and relevantDetails
            const mergedHotels = commonHotels.map((hotel: any) => {
                const matchingHotelArr = hotelArr.find(h => h.HotelCode === hotel.HotelCode) || {};
                const matchingDetail = detailedMap.get(hotel.HotelCode) || {};
                return { ...hotel, ...matchingHotelArr, ...matchingDetail }; // Merge all details
            });

            if (mergedHotels.length === 0) {
                dispatch(sethotelArr({ data: false }));
                setHotelData([]); // Clear local state to match Redux state
                setIsLoading(false);
                return;
            }

            // const search = hotelDetails?.commonData?.searchKey;
            const convid = mergedHotels.HotelCode;

            const prices = hotelArr.map(hotels => hotels?.Rooms[0]?.TotalFare);
            lowestPrice = Math.min(...prices);
            highestPrice = Math.max(...prices);

            dispatch(sethotelPriceRange({ lowestPrice, highestPrice }));

            dispatch(sethotelArr(mergedHotels));
            setHotelData(mergedHotels);
            // setSearchKey(search);
            setConversationId(convid);
            setIsLoading(false);
        } else {
            dispatch(sethotelArr({ data: false }));
            setHotelData([]);
            setSearchKey('');
            setConversationId('');
            setIsLoading(false);
        }
    };

    return { data: hotelData, isLoading, searchKey, conversationId, hotelsList };
}
