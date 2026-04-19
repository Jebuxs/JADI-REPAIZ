// MODAL UNIVERSAL JADI-REPAIZ - MOTOR LOGICO
const JADI_MODAL = {
    carrito: [],
    modo: 'crear',
    ordenActual: null,

    // 1. GESTION DE AREAS (SIN PERDER DATOS)
    renderArea: function(area) {
        const container = document.getElementById('modal-trabajos-container');
        container.style.display = 'flex';
        
        if (area === 'reparar') {
            container.innerHTML = this.templateAreaI();
        } else {
            container.innerHTML = this.templateAreaII();
        }
    },

    // 2. TEMPLATES (AREA I - CREAR/EDITAR)
    templateAreaI: function() {
        return `
            <div class="card-jadi" style="background:#111; padding:20px; border-radius:15px; border:1px solid #fbc02d; color:white; width:90%; max-width:400px;">
                <h3>${this.modo === 'crear' ? 'CREAR SOLICITUD' : 'EDITAR SOLICITUD'}</h3>
                <input type="number" id="m-cant" value="1" style="width:100%; margin:5px 0;">
                <input type="text" id="m-objeto" placeholder="Objeto (ej. Mochila)" style="width:100%; margin:5px 0;">
                <textarea id="m-detalle" placeholder="Detalle del daño" style="width:100%; margin:5px 0;"></textarea>
                <button onclick="JADI_MODAL.agregarItem()" style="background:#fbc02d; width:100%;">+</button>
                <div id="m-lista-reparacion"></div>
                <button onclick="JADI_MODAL.guardarEnDB()" style="background:green; width:100%;">GUARDAR SOLICITUD</button>
                <button onclick="JADI_MODAL.cerrar()" style="background:#333; width:100%;">CANCELAR</button>
            </div>
        `;
    },

    // 3. LOGICA DE DATOS
    agregarItem: function() {
        const item = {
            cant: document.getElementById('m-cant').value,
            objeto: document.getElementById('m-objeto').value,
            detalle: document.getElementById('m-detalle').value
        };
        this.carrito.push(item);
        this.renderArea('reparar'); // Recarga para ver el nuevo item
    },

    // 4. PERSISTENCIA EN FIREBASE (ESPECIFICACION II)
    guardarEnDB: async function() {
        const session = JSON.parse(localStorage.getItem('session_jadi'));
        const idOrden = this.ordenActual || Date.now();

        const ordenData = {
            cliente: { nombre: "Usuario" }, // Traer de session
            trabajos: this.carrito,
            status: 'solicitado',
            fecha: new Date().toISOString()
        };

        try {
            // Guardado en dos rutas (Ordenes generales y usuario)
            await firebase.database().ref().update({
                ['/ordenes/' + idOrden]: ordenData,
                ['/usuarios/' + session.uid + '/mis_ordenes/' + idOrden]: true
            });
            alert("Solicitud guardada con éxito");
            this.cerrar();
        } catch (e) {
            console.error("Error:", e);
        }
    },

    cerrar: function() {
        document.getElementById('modal-trabajos-container').style.display = 'none';
    }
};
