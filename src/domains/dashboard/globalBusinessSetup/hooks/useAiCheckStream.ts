import { useEffect, useRef, useState } from 'react';

import Pusher from 'pusher-js';

import { VITE_PUSHER_APPKEY } from '@src/config-global';

export type StepStatus = 'pending' | 'loading' | 'success' | 'error';

export type Step = {
    stage: 'preparing' | 'validating' | 'processing' | 'saving';
    label: string;
    status: StepStatus;
};

export type AiCheckUpdate = {
    stage: string;
    status: string;
    message: string;
    reference_id?: string;
};

const STEP_DEFINITIONS: Array<Omit<Step, 'status'>> = [
    { stage: 'preparing', label: 'Preparing your application' },
    { stage: 'validating', label: 'Validating against quote configuration' },
    { stage: 'processing', label: 'Processing form attachments' },
    { stage: 'saving', label: 'Saving your application' },
];

const buildInitialSteps = (): Step[] =>
    STEP_DEFINITIONS.map((s, i) => ({ ...s, status: i === 0 ? 'loading' : 'pending' }));

interface UseAiCheckStreamResult {
    steps: Step[];
    updates: AiCheckUpdate[];
    errors: string[];
    isComplete: boolean;
    isFailed: boolean;
    isPending: boolean;
    reset: () => void;
}

export const useAiCheckStream = (
    referenceId: string | null,
    enabled: boolean,
    apiSuccess = false
): UseAiCheckStreamResult => {
    const [steps, setSteps] = useState<Step[]>(buildInitialSteps);
    const [updates, setUpdates] = useState<AiCheckUpdate[]>([]);
    const [errors, setErrors] = useState<string[]>([]);
    const [isComplete, setIsComplete] = useState(false);
    const [isFailed, setIsFailed] = useState(false);
    const [isPending, setIsPending] = useState(false);

    const pusherRef = useRef<Pusher | null>(null);

    const reset = () => {
        setSteps(buildInitialSteps());
        setUpdates([]);
        setErrors([]);
        setIsComplete(false);
        setIsFailed(false);
        setIsPending(false);
    };

    useEffect(() => {
        if (!enabled || !referenceId) return () => {};

        // Fresh state on each subscription
        setSteps(buildInitialSteps());
        setUpdates([]);
        setErrors([]);
        setIsComplete(false);
        setIsFailed(false);
        setIsPending(true);

        const pusher = new Pusher(VITE_PUSHER_APPKEY, { cluster: 'ap2' });
        pusherRef.current = pusher;

        const channelName = `global-business-setup-${referenceId}`;
        const channel = pusher.subscribe(channelName);

        channel.bind('ai-check-status', (data: AiCheckUpdate) => {
            const incoming: AiCheckUpdate = {
                stage: data.stage ?? '',
                status: data.status ?? '',
                message: data.message ?? '',
                reference_id: data.reference_id,
            };

            setUpdates(prev => [...prev, incoming]);

            // Advance the fixed 4-step state based on incoming stage
            setSteps(prev => {
                const next = prev.map(s => ({ ...s }));
                const idxOf = (stage: string) => next.findIndex(s => s.stage === stage);

                if (incoming.stage === 'validating') {
                    if (idxOf('preparing') !== -1) next[idxOf('preparing')].status = 'success';
                    if (idxOf('validating') !== -1) next[idxOf('validating')].status = 'loading';
                } else if (incoming.stage === 'validation_failed') {
                    if (idxOf('validating') !== -1) next[idxOf('validating')].status = 'error';
                } else if (incoming.stage === 'processing') {
                    const processingIdx = idxOf('processing');
                    next.forEach((s, i) => {
                        if (i < processingIdx && s.status !== 'error') s.status = 'success';
                    });
                    if (processingIdx !== -1) next[processingIdx].status = 'loading';
                } else if (incoming.stage === 'saving') {
                    const savingIdx = idxOf('saving');
                    next.forEach((s, i) => {
                        if (i < savingIdx && s.status !== 'error') s.status = 'success';
                    });
                    if (savingIdx !== -1) next[savingIdx].status = 'loading';
                }

                return next;
            });

            // Capture errors when status indicates failure
            if (incoming.status === 'error' || incoming.status === 'failed') {
                if (incoming.message) {
                    setErrors(prev => [...prev, incoming.message]);
                }
                setIsFailed(true);
                setIsPending(false);

                // Mark the currently-loading step as error (if not already handled above)
                setSteps(prev =>
                    prev.map(s => (s.status === 'loading' ? { ...s, status: 'error' } : s))
                );
            }

            // Mark complete when saving stage succeeds
            if (incoming.stage === 'saving' && incoming.status === 'success') {
                setSteps(prev => prev.map(s => ({ ...s, status: 'success' })));
                setIsComplete(true);
                setIsPending(false);
            }
        });

        return () => {
            channel.unbind_all();
            pusher.unsubscribe(channelName);
            pusher.disconnect();
            pusherRef.current = null;
        };
    }, [referenceId, enabled]);

    // Fallback: when the submit API returns successfully, treat that as the
    // definitive "saved" signal — regardless of whether the final Pusher event
    // for stage=saving,status=success arrived. Fast-forward any non-errored
    // steps to success.
    useEffect(() => {
        if (!enabled || !apiSuccess || isComplete || isFailed) return;
        setSteps(prev => prev.map(s => (s.status === 'error' ? s : { ...s, status: 'success' })));
        setIsComplete(true);
        setIsPending(false);
    }, [apiSuccess, enabled, isComplete, isFailed]);

    return { steps, updates, errors, isComplete, isFailed, isPending, reset };
};
