// ========================================================
// ARCHIVO: modal_trabajos.js - J.A.D.I REPAIZ
// ========================================================

let fotoProcesada = null;
let modoActual = ""; 

// --- INTELIGENCIA DE IDs (IA READY) ---
const generarIdConsonantes = (texto) => {
    if (!texto) return "OBJ";
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                .replace(/[aeiou\s]/gi, '').toUpperCase().substring(0, 4);
};

// --- FUNCIÓN MAESTRA: ABRIR MODAL ---
function abrirModalOrden(modo, datos = null) {
    modoActual = modo;
    const container = document.getElementById('modal-trabajo') || document.getElementById('modal-trabajos-container');
    if (!container) return;

    // Inyectamos el HTML dinámicamente
    container.innerHTML = `
        <div style="background:#111; width:90%; max-width:450px; border-radius:20px; border:1px solid #333; padding:20px; position:relative; color:white; font-family:sans-serif;">
            <div onclick="cerrarModal()" style="position:absolute; top:15px; right:15px; color:#666; font-size:20px; cursor:pointer;">&times;</div>
            
            <h3 style="color:#fbc02d; margin-top:0;">${modo === 'crear' ? 'Nueva Orden Local' : 'Gestión de Trabajo'}</h3>
            
            <div style="margin-bottom:15px;">
                <label style="font-size:11px; color:#666;">CATEGORÍA</label>
                <select id="m-cat" style="background:#1a1a1a; color:white; border:1px solid #333; padding:10px; width:100%; border-radius:8px;">
                    <option value="Zapatillas">Zapatillas</option>
                    <option value="Zapatos">Zapatos</option>
                    <option value="Mochilas">Mochilas</option>
                </select>
            </div>

            <div id="seccion-camara" style="text-align:center; margin-bottom:15px;">
                <div id="drop-zona" onclick="activarCamara()" style="border:2px dashed #333; border-radius:12px; padding:20px; cursor:pointer;">
                    <i class="fas fa-camera" style="font-size:30px; color:#fbc02d;"></i>
                    <p style="font-size:12px; color:#888; margin-top:10px;">${modo === 'editar' ? 'Foto de Entrega (Después)' : 'Foto de Ingreso (Antes)'}</p>
                    <img id="preview-foto" style="width:100%; border-radius:10px; display:none; margin-top:10px;">
                </div>
            </div>

            <div id="campos-zapatero" style="${modo === 'crear' || modo === 'editar' ? 'display:block' : 'display:none'}">
                <input type="number" id="m-precio" placeholder="Precio Real $" style="background:#1a1a1a; color:white; border:1px solid #333; padding:10px; width:45%; border-radius:8px; margin-right:5%;">
                <input type="text" id="m-material" placeholder="Materiales (Suela, etc.)" style="background:#1a1a1a; color:white; border:1px solid #333; padding:10px; width:48%; border-radius:8px;">
            </div>

            <textarea id="m-detalle" placeholder="Observaciones técnicas..." rows="3" style="background:#1a1a1a; color:white; border:1px solid #333; padding:10px; width:100%; border-radius:8px; margin-top:15px; box-sizing:border-box;"></textarea>

            <button onclick="procesarGuardado()" style="background:#fbc02d; color:black; border:none; width:100%; padding:15px; border-radius:10px; margin-top:20px; font-weight:bold; cursor:pointer;">
                GUARDAR CAMBIOS EN JADI
            </button>
        </div>
    `;
    container.style.display = 'flex';
}

function cerrarModal() {
    document.getElementById('modal-trabajo').style.display = 'none';
    if(document.getElementById('modal-trabajos-container')) document.getElementById('modal-trabajos-container').style.display = 'none';
}

// --- LÓGICA DE CÁMARA ---
function activarCamara() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'camera';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const preview = document.getElementById('preview-foto');
            preview.src = URL.createObjectURL(file);
            preview.style.display = 'block';
            fotoProcesada = file; // Aquí aplicarías la compresión luego
        }
    };
    input.click();
}

// --- GUARDADO ---
async function procesarGuardado() {
    const cat = document.getElementById('m-cat').value;
    const desc = document.getElementById('m-detalle').value;
    const cod = generarIdConsonantes(cat);
    
    // Aquí conectas con tu Firebase Database
    alert(`Guardando item: ${cod} - Imagen preparada`);
    cerrarModal();
}
