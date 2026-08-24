// Turns a raw filing-partner error (a terse code or message) into a short,
// actionable line the applicant can act on — enough context to find and fix the
// offending field, without leaking raw vendor codes. Used by every toast that
// surfaces a vendor failure (per-step sync + on-the-go document upload).

const RULES: Array<[RegExp, string]> = [
    [/pan.*(invalid|mismatch|not\s*match|verif|fail)|invalid\s*pan|ERR011|ERR079/i,
        'The PAN could not be verified — please recheck the PAN number and the name exactly as on the PAN card.'],
    [/postal|pincode|postal_code|ERR085/i,
        'The pincode was not accepted — please recheck the address pincode.'],
    [/occupation/i, 'The occupation entered is not valid — please choose a valid occupation.'],
    [/qualification/i, 'The qualification entered is not valid — please choose a valid qualification.'],
    [/dob|date\s*of\s*birth|\bbirth\b/i, 'The date of birth looks invalid — please check it.'],
    [/e-?mail/i, 'An email address was rejected — please check the email entered.'],
    [/mobile|phone|contact\s*number/i, 'A mobile number was rejected — please check the number entered.'],
    [/din\b/i, 'A DIN was rejected — please check the director’s DIN.'],
    [/document|upload|\bfile\b|\bdocs?\b|classification|integration guide/i,
        'A document was not accepted — please make sure you’ve uploaded the correct, clear document (right type, readable, within the size limit) and try again.'],
    [/gid|startup|application_id|subscription|PERMERR|NO_SUBS/i,
        'We couldn’t reach the filing partner just now — please try again in a moment.'],
];

const DEFAULT_FALLBACK =
    'Something in your details was not accepted by the filing partner. Please review the highlighted step and try again.';

// A person-named prefix ("Director John Doe — ...") is kept so the user knows
// WHOSE detail to fix; only the trailing code/message is mapped to friendly text.
const splitPrefix = (msg: string): [string, string] => {
    const idx = msg.indexOf('—');
    if (idx > 0 && idx < 60) return [`${msg.slice(0, idx + 1).trim()} `, msg.slice(idx + 1).trim()];
    return ['', msg];
};

const mapMessage = (msg: string, fallback: string) => {
    const found = RULES.find(([re]) => re.test(msg));
    return found ? found[1] : fallback;
};

// Name/PAN mismatch (ERR080): the vendor returns the actual name registered on
// the PAN — that's precisely what the user needs to correct, so surface it
// instead of a generic line.
const panNameMismatch = (msg: string): string | null => {
    if (!/name\s*mismatch|does not match the name|ERR080/i.test(msg)) return null;
    const onPan = msg.match(/name on the pan card\s*\(([^)]+)\)/i);
    return onPan
        ? `The name entered doesn’t match the PAN card — the PAN is registered as “${onPan[1].trim()}”. Please enter the name exactly as on the PAN.`
        : 'The name entered doesn’t match the name on the PAN card — please enter the name exactly as it appears on the PAN.';
};

export const friendlyVendorError = (raw?: string, fallback: string = DEFAULT_FALLBACK): string => {
    const msg = String(raw ?? '').trim();
    if (!msg) return fallback;
    const [prefix, rest] = splitPrefix(msg);
    return prefix + (panNameMismatch(rest) ?? mapMessage(rest, fallback));
};
