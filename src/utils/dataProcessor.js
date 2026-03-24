export function cleanDescription(rawDesc) {
  if (!rawDesc) return '';

  // Format JSON (sekcje Allegro)
  if (rawDesc.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(rawDesc);
      let textContent = '';
      if (parsed.sections) {
        parsed.sections.forEach(section => {
          if (section.items) {
            section.items.forEach(item => {
              if (item.type === 'TEXT' && item.content) {
                textContent += item.content + ' ';
              }
            });
          }
        });
      }
      return textContent.trim();
    } catch (e) {
      // parsowanie JSON nieudane, fallback do HTML
    }
  }

  // Usuwanie tagów HTML
  let text = rawDesc.replace(/<br\s*\/?>/gi, ' ');
  text = text.replace(/<\/?p>/gi, ' ');
  text = text.replace(/<[^>]*>?/gm, '');
  return text.trim();
}

export function extractDimensions(rawNazwa, rawDesc) {
  const searchString = (rawNazwa + ' ' + rawDesc).toLowerCase();

  // Format milimetrowy: 400x600 mm → 40x60 cm
  const mmMatch = searchString.match(/(\d{3,4})\s*[x\*]\s*(\d{3,4})\s*mm/i);
  if (mmMatch) {
    const w = parseInt(mmMatch[1]) / 10;
    const l = parseInt(mmMatch[2]) / 10;
    return `${w} x ${l} cm`;
  }

  // Format centymetrowy: 040*060cm lub 50x80cm
  const cmMatch = searchString.match(/0*(\d{2,3})\s*[x\*]\s*0*(\d{2,3})\s*cm/i);
  if (cmMatch) {
    return `${cmMatch[1]} x ${cmMatch[2]} cm`;
  }

  return 'Brak Danych';
}

export function normalizeColor(rawStr) {
  const s = rawStr.toLowerCase();

  if (s.includes('j. szary') || s.includes('jasno') || s.includes('gry-l')) return 'Jasnoszary';
  if (s.includes('c. szary') || s.includes('ciemno') || s.includes('gry-d')) return 'Ciemnoszary';
  if (s.includes('szary') || s.includes('gry')) return 'Szary';
  if (s.includes('beż') || s.includes('beg')) return 'Beżowy';
  if (s.includes('czarn') || s.includes('blk')) return 'Czarny';
  if (s.includes('biał') || s.includes('wht')) return 'Biały';

  return 'Nieznany';
}

// Mapa skrótów magazynowych → pełne nazwy
const ABBREVIATIONS = [
  [/\bDyw\.\s*[Łł]az\./gi, 'Dywanik Łazienkowy'],
  [/\bDyw\./gi,            'Dywanik'],
  [/\bDyw\b/gi,            'Dywanik'],
  [/\b[Łł]az\./gi,         'Łazienkowy'],
  [/\bWycier\./gi,         'Wycieraczka'],
  [/\bPodusz\./gi,         'Poduszka'],
  [/\bKrzesł\./gi,         'Krzesło'],
  [/\bSzaf\./gi,           'Szafka'],
  [/\bMat\./gi,            'Mata'],
  [/\bSzt\.\s*/gi,         ''],
  [/\bNr\.\s*/gi,          ''],
  [/\bRef\.\s*/gi,         ''],
];

export function expandAbbreviations(name) {
  let result = name;
  for (const [pattern, replacement] of ABBREVIATIONS) {
    result = result.replace(pattern, replacement);
  }
  return result.replace(/\s{2,}/g, ' ').trim();
}

export function extractBaseProductName(rawNazwa) {
  let name = expandAbbreviations(rawNazwa);
  // Usuń wzorce wymiarów
  name = name.replace(/\b0*\d{2,4}\s*[x\*]\s*0*\d{2,4}\s*(cm|mm)\b/gi, '');
  // Usuń skróty kolorów (granice słów przez spacje — \b nie działa z polskimi znakami)
  name = name.replace(/(^|\s)(j\.\s*szary|c\.\s*szary|czarny|bia[łl]y|be[żz](owy)?|szary|blk|wht|gry[-_]?[ld]?)(\s|$)/gi, ' ');
  // Wyczyść nadmiarowe spacje i końcowe znaki interpunkcyjne
  name = name.replace(/\s{2,}/g, ' ').replace(/[\s,.\-–]+$/, '').trim();
  return name || rawNazwa.trim();
}

export function generateAllegroTitle(color, dimensions, rawNazwa, rawDesc) {
  const combined = (rawNazwa + ' ' + rawDesc).toLowerCase();
  const baseName = extractBaseProductName(rawNazwa);

  // Antypoślizgowy tylko jeśli wynika z danych produktu
  const isAntiSlip = combined.includes('antypoślizg') || combined.includes('anti-slip');
  const antiSlipSuffix = isAntiSlip ? ' Antypoślizgowy' : '';

  const colorPart = color !== 'Nieznany' ? ` ${color}` : '';
  const dimPart = dimensions !== 'Brak Danych' ? ` ${dimensions}` : '';

  let title = `${baseName}${antiSlipSuffix}${colorPart}${dimPart}`;

  // Jeśli przekracza 75 znaków, usuń suffix atrybutu
  if (title.length > 75) {
    title = `${baseName}${colorPart}${dimPart}`;
  }

  return title.slice(0, 75).trim();
}

export function processDirtyExport(data) {
  return data.map(item => {
    const rawNazwa = item['NAZWA ORG'] || '';
    const rawDesc = item['Opis ofe'] || '';
    const sku = item['SKU'] || '';

    const cleanDesc = cleanDescription(rawDesc);
    const dimensions = extractDimensions(rawNazwa, cleanDesc);
    const color = normalizeColor(rawNazwa + ' ' + sku + ' ' + rawDesc);
    const title = generateAllegroTitle(color, dimensions, rawNazwa, rawDesc);

    // Normalizacja ceny
    let cleanPrice = item['Cena'] ? item['Cena'].replace(' PLN', '').replace(',', '.') : '0.00';
    if (!isNaN(parseFloat(cleanPrice))) {
      cleanPrice = parseFloat(cleanPrice).toFixed(2) + ' PLN';
    }

    // Normalizacja stanów magazynowych
    let stany = item['Stany'];
    const stanyStr = String(stany).toLowerCase().trim();
    if (stanyStr === 'dużo' || stanyStr === 'duzo') stany = '>50';
    else if (stanyStr === 'malo' || stanyStr === 'mało') stany = '<10';
    else if (stanyStr === 'brak' || stanyStr === '' || stanyStr === 'undefined' || stanyStr === 'null') stany = 'N/D';

    let ean = item['EAN'];
    if (ean === 'BŁĄD_ODCZYTU' || !ean) ean = 'BRAK';

    // Usuń surowe wzorce wymiarów które mogły przeniknąć do tytułu/opisu
    const rawDimRegex = /0\d{2}[\*x]0\d{2}cm/gi;
    const finalTitle = title.replace(rawDimRegex, dimensions);
    const finalDesc = cleanDesc.replace(rawDimRegex, dimensions);

    return {
      'Oryginalna Nazwa': rawNazwa,
      'Tytuł Allegro': finalTitle,
      'Wymiary': dimensions,
      'Kolor': color,
      'Opis (Czysty)': finalDesc,
      'Cena': cleanPrice,
      'Stany': stany,
      'SKU': sku,
      'EAN': ean
    };
  });
}
