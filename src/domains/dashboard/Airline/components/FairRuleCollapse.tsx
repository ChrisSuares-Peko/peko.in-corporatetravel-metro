import React from 'react';

import { Collapse, Typography } from 'antd';
import { CollapseProps } from 'antd/lib';

interface fairRlesProps {
    fareRulesData: any[];
}

const FairRuleCollapse = ({ fareRulesData }: fairRlesProps) => {
    const result: CollapseProps['items'] = fareRulesData.map((item, index) => ({
        key: (index + 1).toString(),
        label: `${item.Origin} -> ${item.Destination}`,
        // children: <p>{item.paragraph}</p>,
        children: (
            <Typography
                dangerouslySetInnerHTML={{ __html: item.FareRuleDetail! }}
                className="mt-3 text-justify text-sm font-light line-clamp-4 "
                style={{ lineHeight: '1.5' }}
            />
        ),
    }));

    const onChange = (key: string | string[]) => {
        console.log(key);
    };

    return (
        <Collapse
            style={{ width: '100%' }}
            items={result}
            defaultActiveKey={['1']}
            onChange={onChange}
        />
    );
};

export default FairRuleCollapse;
