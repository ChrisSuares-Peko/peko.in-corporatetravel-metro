import { BsCameraVideo, BsLightningChargeFill, BsTelephone } from 'react-icons/bs';
import { MdOutlineBed, MdOutlineChair, MdOutlineLightbulb, MdOutlineLocalDrink, MdOutlineSecurity } from 'react-icons/md';
import { RiMovieLine, RiWifiFill } from 'react-icons/ri';

export const AMENITY_ICONS: Record<string, React.ReactNode> = {
    'wifi':                     <RiWifiFill size={13} />,
    'wi-fi':                    <RiWifiFill size={13} />,
    'water bottle':             <MdOutlineLocalDrink size={13} />,
    'charging point':           <BsLightningChargeFill size={12} />,
    'blankets':                 <MdOutlineBed size={13} />,
    'blanket':                  <MdOutlineBed size={13} />,
    'pillow':                   <MdOutlineBed size={13} />,
    'reading light':            <MdOutlineLightbulb size={13} />,
    'waiting lounge':           <MdOutlineChair size={13} />,
    'movie':                    <RiMovieLine size={13} />,
    'cctv':                     <MdOutlineSecurity size={13} />,
    'emergency contact number': <BsTelephone size={12} />,
    'emergency contact':        <BsTelephone size={12} />,
    'cctv camera':              <BsCameraVideo size={12} />,
};
