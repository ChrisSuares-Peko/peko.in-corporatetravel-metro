import React from 'react';

import { Tag } from 'antd';

interface PriceTagProps {
    price: number;
    onClick: () => void;
    selected: boolean;
}

const PriceTag: React.FC<PriceTagProps> = ({ price, onClick, selected }) => (
    <Tag
        onClick={onClick}
        style={{ borderRadius: '0.4rem', backgroundColor: 'white' }}
        className={`text-center p-2 mt-2 text-sm h-10 items-center cursor-pointer xs:mt-1 md:mt-0 ${
            selected ? 'border border-red-500 bg-stone-50 text-red-500' : 'text-zinc-400'
        }`}
    >
        {`₹ ${Number(price).toFixed(2)}`}
    </Tag>
);

export default PriceTag;
