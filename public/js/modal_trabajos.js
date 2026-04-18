/**
 * JADI REPAIZ - MOTOR MAESTRO DE TRABAJOS (v2.0)
 * ------------------------------------------------
 * Secciones: Solicitud, Edición, Gestión Zapatero y Orden Local.
 * Sistema de IDs: Categoría-Subcategoría-Índice.
 */

const db = firebase.database();
const storage = firebase.storage().ref();
let ordenActual = {};
let modoModal = 'crear'; 

// ==========================================
// 1. DICCIONARIO DE CATEGORÍAS E IDs (PARA IA)
// ==========================================
const MAPA_CATEGORIAS = {
    "Zapatos": { code: "ZP", subs: { "Casual Hombre": "CH", "Casual Mujer": "CM", "Tacon": "TC" } },
    "Botas": { code: "BT", subs: { "Botas Hombre": "BH", "Botas Mujer": "BM" } },
    "Deportivos": { code: "DP", subs: { "Running": "RN", "Futbol": "FT" } },
    "Maletas": { code: "ML", subs: { "Mochila": "MC", "Viaje": "VJ" } }
};

// ==========================================
// 2. FUNCIÓN GENERADORA DE IDs INTELIGENTES
// ==========================================
function generarIdInteligente(cat, sub, index = 1) {
    const pCat = MAPA_CATEGORIAS[cat] ? MAPA_CATEGORIAS[cat].code : "OTR";
    const pSub = (MAPA_CATEGORIAS[cat] && MAPA_CATEGORIAS[cat].subs[sub]) ? MAPA_CATEGORIAS[cat].subs[sub] : "GEN";
    return `${pCat}-${pSub}-${index}`;
}

// ==========================================
// 3. SECCIÓN: SOLICITUD Y GESTIÓN (ABRIR MODAL)
// ==========================================
async function abrirModalOrden(modo = 'crear', data = null) {
    const session = JSON.parse(localStorage.getItem('session_jadi'));
    if (!session) return alert("Sesión no encontrada");

    const rol = session.rolCodigo; // 'zapatero' o 'cliente'
    modoModal = modo;

    // Configuración inicial del objeto de orden
    if (modo === 'crear') {
        const snapshot = await db.ref(`usuarios/${session.uid}/mis_ordenes`).once('value');
        const numOrden = (snapshot.numChildren() || 0) + 1;
        
        ordenActual = {
            id: `${session.uid}-${numOrden}`,
            fecha: new Date().toLocaleDateString(),
            status: 'Pendiente',
            cliente: { uid: session.uid, nombre: session.nombre, telefono: session.telefono || '' },
            trabajos: [],
            totales: { cobrado: 0, abono: 0, saldo: 0 }
        };
    } else {
        ordenActual = data;
    }

    renderizarModalHTML(rol);
    if (typeof JadiEstilo !== 'undefined') JadiEstilo.aplicar();
}

// ==========================================
// 4. SECCIÓN: RENDERIZADO VISUAL DINÁMICO
// ==========================================
function renderizarModalHTML(rol) {
    const modal = document.getElementById('modal-trabajo'); // Asegúrate de tener este ID en tu HTML
    
    let html = `
        <div class="modal-content">
            <h2 style="color:var(--gold)">${modoModal.toUpperCase()}: ${ordenActual.id}</h2>
            
            <label>Cliente:</label>
            <input type="text" id="m-nombre" value="${ordenActual.cliente.nombre}" ${rol !== 'zapatero' ? 'disabled' : ''}>
            
            <div id="lista-trabajos-container">
                </div>

            <div style="text-align:center; margin-top:20px;">
                <button onclick="agregarItemForm()" style="width:auto; padding:10px 20px;">
                    <i class="fas fa-plus"></i> Añadir Artículo
                </button>
            </div>

            <div id="seccion-zapatero" style="display: ${rol === 'zapatero' ? 'block' : 'none'}">
                <label>Total $:</label>
                <input type="number" id="m-total" value="${ordenActual.totales.cobrado}" oninput="calcularSaldo()">
                <label>Abono $:</label>
                <input type="number" id="m-abono" value="${ordenActual.totales.abono}" oninput="calcularSaldo()">
                <h3 id="display-saldo">Saldo: $${ordenActual.totales.saldo}</h3>
            </div>

            <button onclick="guardarOrdenMaestra()" class="btn-guardar">GUARDAR ORDEN</button>
            <button onclick="cerrarModal()" style="background:#444">CANCELAR</button>
        </div>
    `;
    
    modal.innerHTML = html;
    modal.style.display = 'flex';
    actualizarListaItems();
}

// ==========================================
// 5. SECCIÓN: CÁMARA Y ARCHIVOS (ANTES/DESPUÉS)
// ==========================================
async function capturarFoto(index, tipo = 'ANT') {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Nombre inteligente para la IA
        const item = ordenActual.trabajos[index];
        const idArticulo = generarIdInteligente(item.categoria, item.subcategoria, index + 1);
        const fileName = `${ordenActual.cliente.uid}_${idArticulo}_${tipo}.jpg`;

        // Subida a Firebase Storage
        const ref = storage.child(`reparaciones/${fileName}`);
        await ref.put(file);
        const url = await ref.getDownloadURL();
        
        ordenActual.trabajos[index][`foto_${tipo.toLowerCase()}`] = url;
        alert("Foto guardada con ID: " + idArticulo);
        actualizarListaItems();
    };
    input.click();
}

// ==========================================
// 6. SECCIÓN: GUARDADO FINAL EN DATABASE
// ==========================================
async function guardarOrdenMaestra() {
    try {
        const idFinal = ordenActual.id;
        const updates = {};
        
        // Actualizamos totales antes de guardar
        ordenActual.totales.cobrado = parseFloat(document.getElementById('m-total').value) || 0;
        ordenActual.totales.abono = parseFloat(document.getElementById('m-abono').value) || 0;
        ordenActual.totales.saldo = ordenActual.totales.cobrado - ordenActual.totales.abono;

        updates[`/ordenes/${idFinal}`] = ordenActual;
        updates[`/usuarios/${ordenActual.cliente.uid}/mis_ordenes/${idFinal}`] = true;

        await db.ref().update(updates);
        alert(`¡Éxito! Orden ${idFinal} procesada.`);
        cerrarModal();
        if (typeof cargarTrabajos === 'function') cargarTrabajos();
    } catch (error) {
        console.error("Error al guardar:", error);
    }
}

function calcularSaldo() {
    const t = parseFloat(document.getElementById('m-total').value) || 0;
    const a = parseFloat(document.getElementById('m-abono').value) || 0;
    document.getElementById('display-saldo').innerText = `Saldo: $${(t - a).toFixed(2)}`;
}

function cerrarModal() {
    document.getElementById('modal-trabajo').style.display = 'none';
}
