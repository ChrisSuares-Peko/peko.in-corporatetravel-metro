import AmericanExpressLogo from '@src/domains/dashboard/settings/assets/images/American_Express_Logo.png';
import DinersClubLogo from '@src/domains/dashboard/settings/assets/images/DINERS_CLUB.png';
import mastercardLogo from '@src/domains/dashboard/settings/assets/images/Mastercard_logo.png';
import VisaLogo from '@src/domains/dashboard/settings/assets/images/Visa_Logo.png';
import { paths } from '@src/routes/paths';
import { accessKeys, serviceCategoryNames } from '@utils/accessKeys';

export const serviceCategories = [
    {
        label: serviceCategoryNames.utility,
        accessKeys: [
            'bbps_utility_electricity',
            'bbps_utility_lpg',
            'bbps_utility_water',
            'bbps_utility_broadband',
            'bbps_utility_landline',
            'bbps_utility_pipedgas',
            'bbps_utility_education',
        ],
    },
    // { label: 'Mobile Recharge', accessKeys: ['JRI_prepaid'] },
    {
        label: 'Corporate Travel',
        accessKeys: ['tbo_airline', 'hotels_api', 'esim'],
    },
    {
        label: 'Corporate Cards',
        accessKeys: [accessKeys.corporateCards],
    },
    {
        label: 'Payroll',
        accessKeys: ['peko_payroll'],
    },
    {
        label: 'Corporate Cards',
        accessKeys: [accessKeys.corporateCards],
    },
    {
        label: serviceCategoryNames.telecom,
        accessKeys: ['JRI_prepaid', 'bbps_telecom_postpaid', 'bbps_telecom_otme'],
    },
    // {
    //     label: 'Office Supplies',
    //     accessKeys: ['ecommerce'],
    // },
    // {
    //     label: 'Softwares',
    //     accessKeys: ['subscription_payments'],
    // },
    // {
    //     label: 'Logistics',
    //     accessKeys: ['shipment_services'],
    // },
    // {
    //     label: 'Gift Cards',
    //     accessKeys: ['gift-card'],
    // },
    {
        label: 'Marketplace',
        accessKeys: [accessKeys.pekoConnect],
    },
    // {
    //     label: 'Invoicing',
    //     accessKeys: ['quick_links'],
    // },
    // {
    //     label: 'Hike',
    //     accessKeys: ['hike_service'],
    // },
    // {
    //     label: 'Hub',
    //     accessKeys: ['pekoCloud'],
    // },
    // {
    //     label: 'Document Attestation',
    //     accessKeys: ['document_attestation'],
    // },
    // {
    //     label: 'Office Address',
    //     accessKeys: ['workspace'],
    // },
    // {
    //     label: 'Connect',
    //     accessKeys: ['peko_connect'],
    // },
    // {
    //     label: 'Works',
    //     accessKeys: ['peko_works'],
    // },
    // {
    //     label: 'Business Docs',
    //     accessKeys: ['edocs'],
    // },
    {
        label: 'WhatsApp for Business',
        accessKeys: ['whatsApp_for_busines'],
    },
    {
        label: 'eSign',
        accessKeys: ['signDrive_eSign'],
    },
    {
        label: 'Turbo',
        accessKeys: ['peko_garage'],
    },
    {
        label: 'Reports',
        accessKeys: [],
    },
    // {
    //     label: 'Need Help',
    //     accessKeys: [],
    // },
    // {
    //     label: 'Business Emails',
    //     accessKeys: ['email_domain_service'],
    // },
    // {
    //     label: 'Verification Suite',
    //     accessKeys: [
    //         "bank_account_verify",
    //         "ifsc_verify",
    //         "pan_verify",
    //         "advance_pan_verify",
    //         "dl_verify",
    //         "voter_id_verify",
    //         "aadhar_verify",
    //         "gstin_pan",
    //         "cin_verify",
    //         "gstin_verify",
    //         "passport_verify",
    //         "aadhar_ocr_verify",
    //         "gst_return_check",
    //         "corporate_verify",
    //         "director_verify_din",
    //         "director_verify_cin",
    //     ],
    // },
];

export const getCardImage = (scheme: string) => {
    switch (scheme) {
        case 'VISA':
            return VisaLogo;
        case 'MASTERCARD':
            return mastercardLogo;
        case 'AMERICAN_EXPRESS':
            return AmericanExpressLogo;
        case 'DINERS_CLUB_INTERNATIONAL':
            return DinersClubLogo;
        default:
            return mastercardLogo;
    }
};
export const packageRoutes = {
    Payroll: paths.dashboard.payroll,
    Hub: paths.dashboard.pekoCloud,
    Invoicing: paths.dashboard.invoicing,
    eSign: paths.dashboard.eSign,
    Turbo: paths.dashboard.turbo,
};
