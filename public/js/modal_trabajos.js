/**
 * JADI REPAIZ - MOTOR UNIVERSAL DE ÓRDENES
 * Versión: 3.0 (ID Personalizado & Roles Dinámicos)
 * Sistema: USUARIO-CORRELATIVO (Ej: CLN321-23)
 */

const db = firebase.database();
let ordenActual = {};
let modoModal = 'crear'; 

/**
 * 1. ABRE EL MODAL SEGÚN EL ROL Y MODO
 */
async function abrirModalOrden(modo = 'crear', data = null) {
    const session = JSON.parse(localStorage.getItem('session_jadi'));
    if (!session) return console.error("No hay sesión activa");
    
    const rol = session.rolCodigo; 
    modoModal = modo;

    if (modo === 'crear') {
        // LÓGICA DE ID PERSONALIZADO (Punto 1.2.1 de la Especificación)
        // Consultamos cuántas órdenes tiene el usuario para asignar el siguiente número
        const snapshot = await db.ref(`usuarios/${session.uid}/mis_ordenes`).once('value');
        const numOrden = (snapshot.numChildren() || 0) + 1;
        const customID = `${session.uid}-${numOrden}`;

        ordenActual = {
            id: customID,
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
 * 2. CONSTRUYE LA INTERFAZ DINÁMICA (Visualización Premium Dark)
 */
function renderizarInterfazModal(rol) {
    const esZapatero = (rol === 'ZPT' || rol === 'ADM');
    const container = document.getElementById('modal-trabajos-container');

    container.innerHTML = `
    <div class="card-jadi modal-content" style="max-width: 500px; margin: auto; background: #111; border: 2px solid var(--gold); padding: 25px; border-radius: 20px; color: white;">
        <h2 style="color: var(--gold); text-align: center; margin-top: 0;">
            ${modoModal === 'crear' ? 'NUEVA ORDEN' : 'DETALLE DE ORDEN'}
        </h2>
        <p style="text-align: center; font-size: 0.8rem; color: #666; margin-top: -10px;">ID: ${ordenActual.id}</p>
        
        <div class="form-group" style="margin-bottom: 15px;">
            <label style="color: var(--gold); font-size: 0.7rem; font-weight: bold;">CLIENTE:</label>
            <input type="text" id="m-nombre" value="${ordenActual.cliente.nombre}" 
                ${!esZapatero ? 'readonly style="background:transparent; border:none; color:#888"' : 'style="width:100%; padding:8px; border-radius:5px; background:#222; border:1px solid #333; color:white;"'}>
            
            <label style="color: var(--gold); font-size: 0.7rem; font-weight: bold; display:block; margin-top:10px;">TELÉFONO:</label>
            <input type="text" id="m-telefono" value="${ordenActual.cliente.telefono}" 
                ${!esZapatero ? 'readonly style="background:transparent; border:none; color:#888"' : 'style="width:100%; padding:8px; border-radius:5px; background:#222; border:1px solid #333; color:white;"'}>
        </div>

        <hr style="border: 0.5px solid #333; margin: 20px 0;">

        <div id="lista-items">
            <div style="display: flex; color: var(--gold); font-size: 0.7rem; font-weight: bold; margin-bottom: 5px;">
                <span style="width: 40px">CANT</span>
                <span style="flex: 1; margin-left: 10px;">DESCRIPCIÓN</span>
                ${esZapatero ? '<span style="width: 60px; text-align:right">PRECIO</span>' : ''}
            </div>
        </div>

        ${esZapatero ? `
            <button onclick="anyadirLineaTrabajo()" style="background: transparent; color: var(--gold); border: 1px dashed var(--gold); width: 100%; padding: 8px; border-radius: 5px; cursor: pointer; margin: 10px 0;">
                + AÑADIR TRABAJO
            </button>
        ` : ''}

        <div style="background: #0a0a0a; padding: 15px; border-radius: 10px; margin-top: 20px; border: 1px solid #222;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <span style="font-size: 0.9rem;">TOTAL:</span>
                <div style="display:flex; align-items:center;">
                    <span style="color:var(--gold); margin-right:5px;">$</span>
                    <input type="number" id="m-total" value="${ordenActual.totales.cobrado}" onchange="calcularSaldos()" 
                        ${!esZapatero ? 'readonly style="background:transparent; border:none; color:white; text-align:right; width:60px;"' : 'style="width:70px; text-align:right; background:#222; border:1px solid #333; color:white;"'}>
                </div>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <span style="font-size: 0.9rem;">ABONO:</span>
                <div style="display:flex; align-items:center;">
                    <span style="color:var(--gold); margin-right:5px;">$</span>
                    <input type="number" id="m-abono" value="${ordenActual.totales.abono}" onchange="calcularSaldos()" 
                        ${!esZapatero ? 'readonly style="background:transparent; border:none; color:white; text-align:right; width:60px;"' : 'style="width:70px; text-align:right; background:#222; border:1px solid #333; color:white;"'}>
                </div>
            </div>
            <div style="display: flex; justify-content: space-between; border-top: 1px solid #333; padding-top: 10px; margin-top: 10px;">
                <span style="font-weight: bold;">SALDO:</span>
                <span id="m-saldo" style="color: #00e676; font-weight: bold; font-size: 1.2rem;">$${ordenActual.totales.saldo.toFixed(2)}</span>
            </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 25px;">
            <button onclick="cerrarModal()" style="background: #333; color: white; border: none; padding: 12px; border-radius: 10px; cursor: pointer; font-weight: bold;">CERRAR</button>
            <button onclick="guardarOrdenBD()" style="background: var(--gold); color: black; border: none; padding: 12px; border-radius: 10px; cursor: pointer; font-weight: bold;">GUARDAR</button>
        </div>
    </div>`;

    if (ordenActual.trabajos.length > 0) {
        ordenActual.trabajos.forEach((t, i) => inyectarFilaHTML(t, i, esZapatero));
    } else if (esZapatero) {
        anyadirLineaTrabajo();
    }
}

function inyectarFilaHTML(t, i, esZapatero) {
    const html = `
    <div class="fila-trabajo" id="fila-${i}" style="display: flex; gap: 10px; margin-bottom: 8px; align-items: center;">
        <input type="number" id="cant-${i}" value="${t.cant}" style="width: 40px; text-align: center; background: #222; border: 1px solid #333; color: white; padding: 5px; border-radius: 5px;" ${!esZapatero ? 'readonly' : ''}>
        <input type="text" id="det-${i}" value="${t.detalle}" placeholder="Detalle..." style="flex: 1; background: #222; border: 1px solid #333; color: white; padding: 5px; border-radius: 5px;" ${!esZapatero ? 'readonly' : ''}>
        ${esZapatero ? `
            <input type="number" id="pre-${i}" value="${t.precio}" onchange="autoSumarPrecios()" style="width: 60px; text-align: right; background: #222; border: 1px solid #333; color: white; padding: 5px; border-radius: 5px;">
        ` : ''}
    </div>`;
    document.getElementById('lista-items').insertAdjacentHTML('beforeend', html);
}

function anyadirLineaTrabajo() {
    const index = document.querySelectorAll('.fila-trabajo').length;
    const nuevo = { cant: 1, detalle: '', precio: 0 };
    ordenActual.trabajos.push(nuevo);
    inyectarFilaHTML(nuevo, index, true);
}

function autoSumarPrecios() {
    let suma = 0;
    document.querySelectorAll('.fila-trabajo').forEach((_, i) => {
        const p = parseFloat(document.getElementById(`pre-${i}`).value) || 0;
        const c = parseInt(document.getElementById(`cant-${i}`).value) || 1;
        suma += (p * c);
    });
    document.getElementById('m-total').value = suma;
    calcularSaldos();
}

function calcularSaldos() {
    const total = parseFloat(document.getElementById('m-total').value) || 0;
    const abono = parseFloat(document.getElementById('m-abono').value) || 0;
    const saldo = total - abono;
    document.getElementById('m-saldo').innerText = `$${saldo.toFixed(2)}`;
}

/**
 * 5. PERSISTENCIA (Punto 2 y 3 de la Especificación)
 */
async function guardarOrdenBD() {
    const session = JSON.parse(localStorage.getItem('session_jadi'));
    
    // Captura de datos finales
    const idFinal = ordenActual.id; 
    const trabajosFinales = [];
    document.querySelectorAll('.fila-trabajo').forEach((_, i) => {
        trabajosFinales.push({
            cant: document.getElementById(`cant-${i}`).value,
            detalle: document.getElementById(`det-${i}`).value,
            precio: document.getElementById(`pre-${i}`) ? document.getElementById(`pre-${i}`).value : 0
        });
    });

    const ordenParaGuardar = {
        id: idFinal,
        fecha: ordenActual.fecha,
        status: ordenActual.status,
        cliente: {
            uid: session.uid,
            nombre: document.getElementById('m-nombre').value,
            telefono: document.getElementById('m-telefono').value
        },
        trabajos: trabajosFinales,
        totales: {
            cobrado: parseFloat(document.getElementById('m-total').value) || 0,
            abono: parseFloat(document.getElementById('m-abono').value) || 0,
            saldo: (parseFloat(document.getElementById('m-total').value) || 0) - (parseFloat(document.getElementById('m-abono').value) || 0)
        }
    };

    try {
        const updates = {};
        updates[`/ordenes/${idFinal}`] = ordenParaGuardar;
        updates[`/usuarios/${session.uid}/mis_ordenes/${idFinal}`] = true;

        await db.ref().update(updates);
        alert(`¡Orden ${idFinal} procesada con éxito!`);
        cerrarModal();
        
        // Ejecutar refresco de vista si existe en la página padre
        if (typeof cargarSeguimiento === 'function') cargarSeguimiento();
        if (typeof cargarOrdenes === 'function') cargarOrdenes();
        
    } catch (e) {
        console.error("Error al guardar:", e);
        alert("Error de conexión con J.A.D.I");
    }
}

function cerrarModal() {
    document.getElementById('modal-trabajos-container').style.display = 'none';
}
