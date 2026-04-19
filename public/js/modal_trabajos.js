// --- GESTOR DE ESTADO JADI-REPAIZ ---
const JADI_MODAL = {
    carrito: [],
    modo: 'crear', // 'crear' o 'editar'
    ordenId: null,

    // Inicializar listeners globales
    init: function() {
        console.log("JADI Modal Inicializado");
    },

    // Renderizado dinámico del área de trabajo
    renderAreaI: function() {
        const container = document.getElementById('modal-trabajos-container');
        container.innerHTML = `
            <div class="card-jadi">
                <h3>CREAR SOLICITUD DE REPARACIÓN</h3>
                <input type="number" id="m-cant" value="1" min="1">
                <input type="text" id="m-objeto" placeholder="Ej: Zapatillas">
                <input type="file" id="m-foto" accept="image/*">
                <textarea id="m-detalle" placeholder="Detalle del daño..."></textarea>
                <button onclick="JADI_MODAL.agregarAlListado()">+</button>
                <div id="m-listado"></div>
                <button id="btn-accion" onclick="JADI_MODAL.guardar()">SOLICITAR</button>
                <button onclick="JADI_MODAL.cerrar()">CANCELAR</button>
            </div>
        `;
    },

    agregarAlListado: function() {
        const item = {
            cant: document.getElementById('m-cant').value,
            objeto: document.getElementById('m-objeto').value,
            detalle: document.getElementById('m-detalle').value
        };
        this.carrito.push(item);
        this.actualizarUIListado();
    },

    actualizarUIListado: function() {
        const lista = document.getElementById('m-listado');
        lista.innerHTML = this.carrito.map((i, index) => `
            <div class="link-item" onclick="JADI_MODAL.cargarParaEdicion(${index})">
                ${i.cant} - ${i.objeto}
            </div>
        `).join('');
    },

    guardar: async function() {
        const session = JSON.parse(localStorage.getItem('session_jadi'));
        const nuevaOrden = {
            cliente: session.uid,
            trabajos: this.carrito,
            status: 'solicitado',
            fecha: Date.now()
        };

        // Firebase Update (Versátil: Crea o Actualiza)
        await firebase.database().ref('ordenes/' + (this.ordenId || Date.now())).update(nuevaOrden);
        this.cerrar();
    },

    cerrar: function() {
        document.getElementById('modal-trabajos-container').style.display = 'none';
    }
};
