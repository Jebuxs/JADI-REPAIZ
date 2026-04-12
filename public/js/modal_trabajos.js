/**
 * JADI REPAIZ - MOTOR DE ÓRDENES 
 * SOLUCIÓN DEFINITIVA AL ID ALEATORIO
 */

const db = firebase.database();
let ordenActual = {};
let modoModal = 'crear'; 

/**
 * 1. APERTURA Y GENERACIÓN DE ID
 */
async function abrirModalOrden(modo = 'crear', data = null) {
    const session = JSON.parse(localStorage.getItem('session_jadi'));
    if (!session) return alert("Sesión no encontrada");

    const rol = session.rolCodigo; 
    modoModal = modo;

    if (modo === 'crear') {
        try {
            // Contamos las órdenes para el número correlativo
            const snapshot = await db.ref(`usuarios/${session.uid}/mis_ordenes`).once('value');
            const numOrden = (snapshot.numChildren() || 0) + 1;
            
            // Forzamos el formato deseado
            const customID = `${session.uid}-${numOrden}`;

            ordenActual = {
                id: customID,
                fecha: new Date().toLocaleDateString(),
                status: 'Pendiente',
                cliente: { 
                    uid: session.uid, 
                    nombre: session.nombre, 
                    telefono: session.telefono || '' 
                },
                trabajos: [],
                totales: { cobrado: 0, abono: 0, saldo: 0 }
            };
        } catch (e) {
            console.error("Error al generar ID:", e);
        }
    } else {
        ordenActual = data; 
    }

    renderizarInterfazModal(rol);
    document.getElementById('modal-trabajos-container').style.display = 'flex';
}

/**
 * 2. RENDERIZADO (Diseño Premium Dark)
 */
function renderizarInterfazModal(rol) {
    const esPersonal = (rol === 'ZPT' || rol === 'ADM');
    const container = document.getElementById('modal-trabajos-container');

    container.innerHTML = `
    <div class="card-jadi" style="background: #111; border: 2px solid #fbc02d; border-radius: 20px; padding: 25px; color: white; max-width: 450px; margin: auto; font-family: sans-serif;">
        <h2 style="color: #fbc02d; text-align:center; margin: 0;">${modoModal.toUpperCase()} ORDEN</h2>
        <p style="font-size: 0.8rem; color: #fbc02d; text-align:center; margin-bottom: 20px; opacity: 0.8;">FOLIO: ${ordenActual.id}</p>

        <div style="text-align: left;">
            <label style="color: #fbc02d; font-size: 0.7rem;">CLIENTE</label>
            <input type="text" id="m-nombre" value="${ordenActual.cliente.nombre}" 
                ${!esPersonal ? 'readonly style="background:transparent; border:none; color:#bbb; width:100%;"' : 'style="width:100%; background:#222; border:1px solid #333; color:white; padding:8px; border-radius:8px;"'}>
            
            <label style="color: #fbc02d; font-size: 0.7rem; margin-top:10px; display:block;">TELÉFONO</label>
            <input type="text" id="m-telefono" value="${ordenActual.cliente.telefono}" 
                ${!esPersonal ? 'readonly style="background:transparent; border:none; color:#bbb; width:100%;"' : 'style="width:100%; background:#222; border:1px solid #333; color:white; padding:8px; border-radius:8px;"'}>
        </div>

        <hr style="border: 0.5px solid #333; margin: 20px 0;">

        <div id="lista-items"></div>

        ${esPersonal ? `
            <button onclick="anyadirLineaTrabajo()" style="background: transparent; color: #fbc02d; border: 1px dashed #fbc02d; width: 100%; padding: 8px; cursor: pointer; border-radius: 10px; margin-top: 10px;">
                + AÑADIR ITEM
            </button>` : ''}

        <div style="background: #0a0a0a; border-radius: 15px; padding: 15px; margin-top: 20px; border: 1px solid #222;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span>TOTAL:</span>
                <input type="number" id="m-total" value="${ordenActual.totales.cobrado}" onchange="calcularSaldos()" 
                    ${!esPersonal ? 'readonly style="background:transparent; border:none; color:white; text-align:right;"' : 'style="width: 80px; text-align: right; background: #222; color: white; border:none;"'}>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span>ABONO:</span>
                <input type="number" id="m-abono" value="${ordenActual.totales.abono}" onchange="calcularSaldos()" 
                    ${!esPersonal ? 'readonly style="background:transparent; border:none; color:white; text-align:right;"' : 'style="width: 80px; text-align: right; background: #222; color: white; border:none;"'}>
            </div>
            <div style="display: flex; justify-content: space-between; border-top: 1px solid #333; padding-top: 10px;">
                <span style="font-weight: bold;">SALDO:</span>
                <span id="m-saldo" style="color: #00e676; font-weight: bold; font-size: 1.2rem;">$${ordenActual.totales.saldo.toFixed(2)}</span>
            </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 25px;">
            <button onclick="cerrarModal()" style="background: #333; color: white; border: none; padding: 10px; border-radius: 10px; cursor: pointer;">SALIR</button>
            <button onclick="guardarOrdenBD()" style="background: #fbc02d; color: black; border: none; padding: 10px; border-radius: 10px; cursor: pointer; font-weight: bold;">GUARDAR</button>
        </div>
    </div>`;

    if (ordenActual.trabajos.length > 0) {
        ordenActual.trabajos.forEach((t, i) => inyectarFilaHTML(t, i, esPersonal));
    } else if (esPersonal) {
        anyadirLineaTrabajo();
    }
}

function inyectarFilaHTML(t, i, esPersonal) {
    const html = `
    <div class="fila-trabajo" id="fila-${i}" style="display: flex; gap: 5px; margin-bottom: 8px;">
        <input type="number" id="cant-${i}" value="${t.cant}" onchange="sumarTodo()" style="width: 40px; background:#222; border:1px solid #333; color:white; border-radius:5px;" ${!esPersonal ? 'readonly' : ''}>
        <input type="text" id="det-${i}" value="${t.detalle}" style="flex:1; background:#222; border:1px solid #333; color:white; border-radius:5px;" ${!esPersonal ? 'readonly' : ''}>
        ${esPersonal ? `<input type="number" id="pre-${i}" value="${t.precio}" onchange="sumarTodo()" style="width: 55px; background:#222; border:1px solid #333; color:#fbc02d; border-radius:5px; text-align:right;">` : ''}
    </div>`;
    document.getElementById('lista-items').insertAdjacentHTML('beforeend', html);
}

function anyadirLineaTrabajo() {
    const i = document.querySelectorAll('.fila-trabajo').length;
    inyectarFilaHTML({ cant: 1, detalle: '', precio: 0 }, i, true);
}

function sumarTodo() {
    let sub = 0;
    document.querySelectorAll('.fila-trabajo').forEach((_, i) => {
        sub += (parseInt(document.getElementById(`cant-${i}`).value) || 0) * (parseFloat(document.getElementById(`pre-${i}`)?.value) || 0);
    });
    if (modoModal === 'crear') document.getElementById('m-total').value = sub.toFixed(2);
    calcularSaldos();
}

function calcularSaldos() {
    const t = parseFloat(document.getElementById('m-total').value) || 0;
    const a = parseFloat(document.getElementById('m-abono').value) || 0;
    document.getElementById('m-saldo').innerText = `$${(t - a).toFixed(2)}`;
}

/**
 * 3. EL GUARDADO DEFINITIVO (BLOQUEO DE ID ALEATORIO)
 */
async function guardarOrdenBD() {
    const session = JSON.parse(localStorage.getItem('session_jadi'));
    
    // USAMOS EL ID QUE GENERAMOS AL PRINCIPIO
    const idFinal = ordenActual.id; 

    const trabajos = [];
    document.querySelectorAll('.fila-trabajo').forEach((_, i) => {
        trabajos.push({
            cant: parseInt(document.getElementById(`cant-${i}`).value) || 0,
            detalle: document.getElementById(`det-${i}`).value || "",
            precio: parseFloat(document.getElementById(`pre-${i}`)?.value || 0)
        });
    });

    const total = parseFloat(document.getElementById('m-total').value) || 0;
    const abono = parseFloat(document.getElementById('m-abono').value) || 0;

    const objetoOrden = {
        id: idFinal,
        fecha: ordenActual.fecha,
        status: ordenActual.status || 'Pendiente',
        cliente: {
            uid: ordenActual.cliente.uid,
            nombre: document.getElementById('m-nombre').value,
            telefono: document.getElementById('m-telefono').value
        },
        trabajos: trabajos,
        totales: { cobrado: total, abono: abono, saldo: total - abono }
    };

    try {
        const updates = {};
        // AQUÍ ESTÁ EL TRUCO: Definimos la ruta con el ID exacto
        // No usamos .push() en ningún lado.
        updates[`/ordenes/${idFinal}`] = objetoOrden;
        updates[`/usuarios/${ordenActual.cliente.uid}/mis_ordenes/${idFinal}`] = true;

        await db.ref().update(updates);
        
        alert(`Orden ${idFinal} guardada.`);
        cerrarModal();
        if (typeof cargarSeguimiento === 'function') cargarSeguimiento();
    } catch (e) {
        alert("Error: " + e.message);
    }
}

function cerrarModal() {
    document.getElementById('modal-trabajos-container').style.display = 'none';
}
