// ==========================================
// MODAL-TRABAJOS.JS - EL CEREBRO DE JADI REPAIZ
// ==========================================

// --- BLOQUE 1: VARIABLES GLOBALES Y CONFIGURACIÓN ---
let usuarioActual = { rol: 'cliente', id: 'CLN123' }; // Esto vendrá de tu Auth
let fotoCapturada = null;
let modoModal = 'solicitar'; // 'solicitar', 'editar', 'nueva-orden', 'diagnostico'

// --- BLOQUE 2: EL CEREBRO DE LOS IDs (IA READY) ---

// Función que extrae consonantes para el ID del archivo
function generarCodigoArticulo(nombreSubcategoria) {
    // Quita vocales, espacios y toma las primeras 3-4 consonantes
    return nombreSubcategoria
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Quita tildes
        .replace(/[aeiou\s]/gi, '')
        .toUpperCase()
        .substring(0, 4);
}

// Generador de nombre de archivo inteligente
function prepararNombreArchivo(subcategoria, indice = 0) {
    const cod = generarCodigoArticulo(subcategoria);
    const sufijo = (modoModal === 'finalizar') ? 'DESPUES' : 'ANTES';
    return `${usuarioActual.id}_${cod}_${indice}_${sufijo}.jpg`;
}

// --- BLOQUE 3: SECCIÓN CÁMARA (UNIVERSAL) ---

function abrirCamara() {
    console.log("Iniciando cámara...");
    // Aquí disparamos el input type="file" capture="camera"
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'camera';
    
    input.onchange = (e) => {
        const file = e.target.files[0];
        // Aquí meteríamos la compresión antes de subir
        fotoCapturada = file;
        mostrarPrevisualizacion(file);
    };
    input.click();
}

// --- BLOQUE 4: LÓGICA DE SECCIONES (JUAN Y JOHN) ---

// SECCIÓN A: SOLICITAR ORDEN (CLIENTE)
function vistaSolicitarCliente() {
    console.log("Cargando interfaz para Juanito...");
    // Ocultar precios, mostrar descripción y botón cámara "Antes"
}

// SECCIÓN B: NUEVA ORDEN LOCAL (ZAPATERO)
function vistaNuevaOrdenZapatero() {
    console.log("Cargando interfaz para John (Venta Local)...");
    // Mostrar selector de cliente y campos de cobro inmediato
}

// SECCIÓN C: EDITAR Y DIAGNÓSTICO (COMPARTIDO)
function vistaEditarTrabajo(datosOrden) {
    if (usuarioActual.rol === 'zapatero') {
        // Habilitar campos de Materiales, Precio y Foto "Después"
    } else {
        // Solo permitir editar descripción si la orden está 'pendiente'
    }
}

// --- BLOQUE 5: GUARDADO Y FIREBASE ---

async function guardarTrabajo() {
    const subCat = document.getElementById('select-subcategoria').value;
    const nombreFinal = prepararNombreArchivo(subCat);
    
    console.log(`Guardando en Firebase como: ${nombreFinal}`);
    
    // 1. Subir foto a Storage
    // 2. Guardar metadata en Firestore (ID descriptivo, link foto, materiales)
    // 3. Cerrar modal y refrescar Dashboard
}

// --- EVENT LISTENERS (LOS ESCUCHADORES) ---
document.getElementById('btn-foto').addEventListener('click', abrirCamara);
document.getElementById('btn-guardar-modal').addEventListener('click', guardarTrabajo);
