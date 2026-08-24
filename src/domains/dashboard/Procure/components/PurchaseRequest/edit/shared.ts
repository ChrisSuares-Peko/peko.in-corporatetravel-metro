export const sectionCard = {
    styles: { body: { padding: '20px 24px' } },
    className: 'mb-4 mt-5 !border-gray-100',
    style: { borderRadius: 20 },
};

export const ALLOWED_FILE_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const;
