/* ========================================
   Paycheck Calculator — Tax Data & Logic
   2025 Federal Tax Brackets + State Rates
   ======================================== */

// ---- 2025 Federal Income Tax Brackets ----
const FEDERAL_BRACKETS = {
  single: [
    { rate: 0.10, min: 0, max: 11925 },
    { rate: 0.12, min: 11925, max: 48475 },
    { rate: 0.22, min: 48475, max: 103350 },
    { rate: 0.24, min: 103350, max: 197300 },
    { rate: 0.32, min: 197300, max: 250525 },
    { rate: 0.35, min: 250525, max: 626350 },
    { rate: 0.37, min: 626350, max: Infinity }
  ],
  married: [
    { rate: 0.10, min: 0, max: 23850 },
    { rate: 0.12, min: 23850, max: 96950 },
    { rate: 0.22, min: 96950, max: 206700 },
    { rate: 0.24, min: 206700, max: 394600 },
    { rate: 0.32, min: 394600, max: 501050 },
    { rate: 0.35, min: 501050, max: 751600 },
    { rate: 0.37, min: 751600, max: Infinity }
  ],
  head: [
    { rate: 0.10, min: 0, max: 17000 },
    { rate: 0.12, min: 17000, max: 64850 },
    { rate: 0.22, min: 64850, max: 103350 },
    { rate: 0.24, min: 103350, max: 197300 },
    { rate: 0.32, min: 197300, max: 250500 },
    { rate: 0.35, min: 250500, max: 626350 },
    { rate: 0.37, min: 626350, max: Infinity }
  ]
};

// ---- 2025 Standard Deductions ----
const STANDARD_DEDUCTION = {
  single: 15000,
  married: 30000,
  head: 22500
};

// ---- 2025 FICA ----
const FICA = {
  socialSecurityRate: 0.062,
  socialSecurityWageBase: 176100,
  medicareRate: 0.0145,
  additionalMedicareRate: 0.009,
  additionalMedicareThreshold: {
    single: 200000,
    married: 250000,
    head: 200000
  }
};

// ---- State Income Tax Data (2025) ----
// type: "none" = no income tax, "flat" = flat rate, "progressive" = bracket-based
const STATE_TAX = {
  AL: { name: "Alabama", type: "progressive", brackets: [
    { rate: 0.02, min: 0, max: 500 },
    { rate: 0.04, min: 500, max: 3000 },
    { rate: 0.05, min: 3000, max: Infinity }
  ], standardDeduction: 3000 },
  AK: { name: "Alaska", type: "none", rate: 0 },
  AZ: { name: "Arizona", type: "flat", rate: 0.025, standardDeduction: 13950 },
  AR: { name: "Arkansas", type: "progressive", brackets: [
    { rate: 0.02, min: 0, max: 5000 },
    { rate: 0.03, min: 5000, max: 10000 },
    { rate: 0.034, min: 10000, max: 15000 },
    { rate: 0.039, min: 15000, max: Infinity }
  ], standardDeduction: 2970 },
  CA: { name: "California", type: "progressive", brackets: [
    { rate: 0.01, min: 0, max: 10412 },
    { rate: 0.02, min: 10412, max: 24684 },
    { rate: 0.04, min: 24684, max: 38959 },
    { rate: 0.06, min: 38959, max: 54081 },
    { rate: 0.08, min: 54081, max: 68350 },
    { rate: 0.093, min: 68350, max: 349137 },
    { rate: 0.103, min: 349137, max: 418961 },
    { rate: 0.113, min: 418961, max: 698271 },
    { rate: 0.123, min: 698271, max: Infinity }
  ], standardDeduction: 5363 },
  CO: { name: "Colorado", type: "flat", rate: 0.044, standardDeduction: 0 },
  CT: { name: "Connecticut", type: "progressive", brackets: [
    { rate: 0.03, min: 0, max: 10000 },
    { rate: 0.05, min: 10000, max: 50000 },
    { rate: 0.055, min: 50000, max: 100000 },
    { rate: 0.06, min: 100000, max: 200000 },
    { rate: 0.065, min: 200000, max: 250000 },
    { rate: 0.069, min: 250000, max: 500000 },
    { rate: 0.0699, min: 500000, max: Infinity }
  ], standardDeduction: 0 },
  DE: { name: "Delaware", type: "progressive", brackets: [
    { rate: 0.022, min: 0, max: 5000 },
    { rate: 0.039, min: 5000, max: 10000 },
    { rate: 0.048, min: 10000, max: 20000 },
    { rate: 0.052, min: 20000, max: 25000 },
    { rate: 0.0555, min: 25000, max: 60000 },
    { rate: 0.066, min: 60000, max: Infinity }
  ], standardDeduction: 3250 },
  DC: { name: "District of Columbia", type: "progressive", brackets: [
    { rate: 0.04, min: 0, max: 10000 },
    { rate: 0.06, min: 10000, max: 40000 },
    { rate: 0.065, min: 40000, max: 60000 },
    { rate: 0.085, min: 60000, max: 250000 },
    { rate: 0.0925, min: 250000, max: 500000 },
    { rate: 0.0975, min: 500000, max: 1000000 },
    { rate: 0.1075, min: 1000000, max: Infinity }
  ], standardDeduction: 14000 },
  FL: { name: "Florida", type: "none", rate: 0 },
  GA: { name: "Georgia", type: "flat", rate: 0.0539, standardDeduction: 12000 },
  HI: { name: "Hawaii", type: "progressive", brackets: [
    { rate: 0.014, min: 0, max: 2400 },
    { rate: 0.032, min: 2400, max: 4800 },
    { rate: 0.055, min: 4800, max: 9600 },
    { rate: 0.064, min: 9600, max: 19200 },
    { rate: 0.068, min: 19200, max: 30000 },
    { rate: 0.072, min: 30000, max: 48000 },
    { rate: 0.079, min: 48000, max: 60000 },
    { rate: 0.082, min: 60000, max: 150000 },
    { rate: 0.089, min: 15000, max: 175000 },
    { rate: 0.097, min: 175000, max: 200000 },
    { rate: 0.10, min: 200000, max: Infinity }
  ], standardDeduction: 2200 },
  ID: { name: "Idaho", type: "flat", rate: 0.05695, standardDeduction: 0 },
  IL: { name: "Illinois", type: "flat", rate: 0.0495, standardDeduction: 0 },
  IN: { name: "Indiana", type: "flat", rate: 0.0305, standardDeduction: 0 },
  IA: { name: "Iowa", type: "progressive", brackets: [
    { rate: 0.044, min: 0, max: 12000 },
    { rate: 0.0482, min: 12000, max: 25000 },
    { rate: 0.0512, min: 25000, max: 35000 },
    { rate: 0.0554, min: 35000, max: 50000 },
    { rate: 0.0574, min: 50000, max: 75000 },
    { rate: 0.0588, min: 75000, max: Infinity }
  ], standardDeduction: 0 },
  KS: { name: "Kansas", type: "progressive", brackets: [
    { rate: 0.031, min: 0, max: 15000 },
    { rate: 0.0525, min: 15000, max: 30000 },
    { rate: 0.057, min: 30000, max: Infinity }
  ], standardDeduction: 3850 },
  KY: { name: "Kentucky", type: "flat", rate: 0.04, standardDeduction: 0 },
  LA: { name: "Louisiana", type: "flat", rate: 0.03, standardDeduction: 0 },
  ME: { name: "Maine", type: "progressive", brackets: [
    { rate: 0.058, min: 0, max: 24500 },
    { rate: 0.0675, min: 24500, max: 51450 },
    { rate: 0.0715, min: 51450, max: Infinity }
  ], standardDeduction: 14500 },
  MD: { name: "Maryland", type: "progressive", brackets: [
    { rate: 0.02, min: 0, max: 1000 },
    { rate: 0.03, min: 1000, max: 2000 },
    { rate: 0.04, min: 2000, max: 3000 },
    { rate: 0.0475, min: 3000, max: 100000 },
    { rate: 0.05, min: 100000, max: 125000 },
    { rate: 0.0525, min: 125000, max: 150000 },
    { rate: 0.055, min: 150000, max: 250000 },
    { rate: 0.0575, min: 250000, max: Infinity }
  ], standardDeduction: 2600 },
  MA: { name: "Massachusetts", type: "flat", rate: 0.05, standardDeduction: 0 },
  MI: { name: "Michigan", type: "flat", rate: 0.0425, standardDeduction: 0 },
  MN: { name: "Minnesota", type: "progressive", brackets: [
    { rate: 0.0535, min: 0, max: 30710 },
    { rate: 0.068, min: 30710, max: 123950 },
    { rate: 0.0785, min: 123950, max: 183170 },
    { rate: 0.0985, min: 183170, max: Infinity }
  ], standardDeduction: 14800 },
  MS: { name: "Mississippi", type: "flat", rate: 0.044, standardDeduction: 0 },
  MO: { name: "Missouri", type: "progressive", brackets: [
    { rate: 0.02, min: 0, max: 1000 },
    { rate: 0.021, min: 1000, max: 2000 },
    { rate: 0.025, min: 2000, max: 3000 },
    { rate: 0.029, min: 3000, max: 4000 },
    { rate: 0.033, min: 4000, max: 5000 },
    { rate: 0.037, min: 5000, max: 6000 },
    { rate: 0.039, min: 6000, max: 7000 },
    { rate: 0.041, min: 7000, max: 8000 },
    { rate: 0.043, min: 8000, max: 9000 },
    { rate: 0.045, min: 9000, max: Infinity }
  ], standardDeduction: 13800 },
  MT: { name: "Montana", type: "progressive", brackets: [
    { rate: 0.047, min: 0, max: 20300 },
    { rate: 0.059, min: 20300, max: Infinity }
  ], standardDeduction: 0 },
  NE: { name: "Nebraska", type: "progressive", brackets: [
    { rate: 0.0246, min: 0, max: 3850 },
    { rate: 0.0351, min: 3850, max: 23350 },
    { rate: 0.0501, min: 23350, max: 36550 },
    { rate: 0.0584, min: 36550, max: 59000 },
    { rate: 0.0664, min: 59000, max: Infinity }
  ], standardDeduction: 8000 },
  NV: { name: "Nevada", type: "none", rate: 0 },
  NH: { name: "New Hampshire", type: "none", rate: 0 },
  NJ: { name: "New Jersey", type: "progressive", brackets: [
    { rate: 0.014, min: 0, max: 20000 },
    { rate: 0.0175, min: 20000, max: 35000 },
    { rate: 0.0245, min: 35000, max: 40000 },
    { rate: 0.035, min: 40000, max: 75000 },
    { rate: 0.05525, min: 75000, max: 500000 },
    { rate: 0.0637, min: 500000, max: 1000000 },
    { rate: 0.0897, min: 1000000, max: Infinity }
  ], standardDeduction: 0 },
  NM: { name: "New Mexico", type: "progressive", brackets: [
    { rate: 0.017, min: 0, max: 6000 },
    { rate: 0.032, min: 6000, max: 15000 },
    { rate: 0.047, min: 15000, max: 25000 },
    { rate: 0.049, min: 25000, max: 50000 },
    { rate: 0.059, min: 50000, max: Infinity }
  ], standardDeduction: 0 },
  NY: { name: "New York", type: "progressive", brackets: [
    { rate: 0.04, min: 0, max: 8500 },
    { rate: 0.045, min: 8500, max: 11700 },
    { rate: 0.0525, min: 11700, max: 13900 },
    { rate: 0.055, min: 13900, max: 80650 },
    { rate: 0.06, min: 80650, max: 215400 },
    { rate: 0.0685, min: 215400, max: 1077550 },
    { rate: 0.0965, min: 1077550, max: 5000000 },
    { rate: 0.103, min: 5000000, max: 25000000 },
    { rate: 0.109, min: 25000000, max: Infinity }
  ], standardDeduction: 8000 },
  NC: { name: "North Carolina", type: "flat", rate: 0.0425, standardDeduction: 12750 },
  ND: { name: "North Dakota", type: "progressive", brackets: [
    { rate: 0.0, min: 0, max: 0 },
    { rate: 0.0195, min: 0, max: 44750 },
    { rate: 0.025, min: 44750, max: 108450 },
    { rate: 0.02504, min: 108450, max: 230300 },
    { rate: 0.0253, min: 230300, max: Infinity }
  ], standardDeduction: 0 },
  OH: { name: "Ohio", type: "progressive", brackets: [
    { rate: 0.0, min: 0, max: 26050 },
    { rate: 0.0277, min: 26050, max: 46100 },
    { rate: 0.03226, min: 46100, max: 92150 },
    { rate: 0.03688, min: 92150, max: 115300 },
    { rate: 0.0399, min: 115300, max: Infinity }
  ], standardDeduction: 0 },
  OK: { name: "Oklahoma", type: "progressive", brackets: [
    { rate: 0.0025, min: 0, max: 1000 },
    { rate: 0.0075, min: 1000, max: 2500 },
    { rate: 0.0175, min: 2500, max: 3750 },
    { rate: 0.0275, min: 3750, max: 4900 },
    { rate: 0.0375, min: 4900, max: 7200 },
    { rate: 0.0475, min: 7200, max: Infinity }
  ], standardDeduction: 6350 },
  OR: { name: "Oregon", type: "progressive", brackets: [
    { rate: 0.0475, min: 0, max: 4050 },
    { rate: 0.0675, min: 4050, max: 10200 },
    { rate: 0.0875, min: 10200, max: 125000 },
    { rate: 0.099, min: 125000, max: Infinity }
  ], standardDeduction: 2940 },
  PA: { name: "Pennsylvania", type: "flat", rate: 0.0307, standardDeduction: 0 },
  RI: { name: "Rhode Island", type: "progressive", brackets: [
    { rate: 0.0375, min: 0, max: 68200 },
    { rate: 0.0475, min: 68200, max: 155350 },
    { rate: 0.0599, min: 155350, max: Infinity }
  ], standardDeduction: 0 },
  SC: { name: "South Carolina", type: "progressive", brackets: [
    { rate: 0.0, min: 0, max: 3400 },
    { rate: 0.03, min: 3400, max: Infinity }
  ], standardDeduction: 0 },
  SD: { name: "South Dakota", type: "none", rate: 0 },
  TN: { name: "Tennessee", type: "none", rate: 0 },
  TX: { name: "Texas", type: "none", rate: 0 },
  UT: { name: "Utah", type: "flat", rate: 0.0455, standardDeduction: 0 },
  VT: { name: "Vermont", type: "progressive", brackets: [
    { rate: 0.0335, min: 0, max: 42950 },
    { rate: 0.066, min: 42950, max: 103800 },
    { rate: 0.076, min: 103800, max: 213150 },
    { rate: 0.0875, min: 213150, max: Infinity }
  ], standardDeduction: 6500 },
  VA: { name: "Virginia", type: "progressive", brackets: [
    { rate: 0.02, min: 0, max: 3000 },
    { rate: 0.03, min: 3000, max: 5000 },
    { rate: 0.05, min: 5000, max: 17000 },
    { rate: 0.0575, min: 17000, max: Infinity }
  ], standardDeduction: 8500 },
  WA: { name: "Washington", type: "none", rate: 0 },
  WV: { name: "West Virginia", type: "progressive", brackets: [
    { rate: 0.0236, min: 0, max: 10000 },
    { rate: 0.0315, min: 10000, max: 25000 },
    { rate: 0.0354, min: 25000, max: 40000 },
    { rate: 0.0422, min: 40000, max: 60000 },
    { rate: 0.0449, min: 60000, max: Infinity }
  ], standardDeduction: 0 },
  WI: { name: "Wisconsin", type: "progressive", brackets: [
    { rate: 0.0354, min: 0, max: 12380 },
    { rate: 0.0465, min: 12380, max: 24820 },
    { rate: 0.053, min: 24820, max: 274630 },
    { rate: 0.0765, min: 274630, max: Infinity }
  ], standardDeduction: 12880 },
  WY: { name: "Wyoming", type: "none", rate: 0 }
};

// ---- Calculate Federal Income Tax ----
function calculateFederalTax(taxableIncome, filingStatus) {
  const brackets = FEDERAL_BRACKETS[filingStatus];
  let tax = 0;
  for (const b of brackets) {
    if (taxableIncome > b.min) {
      tax += (Math.min(taxableIncome, b.max) - b.min) * b.rate;
    } else {
      break;
    }
  }
  return tax;
}

// ---- Calculate FICA ----
function calculateFICA(grossAnnual, filingStatus) {
  const ssWages = Math.min(grossAnnual, FICA.socialSecurityWageBase);
  const socialSecurity = ssWages * FICA.socialSecurityRate;
  const medicare = grossAnnual * FICA.medicareRate;
  const threshold = FICA.additionalMedicareThreshold[filingStatus];
  const additionalMedicare = grossAnnual > threshold
    ? (grossAnnual - threshold) * FICA.additionalMedicareRate
    : 0;
  return {
    socialSecurity,
    medicare,
    additionalMedicare,
    total: socialSecurity + medicare + additionalMedicare
  };
}

// ---- Calculate State Income Tax ----
function calculateStateTax(taxableIncome, stateCode) {
  const state = STATE_TAX[stateCode];
  if (!state) return { tax: 0, rate: 0, name: "Unknown", type: "none" };

  if (state.type === "none") {
    return { tax: 0, rate: 0, name: state.name, type: "none" };
  }

  let stateTaxable = taxableIncome;
  if (state.standardDeduction) {
    stateTaxable = Math.max(0, taxableIncome - state.standardDeduction);
  }

  if (state.type === "flat") {
    const tax = stateTaxable * state.rate;
    return { tax, rate: state.rate, name: state.name, type: "flat" };
  }

  // Progressive
  let tax = 0;
  for (const b of state.brackets) {
    if (stateTaxable > b.min) {
      tax += (Math.min(stateTaxable, b.max) - b.min) * b.rate;
    } else {
      break;
    }
  }
  const effectiveRate = stateTaxable > 0 ? tax / stateTaxable : 0;
  return { tax, rate: effectiveRate, name: state.name, type: "progressive" };
}

// ---- Main Calculation ----
function calculatePaycheck(params) {
  const { grossAnnual, filingStatus, stateCode, payFrequency } = params;

  // Federal taxable income
  const fedDeduction = STANDARD_DEDUCTION[filingStatus];
  const fedTaxableIncome = Math.max(0, grossAnnual - fedDeduction);

  // Federal income tax
  const federalTax = calculateFederalTax(fedTaxableIncome, filingStatus);

  // FICA
  const fica = calculateFICA(grossAnnual, filingStatus);

  // State income tax
  const stateResult = calculateStateTax(fedTaxableIncome, stateCode);

  // Total deductions
  const totalTax = federalTax + fica.total + stateResult.tax;
  const netAnnual = grossAnnual - totalTax;
  const netPaycheck = netAnnual / payFrequency;
  const grossPaycheck = grossAnnual / payFrequency;

  return {
    grossAnnual,
    grossPaycheck,
    federalTax,
    fica,
    stateTax: stateResult.tax,
    stateName: stateResult.name,
    stateType: stateResult.type,
    totalTax,
    netAnnual,
    netPaycheck,
    effectiveRate: grossAnnual > 0 ? totalTax / grossAnnual : 0,
    payFrequency
  };
}

// ---- Formatting ----
function formatCurrency(n) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatPercent(n) {
  return (n * 100).toFixed(2) + '%';
}

// ---- Pay Frequency Divisors ----
const PAY_FREQUENCY = {
  weekly: 52,
  biweekly: 26,
  semimonthly: 24,
  monthly: 12,
  annually: 1
};

const PAY_FREQUENCY_LABELS = {
  weekly: "Weekly",
  biweekly: "Bi-Weekly",
  semimonthly: "Semi-Monthly",
  monthly: "Monthly",
  annually: "Annually"
};
