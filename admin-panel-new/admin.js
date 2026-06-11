let libri = [];
const STORAGE_KEY = 'robpac_libri';
let studioProducts = [];
let studioDocumentiCorrenti = [];
const STUDIO_STORAGE_KEY = 'robpac_studio_products';
const STUDIO_MATERIE = [
    { materia: 'psicologia-dello-sviluppo', nome: 'Psicologia dello Sviluppo' },
    { materia: 'psicologia-del-lavoro', nome: 'Psicologia del Lavoro' },
    { materia: 'psicologia-dinamica', nome: 'Psicologia Dinamica' },
    { materia: 'psicologia-di-comunita', nome: 'Psicologia di Comunità' },
    { materia: 'psicologia-della-personalita', nome: 'Psicologia della Personalità' }
];

// ===== LOCAL COVERS ONLY (no Cloudinary / no remote URLs) =====
const COVER_PLACEHOLDER = '/covers/placeholder.svg';
const CLOUDINARY_FRAGMENT = 'cloudinary.com';

function _isCloudinary(u) {
    return typeof u === 'string' && u.toLowerCase().includes(CLOUDINARY_FRAGMENT);
}

function _extractFilename(u) {
    try {
        const url = new URL(String(u), location.href);
        const path = url.pathname || '';
        const m = path.match(/\/([^\/?#]+\.(?:png|jpe?g|webp|gif|svg))$/i);
        return m ? m[1] : null;
    } catch (e) {
        const m = String(u).match(/\/([^\/?#]+\.(?:png|jpe?g|webp|gif|svg))$/i);
        return m ? m[1] : null;
    }
}

function normalizeCover(input) {
    if (!input) return COVER_PLACEHOLDER;
    let v = String(input).trim();
    if (!v) return COVER_PLACEHOLDER;

    if (v.startsWith('/covers/')) return v;
    if (v.startsWith('covers/')) return '/' + v;

    if (!v.includes('/') && /\.(png|jpe?g|webp|gif|svg)$/i.test(v)) return '/covers/' + v;

    if (_isCloudinary(v)) {
        const fname = _extractFilename(v);
        return fname ? ('/covers/' + fname) : COVER_PLACEHOLDER;
    }

    if (/^https?:\/\//i.test(v)) return COVER_PLACEHOLDER;

    return v;
}


// Carica libri da localStorage al caricamento
document.addEventListener('DOMContentLoaded', () => {
    caricaLibri();
    renderLibri();
    aggiornaNumerazione();
    caricaStudioProducts();
    caricaMateriaStudioNelForm();
    renderStudioSummary();
});

// Form submission
document.getElementById('libro-form').addEventListener('submit', (e) => {
    e.preventDefault();
    aggiungiLibro();
});

// Filtri
document.getElementById('cerca').addEventListener('input', renderLibri);
document.getElementById('filtro-categoria').addEventListener('change', renderLibri);

// Pulsanti gestione
document.getElementById('esporta-btn').addEventListener('click', esportaJSON);
document.getElementById('importa-btn').addEventListener('click', () => {
    document.getElementById('importa-file').click();
});
document.getElementById('importa-file').addEventListener('change', importaJSON);

// Modal
document.querySelector('.close').addEventListener('click', chiudiModal);
window.addEventListener('click', (e) => {
    const modal = document.getElementById('modal-modifica');
    if (e.target === modal) chiudiModal();
});

document.getElementById('modifica-form').addEventListener('submit', salvaModifiche);

document.getElementById('studio-materia').addEventListener('change', caricaMateriaStudioNelForm);
document.getElementById('studio-form').addEventListener('submit', salvaMaterialeStudio);
document.getElementById('studio-add-doc-btn').addEventListener('click', aggiungiDocumentoStudio);
document.getElementById('studio-reset-btn').addEventListener('click', svuotaMateriaStudioCorrente);
document.getElementById('studio-export-btn').addEventListener('click', esportaStudioJSON);
document.getElementById('studio-import-btn').addEventListener('click', () => {
    document.getElementById('studio-import-file').click();
});
document.getElementById('studio-import-file').addEventListener('change', importaStudioJSON);

// ========== FUNZIONI ==========

function aggiungiLibro() {
    const libro = {
        title: document.getElementById('titolo').value,
        author: document.getElementById('autore').value,
        category: document.getElementById('categoria').value,
        cover: normalizeCover(document.getElementById('cover').value),
        description: document.getElementById('descrizione').value,
        amazonLink: document.getElementById('amazonLink').value,
        payhip: (document.getElementById('payhipLink') && document.getElementById('payhipLink').value.trim()) ? document.getElementById('payhipLink').value.trim() : undefined,
        rating: parseFloat(document.getElementById('rating').value) || 4.5
    };

    if (!libro.title || !libro.author || !libro.category || !libro.cover || !libro.description || !libro.amazonLink) {
        mostraNotifica('Compila tutti i campi obbligatori', 'error');
        return;
    }

    libri.push(libro);
    salvaLibri();
    document.getElementById('libro-form').reset();
    renderLibri();
    aggiornaNumerazione();
    mostraNotifica('Libro aggiunto con successo!', 'success');
}

function renderLibri() {
    const cerca = document.getElementById('cerca').value.toLowerCase();
    const categoria = document.getElementById('filtro-categoria').value;

    let libroFiltrati = libri.filter(libro => {
        const matchTitolo = libro.title.toLowerCase().includes(cerca);
        const matchAutore = libro.author.toLowerCase().includes(cerca);
        const matchCategoria = !categoria || libro.category === categoria;
        return (matchTitolo || matchAutore) && matchCategoria;
    });

    const grid = document.getElementById('libri-grid');
    
    if (libroFiltrati.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 40px; color: #999;">Nessun libro trovato</p>';
        return;
    }

    grid.innerHTML = libroFiltrati.map((libro, idx) => {
        const indexOriginale = libri.indexOf(libro);
        return `
            <div class="libro-card">
                <div class="libro-cover">
                    <img src="${normalizeCover(libro.cover)}" alt="${libro.title}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22300%22%3E%3Crect fill=%22%23f0f0f0%22 width=%22200%22 height=%22300%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-family=%22Arial%22 font-size=%2216%22 fill=%22%23999%22%3ENo Image%3C/text%3E%3C/svg%3E'">
                </div>
                <div class="libro-info">
                    <span class="libro-categoria">${libro.category}</span>
                    <h3>${libro.title}</h3>
                    <p><strong>Autore:</strong> ${libro.author}</p>
                    <p><strong>Rating:</strong> ⭐ ${libro.rating}</p>
                    ${libro.payhip ? '<p><strong>eBook:</strong> Payhip</p>' : ''}
                </div>
                <div class="libro-actions">
                    <button class="btn btn-warning btn-small" onclick="apriModale(${indexOriginale})">Modifica</button>
                    <button class="btn btn-danger btn-small" onclick="eliminaLibro(${indexOriginale})">Elimina</button>
                </div>
            </div>
        `;
    }).join('');
}

function apriModale(index) {
    const libro = libri[index];
    document.getElementById('modifica-index').value = index;
    document.getElementById('mod-titolo').value = libro.title;
    document.getElementById('mod-autore').value = libro.author;
    document.getElementById('mod-categoria').value = libro.category;
    document.getElementById('mod-descrizione').value = libro.description;
    document.getElementById('mod-cover').value = libro.cover;
    document.getElementById('mod-amazonLink').value = libro.amazonLink;
    if (document.getElementById('mod-payhipLink')) document.getElementById('mod-payhipLink').value = (libro.payhip || '');
    document.getElementById('mod-rating').value = libro.rating;
    document.getElementById('modal-modifica').style.display = 'flex';
}

function chiudiModal() {
    document.getElementById('modal-modifica').style.display = 'none';
}

function salvaModifiche(e) {
    e.preventDefault();
    const index = parseInt(document.getElementById('modifica-index').value);
    
    libri[index] = {
        title: document.getElementById('mod-titolo').value,
        author: document.getElementById('mod-autore').value,
        category: document.getElementById('mod-categoria').value,
        cover: normalizeCover(document.getElementById('mod-cover').value),
        description: document.getElementById('mod-descrizione').value,
        amazonLink: document.getElementById('mod-amazonLink').value,
        payhip: (document.getElementById('mod-payhipLink') && document.getElementById('mod-payhipLink').value.trim()) ? document.getElementById('mod-payhipLink').value.trim() : undefined,
        rating: parseFloat(document.getElementById('mod-rating').value) || 4.5
    };

    salvaLibri();
    renderLibri();
    chiudiModal();
    mostraNotifica('Libro modificato con successo!', 'success');
}

function eliminaLibro(index) {
    if (confirm(`Sei sicuro di voler eliminare "${libri[index].title}"?`)) {
        libri.splice(index, 1);
        salvaLibri();
        renderLibri();
        aggiornaNumerazione();
        mostraNotifica('Libro eliminato', 'info');
    }
}

function salvaLibri() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(libri));
}

function caricaLibri() {
    const salvati = localStorage.getItem(STORAGE_KEY);
    libri = salvati ? JSON.parse(salvati) : [];

    // Migrazione automatica: elimina eventuali URL Cloudinary/remote già salvati
    let changed = false;
    try {
        libri = (Array.isArray(libri) ? libri : []).map(l => {
            const c = normalizeCover(l && l.cover);
            if (l && l.cover !== c) changed = true;
            return { ...(l || {}), cover: c };
        });
    } catch (e) {}

    if (changed) salvaLibri();
}

function esportaJSON() {
    if (libri.length === 0) {
        mostraNotifica('Nessun libro da esportare', 'error');
        return;
    }

    const json = JSON.stringify(libri, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `robpac-libri-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    mostraNotifica('JSON esportato con successo!', 'success');
}

function importaJSON(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const dati = JSON.parse(event.target.result);
            if (!Array.isArray(dati)) {
                throw new Error('File non valido');
            }

            if (confirm(`Importare ${dati.length} libri? I dati esistenti verranno sovrascritti.`)) {
                libri = (Array.isArray(dati) ? dati : []).map(l => ({ ...(l || {}), cover: normalizeCover(l && l.cover) }));
                salvaLibri();
                renderLibri();
                aggiornaNumerazione();
                mostraNotifica(`${dati.length} libri importati!`, 'success');
            }
        } catch (err) {
            mostraNotifica('Errore nel caricamento del file: ' + err.message, 'error');
        }
    };
    reader.readAsText(file);
    e.target.value = '';
}

function aggiornaNumerazione() {
    const stats = document.getElementById('statistiche');
    if (libri.length === 0) {
        stats.style.display = 'none';
        return;
    }

    stats.style.display = 'block';
    document.getElementById('tot-libri').textContent = libri.length;
    document.getElementById('tot-fiction').textContent = libri.filter(l => l.category === 'fiction').length;
    document.getElementById('tot-self-help').textContent = libri.filter(l => l.category === 'self-help').length;
    document.getElementById('tot-cookbook').textContent = libri.filter(l => l.category === 'cookbook').length;
    document.getElementById('tot-psychology').textContent = libri.filter(l => l.category === 'psychology').length;
}

function creaMateriaStudioBase(materia) {
    const meta = STUDIO_MATERIE.find(m => m.materia === materia) || { materia, nome: materia };
    return {
        materia: meta.materia,
        nome: meta.nome,
        ebookGratuito: {
            titolo: '',
            descrizione: '',
            cover: '',
            link: '',
            cta: 'Scarica gratis'
        },
        documenti: [],
        libroAmazon: {
            titolo: '',
            descrizione: '',
            cover: '',
            link: '',
            cta: 'Acquista su Amazon'
        }
    };
}

function normalizzaMateriaStudio(item) {
    const base = creaMateriaStudioBase(item && item.materia);
    return {
        ...base,
        ...(item || {}),
        ebookGratuito: {
            ...base.ebookGratuito,
            ...((item && item.ebookGratuito) || {})
        },
        documenti: Array.isArray(item && item.documenti) ? item.documenti.map(doc => ({
            titolo: doc.titolo || '',
            descrizione: doc.descrizione || '',
            tipo: doc.tipo || 'PDF',
            link: doc.link || '',
            cta: doc.cta || 'Apri documento'
        })) : [],
        libroAmazon: {
            ...base.libroAmazon,
            ...((item && item.libroAmazon) || {})
        }
    };
}

function creaStudioProductsIniziali() {
    return STUDIO_MATERIE.map(m => creaMateriaStudioBase(m.materia));
}

function caricaStudioProducts() {
    const salvati = localStorage.getItem(STUDIO_STORAGE_KEY);
    try {
        const dati = salvati ? JSON.parse(salvati) : [];
        const lista = Array.isArray(dati) ? dati : [];
        studioProducts = STUDIO_MATERIE.map(meta => {
            const trovato = lista.find(item => item && item.materia === meta.materia);
            return normalizzaMateriaStudio(trovato || creaMateriaStudioBase(meta.materia));
        });
    } catch (e) {
        studioProducts = creaStudioProductsIniziali();
    }
    salvaStudioProducts();
}

function salvaStudioProducts() {
    localStorage.setItem(STUDIO_STORAGE_KEY, JSON.stringify(studioProducts));
}

function getMateriaStudioCorrente() {
    const materia = document.getElementById('studio-materia').value;
    return studioProducts.find(item => item.materia === materia) || creaMateriaStudioBase(materia);
}

function setValore(id, valore) {
    const el = document.getElementById(id);
    if (el) el.value = valore || '';
}

function leggiValore(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : '';
}

function caricaMateriaStudioNelForm() {
    const item = getMateriaStudioCorrente();
    studioDocumentiCorrenti = [...(item.documenti || [])];

    setValore('studio-ebook-titolo', item.ebookGratuito.titolo);
    setValore('studio-ebook-descrizione', item.ebookGratuito.descrizione);
    setValore('studio-ebook-cover', item.ebookGratuito.cover);
    setValore('studio-ebook-link', item.ebookGratuito.link);
    setValore('studio-ebook-cta', item.ebookGratuito.cta || 'Scarica gratis');

    setValore('studio-amazon-titolo', item.libroAmazon.titolo);
    setValore('studio-amazon-descrizione', item.libroAmazon.descrizione);
    setValore('studio-amazon-cover', item.libroAmazon.cover);
    setValore('studio-amazon-link', item.libroAmazon.link);
    setValore('studio-amazon-cta', item.libroAmazon.cta || 'Acquista su Amazon');

    pulisciDocumentoStudioForm();
    renderDocumentiStudioForm();
}

function salvaMaterialeStudio(e) {
    e.preventDefault();
    const materia = leggiValore('studio-materia');
    const base = creaMateriaStudioBase(materia);
    const aggiornato = {
        ...base,
        ebookGratuito: {
            titolo: leggiValore('studio-ebook-titolo'),
            descrizione: leggiValore('studio-ebook-descrizione'),
            cover: leggiValore('studio-ebook-cover'),
            link: leggiValore('studio-ebook-link'),
            cta: leggiValore('studio-ebook-cta') || 'Scarica gratis'
        },
        documenti: [...studioDocumentiCorrenti],
        libroAmazon: {
            titolo: leggiValore('studio-amazon-titolo'),
            descrizione: leggiValore('studio-amazon-descrizione'),
            cover: leggiValore('studio-amazon-cover'),
            link: leggiValore('studio-amazon-link'),
            cta: leggiValore('studio-amazon-cta') || 'Acquista su Amazon'
        }
    };

    const index = studioProducts.findIndex(item => item.materia === materia);
    if (index >= 0) studioProducts[index] = aggiornato;
    else studioProducts.push(aggiornato);

    salvaStudioProducts();
    renderStudioSummary();
    mostraNotifica('Materiale Studio salvato', 'success');
}

function aggiungiDocumentoStudio() {
    const titolo = leggiValore('studio-doc-titolo');
    const link = leggiValore('studio-doc-link');
    if (!titolo && !link) {
        mostraNotifica('Inserisci almeno titolo o link del documento', 'error');
        return;
    }

    studioDocumentiCorrenti.push({
        titolo,
        descrizione: leggiValore('studio-doc-descrizione'),
        tipo: leggiValore('studio-doc-tipo') || 'PDF',
        link,
        cta: leggiValore('studio-doc-cta') || 'Apri documento'
    });

    pulisciDocumentoStudioForm();
    renderDocumentiStudioForm();
}

function eliminaDocumentoStudio(index) {
    studioDocumentiCorrenti.splice(index, 1);
    renderDocumentiStudioForm();
}

function pulisciDocumentoStudioForm() {
    setValore('studio-doc-titolo', '');
    setValore('studio-doc-descrizione', '');
    setValore('studio-doc-tipo', 'PDF');
    setValore('studio-doc-link', '');
    setValore('studio-doc-cta', 'Apri documento');
}

function renderDocumentiStudioForm() {
    const list = document.getElementById('studio-doc-list');
    if (!list) return;
    if (studioDocumentiCorrenti.length === 0) {
        list.innerHTML = '<p class="empty-state">Nessun documento aggiunto per questa materia.</p>';
        return;
    }

    list.innerHTML = studioDocumentiCorrenti.map((doc, index) => `
        <div class="studio-doc-item">
            <div>
                <strong>${escapeHTML(doc.titolo || 'Documento senza titolo')}</strong>
                <span>${escapeHTML(doc.tipo || 'PDF')}</span>
                ${doc.descrizione ? `<p>${escapeHTML(doc.descrizione)}</p>` : ''}
            </div>
            <button class="btn btn-danger btn-small" type="button" onclick="eliminaDocumentoStudio(${index})">Elimina</button>
        </div>
    `).join('');
}

function renderStudioSummary() {
    const grid = document.getElementById('studio-summary-grid');
    if (!grid) return;

    grid.innerHTML = studioProducts.map(item => {
        const ebook = item.ebookGratuito || {};
        const amazon = item.libroAmazon || {};
        const ebookStatus = ebook.titolo || ebook.link ? 'Presente' : 'Vuoto';
        const amazonStatus = amazon.titolo || amazon.link ? 'Presente' : 'Vuoto';
        const docsCount = Array.isArray(item.documenti) ? item.documenti.length : 0;

        return `
            <div class="studio-summary-card">
                <h4>${escapeHTML(item.nome)}</h4>
                <p><strong>eBook gratuito:</strong> ${ebookStatus}</p>
                <p><strong>Documenti:</strong> ${docsCount}</p>
                <p><strong>Libro Amazon:</strong> ${amazonStatus}</p>
                <div class="studio-summary-actions">
                    <button class="btn btn-warning btn-small" type="button" onclick="modificaMateriaStudio('${item.materia}')">Modifica</button>
                    <button class="btn btn-danger btn-small" type="button" onclick="svuotaMateriaStudio('${item.materia}')">Elimina</button>
                </div>
            </div>
        `;
    }).join('');
}

function modificaMateriaStudio(materia) {
    document.getElementById('studio-materia').value = materia;
    caricaMateriaStudioNelForm();
    document.getElementById('studio-materia').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function svuotaMateriaStudioCorrente() {
    svuotaMateriaStudio(document.getElementById('studio-materia').value);
}

function svuotaMateriaStudio(materia) {
    const meta = STUDIO_MATERIE.find(m => m.materia === materia);
    if (!meta) return;
    if (!confirm(`Svuotare i materiali di "${meta.nome}"?`)) return;
    const index = studioProducts.findIndex(item => item.materia === materia);
    if (index >= 0) studioProducts[index] = creaMateriaStudioBase(materia);
    salvaStudioProducts();
    if (document.getElementById('studio-materia').value === materia) caricaMateriaStudioNelForm();
    renderStudioSummary();
    mostraNotifica('Materiale Studio svuotato', 'info');
}

function esportaStudioJSON() {
    const json = JSON.stringify(studioProducts, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'studio-products.json';
    a.click();
    URL.revokeObjectURL(url);
    mostraNotifica('JSON Studio esportato', 'success');
}

function importaStudioJSON(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const dati = JSON.parse(event.target.result);
            const lista = Array.isArray(dati) ? dati : (Array.isArray(dati.subjects) ? dati.subjects : dati.materie);
            if (!Array.isArray(lista)) throw new Error('File Studio non valido');
            if (confirm(`Importare ${lista.length} materie Studio? I dati esistenti verranno sovrascritti.`)) {
                studioProducts = STUDIO_MATERIE.map(meta => {
                    const trovato = lista.find(item => item && item.materia === meta.materia);
                    return normalizzaMateriaStudio(trovato || creaMateriaStudioBase(meta.materia));
                });
                salvaStudioProducts();
                caricaMateriaStudioNelForm();
                renderStudioSummary();
                mostraNotifica('JSON Studio importato', 'success');
            }
        } catch (err) {
            mostraNotifica('Errore import Studio: ' + err.message, 'error');
        }
    };
    reader.readAsText(file);
    e.target.value = '';
}

function escapeHTML(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function mostraNotifica(messaggio, tipo = 'info') {
    const notifica = document.getElementById('notifica');
    notifica.textContent = messaggio;
    notifica.className = `notifica show ${tipo}`;
    
    setTimeout(() => {
        notifica.classList.remove('show');
    }, 3000);
}
