/**
 * JADI REPAIZ - MOTOR UNIVERSAL DE ÓRDENES
 * Versatilidad: Clientes (reparar.html) y Zapateros (nueva_orden.html)
 * Conexión: Firebase Realtime Database
 */

const db = firebase.database();
let ordenActual = {};
let modoModal = 'crear'; // 'crear' o 'editar'

/**
 * 1. ABRE EL MODAL SEGÚN EL ROL Y MODO
 * @param {string} modo - 'crear' o 'editar'
 * @param {Object} data - Datos de la orden si es edición
 */
function abrirModalOrden(modo = 'crear', data = null) {
    const session = JSON.parse(localStorage.getItem('session_jadi'));
    const rol = session.rolCodigo; // 'CLN' o 'ZPT' / 'ADM'
    modoModal = modo;

    // Inicializar estructura de la orden
    if (modo === 'crear') {
        ordenActual = {
            id: db.ref().child('ordenes').push().key,
            fecha: new Date().toLocaleDateString(),
            status: 'Pendiente',
            cliente: {
                uid: session.uid || '',
                nombre: session.nombre || '',
                telefono: session.telefono || ''
            },
            trabajos: [],
            totales: { cobrado: 0, abono: 0, saldo: 0 }
        };
    } else {
        ordenActual = data;
    }

    renderizarInterfazModal(rol);
    document.getElementById('modal-trabajos-container').style.display = 'flex';
}

/**
 * 2. CONSTRUYE LA INTERFAZ DINÁMICA (Visualización Premium)
 */
function renderizarInterfazModal(rol) {
    const esZapatero = (rol === 'ZPT' || rol === 'ADM');
    const container = document.getElementById('modal-trabajos-container');

    container.innerHTML = `
    <div class="card-jadi modal-content">
        <h2 style="color: var(--gold)">${modoModal === 'crear' ? 'NUEVA ORDEN' : 'DETALLE DE ORDEN'}</h2>
        
        <div class="form-group" style="text-align: left">
            <label>CLIENTE:</label>
            <input type="text" id="m-nombre" value="${ordenActual.cliente.nombre}" ${!esZapatero ? 'readonly' : ''} placeholder="Nombre del cliente">
            
            <label>TELÉFONO:</label>
            <input type="text" id="m-telefono" value="${ordenActual.cliente.telefono}" ${!esZapatero ? 'readonly' : ''} placeholder="Ej: 0987654321">
        </div>

        <hr style="border: 1px solid #333; margin: 20px 0;">

        <div id="lista-items">
            </div>

        ${esZapatero ? `<button class="btn-add" onclick="anyadirLineaTrabajo()">+ Añadir Trabajo</button>` : ''}

        <div class="seccion-cobro" style="${!esZapatero && modoModal === 'crear' ? 'display:none' : 'display:block'}">
            <div style="display: flex; justify-content: space-between; margin-top: 20px;">
                <span>TOTAL:</span>
                <input type="number" id="m-total" value="${ordenActual.totales.cobrado}" onchange="calcularSaldos()" ${!esZapatero ? 'readonly' : ''}>
            </div>
            <div style="display: flex; justify-content: space-between;">
                <span>ABONO:</span>
                <input type="number" id="m-abono" value="${ordenActual.totales.abono}" onchange="calcularSaldos()" ${!esZapatero ? 'readonly' : ''}>
            </div>
            <div style="display: flex; justify-content: space-between; color: #00e676; font-weight: bold; font-size: 1.2rem;">
                <span>SALDO:</span>
                <span id="m-saldo">$${ordenActual.totales.saldo}</span>
            </div>
        </div>

        <div class="modal-btns">
            <button class="btn-cerrar" onclick="cerrarModal()">CANCELAR</button>
            <button class="btn-guardar" onclick="guardarOrdenBD()">GUARDAR EN J.A.D.I</button>
        </div>
    </div>`;

    // Cargar trabajos existentes
    if (ordenActual.trabajos.length > 0) {
        ordenActual.trabajos.forEach((t, i) => inyectarFilaHTML(t, i, esZapatero));
    } else if (esZapatero) {
        anyadirLineaTrabajo();
    }
}

/**
 * 3. LÓGICA DE LÍNEAS DE TRABAJO
 */
function anyadirLineaTrabajo() {
    const index = ordenActual.trabajos.length;
    const nuevo = { cant: 1, detalle: '', precio: 0 };
    ordenActual.trabajos.push(nuevo);
    inyectarFilaHTML(nuevo, index, true);
}

function inyectarFilaHTML(t, i, esZapatero) {
    const html = `
    <div class="fila-trabajo" id="fila-${i}" style="display: flex; gap: 10px; margin-bottom: 10px;">
        <input type="number" style="width: 50px" value="${t.cant}" id="cant-${i}" ${!esZapatero ? 'readonly' : ''}>
        <input type="text" style="flex: 1" value="${t.detalle}" id="det-${i}" placeholder="Descripción" ${!esZapatero ? 'readonly' : ''}>
        ${esZapatero ? `<input type="number" style="width: 70px" value="${t.precio}" id="pre-${i}" onchange="sumarTodo()">` : ''}
    </div>`;
    document.getElementById('lista-items').insertAdjacentHTML('beforeend', html);
}

/**
 * 4. CÁLCULOS MATEMÁTICOS
 */
function sumarTodo() {
    let total = 0;
    ordenActual.trabajos.forEach((_, i) => {
        const p = parseFloat(document.getElementById(`pre-${i}`).value) || 0;
        const c = parseInt(document.getElementById(`cant-${i}`).value) || 1;
        total += (p * c);
    });
    document.getElementById('m-total').value = total;
    calcularSaldos();
}

function calcularSaldos() {
    const total = parseFloat(document.getElementById('m-total').value) || 0;
    const abono = parseFloat(document.getElementById('m-abono').value) || 0;
    const saldo = total - abono;
    document.getElementById('m-saldo').innerText = `$${saldo.toFixed(2)}`;
}

/**
 * 5. PERSISTENCIA EN FIREBASE (GUARDAR)
 */
async function guardarOrdenBD() {
    // Actualizar objeto con datos de los inputs
    ordenActual.cliente.nombre = document.getElementById('m-nombre').value;
    ordenActual.cliente.telefono = document.getElementById('m-telefono').value;
    ordenActual.totales.cobrado = parseFloat(document.getElementById('m-total').value) || 0;
    ordenActual.totales.abono = parseFloat(document.getElementById('m-abono').value) || 0;
    ordenActual.totales.saldo = ordenActual.totales.cobrado - ordenActual.totales.abono;

    // Recoger trabajos actualizados
    ordenActual.trabajos = ordenActual.trabajos.map((_, i) => ({
        cant: document.getElementById(`cant-${i}`).value,
        detalle: document.getElementById(`det-${i}`).value,
        precio: document.getElementById(`pre-${i}`) ? document.getElementById(`pre-${i}`).value : 0
    }));

    try {
        const updates = {};
        updates[`/ordenes/${ordenActual.id}`] = ordenActual;
        // Si tiene UID de cliente, indexarlo para su historial
        if (ordenActual.cliente.uid) {
            updates[`/usuarios/${ordenActual.cliente.uid}/mis_ordenes/${ordenActual.id}`] = true;
        }

        await db.ref().update(updates);
        alert("¡Orden procesada correctamente en J.A.D.I REPAIZ!");
        cerrarModal();
        if (typeof cargarOrdenes === 'function') cargarOrdenes(); // Recarga la tabla de la página principal si existe
    } catch (e) {
        console.error(e);
        alert("Error al guardar en BD.");
    }
}

function cerrarModal() {
    document.getElementById('modal-trabajos-container').style.display = 'none';
}
