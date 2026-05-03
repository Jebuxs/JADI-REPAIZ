/**
 * JADI CORE V3 - Arquitectura Global Consolidada
 * Gestiona: Países, Usuarios con IDs de 9 dígitos y Transacciones Relacionales.
 */

const JADI_CORE = {
    // 1. CONFIGURACIÓN DE ENTORNO
    paisActual: "ecuador", 
    raiz: "ecosistema",

    // 2. CONSTRUCTOR DE RUTAS
    // Mantiene todo dentro de /ecosistema/pais/coleccion
    path: function(coleccion) {
        return `${this.raiz}/${this.paisActual}/${coleccion}`;
    },

    // 3. GESTIÓN DE USUARIOS (El curso normal de registro)
    // Funciona igual si lo registra un Zapatero, Tienda, Proveedor o el mismo Cliente
    async registrarUsuario(id, datos) {
        const ruta = `${this.path('usuarios')}/${id}`;
        return firebase.database().ref(ruta).update({
            ...datos,
            uid: id,
            pais: this.paisActual,
            online: datos.online || false, // Estado de conexión interno, no carpeta
            ultimaConexion: firebase.database.ServerValue.TIMESTAMP
        });
    },

    // 4. CONTADOR GLOBAL DE USUARIOS
    // Genera el número secuencial para IDs tipo ZPT000000001
    async obtenerContadorGlobal(rol) {
        const ruta = `${this.path('contadores')}/${rol}`;
        const ref = firebase.database().ref(ruta);
        
        const resultado = await ref.transaction((valorActual) => {
            return (valorActual || 0) + 1;
        });
        return resultado.snapshot.val();
    },

    // 5. GESTIÓN DE TRANSACCIONES (La lógica que pediste)
    // Formato de ID: ORIGEN_DESTINO-NUMERO (Ej: ZPT1_CLN25-1)
    async nuevaTransaccion(idOrigen, idDestino, info) {
        // Obtenemos el número correlativo de esta relación específica
        const numeroTransaccion = await this.obtenerContadorRelacion(idOrigen, idDestino);
        
        // Construimos el ID según tu requerimiento: ORIGEN_DESTINO-NUMERO
        const idCompuesto = `${idOrigen}_${idDestino}-${numeroTransaccion}`;
        const ruta = `${this.path('transacciones')}/${idCompuesto}`;
        
        return firebase.database().ref(ruta).set({
            ...info,
            idTransaccion: idCompuesto,
            origen: idOrigen,
            destino: idDestino,
            numRelacional: numeroTransaccion,
            fecha: firebase.database.ServerValue.TIMESTAMP
        });
    },

    // 6. CONTADOR PRIVADO DE RELACIONES
    // Maneja cuántas veces A le ha vendido o comprado a B
    async obtenerContadorRelacion(origen, destino) {
        // Usamos un guión bajo para la carpeta del contador para mantener orden
        const llaveRelacion = `${origen}_${destino}`;
        const rutaContador = `${this.path('contadores_relaciones')}/${llaveRelacion}`;
        const ref = firebase.database().ref(rutaContador);
        
        const resultado = await ref.transaction((valorActual) => {
            return (valorActual || 0) + 1;
        });
        return resultado.snapshot.val();
    },

    // 7. UTILIDAD: LIMPIEZA VISUAL DE ID
    // Para que en el Dashboard diga "ZPT1" y no "ZPT000000001"
    formatearIDVisual: function(uid) {
        if (!uid) return "";
        const prefijo = uid.substring(0, 3);
        const numero = parseInt(uid.substring(3));
        // public/js/core.js

