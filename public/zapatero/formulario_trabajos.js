// --- CARGA DE SUGERENCIAS DESDE LA BD ---
function cargarSugerenciasBD() {
    // Buscamos en tu diccionario global de reparaciones
    db.ref('global_dictionary').on('value', snap => {
        const list = document.getElementById('lista-sugerencias');
        if(!list) return; // Por si no existe el datalist en el HTML
        list.innerHTML = "";
        if(snap.exists()){
            Object.keys(snap.val()).forEach(key => {
                list.innerHTML += `<option value="${key.toUpperCase()}">`;
            });
        }
    });
}

// --- MODIFICACIÓN EN iniciarModulo ---
async function iniciarModulo() {
    cargarSugerenciasBD(); // <-- Nueva función cargada al inicio
    
    // Cantidad predeterminada en 1 (Si tienes el input en el HTML)
    const inputCant = document.getElementById('item-cant');
    if(inputCant) inputCant.value = 1; 

    if (idEdicion) {
        document.getElementById('titulo-pagina').innerText = "Editar Orden";
        const btn = document.getElementById('btn-accion');
        btn.innerText = "ACTUALIZAR CAMBIOS";
        btn.style.background = "var(--edit)";
        await cargarDatosOrden();
    }
}

// --- MODIFICACIÓN EN bajarItem (Para incluir cantidad) ---
function bajarItem() {
    const cant = parseInt(document.getElementById('item-cant')?.value) || 1; // Cantidad predeterminada
    const tipo = document.getElementById('item-tipo').value.toUpperCase();
    const precio = parseFloat(document.getElementById('item-precio').value) || 0;
    const detalles = document.getElementById('item-detalles').value;
    const comprar = document.getElementById('item-comprar').value;

    if (!tipo) return;

    // Guardamos el tipo en el diccionario global para que aparezca como sugerencia la próxima vez
    db.ref('global_dictionary/' + tipo.toLowerCase()).set(true);

    itemsArray.push({ cant, tipo, precio, detalles, comprar });
    renderizarItems();
    
    // Limpiar campos y resetear cantidad a 1
    ['item-tipo', 'item-precio', 'item-detalles', 'item-comprar'].forEach(id => document.getElementById(id).value = "");
    if(document.getElementById('item-cant')) document.getElementById('item-cant').value = 1;
}
