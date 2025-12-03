let libri = [];
const STORAGE_KEY = 'robpac_libri';

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

// ========== FUNZIONI ==========

function aggiungiLibro() {
    const libro = {
        title: document.getElementById('titolo').value,
        author: document.getElementById('autore').value,
        category: document.getElementById('categoria').value,
        cover: normalizeCover(document.getElementById('cover').value),
        description: document.getElementById('descrizione').value,
        amazonLink: document.getElementById('amazonLink').value,
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

function mostraNotifica(messaggio, tipo = 'info') {
    const notifica = document.getElementById('notifica');
    notifica.textContent = messaggio;
    notifica.className = `notifica show ${tipo}`;
    
    setTimeout(() => {
        notifica.classList.remove('show');
    }, 3000);
}
