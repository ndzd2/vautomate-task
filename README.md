# Marketplace AI-Fixer — VibeCoder @ vAutomate

Rozwiązanie Zadania 1 rekrutacji na stanowisko VibeCoder 1.0.

## Działanie aplikacji

Narzędzie pobiera "brudny" eksport produktów od partnera (JSON), przetwarza go po stronie klienta i prezentuje oczyszczone dane w profesjonalnym dashboardzie z możliwością eksportu do CSV.

### Co robi:
- **Parsuje opisy** dwóch formatów: czysty HTML oraz ukryte obiekty JSON (format Allegro `sections`)
- **Normalizuje wymiary** z dowolnego formatu wejściowego (`040*060cm`, `400x600 mm`, `50x80cm`) do zunifikowanego `Szerokość x Długość cm`
- **Rozwija skróty kolorów** (`j. szary`, `BLK`, `c. szary`, `beż`) na pełne nazwy rynkowe
- **Generuje Tytuł Allegro** (max 75 znaków) z dynamicznym doborem atrybutów — np. "Antypoślizgowy" pojawia się tylko gdy wynika to z danych produktu
- **Normalizuje stany magazynowe** — obsługa niespójnych wartości tekstowych (`dużo` → `>50`, `malo` → `<10`, `Brak` → `N/D`)
- **Wyświetla błędy walidacji** dynamicznie (brakujący EAN, nieznane wymiary/kolor, brak stanu)
- **Eksportuje do CSV** — poprawny plik z BOM UTF-8, gotowy do otwarcia w Excelu

## Jak uruchomić

Wymagania: **Node.js v18+**

```bash
cd vautomate-task
npm install
npm run dev
```

Aplikacja będzie dostępna pod `http://localhost:5173`.

### Funkcja AI (opcjonalna)

Aplikacja zawiera modal edycji produktu z możliwością generowania tytułu i opisu przez AI (Groq API / Llama 3.1). Aby uruchomić:

1. Skopiuj `.env.example` → `.env`
2. Wklej swój klucz Groq: `GROQ_API_KEY=tu_wklej_klucz`
3. Uruchom `npm run dev` — startuje jednocześnie frontend Vite i backend Express

Klucz API jest obsługiwany wyłącznie po stronie serwera — nigdy nie trafia do przeglądarki.

## Struktura projektu

```
vautomate-task/
├── src/
│   ├── App.jsx                      # Dashboard, modal edycji, eksport CSV
│   ├── App.css                      # Vanilla CSS (Glassmorphism, bez Tailwind)
│   ├── utils/dataProcessor.js       # Logika czyszczenia danych
│   └── data/
│       ├── partner_export_dirty.json    # Oryginalny plik (4 rekordy)
│       └── partner_export_dirty_v2.json # Rozszerzony zestaw (+4 rekordy)
├── api/
│   └── generate.js          # Vercel Serverless Function (Groq AI)
├── server.js                # Lokalny Express proxy dla API
├── generateCsv.js           # Skrypt Node do generowania wynik.csv
├── wynik.csv                # Gotowy plik wynikowy (8 rekordów)
└── vite.config.js           # Proxy /api → localhost:3001
```

## Dostarczone materiały

- Kod źródłowy: repozytorium GitHub — `[LINK]`
- Live demo: `[LINK]`
- Plik wynikowy: `wynik.csv` (8 rekordów, UTF-8 BOM)
- Scenariusze biznesowe: `../Scenariusze_Biznesowe.md`
