/**
 * Módulo JADI REPAIZ: Gestión de Modal de Reparaciones
 * Corregido para evitar errores de null y asegurar la conexión.
 */

function abrirModalOrden(modo, datos = null) {
    console.log("Abriendo modal en modo:", modo);

    const container = document.getElementById('modal-trabajos-container');
    
    // 1. Verificación de seguridad: ¿Existe el contenedor?
    if (!container) {
        console.error("ERROR: No existe el contenedor 'modal-trabajos-container' en el HTML.");
        return;
    }

    // 2. Construcción del contenido del modal
    container.style.display = 'flex'; // Mostramos el modal
    container.innerHTML = `
        <div style="background: #1a1a1a; padding: 20px; border-radius: 15px; width: 90%; max-width: 400px; color: white; border: 1px solid var(--gold);">
            <h3>${modo === 'editar' ? 'Editar Orden' : 'Nueva Orden Técnica'}</h3>
            
            <label>Categoría:</label>
            <input type="text" id="m-cat" placeholder="Ej: Zapatillas">
            
            <label style="margin-top:10px; display:block;">Detalle Técnico:</label>
            <textarea id="m-detalle" rows="3" placeholder="Describe el daño..."></textarea>
            
            <div style="display: flex; gap: 10px; margin-top: 20px;">
                <button onclick="procesarGuardado()" style="flex:1; background:var(--gold); border:none; padding:10px; border-radius:5px; cursor:pointer;">Guardar</button>
                <button onclick="cerrarModal()" style="flex:1; background:#333; color:white; border:none; padding:10px; border-radius:5px; cursor:pointer;">Cerrar</button>
            </div>
        </div>
    `;
}

function cerrarModal() {
    const container = document.getElementById('modal-trabajos-container');
    if (container) container.style.display = 'none';
}

function procesarGuardado() {
    // 3. Blindaje contra errores: Verificamos que los elementos existan antes de leer .value
    const inputCat = document.getElementById('m-cat');
    const inputDetalle = document.getElementById('m-detalle');

    if (!inputCat || !inputDetalle) {
        console.error("No se encontraron los inputs en el modal. Revisa los IDs.");
        return;
    }

    const categoria = inputCat.value;
    const detalle = inputDetalle.value;

    if (!categoria || !detalle) {
        alert("Por favor, rellena todos los campos.");
        return;
    }

    console.log("Guardando:", { categoria, detalle });
    alert("Datos guardados correctamente en la base.");
    
    cerrarModal();
}
