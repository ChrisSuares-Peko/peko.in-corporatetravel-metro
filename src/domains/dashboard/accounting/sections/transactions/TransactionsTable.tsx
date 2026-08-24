import { Button, Flex } from 'antd';

import BulkActionsBar from './BulkActionsBar';
import LinkDocumentModal from './LinkDocumentModal';
import TransactionsTableBody from './TransactionsTableBody';
import { useTransactionActions } from './useTransactionActions';
import { TransactionMonthGroup, TransactionTab } from '../../utils/transactionsData';

interface TransactionsTableProps {
    groups: TransactionMonthGroup[];
    loading: boolean;

    onRefetch: () => void;

    activeTab: TransactionTab['key'];

    hasMore: boolean;

    loadingMore: boolean;

    onLoadMore: () => void;
}

const TransactionsTable = ({
    groups,
    loading,
    onRefetch,
    activeTab,
    hasMore,
    loadingMore,
    onLoadMore,
}: TransactionsTableProps) => {
    const {
        editingId,
        setEditingId,
        selectedIds,
        setSelectedIds,
        linkingTxn,
        setLinkingTxn,
        allSelected,
        someSelected,
        toggleId,
        handleToggleSelectAll,
        handleSaveNote,
        handleToggleRecurring,
        handleToggleHide,
        handleSetCategory,
        handleChangeAccount,
        handleUnlink,
        handleRemoveDoc,
        selectedCount,
        clearSelection,
        exporting,
        handleExportSelected,
        hideLabel,
        handleBulkHide,
        handleBulkRecurring,
        handleBulkCategorize,
    } = useTransactionActions({ groups, onRefetch, activeTab });

    return (
        <>
            <TransactionsTableBody
                groups={groups}
                loading={loading}
                allSelected={allSelected}
                someSelected={someSelected}
                onToggleSelectAll={handleToggleSelectAll}
                selectedIds={selectedIds}
                editingId={editingId}
                onToggleSelect={id => setSelectedIds(prev => toggleId(prev, id))}
                onStartEdit={id => setEditingId(id)}
                onStopEdit={() => setEditingId(null)}
                onSaveNote={handleSaveNote}
                onToggleRecurring={handleToggleRecurring}
                onToggleHide={handleToggleHide}
                onSetCategory={handleSetCategory}
                onChangeAccount={handleChangeAccount}
                onLinkDocument={setLinkingTxn}
                onUnlink={handleUnlink}
                onRemoveDoc={handleRemoveDoc}
            />

            {hasMore && !loading && (
                <Flex justify="center">
                    <Button
                        onClick={onLoadMore}
                        loading={loadingMore}
                        className="!h-10 !rounded-xl !border-borderSubtle !px-6 !font-medium !text-bodyText"
                    >
                        Load more
                    </Button>
                </Flex>
            )}

            {selectedCount > 0 && (
                <BulkActionsBar
                    count={selectedCount}
                    onCategorize={handleBulkCategorize}
                    onMarkRecurring={handleBulkRecurring}
                    hideLabel={hideLabel}
                    onHide={handleBulkHide}
                    exporting={exporting}
                    onExport={handleExportSelected}
                    onClear={clearSelection}
                />
            )}

            <LinkDocumentModal
                open={Boolean(linkingTxn)}
                transaction={linkingTxn}
                onClose={() => setLinkingTxn(null)}
                onLinked={onRefetch}
            />
        </>
    );
};

export default TransactionsTable;
