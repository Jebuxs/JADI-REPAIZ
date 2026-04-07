/**
 * JADI REPAIZ - CONTROLADOR ÚNICO DE MODALES (NUEVA / EDITAR)
 */

const ModalMaestro = {
    // Detectar en qué página estamos
    obtenerContexto: () => {
        const rutaActual = window.location.pathname;
        if (rutaActual.includes('nueva_orden.html')) return 'NUEVA';
        if (rutaActual.includes('editar_orden.html')) return 'EDITAR';
        return 'DESCONOCIDO';
    },

    // Inicializar el comportamiento
    init: function() {
        const contexto = this.obtenerContexto();

        if (contexto === 'NUEVA') {
            alert("¡Hola! Estás en: NUEVA ORDEN");
            this.configurarParaNueva();
        } 
        else if (contexto === 'EDITAR') {
            alert("¡Hola! Estás en: EDITAR ORDEN");
            this.configurarParaEditar();
        }
    },

    configurarParaNueva: function() {
        console.log("Configurando modal para ingreso de datos desde cero...");
        // Aquí irá la lógica para limpiar el formulario
    },

    configurarParaEditar: function() {
        console.log("Configurando modal para cargar datos existentes del JSON...");
        // Aquí irá la lógica para chupar los datos de Firebase y rellenar el modal
    }
};

// Se lanza solo cuando el HTML esté listo
document.addEventListener('DOMContentLoaded', () => {
    ModalMaestro.init();
});
