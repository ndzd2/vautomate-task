import React, { useState, useEffect } from 'react';
import './App.css';
import { processDirtyExport } from './utils/dataProcessor';
import dirtyDataRaw from './data/partner_export_dirty.json';

const defaultData = [...dirtyDataRaw];

function App() {
  const [activeTab, setActiveTab] = useState('cleaned');
  const [rawData, setRawData] = useState(defaultData);
  const [cleanedData, setCleanedData] = useState([]);
  const [uploadedFileName, setUploadedFileName] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showErrorTooltip, setShowErrorTooltip] = useState(false);

  // Stan modalu edycji
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [modalForm, setModalForm] = useState({ title: '', description: '' });
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const processed = processDirtyExport(rawData);
    setCleanedData(processed);
  }, [rawData]);

  const handleFileLoad = (file) => {
    setUploadError(null);
    if (!file) return;
    if (!file.name.endsWith('.json')) {
      setUploadError('Akceptowane są wyłącznie pliki .json');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (!Array.isArray(parsed)) {
          setUploadError('Plik musi zawierać tablicę obiektów JSON.');
          return;
        }
        setRawData(parsed);
        setUploadedFileName(file.name);
        setSelectedIdx(null);
      } catch {
        setUploadError('Nieprawidłowy format JSON.');
      }
    };
    reader.readAsText(file);
  };

  const handleFileInput = (e) => handleFileLoad(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileLoad(e.dataTransfer.files[0]);
  };

  const handleReset = () => {
    setRawData(defaultData);
    setUploadedFileName(null);
    setUploadError(null);
    setSelectedIdx(null);
  };

  const openProductModal = (idx, row) => {
    setSelectedIdx(idx);
    setModalForm({
      title: row['Tytuł Allegro'] || '',
      description: row['Opis (Czysty)'] || ''
    });
  };

  const closeModal = () => {
    setSelectedIdx(null);
  };

  const handleSaveModal = () => {
    const newData = [...cleanedData];
    newData[selectedIdx]['Tytuł Allegro'] = modalForm.title;
    newData[selectedIdx]['Opis (Czysty)'] = modalForm.description;
    setCleanedData(newData);
    closeModal();
  };

  const proposeWithAI = async (mode) => {
    const row = cleanedData[selectedIdx];
    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          mode,
          titleParam: row['Oryginalna Nazwa'] || row['Tytuł Allegro'],
          descParam: modalForm.description || row['Opis (Czysty)'],
          colorParam: row.Kolor,
          dimParam: row.Wymiary
        })
      });
      const data = await res.json();
      
      if (data.result) {
        // Usuń przypadkowe cudzysłowy i białe znaki z odpowiedzi AI
        const cleanResult = data.result.replace(/^["']|["']$/g, '').trim();
        setModalForm(prev => ({
          ...prev,
          [mode === 'title' ? 'title' : 'description']: cleanResult
        }));
      } else {
        alert(data.error || 'Wystąpił błąd z API Groq.');
      }
    } catch (err) {
      alert('Błąd sieci! Upewnij się, że serwer backendowy nasłuchuje (npm run dev).');
    }
    setIsGenerating(false);
  };

  const handleExportCSV = () => {
    if (!cleanedData.length) return;

    // Usuwamy "Oryginalna Nazwa" z eksportu, ma to być ukryte lub dla API
    const exportData = cleanedData.map(({ 'Oryginalna Nazwa': _, ...rest }) => rest);
    const headers = Object.keys(exportData[0]);
    
    const csvRows = [];
    csvRows.push(headers.join(','));

    for (const row of exportData) {
      const values = headers.map(header => {
        const escaped = ('' + row[header]).replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }

    const csvContent = "\uFEFF" + csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'cleaned_data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="app-container">
      <header>
        <div className="brand">
          <h1>Marketplace AI-Fixer</h1>
          <span>vAutomate Data Engineering Tool</span>
        </div>
        <button className="primary-btn" onClick={handleExportCSV}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Eksportuj (.csv)
        </button>
      </header>

      <div
        className={`upload-zone ${isDragging ? 'upload-zone--dragging' : ''} ${uploadedFileName ? 'upload-zone--loaded' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        {uploadedFileName ? (
          <div className="upload-zone__loaded">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
            <span>Wczytano: <strong>{uploadedFileName}</strong></span>
            <button className="upload-zone__reset" onClick={handleReset}>Resetuj do demo</button>
          </div>
        ) : (
          <label className="upload-zone__label">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
            <span>Przeciągnij plik <strong>.json</strong> lub <strong>kliknij, aby wybrać</strong></span>
            <input type="file" accept=".json" onChange={handleFileInput} style={{ display: 'none' }} />
          </label>
        )}
        {uploadError && <p className="upload-zone__error">{uploadError}</p>}
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <span>Przetworzone rekordy</span>
          <strong>{rawData.length}</strong>
        </div>
        <div className="stat-card">
          <span>Status czyszczenia</span>
          <strong style={{ color: 'var(--success)' }}>Zakończony</strong>
        </div>
        <div
          className="stat-card stat-card--hoverable"
          onMouseEnter={() => setShowErrorTooltip(true)}
          onMouseLeave={() => setShowErrorTooltip(false)}
          style={{ position: 'relative', cursor: 'default' }}
        >
          <span>Błędy walidacji</span>
          {(() => {
            const errorRows = cleanedData.map((r, i) => {
              const issues = [];
              if (r.EAN === 'BRAK') issues.push('brak EAN');
              if (r.Wymiary === 'Brak Danych') issues.push('brak wymiarów');
              if (r.Kolor === 'Nieznany') issues.push('nieznany kolor');
              if (r.Stany === 'N/D') issues.push('brak stanu');
              return issues.length > 0 ? { sku: r.SKU, issues, idx: i } : null;
            }).filter(Boolean);

            return (
              <>
                <strong style={{ color: errorRows.length > 0 ? '#f59e0b' : 'var(--success)' }}>
                  {errorRows.length}
                </strong>
                {showErrorTooltip && errorRows.length > 0 && (
                  <div className="error-tooltip">
                    <div className="error-tooltip__title">Rekordy z problemami</div>
                    {errorRows.map(({ sku, issues }) => (
                      <div key={sku} className="error-tooltip__row">
                        <span className="error-tooltip__sku">{sku}</span>
                        <span className="error-tooltip__issues">{issues.join(', ')}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            );
          })()}
        </div>
      </div>

      <main className="dashboard-grid">
        <div className="glass-panel">
          <div className="panel-header">
            <h2>Podgląd Danych</h2>
            <div className="tabs">
              <button 
                className={`tab-btn ${activeTab === 'cleaned' ? 'active' : ''}`}
                onClick={() => setActiveTab('cleaned')}
              >
                Oczyszczone (Wynikowe)
              </button>
              <button 
                className={`tab-btn ${activeTab === 'dirty' ? 'active' : ''}`}
                onClick={() => setActiveTab('dirty')}
              >
                Oryginalne (Brudne)
              </button>
            </div>
          </div>

          <div className="table-container">
            {activeTab === 'cleaned' ? (
              <table>
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th>Tytuł Allegro</th>
                    <th>Wymiary</th>
                    <th>Kolor</th>
                    <th>Cena</th>
                    <th>Stany</th>
                    <th>Czysty Opis</th>
                    <th>Konfiguracja</th>
                  </tr>
                </thead>
                <tbody>
                  {cleanedData.map((row, idx) => (
                    <tr key={idx}>
                      <td><span className="badge">{row.SKU}</span></td>
                      <td className="truncate" title={row['Tytuł Allegro']}>{row['Tytuł Allegro']}</td>
                      <td><span className="badge success">{row.Wymiary}</span></td>
                      <td>{row.Kolor}</td>
                      <td>{row.Cena}</td>
                      <td>{row.Stany}</td>
                      <td className="truncate" title={row['Opis (Czysty)']}>{row['Opis (Czysty)']}</td>
                      <td>
                        <button 
                          className="tab-btn" 
                          style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem', borderColor: 'var(--accent)' }}
                          onClick={() => openProductModal(idx, row)}
                        >
                          👁️ Podgląd / Edycja
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th>NAZWA ORG</th>
                    <th>Opis ofe (Fragment)</th>
                    <th>Cena</th>
                  </tr>
                </thead>
                <tbody>
                  {rawData.map((row, idx) => (
                    <tr key={idx}>
                      <td><span className="badge">{row.SKU}</span></td>
                      <td className="truncate" title={row['NAZWA ORG']}>{row['NAZWA ORG']}</td>
                      <td className="truncate">{row['Opis ofe']}</td>
                      <td>{row.Cena}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      {/* Modal - Edycja Produktu */}
      {selectedIdx !== null && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel">
            <div className="modal-header">
              <h3>🎨 Edytor Produktu: {cleanedData[selectedIdx].SKU}</h3>
              <button className="close-btn" onClick={closeModal}>✕</button>
            </div>
            
            <div className="modal-body">
              <div className="ai-banner">
                <p>Użyj dedykowanych przycisków ✨ AI przy każdym z pól, aby Llama 3 błyskawicznie zaproponowała nową, lepszą treść do Twojej weryfikacji.</p>
              </div>

              <div className="form-group">
                <label>Oryginalna Nazwa Dostawcy</label>
                <input 
                  type="text" 
                  className="form-input read-only" 
                  readOnly 
                  value={cleanedData[selectedIdx]['Oryginalna Nazwa'] || 'Brak'} 
                />
              </div>

              <div className="form-group flex-group">
                <div style={{ flex: 1 }}>
                  <label>Wykryty Kolor</label>
                  <input type="text" className="form-input read-only" readOnly value={cleanedData[selectedIdx].Kolor} />
                </div>
                <div style={{ flex: 1 }}>
                  <label>Wymiary</label>
                  <input type="text" className="form-input read-only" readOnly value={cleanedData[selectedIdx].Wymiary} />
                </div>
              </div>

              <div className="form-group highlighted-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label>Tytuł Allegro (zoptymalizowany)</label>
                  <button 
                    className="tab-btn" 
                    onClick={() => proposeWithAI('title')}
                    disabled={isGenerating}
                    style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem', borderColor: 'var(--accent)', color: 'var(--text-main)' }}
                  >
                    {isGenerating ? '⏳...' : '✨ Zaproponuj Tytuł (AI)'}
                  </button>
                </div>
                <input 
                  type="text" 
                  className="form-input" 
                  value={modalForm.title}
                  onChange={e => setModalForm({...modalForm, title: e.target.value})}
                  maxLength="75"
                />
                <small className="char-count">{modalForm.title.length}/75 znaków</small>
              </div>

              <div className="form-group highlighted-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label>Opis Ofertowy (Czysty Tekst)</label>
                  <button 
                    className="tab-btn" 
                    onClick={() => proposeWithAI('description')}
                    disabled={isGenerating}
                    style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem', borderColor: 'var(--accent)', color: 'var(--text-main)' }}
                  >
                    {isGenerating ? '⏳...' : '✨ Zaproponuj Opis (AI)'}
                  </button>
                </div>
                <textarea 
                  className="form-input form-textarea" 
                  value={modalForm.description}
                  onChange={e => setModalForm({...modalForm, description: e.target.value})}
                  rows="5"
                ></textarea>
              </div>
            </div>

            <div className="modal-footer">
              <button className="tab-btn" onClick={closeModal}>Anuluj</button>
              <button className="primary-btn" onClick={handleSaveModal}>💾 Zapisz Zmiany</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
