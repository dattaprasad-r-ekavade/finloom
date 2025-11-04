const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const challengePlans = [
    {
      name: "Level 1 Challenge",
      description:
        "Entry-level evaluation with Rs.10 Lakh virtual capital and conservative risk limits.",
      accountSize: 1000000,
      profitTargetPct: 8,
      maxLossPct: 5,
      dailyLossPct: 2,
      fee: 9999,
      durationDays: 30,
      allowedInstruments: ["Equities", "Futures", "Options"],
      profitSplit: 80,
      level: 1,
      isActive: true,
    },
    {
      name: "Level 2 Challenge",
      description:
        "Intermediate evaluation with Rs.25 Lakh virtual capital and balanced risk targets.",
      accountSize: 2500000,
      profitTargetPct: 8,
      maxLossPct: 5,
      dailyLossPct: 2,
      fee: 19999,
      durationDays: 45,
      allowedInstruments: ["Equities", "Futures", "Options"],
      profitSplit: 85,
      level: 2,
      isActive: true,
    },
    {
      name: "Level 3 Challenge",
      description:
        "Advanced evaluation with Rs.50 Lakh virtual capital for experienced prop traders.",
      accountSize: 5000000,
      profitTargetPct: 8,
      maxLossPct: 5,
      dailyLossPct: 2,
      fee: 29999,
      durationDays: 60,
      allowedInstruments: ["Equities", "Futures", "Options"],
      profitSplit: 90,
      level: 3,
      isActive: true,
    },
  ];

  // Remove existing plans to keep seed idempotent in development.
  await prisma.challengePlan.deleteMany();

  await prisma.challengePlan.createMany({
    data: challengePlans,
  });

  const marketData = [
    { scrip: "RELIANCE", scripFullName: "Reliance Industries Ltd", ltp: 2450.5, open: 2440.2, high: 2475.0, low: 2425.4, close: 2445.6, volume: 1820000, exchange: "NSE", instrumentType: "EQUITY" },
    { scrip: "TCS", scripFullName: "Tata Consultancy Services Ltd", ltp: 3525.1, open: 3508.0, high: 3555.5, low: 3490.0, close: 3512.8, volume: 980000, exchange: "NSE", instrumentType: "EQUITY" },
    { scrip: "INFY", scripFullName: "Infosys Ltd", ltp: 1435.2, open: 1428.5, high: 1450.0, low: 1412.2, close: 1424.4, volume: 1430000, exchange: "NSE", instrumentType: "EQUITY" },
    { scrip: "HDFCBANK", scripFullName: "HDFC Bank Ltd", ltp: 1588.7, open: 1572.3, high: 1600.1, low: 1560.0, close: 1578.9, volume: 2120000, exchange: "NSE", instrumentType: "EQUITY" },
    { scrip: "ICICIBANK", scripFullName: "ICICI Bank Ltd", ltp: 982.3, open: 975.0, high: 992.4, low: 968.2, close: 979.5, volume: 2650000, exchange: "NSE", instrumentType: "EQUITY" },
    { scrip: "SBIN", scripFullName: "State Bank of India", ltp: 613.8, open: 608.0, high: 620.5, low: 603.6, close: 610.2, volume: 3240000, exchange: "NSE", instrumentType: "EQUITY" },
    { scrip: "ITC", scripFullName: "ITC Ltd", ltp: 437.9, open: 435.2, high: 441.6, low: 430.0, close: 436.5, volume: 2980000, exchange: "NSE", instrumentType: "EQUITY" },
    { scrip: "LT", scripFullName: "Larsen & Toubro Ltd", ltp: 3240.6, open: 3215.0, high: 3272.1, low: 3200.0, close: 3222.5, volume: 620000, exchange: "NSE", instrumentType: "EQUITY" },
    { scrip: "HINDUNILVR", scripFullName: "Hindustan Unilever Ltd", ltp: 2488.4, open: 2470.0, high: 2505.6, low: 2460.5, close: 2475.2, volume: 540000, exchange: "NSE", instrumentType: "EQUITY" },
    { scrip: "KOTAKBANK", scripFullName: "Kotak Mahindra Bank Ltd", ltp: 1698.3, open: 1685.0, high: 1715.5, low: 1672.2, close: 1689.7, volume: 890000, exchange: "NSE", instrumentType: "EQUITY" },
    { scrip: "AXISBANK", scripFullName: "Axis Bank Ltd", ltp: 1015.2, open: 1002.4, high: 1024.5, low: 995.0, close: 1008.1, volume: 1530000, exchange: "NSE", instrumentType: "EQUITY" },
    { scrip: "BAJFINANCE", scripFullName: "Bajaj Finance Ltd", ltp: 7350.5, open: 7280.0, high: 7422.4, low: 7260.0, close: 7320.0, volume: 450000, exchange: "NSE", instrumentType: "EQUITY" },
    { scrip: "BAJAJFINSV", scripFullName: "Bajaj Finserv Ltd", ltp: 1675.4, open: 1658.6, high: 1692.3, low: 1645.5, close: 1668.8, volume: 520000, exchange: "NSE", instrumentType: "EQUITY" },
    { scrip: "BHARTIARTL", scripFullName: "Bharti Airtel Ltd", ltp: 962.1, open: 955.0, high: 970.8, low: 948.5, close: 958.3, volume: 1840000, exchange: "NSE", instrumentType: "EQUITY" },
    { scrip: "ASIANPAINT", scripFullName: "Asian Paints Ltd", ltp: 3085.0, open: 3062.7, high: 3110.0, low: 3040.5, close: 3072.2, volume: 610000, exchange: "NSE", instrumentType: "EQUITY" },
    { scrip: "MARUTI", scripFullName: "Maruti Suzuki India Ltd", ltp: 10325.0, open: 10280.0, high: 10395.5, low: 10210.2, close: 10290.3, volume: 380000, exchange: "NSE", instrumentType: "EQUITY" },
    { scrip: "SUNPHARMA", scripFullName: "Sun Pharmaceutical Industries Ltd", ltp: 1268.4, open: 1259.0, high: 1280.6, low: 1248.8, close: 1260.1, volume: 930000, exchange: "NSE", instrumentType: "EQUITY" },
    { scrip: "NTPC", scripFullName: "NTPC Ltd", ltp: 246.2, open: 244.4, high: 249.0, low: 242.5, close: 245.3, volume: 3700000, exchange: "NSE", instrumentType: "EQUITY" },
    { scrip: "POWERGRID", scripFullName: "Power Grid Corporation of India Ltd", ltp: 224.7, open: 222.5, high: 227.0, low: 220.0, close: 223.3, volume: 2650000, exchange: "NSE", instrumentType: "EQUITY" },
    { scrip: "ULTRACEMCO", scripFullName: "UltraTech Cement Ltd", ltp: 9810.7, open: 9755.0, high: 9895.0, low: 9700.0, close: 9778.4, volume: 180000, exchange: "NSE", instrumentType: "EQUITY" },
    { scrip: "GRASIM", scripFullName: "Grasim Industries Ltd", ltp: 2210.3, open: 2192.6, high: 2235.0, low: 2175.0, close: 2201.7, volume: 720000, exchange: "NSE", instrumentType: "EQUITY" },
    { scrip: "TITAN", scripFullName: "Titan Company Ltd", ltp: 3205.4, open: 3188.0, high: 3238.9, low: 3172.3, close: 3190.5, volume: 560000, exchange: "NSE", instrumentType: "EQUITY" },
    { scrip: "HCLTECH", scripFullName: "HCL Technologies Ltd", ltp: 1315.9, open: 1304.0, high: 1324.6, low: 1290.8, close: 1308.4, volume: 1250000, exchange: "NSE", instrumentType: "EQUITY" },
    { scrip: "WIPRO", scripFullName: "Wipro Ltd", ltp: 414.8, open: 410.6, high: 418.9, low: 406.2, close: 412.7, volume: 2890000, exchange: "NSE", instrumentType: "EQUITY" },
    { scrip: "TECHM", scripFullName: "Tech Mahindra Ltd", ltp: 1198.6, open: 1185.0, high: 1210.2, low: 1175.5, close: 1188.4, volume: 870000, exchange: "NSE", instrumentType: "EQUITY" },
    { scrip: "ADANIGREEN", scripFullName: "Adani Green Energy Ltd", ltp: 913.4, open: 904.0, high: 926.2, low: 890.0, close: 905.4, volume: 540000, exchange: "NSE", instrumentType: "EQUITY" },
    { scrip: "ADANIPORTS", scripFullName: "Adani Ports and Special Economic Zone Ltd", ltp: 1250.9, open: 1238.0, high: 1265.0, low: 1225.5, close: 1242.3, volume: 980000, exchange: "NSE", instrumentType: "EQUITY" },
    { scrip: "ADANIENT", scripFullName: "Adani Enterprises Ltd", ltp: 2385.5, open: 2368.8, high: 2422.4, low: 2342.2, close: 2370.0, volume: 610000, exchange: "NSE", instrumentType: "EQUITY" },
    { scrip: "COALINDIA", scripFullName: "Coal India Ltd", ltp: 368.2, open: 364.0, high: 372.5, low: 360.5, close: 366.7, volume: 4100000, exchange: "NSE", instrumentType: "EQUITY" },
    { scrip: "ONGC", scripFullName: "Oil and Natural Gas Corporation Ltd", ltp: 196.4, open: 194.5, high: 198.8, low: 192.1, close: 195.0, volume: 3500000, exchange: "NSE", instrumentType: "EQUITY" },
    { scrip: "BPCL", scripFullName: "Bharat Petroleum Corporation Ltd", ltp: 414.2, open: 410.0, high: 419.5, low: 405.2, close: 412.0, volume: 1650000, exchange: "NSE", instrumentType: "EQUITY" },
    { scrip: "IOC", scripFullName: "Indian Oil Corporation Ltd", ltp: 147.6, open: 146.0, high: 149.8, low: 144.4, close: 146.7, volume: 2850000, exchange: "NSE", instrumentType: "EQUITY" },
    { scrip: "INDUSINDBK", scripFullName: "IndusInd Bank Ltd", ltp: 1468.7, open: 1452.4, high: 1484.5, low: 1440.6, close: 1458.2, volume: 720000, exchange: "NSE", instrumentType: "EQUITY" },
    { scrip: "CIPLA", scripFullName: "Cipla Ltd", ltp: 1232.4, open: 1220.5, high: 1240.3, low: 1208.3, close: 1218.6, volume: 930000, exchange: "NSE", instrumentType: "EQUITY" },
    { scrip: "DRREDDY", scripFullName: "Dr. Reddy's Laboratories Ltd", ltp: 5738.8, open: 5685.0, high: 5775.2, low: 5650.4, close: 5702.1, volume: 310000, exchange: "NSE", instrumentType: "EQUITY" },
    { scrip: "TITAGARH", scripFullName: "Titagarh Rail Systems Ltd", ltp: 940.5, open: 932.0, high: 955.6, low: 920.1, close: 934.2, volume: 420000, exchange: "NSE", instrumentType: "EQUITY" },
    { scrip: "BRITANNIA", scripFullName: "Britannia Industries Ltd", ltp: 5045.3, open: 5020.0, high: 5078.0, low: 4985.4, close: 5015.2, volume: 280000, exchange: "NSE", instrumentType: "EQUITY" },
    { scrip: "HAVELLS", scripFullName: "Havells India Ltd", ltp: 1478.5, open: 1464.0, high: 1490.8, low: 1450.0, close: 1469.1, volume: 560000, exchange: "NSE", instrumentType: "EQUITY" },
    { scrip: "PIDILITIND", scripFullName: "Pidilite Industries Ltd", ltp: 2855.4, open: 2838.0, high: 2880.0, low: 2820.5, close: 2842.2, volume: 390000, exchange: "NSE", instrumentType: "EQUITY" },
    { scrip: "TATAMOTORS", scripFullName: "Tata Motors Ltd", ltp: 918.4, open: 905.0, high: 928.6, low: 898.8, close: 910.7, volume: 2740000, exchange: "NSE", instrumentType: "EQUITY" },
    { scrip: "TATASTEEL", scripFullName: "Tata Steel Ltd", ltp: 128.6, open: 127.4, high: 130.2, low: 125.0, close: 127.1, volume: 4150000, exchange: "NSE", instrumentType: "EQUITY" },
    { scrip: "JSWSTEEL", scripFullName: "JSW Steel Ltd", ltp: 800.4, open: 792.0, high: 808.6, low: 785.2, close: 795.0, volume: 1450000, exchange: "NSE", instrumentType: "EQUITY" },
    { scrip: "HEROMOTOCO", scripFullName: "Hero MotoCorp Ltd", ltp: 3655.9, open: 3620.0, high: 3685.0, low: 3605.6, close: 3632.3, volume: 430000, exchange: "NSE", instrumentType: "EQUITY" },
    { scrip: "EICHERMOT", scripFullName: "Eicher Motors Ltd", ltp: 3848.2, open: 3805.0, high: 3885.0, low: 3790.0, close: 3822.4, volume: 350000, exchange: "NSE", instrumentType: "EQUITY" },
    { scrip: "M&M", scripFullName: "Mahindra & Mahindra Ltd", ltp: 1678.3, open: 1662.5, high: 1695.0, low: 1650.0, close: 1668.8, volume: 970000, exchange: "NSE", instrumentType: "EQUITY" },
    { scrip: "BAJAJ_AUTO", scripFullName: "Bajaj Auto Ltd", ltp: 5920.7, open: 5880.0, high: 5965.5, low: 5842.1, close: 5898.2, volume: 260000, exchange: "NSE", instrumentType: "EQUITY" },
    { scrip: "HDFCLIFE", scripFullName: "HDFC Life Insurance Company Ltd", ltp: 628.4, open: 620.0, high: 633.8, low: 615.5, close: 622.1, volume: 1120000, exchange: "NSE", instrumentType: "EQUITY" },
    { scrip: "SBILIFE", scripFullName: "SBI Life Insurance Company Ltd", ltp: 1438.9, open: 1420.0, high: 1452.2, low: 1410.5, close: 1428.6, volume: 650000, exchange: "NSE", instrumentType: "EQUITY" },
    { scrip: "ICICIPRULI", scripFullName: "ICICI Prudential Life Insurance Company Ltd", ltp: 598.3, open: 590.8, high: 604.6, low: 585.0, close: 592.4, volume: 830000, exchange: "NSE", instrumentType: "EQUITY" },
    { scrip: "NESTLEIND", scripFullName: "Nestle India Ltd", ltp: 24560.0, open: 24420.0, high: 24680.0, low: 24300.0, close: 24480.0, volume: 88000, exchange: "NSE", instrumentType: "EQUITY" },
    { scrip: "DMART", scripFullName: "Avenue Supermarts Ltd", ltp: 3825.5, open: 3800.0, high: 3858.2, low: 3772.0, close: 3810.4, volume: 265000, exchange: "NSE", instrumentType: "EQUITY" },
    { scrip: "DIVISLAB", scripFullName: "Divi's Laboratories Ltd", ltp: 3630.9, open: 3602.5, high: 3665.5, low: 3580.1, close: 3610.2, volume: 280000, exchange: "NSE", instrumentType: "EQUITY" },
    { scrip: "UPL", scripFullName: "UPL Ltd", ltp: 624.5, open: 618.0, high: 630.5, low: 610.0, close: 620.2, volume: 940000, exchange: "NSE", instrumentType: "EQUITY" },
    { scrip: "DABUR", scripFullName: "Dabur India Ltd", ltp: 562.8, open: 558.5, high: 568.3, low: 552.5, close: 559.0, volume: 860000, exchange: "NSE", instrumentType: "EQUITY" },
    { scrip: "GODREJCP", scripFullName: "Godrej Consumer Products Ltd", ltp: 1048.7, open: 1035.0, high: 1058.6, low: 1022.0, close: 1038.4, volume: 520000, exchange: "NSE", instrumentType: "EQUITY" },
    { scrip: "AMBUJACEM", scripFullName: "Ambuja Cements Ltd", ltp: 472.6, open: 468.5, high: 478.8, low: 462.0, close: 469.7, volume: 1320000, exchange: "NSE", instrumentType: "EQUITY" },
    { scrip: "SHREECEM", scripFullName: "Shree Cement Ltd", ltp: 23650.5, open: 23510.0, high: 23880.0, low: 23320.0, close: 23588.0, volume: 52000, exchange: "NSE", instrumentType: "EQUITY" },
    { scrip: "PEL", scripFullName: "Piramal Enterprises Ltd", ltp: 910.2, open: 902.5, high: 918.8, low: 890.4, close: 905.1, volume: 310000, exchange: "NSE", instrumentType: "EQUITY" },
    { scrip: "ABBOTINDIA", scripFullName: "Abbott India Ltd", ltp: 24215.5, open: 24080.0, high: 24450.0, low: 23910.0, close: 24100.0, volume: 48000, exchange: "NSE", instrumentType: "EQUITY" }
  ];

  await prisma.mockedMarketData.deleteMany();
  await prisma.mockedMarketData.createMany({
    data: marketData,
  });
}

main()
  .catch((error) => {
    console.error("Error seeding challenge plans:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
