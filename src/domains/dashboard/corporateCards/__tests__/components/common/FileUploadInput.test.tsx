import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Formik } from 'formik';
import { describe, it, expect } from 'vitest';

import DocumentUploadField from '../../../components/common/FileUploadInput';

const MIDDLE_DOT = '·';

const renderField = (props: Partial<React.ComponentProps<typeof DocumentUploadField>> = {}) =>
    render(
        <Formik initialValues={{ doc: null }} onSubmit={() => {}}>
            <DocumentUploadField name="doc" label="Corporate Agreement" {...props} />
        </Formik>
    );

describe('FileUploadInput (DocumentUploadField)', () => {
    it('shows the label, a mandatory asterisk, sublabel and a size hint derived from props', () => {
        renderField({
            isRequired: true,
            subLabel: 'Upload Corporate Agreement',
            maxFileSize: 300,
            allowedFileTypes: ['image/jpeg', 'image/png', 'application/pdf'],
        });

        expect(screen.getByText('Corporate Agreement')).toBeInTheDocument();
        expect(screen.getByText('*')).toBeInTheDocument();
        expect(screen.getByText('Upload Corporate Agreement')).toBeInTheDocument();
        expect(screen.getByText(`JPG, PNG, PDF ${MIDDLE_DOT} Max 300 KB`)).toBeInTheDocument();
    });

    it('does not show an asterisk when the field is not required', () => {
        renderField({ isRequired: false });

        expect(screen.queryByText('*')).not.toBeInTheDocument();
    });

    it('accepts a valid file within the size limit and shows it as uploaded', async () => {
        const { container } = renderField({ maxFileSize: 300, allowedFileTypes: ['application/pdf'] });

        const input = container.querySelector('input[type="file"]') as HTMLInputElement;
        const file = new File(['x'.repeat(100)], 'agreement.pdf', { type: 'application/pdf' });
        Object.defineProperty(input, 'files', { value: [file] });
        fireEvent.change(input);

        await waitFor(() => expect(screen.getByText('agreement.pdf')).toBeInTheDocument());
    });

    it('keeps showing the document type label alongside the filename once uploaded', async () => {
        const { container } = renderField({ maxFileSize: 300, allowedFileTypes: ['application/pdf'] });

        const input = container.querySelector('input[type="file"]') as HTMLInputElement;
        const file = new File(['x'.repeat(100)], 'image (1).png', { type: 'application/pdf' });
        Object.defineProperty(input, 'files', { value: [file] });
        fireEvent.change(input);

        await waitFor(() => expect(screen.getByText('image (1).png')).toBeInTheDocument());
        expect(screen.getByText('Corporate Agreement')).toBeInTheDocument();
    });

    it('rejects a file over the max size and shows the error inline below the field, not the file', async () => {
        const { container } = renderField({ maxFileSize: 1, allowedFileTypes: ['application/pdf'] });

        const input = container.querySelector('input[type="file"]') as HTMLInputElement;
        const file = new File(['x'.repeat(5000)], 'agreement.pdf', { type: 'application/pdf' });
        Object.defineProperty(input, 'files', { value: [file] });
        fireEvent.change(input);

        await waitFor(() => expect(screen.getByText('File size must not exceed 1 KB')).toBeInTheDocument());
        expect(screen.queryByText('agreement.pdf')).not.toBeInTheDocument();
    });

    it('rejects a disallowed file type and shows the error inline below the field', async () => {
        const { container } = renderField({ allowedFileTypes: ['application/pdf'] });

        const input = container.querySelector('input[type="file"]') as HTMLInputElement;
        const file = new File(['x'], 'photo.png', { type: 'image/png' });
        Object.defineProperty(input, 'files', { value: [file] });
        fireEvent.change(input);

        await waitFor(() =>
            expect(screen.getByText('Invalid file format. Please upload a PDF file.')).toBeInTheDocument()
        );
    });

    it('lists multiple accepted formats with an Oxford comma in the disallowed-type message', async () => {
        const { container } = renderField({
            allowedFileTypes: ['image/jpeg', 'image/png', 'application/pdf'],
        });

        const input = container.querySelector('input[type="file"]') as HTMLInputElement;
        const file = new File(['x'], 'doc.docx', {
            type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        });
        Object.defineProperty(input, 'files', { value: [file] });
        fireEvent.change(input);

        await waitFor(() =>
            expect(
                screen.getByText('Invalid file format. Please upload a JPG, PNG, or PDF file.')
            ).toBeInTheDocument()
        );
    });

    it('rejects an empty file and shows the error inline below the field', async () => {
        const { container } = renderField({ allowedFileTypes: ['application/pdf'] });

        const input = container.querySelector('input[type="file"]') as HTMLInputElement;
        const file = new File([], 'empty.pdf', { type: 'application/pdf' });
        Object.defineProperty(input, 'files', { value: [file] });
        fireEvent.change(input);

        await waitFor(() =>
            expect(
                screen.getByText('The selected file is empty. Please upload a valid file.')
            ).toBeInTheDocument()
        );
    });

    it('lets the user remove an uploaded file', async () => {
        const { container } = renderField({ maxFileSize: 300, allowedFileTypes: ['application/pdf'] });

        const input = container.querySelector('input[type="file"]') as HTMLInputElement;
        const file = new File(['x'.repeat(100)], 'agreement.pdf', { type: 'application/pdf' });
        Object.defineProperty(input, 'files', { value: [file] });
        fireEvent.change(input);
        await waitFor(() => expect(screen.getByText('agreement.pdf')).toBeInTheDocument());

        fireEvent.click(container.querySelector('.anticon-close-circle') as Element);

        expect(screen.queryByText('agreement.pdf')).not.toBeInTheDocument();
        expect(screen.getByText('Corporate Agreement')).toBeInTheDocument();
    });
});
