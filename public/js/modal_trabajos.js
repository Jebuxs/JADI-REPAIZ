/**
 * JADI REPAIZ - MOTOR MAESTRO UNIFICADO
 * Conecta: nueva_orden.html, reparar.html y trabajos.html
 */

const db = firebase.database();
const storage = firebase.storage();
let ordenActual = {};
let modoModal = 'crear';

// 1. DICCIONARIO DE CATEGORÍAS PARA IDs INTELIGENTES
const MAPA_CATEGORIAS = {
    "Zapatos": { code: "ZP", subs: { "Casual Hombre": "CH", "Casual Mujer": "CM", "Tacon": "TC" } },
    "Botas": { code: "BT", subs: { "Botas Hombre": "BH", "Botas Mujer": "BM" } },
    "Deportivos": { code: "DP", subs: { "Running": "RN", "Futbol": "FT" } },
    "Maletas": { code: "ML", subs: { "Mochila": "MC", "Viaje": "VJ" } }
};

// 2. FUNCIÓN PARA ABRIR EL MODAL (Desde cualquier módulo)
async function abrirModalOrden(modo = 'crear', data = null) {
    const session = JSON.parse(localStorage.getItem('session_jadi'));
    const container = document.getElementById('modal-trabajo');

    if (!container) {
        console.error("Error: No existe el contenedor #modal-trabajo en el HTML");
        return;
    }

    modoModal = modo;

    if (modo === 'crear') {
        // Si es nueva orden en local, generamos un ID basado en tiempo o conteo
        const ticketId = "TK-" + Math.floor(Math.random() * 9000 + 1000);
        
        ordenActual = {
            id: ticketId,
            fecha: new Date().toLocaleDateString(),
            status: 'Ingresado',
            cliente: { 
                uid: session ? session.uid : 'local', 
                nombre: '', 
                telefono: '' 
            },
            trabajos: [{ categoria: 'Zapatos', subcategoria: 'Casual Hombre', detalle: '', precio: 0 }],
            totales: { cobrado: 0, abono: 0, saldo: 0 }
        };
    } else {
        ordenActual = data;
    }

    renderizarModal(session ? session.rolCodigo : 'zapatero');
}

// 3. RENDERIZADO DE LA INTERFAZ DEL MODAL
function renderizarModal(rol) {
    const container = document.getElementById('modal-trabajo');
    const t = ordenActual.totales;

    container.innerHTML = `
        <div class="modal-content-jadi" style="background:#111; color:white; padding:20px; border-radius:15px; border:1px solid var(--gold); max-width:500px; margin:auto;">
            <h2 style="color:var(--gold); text-align:center;">ORDEN: ${ordenActual.id}</h2>
            
            <label>Nombre del Cliente:</label>
            <input type="text" id="m-nombre" value="${ordenActual.cliente.nombre}" placeholder="Ej. Juan Pérez">
            
            <label>Teléfono:</label>
            <input type="text" id="m-telefono" value="${ordenActual.cliente.telefono}" placeholder="0999999999">

            <hr style="border:0.5px solid #333; margin:20px 0;">

            <div id="items-reparacion">
                ${ordenActual.trabajos.map((item, index) => `
                    <div class="item-box" style="background:#1a1a1a; padding:10px; border-radius:8px; margin-bottom:10px;">
                        <p style="color:var(--gold); font-weight:bold; margin:0;">Artículo #${index + 1}</p>
                        <select id="cat-${index}" onchange="actualizarSubcat(${index})">
                            ${Object.keys(MAPA_CATEGORIAS).map(cat => `<option value="${cat}" ${item.categoria === cat ? 'selected' : ''}>${cat}</option>`).join('')}
                        </select>
                        <textarea id="det-${index}" placeholder="Descripción del daño..." style="margin-top:10px;">${item.detalle}</textarea>
                        
                        <button onclick="capturarFoto(${index}, 'ANT')" style="background:#333; font-size:12px;">
                            <i class="fas fa-camera"></i> Foto Antes
                        </button>
                    </div>
                `).join('')}
            </div>

            <div id="controles-zapatero" style="display:${rol === 'zapatero' ? 'block' : 'none'}">
                <label>Total a Cobrar $:</label>
                <input type="number" id="m-total" value="${t.cobrado}" oninput="recalcularSaldo()">
                <label>Abono $:</label>
                <input type="number" id="m-abono" value="${t.abono}" oninput="recalcularSaldo()">
                <h3 id="m-saldo" style="text-align:right; color:var(--gold);">Saldo: $${(t.cobrado - t.abono).toFixed(2)}</h3>
            </div>

            <button onclick="guardarTodo()" style="background:var(--gold); color:black;
