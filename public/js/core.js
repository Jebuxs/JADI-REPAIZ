/**
 * JADI CORE V2 - Motor Global por Países
 */
const JADI_CORE = {
    // Configuramos el país (esto lo puedes cambiar dinámicamente luego)
    paisActual: "ecuador", 

    // Generador de rutas maestras
    path: function(coleccion) {
        // Retorna: ecosistema/ecuador/usuarios, etc.
        return `ecosistema/${this.paisActual}/${coleccion}`;
    },

    // 1. GESTIÓN DE IDENTIDAD (Login / Registro)
    async registrarUsuario(id, datos) {
        const ruta = `${this.path('usuarios')}/${id}`;
        return firebase.database().ref(ruta).update({
            ...datos,
            ultimaConexion: firebase.database.ServerValue.TIMESTAMP
        });
    },

    // 2. GESTIÓN DE TRANSACCIONES (Órdenes / Ventas)
    async nuevaTransaccion(idOrigen, idDestino, info) {
        const idRelacion = await this.obtenerContadorRelacion(idOrigen, idDestino);
        const ruta = `${this.path('transacciones')}/${idRelacion}`;
        
        return firebase.database().ref(ruta).set({
            ...info,
            fecha: firebase.database.ServerValue.TIMESTAMP
        });
    },

    // 3. CONTADOR DE RELACIONES (Para el ID compuesto)
    async obtenerContadorRelacion(origen, destino) {
        const rutaContador = `${this.path('contadores')}/${origen}_${destino}`;
        const ref = firebase.database().ref(rutaContador);
        const snapshot = await ref.once('value');
        let cuenta = (snapshot.val() || 0) + 1;
        await ref.set(cuenta);
        return `${origen}_${destino}_${cuenta}`;
    }
};
