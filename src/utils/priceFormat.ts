/** Matches paymentGateway validateAmount `normalizeAmount` — use before surcharge + PG totals. */
export const roundMoney = (val: number | string): number =>
    Math.round((Number(val) + Number.EPSILON) * 100) / 100;

export const formatNumberWithLocalString = (
    amount: any,
    minFraction: number = 2,
    maxFraction: number = 2
): string => {
    try {
        if (minFraction > maxFraction) maxFraction = minFraction;

        // Remove commas and other non-numeric characters (except for decimal points)
        const sanitizedAmount = String(amount).replace(/,/g, '');

        // Convert sanitized amount to a number
        const number = Number(sanitizedAmount);

        // Check if the conversion resulted in NaN
        // eslint-disable-next-line no-restricted-globals
        if (isNaN(number)) {
            return '0'; // Return '0' if the amount is not a valid number
        }

        // Format the number with Indian locale
        return number.toLocaleString('en-IN', {
            minimumFractionDigits: minFraction,
            maximumFractionDigits: maxFraction,
        });
    } catch (error) {
        console.log('Error occurred while formatting amount:', error);
        return amount; // Return the original amount if an error occurs
    }
};

export const formatNumberWithoutCommas = (
    amount: any,
    minFraction: number = 2,
    maxFraction: number = 2
): string => {
    try {
        if (minFraction > maxFraction) maxFraction = minFraction;

        // Remove commas and other non-numeric characters (except for decimal points)
        const sanitizedAmount = String(amount).replace(/,/g, '');

        // Convert sanitized amount to a number
        const number = Number(sanitizedAmount);
        // Check if the conversion resulted in NaN
        // eslint-disable-next-line no-restricted-globals
        if (isNaN(number)) {
            // console.log('Invalid number:', sanitizedAmount);
            return amount; // Return the original amount if the conversion fails
        }
        // Format the number without grouping (no commas)
        return number.toLocaleString('en-IN', {
            minimumFractionDigits: minFraction,
            maximumFractionDigits: maxFraction,
            useGrouping: false, // Disable grouping
        });
    } catch (error) {
        console.log('Error occurred while formatting amount:', error);
        return amount; // Return the original amount if an error occurs
    }
};

export const formatNumberWithLocalStringWithoutDecimalPoint = (
    amount: any,
    minFraction: number = 2,
    maxFraction: number = 2
): string => {
    try {
        if (minFraction > maxFraction) maxFraction = minFraction;

        // Remove commas and other non-numeric characters (except for decimal points)
        const sanitizedAmount = String(amount).replace(/,/g, '');

        // Convert sanitized amount to a number
        const number = Number(sanitizedAmount);
        // eslint-disable-next-line no-restricted-globals
        if (isNaN(number)) {
            return amount; // Return original amount if it's not a valid number
        }

        // Determine if the number has any fractional part
        const hasFractionalPart = number % 1 !== 0;

        return number.toLocaleString('en-IN', {
            minimumFractionDigits: hasFractionalPart ? minFraction : 0,
            maximumFractionDigits: hasFractionalPart ? maxFraction : 0,
        });
    } catch (error) {
        console.log('Error occurred while formatting amount:', error);
        return amount;
    }
};
