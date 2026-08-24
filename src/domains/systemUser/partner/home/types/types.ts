export type DashboardDetails = {
    totalTransactions: number;
    totalRevenue: number;
    totalCashback: number;
    todaysRevenue: number;
    todaysCashback: number;
    todaysTransactions: number;
    totalCorporateUsers: number;
    activeUsers: number;
    todaysCorporateUsers: number;
    todaysActiveUsers: number;
    totalNetworkShare: number;
    todaysNetworkShare: number;
};

interface RegisteredUsersChartDate {
    Date: string;
    count: number;
}

interface TransactionChartData {
    Date: string;
    cashback: number;
    count: number;
    networkShare: number;
    revenue: number;
}

export type RegisterdUserChart = RegisteredUsersChartDate[];
export type TransactionChart = TransactionChartData[];
export type PartnerChart = {
    allCorporates: RegisterdUserChart;
    // allTransactions: TransactionChart
};
