# Rozwiązanie Zadania Rekrutacyjnego – VibeCoder (vAutomate)

Poniżej znajdują się odpowiedzi na Część II: Scenariusze Biznesowe (High Agency) oraz wymagane Case Study z realizacji Części I.

---

## CZĘŚĆ II: SCENARIUSZE BIZNESOWE

### Zadanie 2: Kryzys API (Po gwarancji)

**Kontekst:** Klient wściekły, API nie działa (throttling), okres wsparcia wygasł, brak opłaconego Managed Service.
**Cel wiadomości:** Uspokoić, naprawić incydent (biznes nie może stać w miejscu), a następnie strategicznie upsell'ować stałą opiekę.

**Wiadomość do klienta:**
"Panie [Imię], całkowicie rozumiem frustrację - brak aktualizacji cen to bezpośrednie straty i to jest teraz priorytetem. Problem wynika z limitów po stronie API Amazona, które niedawno zaostrzyło swoje polityki.
Wyjątkowo, mimo braku aktywnego pakietu wsparcia, natychmiast wrzuciłem nasz zespół do wdrożenia „patcha” omijającego ten lejek technologiczny. Synchronizacja powinna powrócić do normy w ciągu godziny. Koszt tej interwencji awaryjnej zrabatujemy do 0 zł.
Jednocześnie, aby uniknąć podobnych awarii i pożarów w przyszłości (Amazon ciągle zmienia API), mocno rekomenduję uruchomienie naszego Managed Service za X zł/m-c. Obejmuje on nasz autorski system monitoringu, który wyłapie takie zmiany *zanim* wpłyną na sprzedaż. Skontaktuję się jutro z propozycją zabezpieczenia Państwa procesów."

### Zadanie 3: Konsultant vs Wykonawca

**Kontekst:** Klient chce kopiować opisy 1:1 z Allegro na eMAG. Wiemy, że to się źle pozycjonuje.
**Argumenty do użycia w rozmowie:**

1. **Koszt utraconej widoczności (Algorytm eMAG):** „Zrzucając opisy 1:1 z Allegro, algorytm eMAG zakwalifikuje to jako niskiej jakości content. Będzie Pan płacił za prowizje od sprzedaży i pozycjonowania (Ads), ale współczynnik konwersji będzie na tyle niski, że Pańska marża zostanie pożarta przez koszty marketingu. AI zaadaptuje treść tak, by organicznie rankowała wyżej za darmo.”
2. **Szybszy Time-to-Market vs Koszty ręcznych poprawek:** „Jeśli za 2 miesiące wspólnie uznamy, że oferty się nie sprzedają, będzie Pan musiał zatrudnić asystenta na dziesiątki godzin lub zapłacić nam ponownie, by ręcznie poprawić tysiące opisów. Generowanie ich od razu przez AI dostosowane do specyfiki eMAG to jednorazowa inwestycja, która spłaca się przy pierwszej lepszej sprzedaży z organica.”
3. **Zwiększenie wartości samego produktu (Percepcja):** „eMAG to inny profil klienta niż Allegro. Skopiowanie tam surowych, technicznych opisów wygląda taniej. Używając AI, transformujemy ten sam produkt poprzez język korzyści unikalny dla tej platformy, co pozwala Panu docelowo ustalić cenę wyższą o 5-10% na eMAGu w stosunku do Allegro. Różnica cenowa natychmiast pokryje koszt naszej integracji AI.”

### Zadanie 4: CEO nie odbiera (Stress Test)

**Kontekst:** Skrypt błędnie wylicza marżę i zaniża ceny (100 produktów na sekundę!). Czas to pieniądz. Brak decydentów.
**Decyzja:** Natychmiastowe **zablokowanie/odcięcie systemu (Kill Switch)**, a następnie dogłębna szybka analiza.

**Kroki w pierwszych 15 minutach:**

1. **0:00 - 0:02 (Triage):** Natychmiastowe zablokowanie feeda cenowego do kanału sprzedaży / kill-switch na serwerze crona aktualizującego ceny. Zatrzymuję krwotok. (Zatrzymanie sprzedaży przez weekend boli mniej niż sprzedaż tysięcy towarów poniżej kosztów, która może zabić płynność firmy lub grozić pozwami od klientów za anulowane żądanie).
2. **0:02 - 0:05 (Damage Control):** Uruchamiam skrypt cofający/przywracający ceny do ostatniego poprawnego backupu z wczoraj lub ręcznie blokuję zakup/ukrywam problematyczne oferty bezpośrednio na marketplace (jeśli to tylko 100 konkretnych produktów).
3. **0:05 - 0:10 (Komunikacja wewnętrzna/zewnętrzna):** Piszę jasny komunikat na Slacku zespołu, oznaczam CEO i COO z etykietą "KRYZYS - OPANOWANY" opisując, że zatrzymałem automatyzację z powodu błędnie zaniżonych o X% cen. Czekam do ich potwierdzenia, ew. wysyłam SMS'a z hasłem "Proszę sprawdzić Slack, zatrzymałem wyciek marży".
4. **0:10 - 0:15 (Śledztwo na sucho):** Mając wyłączony system i zabezpieczone oferty, odpalam skrypt lokalnie/na środowisku stagingowym, aby zreplikować i zdiagnozować błąd wyliczania.

**Uzasadnienie:** Główną zasadą biznesu e-commerce jest ochrona marży. Utracona sprzedaż to utracony potencjał zysku, ale sprzedaż znacznie poniżej kosztów wytworzenia/zakupu to realna stara twardej gotówki. Jako inżynier muszę chronić firmę przed twardym spadkiem rentowności z niekontrolowanego błędu maszyny.

### Zadanie 5: Organizacja Dnia

**Priorytetyzacja spraw:**

1. **Klient A zgłasza błąd kategoryzacji (5% produktów)** - Problem na żywo, który może generować "utraconą sprzedaż" lub zwroty, zły wpływ na UX. (Quick win - szybka weryfikacja czy to bug czy dane).
2. **Sales prosi o wycenę nowego projektu (30 min)** - Dla Salesów czas reakcji przy wycenie rzutuje na sukces deala, muszę im dać amunicję przed ich spotkaniem o 14:00, żeby biznes kręcił się dalej.
3. **CEO prosi o „surowe case study” na jutro rano** - Mogę je usiąść i napisać stosunkowo szybko rano (lub oddelegować strukturę AI), aby CEO miał czas na ewentualne poprawki po południu przed własnym jutrzejszym spotkaniem.
4. **5h „Deep Worku” nad nową integracją Amazon** - Zadanie najważniejsze objętościowo. Muszę zablokować kalendarz od 11:30 do 16:30 na głęboką pracę (bez rozpraszaczy z powiadomieniami).
5. **Drobna literówka w panelu innego klienta** - Błahe i rzutuje na postrzeganie, zgoda, ale nie jest "blockerem". Poprawka trafia do backlogu na sam koniec dnia jako "cool down".

**Morning Update na Discorda (09:15):**

> 🌞 Poranny Update: W pierwszej kolejności gaszę błąd kategoryzacji u Klienta A i przygotowuję wycenę dla Sales na 14:00. Równolegle przygotuję surowe Case Study dla CEO, żeby było gotowe na czas. Od 11:30 blokuję kalendarz i wchodzę w 5h Deep Worku nad nową integracją Amazona – na Slacku będę odpisywał tylko na powiadomienia @emergency. Literówkę w panelu poprawię w ramach domkniecia dnia po 16:30. Jedziemy!

## CZĘŚĆ I: CASE STUDY - Marketplace AI-Fixer

**Wyzwanie:** Rozbieżne, "brudne" dane od dostawców to powszechna choroba tocząca procesy marketplace'owe (wymieszane atrybuty w ciągach tekstowych, zanieczyszczone opisy sekcjami JSON/HTML).
**Rozwiązanie:** W ramach proof-of-concept połączyłem silnik regułowy z inteligentnym modelem językowym do normalizacji danych e-commerce. Aplikacja w ułamku sekundy ekstrahuje poprawne warianty kolorystyczne, rygorystycznie normalizuje tabele rozmiarów i pozbywa się technicznych artefaktów (HTML/JSON) z tekstów marketingowych sprzedawcy, obudowując to o generator sprzedażowych tytułów w ramach jednego, szybkiego Reactowego dashboardu w modelu Glassmorphism.
**Wartość dla klienta:** Automatyzacja tego strumienia oszczędza szacunkowo ~20 do 30 godzin pracy asystenta na każdych 10,000 dodawanych ofert miesięcznie. Eliminuje wąskie gardło publikacji ("time-to-market") i drastycznie podnosi SEO rankingi ze zoptymalizowanych tytułów, co w perspektywie rocznej wprost przekłada się na dziesiątki tysięcy złotych czystego zysku, z ułamkiem kosztu operacyjnego.
