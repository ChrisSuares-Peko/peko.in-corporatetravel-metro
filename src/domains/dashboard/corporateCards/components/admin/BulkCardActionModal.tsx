import { useMemo, useState } from 'react';

import { Button, Checkbox, Input, Modal, Select, Spin, Typography } from 'antd';

import { useAppDispatch } from '@src/hooks/store';
import { showToast } from '@src/slices/apiSlice';

import { useAdminCardsApi } from '../../hooks/admin/useAdminCardsApi';
import { useBulkCardStateApi } from '../../hooks/admin/useBulkCardStateApi';
import {
    FREEZE_REASON_NOTE_MAX,
    FREEZE_REASON_OPTIONS,
    FREEZE_REASON_OTHERS,
    reasonNoteError,
    sanitizeReasonNote,
} from '../../utils/cardsData';
import { MODAL_CLOSE_ICON, PineLabsFooter, ROUNDED_MODAL_CLASSNAMES } from '../common/modalProps';

const { Title, Text } = Typography;

export type BulkCardMode = 'freeze' | 'unfreeze';

interface BulkCardActionModalProps {
    open: boolean;
    mode: BulkCardMode;
    onClose: () => void;
    onSuccess?: () => void;
}

const COPY: Record<
    BulkCardMode,
    { title: string; description: string; cta: string; empty: string }
> = {
    freeze: {
        title: 'Bulk freeze cards',
        description:
            'Choose which active cards to freeze. New transactions will be declined until they are unfrozen.',
        cta: 'Freeze cards',
        empty: 'No active cards to freeze.',
    },
    unfreeze: {
        title: 'Bulk unfreeze cards',
        description:
            'Choose which frozen cards to reactivate. They will resume accepting transactions immediately.',
        cta: 'Unfreeze cards',
        empty: 'No frozen cards to unfreeze.',
    },
};

const CONFIRM_WORD = 'FREEZE';
// Matches the backend per-request cap (MAX_ITEMS_PER_PAGE). Larger sets are processed in batches.
const MAX_BULK = 100;

/**
 * Inner body. Mounted only while the modal is open (antd lazy-mounts + `destroyOnHidden` unmounts on close),
 * so the eligible-card fetch runs once per open and all local state resets on close without manual cleanup.
 */
const BulkCardActionContent = ({
    mode,
    onClose,
    onSuccess,
}: Omit<BulkCardActionModalProps, 'open'>) => {
    const dispatch = useAppDispatch();
    const { submitBulkCardState, isLoading: submitting } = useBulkCardStateApi();
    // Eligible cards for the action: freeze → currently Active; unfreeze → currently Frozen.
    const { cards, total, isLoading } = useAdminCardsApi(
        1,
        MAX_BULK,
        undefined,
        undefined,
        mode === 'freeze' ? 'Active' : 'Frozen'
    );

    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [step, setStep] = useState<'select' | 'confirm'>('select');
    const [confirmText, setConfirmText] = useState('');
    const [reason, setReason] = useState<number>();
    // "Others" says nothing on its own, so it carries a free-text note; the other three codes are
    // self-describing and don't.
    const [reasonNote, setReasonNote] = useState('');
    const needsReasonNote = reason === FREEZE_REASON_OTHERS;
    const reasonNoteMissing = needsReasonNote && reasonNote.trim() === '';
    const reasonNoteInvalid = reasonNoteError(reasonNote, FREEZE_REASON_NOTE_MAX);

    const copy = COPY[mode];
    const keys = useMemo(() => cards.map(card => card.key), [cards]);
    const allChecked = selected.size === keys.length && keys.length > 0;
    const indeterminate = selected.size > 0 && selected.size < keys.length;

    const toggleAll = (checked: boolean) => setSelected(checked ? new Set(keys) : new Set());
    const toggleOne = (key: string) =>
        setSelected(prev => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });

    const runBulk = async () => {
        const res = await submitBulkCardState({
            action: mode,
            cardIds: [...selected],
            ...(mode === 'freeze'
                ? { reason, ...(needsReasonNote ? { reasonNote: reasonNote.trim() } : {}) }
                : {}),
        });
        if (!res) return; // failure already surfaced by the response interceptor
        const { summary } = res.data;
        dispatch(
            showToast({
                variant: 'success',
                description: `${summary.succeeded} Card(s) ${mode === 'freeze' ? 'frozen' : 'unfrozen'} successfully`,
            })
        );
        if (summary.failed > 0) {
            dispatch(
                showToast({
                    variant: 'warning',
                    description: `${summary.failed} card${
                        summary.failed === 1 ? '' : 's'
                    } could not be updated. Please try again.`,
                })
            );
        }
        onSuccess?.();
        onClose();
    };

    const confirmValid = confirmText.trim() === CONFIRM_WORD;
    const canSubmitFreeze = confirmValid && !!reason && !reasonNoteMissing && !reasonNoteInvalid;

    const renderCardList = () => {
        if (isLoading) {
            return (
                <div className="flex items-center justify-center py-10">
                    <Spin />
                </div>
            );
        }
        if (keys.length === 0) {
            return (
                <div className="px-4 py-10 text-center text-sm text-textGreyLight">
                    {copy.empty}
                </div>
            );
        }
        return (
            <>
                <div className="flex items-center justify-between gap-3 border-b border-borderDivider px-4 py-3">
                    <Checkbox
                        checked={allChecked}
                        indeterminate={indeterminate}
                        onChange={event => toggleAll(event.target.checked)}
                    >
                        <span className="text-sm font-medium text-textHeadings">Select all</span>
                    </Checkbox>
                    <span className="text-sm text-textGreyLight">({keys.length})</span>
                </div>
                <ul className="flex max-h-64 flex-col overflow-y-auto">
                    {cards.map(card => (
                        <li
                            key={card.key}
                            className="flex items-center justify-between gap-3 px-4 py-2.5"
                        >
                            <Checkbox
                                checked={selected.has(card.key)}
                                onChange={() => toggleOne(card.key)}
                            >
                                <span className="text-sm text-textHeadings">
                                    {[`•• ${card.last4}`, card.nameOnCard, card.holder]
                                        .filter(Boolean)
                                        .join(' · ')}
                                </span>
                            </Checkbox>
                            <span className="text-xs text-textGreyLight">{card.type}</span>
                        </li>
                    ))}
                </ul>
            </>
        );
    };

    // Confirm step (freeze only): pick a reason + type-to-confirm.
    if (step === 'confirm') {
        return (
            <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                    <Title level={4} className="!mb-0 !text-textHeadings">
                        Confirm bulk freeze
                    </Title>
                    <Text className="text-sm text-textBody">
                        You are about to freeze {selected.size} card{selected.size === 1 ? '' : 's'}
                        . Type {CONFIRM_WORD} below to confirm.
                    </Text>
                </div>
                <div className="flex flex-col gap-1.5">
                    <Text className="text-sm text-textBody">
                        Select Reason
                        <span className="ml-0.5 text-errorTextRed">*</span>
                    </Text>
                    <Select
                        placeholder="Select a reason"
                        value={reason}
                        onChange={value => {
                            setReason(value);
                            // Drop a note typed under "Others" when the admin switches to a
                            // self-describing code, so it can't be submitted against the wrong reason.
                            if (value !== FREEZE_REASON_OTHERS) setReasonNote('');
                        }}
                        options={FREEZE_REASON_OPTIONS}
                    />
                </div>
                {needsReasonNote && (
                    <div className="flex flex-col gap-1.5">
                        <Text className="text-sm text-textBody">
                            Enter Reason
                            <span className="ml-0.5 text-errorTextRed">*</span>
                        </Text>
                        <Input.TextArea
                            placeholder="Enter"
                            rows={3}
                            maxLength={FREEZE_REASON_NOTE_MAX}
                            value={reasonNote}
                            status={reasonNoteInvalid ? 'error' : undefined}
                            onChange={event =>
                                setReasonNote(sanitizeReasonNote(event.target.value))
                            }
                        />
                        {reasonNoteInvalid && (
                            <Text className="text-xs text-errorTextRed">{reasonNoteInvalid}</Text>
                        )}
                    </div>
                )}
                <div className="flex flex-col gap-1.5">
                    <Text className="text-sm text-textBody">
                        Type <span className="font-semibold text-textHeadings">{CONFIRM_WORD}</span>{' '}
                        to confirm
                    </Text>
                    <Input
                        placeholder="Type"
                        value={confirmText}
                        onChange={event => setConfirmText(event.target.value)}
                        onPressEnter={() => canSubmitFreeze && !submitting && runBulk()}
                    />
                </div>
                <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <Button
                            danger
                            onClick={onClose}
                            disabled={submitting}
                            className="font-medium"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            disabled={!canSubmitFreeze}
                            loading={submitting}
                            onClick={runBulk}
                            className="font-medium"
                        >
                            {copy.cta}
                        </Button>
                    </div>
                    <PineLabsFooter />
                </div>
            </div>
        );
    }

    // Select step.
    return (
        <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
                <Title level={4} className="!mb-0 !text-textHeadings">
                    {copy.title}
                </Title>
                <Text className="text-sm text-textBody">{copy.description}</Text>
                {total > MAX_BULK && (
                    <Text className="text-xs text-textOrange">
                        Showing the first {MAX_BULK} of {total} cards. Process the rest in a later
                        batch.
                    </Text>
                )}
            </div>

            <div className="overflow-hidden rounded-2xl border border-borderCard">
                {renderCardList()}
            </div>

            <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Button danger onClick={onClose} className="font-medium">
                        Cancel
                    </Button>
                    <Button
                        type="primary"
                        disabled={selected.size === 0}
                        loading={mode === 'unfreeze' && submitting}
                        onClick={() => (mode === 'freeze' ? setStep('confirm') : runBulk())}
                        className="font-medium"
                    >
                        {copy.cta}
                    </Button>
                </div>
                <PineLabsFooter />
            </div>
        </div>
    );
};

/** Bulk freeze / unfreeze cards modal. Freeze adds a reason + "type FREEZE to confirm" step. */
const BulkCardActionModal = ({ open, mode, onClose, onSuccess }: BulkCardActionModalProps) => (
    <Modal
        open={open}
        onCancel={onClose}
        footer={null}
        centered
        width={480}
        destroyOnHidden
        classNames={ROUNDED_MODAL_CLASSNAMES}
        closeIcon={MODAL_CLOSE_ICON}
    >
        <BulkCardActionContent mode={mode} onClose={onClose} onSuccess={onSuccess} />
    </Modal>
);

export default BulkCardActionModal;
