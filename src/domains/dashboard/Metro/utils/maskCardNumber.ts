/** Masks all but the last 4 digits, e.g. `123456789012` -> `••••••••9012`. */
export default function maskCardNumber(cardNumber: string): string {
    if (cardNumber.length <= 4) return cardNumber;
    const visible = cardNumber.slice(-4);
    return `${'•'.repeat(cardNumber.length - 4)}${visible}`;
}
