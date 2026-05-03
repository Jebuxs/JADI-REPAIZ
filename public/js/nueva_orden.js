/**
 * CEREBRO: nueva_orden.js
 * Ubicación: public/js/nueva_orden.js
 */

let itemsOrden = [];
const IVA_TASA = 0.15;

function generarVistaPreviaID() {
    const tel = document.getElementById('c-whatsapp').value;
    const display = document.getElementById('display-order-id');
    if(tel.length >= 4) {
        display.innerText = "ORD-" + tel.slice(-4);
    } else {
        display.innerText = "---";
    }
}

function añadirItem() {
    const obj = document.getElementById('i-objeto').value;
    const cant = parseInt(document.getElementById('i-cantidad').value) || 1;
    const det = document.getElementById('i-detalle').value;
    const pre = parseFloat(document.getElementById('i-precio').value) || 0;

    if (!obj || pre <= 0) {
        alert("Por favor, ingresa el nombre del objeto y el precio.");
        return;
    }

    const item = {
        id: Date.now(),
        objeto: obj,
        cantidad: cant,
        detalle: det,
        precioUnitario: pre,
        subtotal: cant * pre
    };

    itemsOrden.push(item);
    renderizarLista();
    limpiarCampos();
}

function eliminarItem(id) {
    itemsOrden = itemsOrden.filter(i => i.id !== id);
    renderizarLista();
}

function renderizarLista() {
    const lista = document.getElementById('lista-items');
    lista.innerHTML = "";
    let subtotal = 0;

    itemsOrden.forEach(item => {
        subtotal += item.subtotal;
        lista.innerHTML += `
            <div class="item-row">
                <b>${item.cantidad}x ${item.objeto}</b>
                <p>${item.detalle}</p>
                <div class="price">$${item.subtotal.toFixed(2)}</div>
                <div class="remove" onclick="eliminarItem(${item.id})">✖</div>
            </div>
        `;
    });

    actualizarTotales(subtotal);
}

function actualizarTotales(subManual = null) {
    let subtotal = subManual !== null ? subManual : itemsOrden.reduce((acc, i) => acc + i.subtotal, 0);
    let desc = parseFloat(document.getElementById('i-descuento').value) || 0;
    let iva = subtotal * IVA_TASA;
    let total = (subtotal + iva) - desc;

    document.getElementById('res-sub').innerText = subtotal.toFixed(2);
    document.getElementById('res-iva').innerText = iva.toFixed(2);
    document.getElementById('res-total').innerText = total.toFixed(2);
}

function limpiarCampos() {
    document.getElementById('i-objeto').value = "";
    document.getElementById('i-detalle').value = "";
    document.getElementById('i-precio').value = "";
    document.getElementById('i-cantidad').value = "1";
}

async function guardarOrdenFinal() {
    const tel = document.getElementById('c-whatsapp').value;
    if (itemsOrden.length === 0) return alert("La orden está vacía.");
    if (tel.length < 8) return alert("Ingresa un número de WhatsApp válido.");

    try {
        const sesion = JSON.parse(localStorage.getItem('session_jadi')) || { id: "ZPT-001" };
        
        // Llamada al CORE (public/js/core.js)
        const clienteID = "CLN-" + tel; 
        const transID = await JADI_CORE.generarIDTransaccion(sesion.id, clienteID);

        const data = {
            id_orden: transID,
            fecha: new Date().toISOString(),
            zapatero_id: sesion.id,
            cliente_whatsapp: tel,
            items: itemsOrden,
            financiero: {
                subtotal: parseFloat(document.getElementById('res-sub').innerText),
                iva: parseFloat(document.getElementById('res-iva').innerText),
                descuento: parseFloat(document.getElementById('i-descuento').value) || 0,
                total: parseFloat(document.getElementById('res-total').innerText)
            },
            estado: "recibido"
        };

        await JADI_CORE.guardar('transacciones/' + transID, data);
        alert("✅ Orden Guardada: " + transID);
        location.reload();

    } catch (e) {
        console.error(e);
        alert("Error al guardar: " + e.message);
