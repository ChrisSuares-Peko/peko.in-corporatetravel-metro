import React from 'react';

import { Flex } from 'antd';

import type { AgingFilterOption } from '../../utils/constants/agingAnalysis';

interface Props {
    options: AgingFilterOption[];
    selected: string;
    onChange: (key: string) => void;
}

const AgingBucketFilter: React.FC<Props> = ({ options, selected, onChange }) => (
    <Flex gap={8} wrap="wrap">
        {options.map(opt => {
            const isSelected = selected === opt.key;
            const color = opt.color ?? '#111827';
            return (
                <button
                    type="button"
                    key={opt.key}
                    onClick={() => onChange(opt.key)}
                    className="px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer"
                    style={
                        isSelected
                            ? { backgroundColor: color, borderWidth: 1, borderStyle: 'solid', borderColor: color, color: '#fff' }
                            : { backgroundColor: '#fff', borderWidth: 1, borderStyle: 'solid', borderColor: color, color }
                    }
                >
                    {opt.label}
                </button>
            );
        })}
    </Flex>
);

export default AgingBucketFilter;
