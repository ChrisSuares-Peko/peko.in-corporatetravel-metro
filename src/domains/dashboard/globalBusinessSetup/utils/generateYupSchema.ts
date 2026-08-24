import * as Yup from 'yup';

import { evaluateCondition, getNestedValue } from './conditionalUtils';
import { isPhoneValidByCountry } from './isPhoneValid';
import { getValueFromComplexPath } from './pathResolver';
import { IForm } from '../types/forms';

const noExtraSpaces = (label: string) =>
    Yup.string()
        .test(
            'no-leading-or-trailing-space',
            `${label} cannot start or end with a blank space`,
            value => !value || (!/^[ \t]/.test(value) && !/[ \t]$/.test(value))
        )
        .test(
            'no-multiple-spaces',
            `${label} cannot contain consecutive blank spaces`,
            value => !value || !/[ \t]{2,}/.test(value)
        );

const sanitizeLabel = (label: string) => label.replace(/\s*\([^)]*\)\s*/g, '').trim();

const getRootFormValues = (context: any) => {
    if (!context?.from || !Array.isArray(context.from) || context.from.length === 0) {
        return context?.parent;
    }

    const last = context.from[context.from.length - 1];
    if (last?.value !== undefined) {
        return last.value;
    }

    const first = context.from[0];
    if (first?.value !== undefined) {
        return first.value;
    }

    return context.parent;
};

function buildFieldValidator(
    field: IForm['pages'][0]['sections'][0]['fields'][0],
    form: IForm
): Yup.AnySchema {
    const formattedLabel = formatLabel(field.label);
    let validator: Yup.AnySchema = createBaseValidator(field, formattedLabel, form);

    const rules = field.validation || {};

    if (field.type === 'text' || field.type === 'textarea') {
        const cleanLabel = sanitizeLabel(formattedLabel);
        validator = noExtraSpaces(cleanLabel);
    }
    if (rules.min_length?.value !== undefined && field.type !== 'number') {
        validator = (validator as Yup.StringSchema).min(
            rules.min_length.value,
            rules.min_length.error_message ||
                `${formattedLabel} must be at least ${rules.min_length.value} characters`
        );
    }

    if (rules.max_length?.value !== undefined && field.type !== 'number') {
        validator = (validator as Yup.StringSchema).max(
            rules.max_length.value,
            rules.max_length.error_message ||
                `${formattedLabel} must be maximum ${rules.max_length.value} characters`
        );
    }

    // if (rules.min?.value !== undefined && field.type === 'number') {
    //     validator = (validator as Yup.NumberSchema).min(
    //         rules.min.value,
    //         rules.min.error_message || `Minimum value should be ${rules.min.value}`
    //     );
    // }

    // if (rules.max?.value !== undefined && field.type === 'number') {
    //     validator = (validator as Yup.NumberSchema).max(
    //         rules.max.value,
    //         rules.max.error_message || `Maximum value should be ${rules.max.value}`
    //     );
    // }

    if (field.type === 'number' && rules.min?.value !== undefined) {
        const minValue = Number(rules.min.value);

        validator = (validator as Yup.StringSchema).test(
            `min-number-${field.name}`,
            rules.min.error_message || `Minimum value should be ${minValue}`,
            value => {
                if (value === undefined || value === null || value.trim() === '') return true;

                const num = Number(value);

                if (Number.isNaN(num)) return false;
                return num >= minValue;
            }
        );
    }

    if (field.type === 'number' && rules.max?.value !== undefined) {
        const maxValue = Number(rules.max.value);

        validator = (validator as Yup.StringSchema).test(
            `max-number-${field.name}`,
            rules.max.error_message || `Maximum value should be ${maxValue}`,
            value => {
                if (value === undefined || value === null || value.trim() === '') return true;

                const num = Number(value);

                if (Number.isNaN(num)) return false;
                return num <= maxValue;
            }
        );
    }

    if (rules.regex?.value && validator instanceof Yup.StringSchema) {
        const regexValue = rules.regex.value;
        const regex = new RegExp(regexValue);

        const message =
            rules.regex.error_message || getRegexErrorMessage(formattedLabel, regexValue);

        validator = validator.matches(regex, message);
    }

    if (rules?.unique?.value) {
        validator = validator.test(
            `unique-${field.name}`,
            rules.unique.error_message || `${formattedLabel} must be unique`,
            function validateUnique(value) {
                if (value === undefined || value === null || value === '') return true;

                const ctx = this as any;

                // ✅ Get full form values safely from Yup
                const rootValues =
                    ctx.from?.[ctx.from.length - 1]?.value ||
                    ctx.from?.[0]?.value ||
                    ctx.options?.parent;

                if (!rootValues || !ctx.path) return true;

                /**
                 * path examples:
                 * Non-repeatable:
                 *   pages.pageId.sectionId.passport
                 *
                 * Repeatable:
                 *   pages.pageId.sectionId.0.passport
                 */
                const parts = ctx.path.split('.');

                const fieldName = parts.pop(); // passport
                const maybeIndex = parts[parts.length - 1];

                const isRepeatable = !Number.isNaN(Number(maybeIndex));
                if (isRepeatable) {
                    parts.pop(); // remove index
                }

                const sectionPath = parts.join('.');

                const sectionValues = sectionPath
                    .split('.')
                    .reduce(
                        (acc: Record<string, any> | undefined, key: string) => acc?.[key],
                        rootValues as Record<string, any>
                    );

                if (!sectionValues || typeof sectionValues !== 'object') return true;

                // --------------------------------------------------
                // ✅ Repeatable section uniqueness
                // --------------------------------------------------
                if (isRepeatable) {
                    const currentIndex = String(maybeIndex);

                    const duplicates = Object.entries(sectionValues).filter(([idx, row]: any) => {
                        if (String(idx) === currentIndex) return false;

                        const otherValue = row?.[fieldName!];
                        if (otherValue === undefined || otherValue === null) return false;

                        return String(otherValue).trim() === String(value).trim();
                    });

                    return duplicates.length === 0;
                }

                // --------------------------------------------------
                // ✅ Non-repeatable section uniqueness
                // (compare with sibling fields)
                // --------------------------------------------------
                const siblings = sectionValues;

                const duplicates = Object.entries(siblings).filter(([key, val]: any) => {
                    if (key === fieldName) return false;
                    if (val === undefined || val === null) return false;

                    return String(val).trim() === String(value).trim();
                });

                return duplicates.length === 0;
            }
        );
    }

    if ((field.type === 'file' || field.type === 'image') && rules.max_file_size?.value) {
        const maxBytes = rules.max_file_size.value * 1024 * 1024;

        validator = validator.test(
            'fileSize',
            rules.max_file_size.error_message ||
                `File must be less than ${rules.max_file_size.value}MB`,
            (file: any) => {
                if (!file) return true;
                return file.size <= maxBytes;
            }
        );
    }

    if (rules.required.value && !field.conditional?.enabled) {
        validator = applyRequiredValidator(validator, field, rules);
    }

    if (
        field.conditional?.enabled &&
        field.conditional.source_field_name &&
        field.conditional.operator
    ) {
        const lazyValidator = Yup.lazy((value, context) => {
            const formValues = getRootFormValues(context);
            const sourceFieldPath = field.conditional!.source_field_name!;
            const sourceValue =
                getValueFromComplexPath(form, formValues, sourceFieldPath, '', '') ??
                getNestedValue(formValues, sourceFieldPath);

            const shouldValidate = evaluateCondition(
                sourceValue,
                field.conditional!.operator!,
                field.conditional!.value
            );

            if (!shouldValidate) {
                return Yup.mixed().notRequired();
            }

            let freshValidator = createBaseValidator(field, formattedLabel, form);
            if (rules.required?.value) {
                freshValidator = applyRequiredValidator(
                    freshValidator as any,
                    field,
                    rules
                ) as typeof freshValidator;
            }
            if (rules.min?.value !== undefined && field.type === 'number') {
                const minValue = Number(rules.min.value);

                freshValidator = (freshValidator as Yup.StringSchema).test(
                    `min-number-${field.name}`,
                    rules.min.error_message || `Minimum value should be ${minValue}`,
                    val => {
                        if (!val) return true;
                        return Number(val) >= minValue;
                    }
                );
            }

            if (rules.max?.value !== undefined && field.type === 'number') {
                const maxValue = Number(rules.max.value);

                freshValidator = (freshValidator as Yup.StringSchema).test(
                    `max-number-${field.name}`,
                    rules.max.error_message || `Maximum value should be ${maxValue}`,
                    val => {
                        if (!val) return true;
                        return Number(val) <= maxValue;
                    }
                );
            }

            if (rules.regex?.value && freshValidator instanceof Yup.StringSchema) {
                const regexValue = rules.regex.value;
                const regex = new RegExp(regexValue);

                const message =
                    rules.regex.error_message || getRegexErrorMessage(formattedLabel, regexValue);

                freshValidator = freshValidator.matches(regex, message);
            }

            return freshValidator;
        });
        return lazyValidator as unknown as Yup.AnySchema;
    }

    return validator;
}

export const generateValidationSchema = (form: IForm) => {
    const pagesShape: any = {};

    form?.pages.forEach(page => {
        const pageShape: any = {};

        page.sections.forEach(section => {
            const isRepeatable = section.repeater?.enabled;

            if (isRepeatable) {
                const instanceShape: any = {};
                section.fields.forEach(field => {
                    instanceShape[field.name] = buildFieldValidator(field, form);
                });

                pageShape[section._id] = Yup.lazy((value: any, context) => {
                    if (section.conditional?.enabled && section.conditional.source_field_name) {
                        const formValues = getRootFormValues(context);
                        const sourceValue =
                            getValueFromComplexPath(
                                form,
                                formValues,
                                section.conditional.source_field_name!,
                                '',
                                ''
                            ) ?? getNestedValue(formValues, section.conditional.source_field_name!);

                        const shouldValidate = evaluateCondition(
                            sourceValue,
                            section.conditional.operator!,
                            section.conditional.value
                        );

                        if (!shouldValidate) {
                            return Yup.object({}).notRequired();
                        }
                    }

                    const instanceValidators: any = {};
                    const numericKeys =
                        value && typeof value === 'object'
                            ? Object.keys(value).filter(k => !Number.isNaN(Number(k)))
                            : [];

                    numericKeys.forEach(key => {
                        instanceValidators[key] = Yup.object(instanceShape);
                    });

                    const minInstances = section.repeater?.min_instances || 0;
                    if (numericKeys.length < minInstances) {
                        const missing = Array.from(
                            { length: minInstances - numericKeys.length },
                            (_, idx) => numericKeys.length + idx
                        );
                        missing.forEach(i => {
                            instanceValidators[i] = Yup.object(instanceShape).required();
                        });
                    }

                    let sectionSchema = Yup.object(instanceValidators);

                    const rules = section.validation?.rules || [];

                    rules.forEach(rule => {
                        if (rule.type !== 'sum') return;
                        const pathParts = rule.source_field_name?.split('.') || [];
                        const fieldIndex = Number(pathParts[pathParts.length - 2]);
                        const fieldName = section.fields?.[fieldIndex]?.name;

                        if (!fieldName) {
                            console.warn(
                                '⚠️ Unable to resolve field for section rule:',
                                rule,
                                section.title
                            );
                            return;
                        }

                        sectionSchema = sectionSchema.test(
                            `section-sum-${section._id}-${fieldName}`,
                            rule.error_message || 'Invalid total',
                            function validateSectionSum(sectionValues) {
                                if (!sectionValues || typeof sectionValues !== 'object') {
                                    return true;
                                }

                                const numbers = extractNumericValuesFromSection(
                                    sectionValues,
                                    fieldName
                                );

                                if (numbers.length === 0) return true;

                                const total = numbers.reduce((sum, n) => sum + n, 0);

                                const isValid = evaluateNumericRule(
                                    total,
                                    rule.operator,
                                    Number(rule.value)
                                );

                                if (isValid) return true;
                                return this.createError({
                                    path: this.path,
                                    message:
                                        rule.error_message || `Invalid total for ${section.title}`,
                                });
                            }
                        );
                    });

                    return sectionSchema;
                });
            } else {
                const sectionShape: any = {};
                section.fields.forEach(field => {
                    sectionShape[field.name] = buildFieldValidator(field, form);
                });

                if (section.conditional?.enabled && section.conditional.source_field_name) {
                    pageShape[section._id] = Yup.lazy((value, context) => {
                        const formValues = getRootFormValues(context);
                        const sourceValue =
                            getValueFromComplexPath(
                                form,
                                formValues,
                                section.conditional.source_field_name!,
                                '',
                                ''
                            ) ?? getNestedValue(formValues, section.conditional.source_field_name!);

                        const shouldValidate = evaluateCondition(
                            sourceValue,
                            section.conditional.operator!,
                            section.conditional.value
                        );

                        if (!shouldValidate) {
                            return Yup.object({}).notRequired();
                        }

                        return Yup.object(sectionShape);
                    });
                } else {
                    pageShape[section._id] = Yup.object(sectionShape);
                }
            }
        });

        pagesShape[page._id] = Yup.object(pageShape);
    });

    return Yup.object({
        pages: Yup.object(pagesShape),
    });
};

const applyRequiredValidator = (
    validator: Yup.AnySchema,
    field: any,
    rules: any
): Yup.AnySchema => {
    if (field.type === 'checkbox') {
        return (validator as Yup.BooleanSchema).oneOf(
            [true],
            rules.required.error_message || `${field.label} must be one of the allowed options`
        );
    }

    if ((field.type === 'select' || field.type === 'checkbox_group') && field.allow_multiple) {
        return (validator as Yup.ArraySchema<string[], any>)
            .transform(value => {
                if (value === undefined || value === null || value === '') {
                    return [];
                }
                if (!Array.isArray(value)) {
                    return [value];
                }
                return value;
            })
            .min(1, rules.required.error_message || `${field.label} is required`)
            .required(rules.required.error_message || `${field.label} is required`);
    }

    if (field.type === 'select') {
        return validator.required(rules.required.error_message || `${field.label} is required`);
    }

    if (field.type === 'radio') {
        return validator.required(
            rules.required.error_message || `${field.label} must be one of the allowed options`
        );
    }

    if (field.type === 'file' || field.type === 'image') {
        return validator.required(rules.required.error_message || `${field.label} is required`);
    }
    if (field.type === 'nested_select') {
        const expectedDepth = Array.isArray(field.levels) ? field.levels.length : 0;
        return (validator as Yup.ArraySchema<string[], any>)
            .min(1, rules.required.error_message || `${field.label} is required`)
            .test(
                'nested-select-complete',
                rules.required.error_message ||
                    `Please select all levels of ${field.label.toLowerCase()}`,
                (val: any) =>
                    Array.isArray(val) &&
                    val.length >= expectedDepth &&
                    val.every(v => v !== undefined && v !== null && v !== '')
            );
    }
    return validator.required(rules.required.error_message || `${field.label} is required`);
};

const createBaseValidator = (field: any, formattedLabel: string, form: IForm) => {
    switch (field.type) {
        case 'text':
        case 'textarea':
            return noExtraSpaces(formattedLabel);

        case 'number':
            return Yup.string()
                .trim()
                .test('is-valid-number', 'Please enter a valid number', value => {
                    if (value === undefined || value === null || value === '') return true;

                    return !Number.isNaN(Number(value));
                });

        case 'email':
            return noExtraSpaces(formattedLabel)
                .required('Please enter the email ID')
                .matches(
                    /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
                    'Please enter a valid email ID'
                );

        case 'checkbox':
            return Yup.boolean();

        case 'checkbox_group':
        case 'select':
            return field.allow_multiple ? Yup.array().of(Yup.string()) : Yup.string();

        case 'nested_select':
            return Yup.array()
                .transform((val, orig) => {
                    if (orig === '' || orig === null || orig === undefined) return undefined;
                    return Array.isArray(val) ? val : [];
                })
                .of(Yup.string());

        case 'file':
        case 'image':
            return Yup.mixed();

        case 'phone':
            return Yup.string()
                .trim()
                .test('is-phone-by-country', function validatePhoneByCountry(value) {
                    if (!value) return true;
                    // Treat country-code-only (e.g. "+971" with no digits)
                    // as empty so .required() can attach a friendlier
                    // "Mobile Number is required" instead of libphonenumber's
                    // "too short" diagnostic.
                    const digits = String(value).replace(/\D/g, '');
                    if (digits.length <= 4) return true;

                    const formValues = getRootFormValues(this);

                    const country = extractCountryFromPath(form, formValues, this.path);
                    const { isValid, error } = isPhoneValidByCountry(value, country);
                    if (!isValid) {
                        return this.createError({
                            message: error || 'Invalid phone number',
                        });
                    }

                    return true;
                });

        case 'date':
            return Yup.date().typeError('Please enter a valid date');

        case 'country':
            return Yup.string().trim();

        case 'radio': {
            const radioOptions =
                field.options?.map((option: { value: string }) => option.value) || [];
            return Yup.string().oneOf(
                radioOptions,
                field.validation.required.error_message ||
                    `${formattedLabel} must be one of the allowed options`
            );
        }

        default:
            return Yup.string().trim();
    }
};

const extractCountryFromPath = (
    form: IForm,
    formValues: any,
    fieldPath?: string
): string | null => {
    if (!fieldPath) return null;

    const parts = fieldPath.split('.');

    if (parts.length < 4) return null;

    const pageId = parts[1];
    const sectionId = parts[2];

    const maybeIndex = parts[3];
    const isRepeatable = !Number.isNaN(Number(maybeIndex));
    const instanceIdx = isRepeatable ? Number(maybeIndex) : null;

    const page = form.pages.find(p => p._id === pageId);
    const section = page?.sections.find(s => s._id === sectionId);
    if (!section) return null;

    const countryField = section.fields.find(f => f.type === 'country');
    if (!countryField) return null;

    const countryValuePath = isRepeatable
        ? `pages.${pageId}.${sectionId}.${instanceIdx}.${countryField.name}`
        : `pages.${pageId}.${sectionId}.${countryField.name}`;

    return getNestedValue(formValues, countryValuePath) ?? null;
};

const formatLabel = (label: string) => {
    if (label === 'Email ID') return label;
    const trimmed = label.trim();
    const words = trimmed.split(/\s+/);

    if (words.length < 2) return trimmed;
    const lower = trimmed.toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
};

const getRegexErrorMessage = (label: string, regexValue: string) => {
    switch (regexValue) {
        case '^[A-Za-z\\s]+$':
        case '^[A-Za-z ]+$':
            return `${label} can contain only alphabets and spaces`;

        case '^[A-Z0-9]+$':
            return `${label} can contain only uppercase letters and numbers`;

        case "^[A-Za-z0-9&#\\-\\(\\),\\.\\/\\':\\s\\r\\n]+$":
            return `${label} can contain only letters, numbers and valid special characters`;
        case '^[A-Z0-9 &.-]+$':
            return `${label} can contain only uppercase letters, numbers, space, &, . and -`;
        default:
            return 'Invalid format';
    }
};

const evaluateNumericRule = (actual: number, operator: string, expected: number) => {
    switch (operator) {
        case 'less_than':
            return actual < expected;
        case 'less_than_equals':
            return actual <= expected;
        case 'greater_than':
            return actual > expected;
        case 'greater_than_equals':
            return actual >= expected;
        case 'equals':
            return actual === expected;
        default:
            return true;
    }
};

const extractNumericValuesFromSection = (
    sectionValues: Record<string, any>,
    fieldName: string
): number[] => {
    if (!sectionValues || typeof sectionValues !== 'object') return [];

    return Object.values(sectionValues)
        .map(row => Number(row?.[fieldName]))
        .filter(v => !Number.isNaN(v));
};
