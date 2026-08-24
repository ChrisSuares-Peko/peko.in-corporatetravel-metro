export type country = {
    name: string;
    id: string;
};

export type countryList = {
    country: string;
    code?: string;
};

type DataOption = {
    planId: string;
    dataGB: string;
    validityDays: string;
};

export type DataOptions = Array<DataOption>;

export type PlanData = {
    planId: string;
    amount: number;
    name: string;
    country: string;
    dataMBs: string | number;
    periodDays: string | number;
};
