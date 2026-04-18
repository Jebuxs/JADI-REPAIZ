// ========================================================
// ARCHIVO: modal_trabajos.js
// DESCRIPCIÓN: Gestión de solicitudes, órdenes y fotos.
// ========================================================

// --- BLOQUE 1: VARIABLES GLOBALES ---
let fotoProcesada = null; // Aquí guardaremos la imagen comprimida
let datosUsuario = { rol: '', id: '' }; // Se llena al iniciar sesión

// --- BLOQUE 2: INTELIGENCIA DE NOMENCLATURA (IA READY) ---
// Esta función es la que genera los IDs que hablamos
const generarIdConsonantes = (texto) => {
    if (!texto) return "OBJ";
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                .replace(/[aeiou\s]/gi, '').toUpperCase().substring(0, 4);
};

// --- BLOQUE 3: GESTIÓN DE CÁMARA Y COMPRESIÓN ---
async function procesarFoto(archivo) {
    // Aquí usamos un Canvas para achicar la imagen antes de subirla
    const reader = new FileReader();
    reader.readAsDataURL(archivo);
    reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 800; // Tamaño ideal para web/móvil
            const scaleSize = MAX_WIDTH / img.width;
            canvas.width = MAX_WIDTH;
            canvas.height = img.height * scaleSize;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            // Convertimos a blob para subir a Firebase
            canvas.toBlob((blob) => {
                fotoProcesada = blob;
                console.log("Imagen comprimida lista");
                document.getElementById('preview-foto').src = URL.createObjectURL(blob);
            }, 'image/jpeg', 0.7); // Calidad al 70%
        };
    };
}

// --- BLOQUE 4: SECCIONES DEL MODAL (ENUNCIADOS) ---

// [SECCIÓN: SOLICITAR REPARACIÓN - CLIENTE]
function vistaSolicitarCliente() {
    // Lógica para mostrar solo: Categoría, Descripción, Foto Daño.
}

// [SECCIÓN: EDITAR SOLICITUD - CLIENTE]
function vistaEditarCliente(idPedido) {
    // Permite al cliente añadir otro objeto o corregir descripción.
}

// [SECCIÓN: NUEVA ORDEN LOCAL - ZAPATERO]
function vistaNuevaOrdenZapatero() {
    // Lo que vimos en tu captura: Ingreso directo de clientes al local.
}

// [SECCIÓN: GESTIÓN DE REPARACIÓN - ZAPATERO]
function vistaGestionZapatero(idOrden) {
    // Aquí el zapatero edita con PRECIOS, MATERIALES y SUGERENCIAS.
    // Aquí se habilita la toma de la FOTO FINAL (DESPUÉS).
}

// --- BLOQUE 5: GUARDADO INTEGRADO ---
async function guardarEnFirebase() {
    const cat = document.getElementById('select-cat').value;
    const sub = document.getElementById('select-sub').value;
    const idCliente = document.getElementById('input-id-cliente').value;
    
    // Generamos el nombre según tu regla: ID_CAT_SUB_FECHA.jpg
    const nombreFinal = `${idCliente}_${generarIdConsonantes(cat)}_${generarIdConsonantes(sub)}_${Date.now()}.jpg`;

    // 1. Subir fotoProcesada a Firebase Storage
    // 2. Guardar JSON en Firestore con la lógica de Juan y John
    console.log("Guardando reparación:", nombreFinal);
}
