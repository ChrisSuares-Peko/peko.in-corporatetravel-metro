import { useState } from 'react';

import { Button, Input, Modal, Typography } from 'antd';

import { MyCard } from '../../../utils/types';
import { MODAL_CLOSE_ICON, PineLabsFooter, ROUNDED_MODAL_CLASSNAMES } from '../../common/modalProps';

const { Title, Text } = Typography;

const CONFIRM_WORD = 'FREEZE';

interface ConfirmFreezeModalProps {
    /** The card to freeze; modal is open when non-null. */
    card: MyCard | null;
    onClose: () => void;
    /** Called with the card once the user confirms by typing FREEZE. Parent performs the freeze. */
    onConfirm: (card: MyCard) => void;
}

/** Cardholder freeze confirmation — requires typing FREEZE before freezing the card. */
const ConfirmFreezeModal = ({ card, onClose, onConfirm }: ConfirmFreezeModalProps) => {
    const [confirmText, setConfirmText] = useState('');

    const isValid = confirmText.trim() === CONFIRM_WORD;

    const handleConfirm = () => {
        if (card) onConfirm(card);
    };

    return (
        <Modal
            open={card !== null}
            onCancel={onClose}
            footer={null}
            centered
            width={480}
            destroyOnHidden
            classNames={ROUNDED_MODAL_CLASSNAMES}
            closeIcon={MODAL_CLOSE_ICON}
        >
            <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                    <Title level={4} className="!mb-0 !text-textHeadings">
                        Confirm freeze
                    </Title>
                    <Text className="text-sm text-textBody">
                        You are about to freeze 1 card. Type {CONFIRM_WORD} below to confirm.
                    </Text>
                </div>

                <div className="flex flex-col gap-1.5">
                    <Text className="text-sm text-textBody">
                        Type <span className="font-semibold text-textHeadings">{CONFIRM_WORD}</span>{' '}
                        to confirm
                    </Text>
                    <Input
                        placeholder="Type"
                        value={confirmText}
                        onChange={event => setConfirmText(event.target.value)}
                        onPressEnter={() => isValid && handleConfirm()}
                    />
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Button danger onClick={onClose} className="font-medium">
                        Cancel
                    </Button>
                    <Button
                        type="primary"
                        disabled={!isValid}
                        onClick={handleConfirm}
                        className="font-medium"
                    >
                        Freeze card
                    </Button>
                </div>

                <PineLabsFooter />
            </div>
        </Modal>
    );
};

export default ConfirmFreezeModal;
