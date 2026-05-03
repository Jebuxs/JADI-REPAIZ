/**
 * NAVEGACIÓN Y LÓGICA DE NUEVA ORDEN - JADI REPAIZ
 * Este archivo gestiona la creación de órdenes multi-ítem.
 */

// 1. VARIABLES DE ESTADO LOCAL
let itemsOrden = [];
const IVA_VALOR = 0.15; // 15% Ecuador 2026

// 2. INICIALIZACIÓN
window.onload = async () => {
    const sesion = JSON.parse(localStorage.getItem('session_jadi'));
    if (!sesion) {
        window.location.href = '../login.html';
        return;
    }
    console.log("Sesión activa:", sesion.id);
};

// 3. LÓGICA DE ÍTEMS (LA CARNE PARA LA IA)
function añadirItem() {
    const obj = document.getElementById('i-objeto').value;
    const cant = parseInt(document.getElementById('i-cantidad').value) || 0;
    const det = document.getElementById('i-detalle').value;
    const pre = parseFloat(document.getElementById('i-precio').value) || 0;

    if (!obj || cant <= 0 || pre <= 0) {
        alert("¡Maestro! Asegúrate de poner el objeto, la cantidad y el precio.");
        return;
    }

    // Estructura de ítem optimizada para análisis de datos
    const nuevoItem = {
        id_item: Date.now(), // Para poder borrarlo si es necesario
        cantidad: cant,
        objeto: obj.trim(),
        detalle: det.trim(),
        precio_unitario: pre,
        subtotal: cant * pre
    };

    itemsOrden.push(nuevoItem);
    actualizarInterfaz();
    limpiarCamposItem();
}

function eliminarItem(idItem) {
    itemsOrden = itemsOrden.filter(item => item.id_item !== idItem);
    actualizarInterfaz();
}

// 4. CÁLCULOS FINANCIEROS (PRECISIÓN TOTAL)
function actualizarInterfaz() {
    const container = document.getElementById('lista-items');
    container.innerHTML = "";

    let subtotalGeneral = 0;

    itemsOrden.forEach(item => {
        subtotalGeneral += item.subtotal;
        container.innerHTML += `
            <div class="item-reparacion" style="background:#1a1a1a; padding:15px; border-radius:10px; border-left:4px solid var(--gold); margin-bottom:10px; position:relative;">
                <b style="color:var(--gold);">${item.cantidad}x</b> <b>${item.objeto}</b>
                <p style="font-size:0.8rem; margin:5px 0; color:#aaa;">${item.detalle}</p>
                <div style="font-weight:bold;">$${item.subtotal.toFixed(2)}</div>
                <i class="fas fa-trash" style="position:absolute; top:15px; right:15px; color:#ff5252; cursor:pointer;" onclick="eliminarItem(${item.id_item})"></i>
            </div>
        `;
    });

    const descuento = parseFloat(document.getElementById('i-descuento').value) || 0;
    const iva = subtotalGeneral * IVA_VALOR;
    const total = (subtotalGeneral + iva) - descuento;

    // Inyectar en el HTML
    document.getElementById('res-sub').innerText = subtotalGeneral.toFixed(2);
    document.getElementById('res-iva').innerText = iva.toFixed(2);
    document.getElementById('res-total').innerText = total.toFixed(2);
}

// 5. GUARDADO MAESTRO (CONEXIÓN CON EL CORE)
async function guardarOrdenMaestra() {
    if (itemsOrden.length === 0) {
        alert("Añade al menos un objeto para reparar.");
        return;
    }

    const tel = document.getElementById('c-whatsapp').value;
    if (!tel || tel.length < 8) {
        alert("Necesitamos un número de WhatsApp válido.");
        return;
    }

    try {
        const zapatero = JSON.parse(localStorage.getItem('session_jadi'));
        
        // Usamos el CORE de modal_trabajos.js
        const cliente = await JADI_CORE.gestionarUsuario(tel, 'CLN');
        const transID = await JADI_CORE.generarIDTransaccion(zapatero.id, cliente.id);

        // EL PAQUETE DE DATOS (EL ORO PARA LA IA)
        const payload = {
            orden_n: transID,
            meta: {
                fecha_iso: new Date().toISOString(),
                timestamp: firebase.database.ServerValue.TIMESTAMP,
                version: "1.0-AI-Ready"
            },
            cliente: {
                uid: cliente.id,
                whatsapp: tel
            },
            zapatero_uid: zapatero.id,
            inventario: itemsOrden, // La lista detallada
            finanzas: {
                subtotal: parseFloat(document.getElementById('res-sub').innerText),
                iva: parseFloat(document.getElementById('res-iva').innerText),
                descuento: parseFloat(document.getElementById('i-descuento').value) || 0,
                total: parseFloat(document.getElementById('res-total').innerText)
            },
            estado_global: "recibido"
        };

        await JADI_CORE.guardarEnDB(`transacciones/${transID}`, payload);
        
        alert("¡Orden Guardada! Ticket: " + transID);
        location.reload(); // Limpiamos todo para la siguiente

    } catch (e) {
        console.error("Error en Nueva Orden:", e);
        alert("Hubo un problema al guardar. Revisa la consola.");
    }
}

function limpiarCamposItem() {
    document.getElementById('i-objeto').value = "";
    document.getElementById('i-detalle').value = "";
    document.getElementById('i-precio').value = "";
    document.getElementById('i-cantidad').value = 1;
    document.getElementById('i-objeto').focus();
}

// Escuchar cambios en el descuento para actualizar el total al instante
document.getElementById('i-descuento').addEventListener('input', actualizarInterfaz);
