import fs from 'fs';
import { processDirtyExport } from './src/utils/dataProcessor.js';

const rawData = JSON.parse(fs.readFileSync('./src/data/partner_export_dirty.json', 'utf8'));
const cleanedData = processDirtyExport(rawData);

const headers = Object.keys(cleanedData[0]);
const csvRows = [];
csvRows.push(headers.join(','));

for (const row of cleanedData) {
  const values = headers.map(header => {
    const escaped = ('' + row[header]).replace(/"/g, '""');
    return `"${escaped}"`;
  });
  csvRows.push(values.join(','));
}

fs.writeFileSync('wynik.csv', "\uFEFF" + csvRows.join('\n'));
console.log('wynik.csv wygenerowany.');
