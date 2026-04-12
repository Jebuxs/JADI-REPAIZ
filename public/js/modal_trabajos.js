/**
 * JADI REPAIZ - MOTOR UNIVERSAL DE ÓRDENES
 * FIX: Eliminación total de IDs aleatorios de Firebase.
 */

const db = firebase.database();
let ordenActual = {};
let modoModal = 'crear'; 

/**
 * 1. ABRE EL MODAL Y FUERZA EL ID PERSONALIZADO
 */
async function abrirModalOrden(modo = 'crear', data = null) {
    const session = JSON.parse(localStorage.getItem('session_jadi'));
    if (!session) return alert("Sesión no encontrada");

    const rol = session.rolCodigo; 
    modoModal = modo;

    if (modo === 'crear') {
        try {
            // Consulta el histórico para el correlativo
            const snapshot = await db.ref(`usuarios/${session.uid}/mis_ordenes`).once('value');
            const numOrden = (snapshot.numChildren() || 0) + 1;
            
            // Generación del ID único J.A.D.I
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
 * 2. RENDERIZADO DE INTERFAZ (PREMIUM DARK)
 */
function renderizarInterfazModal(rol) {
    const esPersonal = (rol === 'ZPT' || rol === 'ADM');
    const container = document.getElementById('modal-trabajos-container');

    container.innerHTML = `
    <div class="card-jadi modal-content" style="background: #111; border: 2px solid #fbc02d; border-radius: 20px; padding: 25px; color: white; max-width: 500px; margin: auto; box-shadow: 0 10px 30px rgba(0,0,0,0.8);">
        <h2 style="color: #fbc02d; margin-bottom: 5px; text-align:center;">${modoModal.toUpperCase()} ORDEN</h2>
        <p style="font-size: 0.8rem; color: #fbc02d; text-align:center; margin-bottom: 20px; letter-spacing: 1px;">FOLIO: ${ordenActual.id}</p>

        <div class="form-group" style="text-align: left;">
            <label style="color: #fbc02d; font-size: 0.7rem; font-weight: bold;">CLIENTE</label>
            <input type="text" id="m-nombre" value="${ordenActual.cliente.nombre}" 
                ${!esPersonal ? 'readonly style="background:transparent; border:none; color:#bbb; width:100%;"' : 'style="width:100%; background:#222; border:1px solid #333; color:white; padding:8px; border-radius:8px;"'}>
            
            <label style="color: #fbc02d; font-size: 0.7rem; font-weight: bold; margin-top:10px; display:block;">TELÉFONO</label>
            <input type="text" id="m-telefono" value="${ordenActual.cliente.telefono}" 
                ${!esPersonal ? 'readonly style="background:transparent; border:none; color:#bbb; width:100%;"' : 'style="width:100%; background:#222; border:1px solid #333; color:white; padding:8px; border-radius:8px;"'}>
        </div>

        <hr style="border: 0.5px solid #333; margin: 20px 0;">

        <div id="lista-items"></div>

        ${esPersonal ? `
            <button onclick="anyadirLineaTrabajo()" style="background: transparent; color: #fbc02d; border: 1px dashed #fbc02d; width: 100%; padding: 10px; cursor: pointer; border-radius: 10px; margin-top: 10px; font-weight:bold;">
                + AÑADIR TRABAJO
            </button>` : ''}

        <div class="seccion-totales" style="background: #0a0a0a; border-radius: 15px; padding: 15px; margin-top: 20px; border: 1px solid #222;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span>TOTAL A COBRAR:</span>
                <input type="number" id="m-total" value="${ordenActual.totales.cobrado}" onchange="calcularSaldos()" 
                    ${!esPersonal ? 'readonly style="background:transparent; border:none; color:white; text-align:right;"' : 'style="width: 80px; text-align: right; background: #222; color: white; border:1px solid #333; border-radius:5px;"'}>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span>ABONO RECIBIDO:</span>
                <input type="number" id="m-abono" value="${ordenActual.totales.abono}" onchange="calcularSaldos()" 
                    ${!esPersonal ? 'readonly style="background:transparent; border:none; color:white; text-align:right;"' : 'style="width: 80px; text-align: right; background: #222; color: white; border:1px solid #333; border-radius:5px;"'}>
            </div>
            <div id="display-descuento" style="font-size: 0.75rem; color: #f44336; text-align: right; display: none; margin-bottom:5px;">
                Diferencia/Descuento: <span id="val-desc"></span>
            </div>
            <div style="display: flex; justify-content: space-between; border-top: 1px solid #333; padding-top: 10px; margin-top: 10px;">
                <span style="font-weight: bold;">SALDO PENDIENTE:</span>
                <span id="m-saldo" style="color: #00e676; font-weight: bold; font-size: 1.3rem;">$${ordenActual.totales.saldo.toFixed(2)}</span>
            </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 25px;">
            <button onclick="cerrarModal()" style="background: #333; color: white; border: none; padding: 12px; border-radius: 10px; cursor: pointer; font-weight:bold;">CANCELAR</button>
            <button onclick="guardarOrdenBD()" style="background: #fbc02d; color: black; border: none; padding: 12px; border-radius: 10px; cursor: pointer; font-weight: bold;">GUARDAR ORDEN</button>
        </div>
    </div>`;

    if (ordenActual.trabajos.length > 0) {
        ordenActual.trabajos.forEach((t, i) => inyectarFilaHTML(t, i, esPersonal));
    } else if (esPersonal) {
        anyadirLineaTrabajo();
    }
    calcularSaldos();
}

/**
 * 3. LÓGICA DE FILAS
 */
function inyectarFilaHTML(t, i, esPersonal) {
    const html = `
    <div class="fila-trabajo" id="fila-${i}" style="display: flex; gap: 8px; margin-bottom: 10px; align-items: center;">
        <input type="number" id="cant-${i}" value="${t.cant}" onchange="sumarTodo()" 
            style="width: 45px; background: #222; border: 1px solid #333; color: white; padding: 5px; border-radius: 5px;" ${!esPersonal ? 'readonly' : ''}>
        <input type="text" id="det-${i}" value="${t.detalle}" placeholder="Reparación..." 
            style="flex: 1; background: #222; border: 1px solid #333; color: white; padding: 5px; border-radius: 5px;" ${!esPersonal ? 'readonly' : ''}>
        ${esPersonal ? `
            <input type="number" id="pre-${i}" value="${t.precio}" onchange="sumarTodo()" placeholder="$" 
                style="width: 65px; background: #222; border: 1px solid #333; color: #fbc02d; padding: 5px; border-radius: 5px; text-align: right;">
        ` : ''}
    </div>`;
    document.getElementById('lista-items').insertAdjacentHTML('beforeend', html);
}

function anyadirLineaTrabajo() {
    const i = document.querySelectorAll('.fila-trabajo').length;
    inyectarFilaHTML({ cant: 1, detalle: '', precio: 0 }, i, true);
}

/**
 * 4. CÁLCULOS
 */
function sumarTodo() {
    let subtotal = 0;
    document.querySelectorAll('.fila-trabajo').forEach((_, i) => {
        const c = parseInt(document.getElementById(`cant-${i}`).value) || 0;
        const p = parseFloat(document.getElementById(`pre-${i}`)?.value || 0);
        subtotal += (c * p);
    });
    
    if (modoModal === 'crear') {
        document.getElementById('m-total').value = subtotal.toFixed(2);
    }
    calcularSaldos();
}

function calcularSaldos() {
    const total = parseFloat(document.getElementById('m-total').value) || 0;
    const abono = parseFloat(document.getElementById('m-abono').value) || 0;
    
    let sumaItems = 0;
    document.querySelectorAll('.fila-trabajo').forEach((_, i) => {
        sumaItems += (parseFloat(document.getElementById(`pre-${i}`)?.value || 0) * parseInt(document.getElementById(`cant-${i}`).value || 0));
    });

    const diff = sumaItems - total;
    const divDesc = document.getElementById('display-descuento');
    if (Math.abs(diff) > 0.01) {
        divDesc.style.display = 'block';
        document.getElementById('val-desc').innerText = `$${diff.toFixed(2)}`;
    } else {
        divDesc.style.display = 'none';
    }

    const saldo = total - abono;
    document.getElementById('m-saldo').innerText = `$${saldo.toFixed(2)}`;
}

/**
 * 5. PERSISTENCIA CRÍTICA (CORRECCIÓN DE LLAVE FIREBASE)
 */
async function guardarOrdenBD() {
    // 1. Validamos identidad de sesión
    const session = JSON.parse(localStorage.getItem('session_jadi'));
    
    // 2. EXTRAEMOS EL ID DEL OBJETO ACTUAL (IMPORTANTE)
    const idFinal = ordenActual.id; // Aquí vive el CLN321-23

    // 3. Empaquetamos trabajos
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

    // 4. Creamos el objeto final exactamente como pide el motor J.A.D.I
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
        totales: {
            cobrado: total,
            abono: abono,
            saldo: total - abono
        }
    };

    try {
        const updates = {};
        
        // CORRECCIÓN RADICAL: Escribimos la ruta con el ID específico del folio.
        // Esto elimina las llaves -Oq1TLE... y usa el nombre CLN321-23.
        updates[`/ordenes/${idFinal}`] = objetoOrden;
        updates[`/usuarios/${ordenActual.cliente.uid}/mis_ordenes/${idFinal}`] = true;

        await db.ref().update(updates);
        
        alert(`Éxito: Orden ${idFinal} registrada en J.A.D.I`);
        cerrarModal();
        
        if (typeof cargarSeguimiento === 'function') cargarSeguimiento();
        if (typeof cargarOrdenes === 'function') cargarOrdenes();
        
    } catch (e) {
        console.error("Error crítico en persistencia:", e);
        alert("Error al conectar con la base de datos.");
    }
}

function cerrarModal() {
    document.getElementById('modal-trabajos-container').style.display = 'none';
}
