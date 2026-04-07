/**
 * JADI REPAIZ - CONTROLADOR DE MODALES (NUEVA / EDITAR)
 */

const ModalMaestro = {
    
    init: function() {
        const ruta = window.location.pathname;
        const boton = document.getElementById('btn-accion-modal');

        if (!boton) return; // Si no hay botón en la página, no hace nada

        boton.addEventListener('click', () => {
            if (ruta.includes('nueva_orden.html')) {
                this.mensajeNueva();
            } 
            else if (ruta.includes('editar_orden.html')) {
                this.mensajeEditar();
            }
        });
    },

    mensajeNueva: function() {
        alert("✅ ¡Hola! Estás en el módulo de NUEVA ORDEN.");
        // Aquí luego abriremos el modal vacío
    },

    mensajeEditar: function() {
        alert("✏️ ¡Hola! Estás en el módulo de EDITAR ORDEN.");
        // Aquí luego cargaremos los datos en el modal
    }
};

// Escuchar cuando el HTML esté listo
document.addEventListener('DOMContentLoaded', () => {
    ModalMaestro.init();
});
