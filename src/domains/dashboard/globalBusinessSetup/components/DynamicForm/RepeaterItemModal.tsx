import React from 'react';

import { Button, Col, Form, Modal, Row } from 'antd';

import FieldRenderer from './FieldRenderer';
import { IForm, ISection } from '../../types/forms';

interface RepeaterItemModalProps {
    open: boolean;
    mode: 'add' | 'edit';
    noun: string;
    section: ISection;
    pageId: string;
    sectionId: string;
    instanceIdx: number;
    form: IForm;
    onSave: () => void;
    onCancel: () => void;
}

const RepeaterItemModal: React.FC<RepeaterItemModalProps> = ({
    open,
    mode,
    noun,
    section,
    pageId,
    sectionId,
    instanceIdx,
    form,
    onSave,
    onCancel,
}) => {
    const isSingleColumn = section.fields.length <= 4;
    const colSpan = isSingleColumn ? 24 : 12;

    return (
        <Modal
            open={open}
            onCancel={onCancel}
            title={`${mode === 'add' ? 'Add' : 'Edit'} ${noun} ${instanceIdx + 1}`}
            width={isSingleColumn ? 640 : 1000}
            maskClosable={false}
            footer={[
                <Button key="cancel" onClick={onCancel} danger>
                    Cancel
                </Button>,
                <Button danger key="save" type="primary" onClick={onSave}>
                    {mode === 'add' ? 'Add' : 'Update'}
                </Button>,
            ]}
        >
            <Form layout="vertical" component="div">
                <Row gutter={[16, 0]}>
                    {section.fields.map(field => {
                        const isFullWidth =
                            field.type === 'checkbox' ||
                            field.type === 'nested_select' ||
                            field.type === 'table';
                        return (
                            <Col key={field._id} xs={24} md={isFullWidth ? 24 : colSpan}>
                                <FieldRenderer
                                    field={field}
                                    pageId={pageId}
                                    sectionId={sectionId}
                                    instanceIdx={instanceIdx}
                                    form={form}
                                />
                            </Col>
                        );
                    })}
                </Row>
            </Form>
        </Modal>
    );
};

export default RepeaterItemModal;
