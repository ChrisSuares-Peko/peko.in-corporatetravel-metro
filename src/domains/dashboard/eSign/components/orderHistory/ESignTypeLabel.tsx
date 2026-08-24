import type { FC } from 'react';

import { Typography } from 'antd';

import { SignerInfo } from '../../types';

interface ESignTypeLabelProps {
    signers_info: SignerInfo[];
}

const ESignTypeLabel: FC<ESignTypeLabelProps> = ({ signers_info }) => {
    const isAadhaarBased = (signers_info || []).some(signer => signer.signingPolicy === 'AADHAAR');
    return <Typography.Text>{isAadhaarBased ? 'Aadhaar-based e-sign' : 'Normal e-sign'}</Typography.Text>;
};

export default ESignTypeLabel;
