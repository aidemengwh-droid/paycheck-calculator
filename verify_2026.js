// Verification test for 2026 tax data updates
const vm = require('vm');
const fs = require('fs');
const path = require('path');

// Load tax-data.js (replace const with var so variables are accessible)
const taxDataPath = path.join(__dirname, 'assets', 'tax-data.js');
let taxCode = fs.readFileSync(taxDataPath, 'utf-8');
taxCode = taxCode.replace(/^const /gm, 'var ');
eval(taxCode);

let pass = 0, fail = 0;
function assert(condition, name) {
  if (condition) { pass++; console.log(`  PASS: ${name}`); }
  else { fail++; console.log(`  FAIL: ${name}`); }
}
function approxEqual(a, b, tolerance = 0.01) {
  return Math.abs(a - b) < tolerance;
}

console.log('=== 2026 Federal Tax Data Verification ===\n');

// 1. Standard deduction values
console.log('1. Standard Deduction:');
assert(STANDARD_DEDUCTION.single === 16100, 'Single = $16,100');
assert(STANDARD_DEDUCTION.married === 32200, 'Married = $32,200');
assert(STANDARD_DEDUCTION.head === 24150, 'Head = $24,150');

// 2. FICA values
console.log('\n2. FICA:');
assert(FICA.socialSecurityWageBase === 184500, 'SS Wage Base = $184,500');
assert(FICA.socialSecurityRate === 0.062, 'SS Rate = 6.2%');
assert(FICA.medicareRate === 0.0145, 'Medicare Rate = 1.45%');

// 3. Federal brackets - Single
console.log('\n3. Federal Brackets (Single):');
assert(FEDERAL_BRACKETS.single[0].max === 12400, '10% bracket max = $12,400');
assert(FEDERAL_BRACKETS.single[1].max === 50400, '12% bracket max = $50,400');
assert(FEDERAL_BRACKETS.single[2].max === 105700, '22% bracket max = $105,700');
assert(FEDERAL_BRACKETS.single[6].min === 640600, '37% bracket min = $640,600');

// 4. Federal brackets - Married
console.log('\n4. Federal Brackets (Married):');
assert(FEDERAL_BRACKETS.married[0].max === 24800, '10% bracket max = $24,800');
assert(FEDERAL_BRACKETS.married[6].min === 768700, '37% bracket min = $768,700');

// 5. Federal brackets - Head of Household
console.log('\n5. Federal Brackets (Head):');
assert(FEDERAL_BRACKETS.head[0].max === 17700, '10% bracket max = $17,700');
assert(FEDERAL_BRACKETS.head[6].min === 640600, '37% bracket min = $640,600');

console.log('\n=== Federal Tax Calculation Tests ===\n');

// 6. Single filer, $75,000 gross
// Taxable = 75000 - 16100 = 58900
// Tax: 12400*0.10 + (50400-12400)*0.12 + (58900-50400)*0.22
// = 1240 + 4560 + 1870 = 7670
console.log('6. Single filer, $75,000 gross:');
const r1 = calculatePaycheck({ grossAnnual: 75000, filingStatus: 'single', stateCode: 'TX', payFrequency: 26 });
assert(approxEqual(r1.federalTax, 7670, 1), `Federal tax = $7,670 (got $${r1.federalTax.toFixed(2)})`);
// FICA: SS = min(75000, 184500) * 0.062 = 4650; Medicare = 75000 * 0.0145 = 1087.50
assert(approxEqual(r1.fica.socialSecurity, 4650, 1), `SS tax = $4,650 (got $${r1.fica.socialSecurity.toFixed(2)})`);
assert(approxEqual(r1.fica.medicare, 1087.50, 1), `Medicare = $1,087.50 (got $${r1.fica.medicare.toFixed(2)})`);
assert(r1.stateTax === 0, 'TX state tax = $0');

// 7. Married filer, $150,000 gross, CA
// Taxable = 150000 - 32200 = 117800
// Tax: 24800*0.10 + (100800-24800)*0.12 + (117800-100800)*0.22
// = 2480 + 9120 + 3740 = 15340
console.log('\n7. Married filer, $150,000 gross, CA:');
const r2 = calculatePaycheck({ grossAnnual: 150000, filingStatus: 'married', stateCode: 'CA', payFrequency: 26 });
assert(approxEqual(r2.federalTax, 15340, 1), `Federal tax = $15,340 (got $${r2.federalTax.toFixed(2)})`);
assert(approxEqual(r2.fica.socialSecurity, 9300, 1), `SS tax = $9,300 (got $${r2.fica.socialSecurity.toFixed(2)})`);
// CA state tax should be different from single (married brackets are doubled)
assert(r2.stateTax > 0, `CA state tax > 0 (got $${r2.stateTax.toFixed(2)})`);

console.log('\n=== State Tax Filing Status Tests ===\n');

// 8. State tax differs by filing status
console.log('8. CA state tax differs by filing status ($100,000 gross):');
const caSingle = calculateStateTax(100000, 'CA', 'single');
const caMarried = calculateStateTax(100000, 'CA', 'married');
const caHead = calculateStateTax(100000, 'CA', 'head');
assert(caSingle.tax !== caMarried.tax, `Single ($${caSingle.tax.toFixed(2)}) != Married ($${caMarried.tax.toFixed(2)})`);
assert(caSingle.tax !== caHead.tax, `Single ($${caSingle.tax.toFixed(2)}) != Head ($${caHead.tax.toFixed(2)})`);
assert(caMarried.tax < caSingle.tax, `Married tax ($${caMarried.tax.toFixed(2)}) < Single tax ($${caSingle.tax.toFixed(2)})`);

// 9. No-tax states still return 0
console.log('\n9. No-tax states:');
assert(calculateStateTax(100000, 'TX', 'married').tax === 0, 'TX married = $0');
assert(calculateStateTax(100000, 'FL', 'head').tax === 0, 'FL head = $0');
assert(calculateStateTax(100000, 'WA', 'single').tax === 0, 'WA single = $0');

// 10. Flat tax states work with filing status
console.log('\n10. Flat tax state (CO) with filing status:');
const coSingle = calculateStateTax(50000, 'CO', 'single');
const coMarried = calculateStateTax(50000, 'CO', 'married');
assert(coSingle.tax === 50000 * 0.044, `CO single = $${coSingle.tax.toFixed(2)} (expected $${(50000 * 0.044).toFixed(2)})`);
// Married should have 2x standard deduction (0 * 2 = 0 for CO, so same)
assert(coMarried.tax === coSingle.tax, `CO married same as single (no deduction)`);

// 11. Flat tax state with deduction (NC)
console.log('\n11. Flat tax state (NC) with deduction:');
const ncSingle = calculateStateTax(50000, 'NC', 'single');
const ncMarried = calculateStateTax(50000, 'NC', 'married');
// NC: rate 4.25%, deduction single=12750, married=25500 (2x)
assert(approxEqual(ncSingle.tax, (50000 - 12750) * 0.0425, 1), `NC single = $${ncSingle.tax.toFixed(2)}`);
assert(approxEqual(ncMarried.tax, (50000 - 25500) * 0.0425, 1), `NC married = $${ncMarried.tax.toFixed(2)}`);
assert(ncMarried.tax < ncSingle.tax, `NC married < NC single`);

// 12. High income SS cap test
console.log('\n12. High income SS cap ($250,000):');
const r3 = calculatePaycheck({ grossAnnual: 250000, filingStatus: 'single', stateCode: 'TX', payFrequency: 26 });
// SS = 184500 * 0.062 = 11439
assert(approxEqual(r3.fica.socialSecurity, 11439, 1), `SS tax = $11,439 (got $${r3.fica.socialSecurity.toFixed(2)})`);
// Additional Medicare = (250000 - 200000) * 0.009 = 450
assert(approxEqual(r3.fica.additionalMedicare, 450, 1), `Additional Medicare = $450 (got $${r3.fica.additionalMedicare.toFixed(2)})`);

// 13. Zero income
console.log('\n13. Zero income:');
const r4 = calculatePaycheck({ grossAnnual: 0, filingStatus: 'single', stateCode: 'CA', payFrequency: 26 });
assert(r4.federalTax === 0, 'Federal tax = $0');
assert(r4.stateTax === 0, 'State tax = $0');
assert(r4.netPaycheck === 0, 'Net paycheck = $0');

console.log(`\n=== Results: ${pass} passed, ${fail} failed ===`);
if (fail > 0) process.exit(1);
