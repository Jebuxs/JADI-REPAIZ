/**
 * JADI CORE - Sistema Central de Identidad y Relaciones
 */

const JADI_CORE = {
    // 1. FORMATEO: Convierte internos (9 dígitos) a visuales (ej: CLN25)
    formatearID: function(prefijo, numeroInterno) {
        return `${prefijo}${parseInt(numeroInterno)}`;
    },

    // 2. IDENTIDAD: Gestiona el Portero (Login/Registro)
    gestionarUsuario: async function(telefono, rol) {
        const snapshot = await firebase.database().ref('usuarios')
            .orderByChild('telefono').equalTo(telefono).once('value');

        if (snapshot.exists()) {
            const id = Object.keys(snapshot.val())[0];
            return { existe: true, id: id, data: snapshot.val()[id] };
        } else {
            // Crea usuario nuevo con estatus pendiente
            const nuevoID = `${rol.toUpperCase()}-${Date.now()}`;
            const datos = { telefono, rol, estado: 'pendiente' };
            await firebase.database().ref('usuarios/' + nuevoID).set(datos);
            return { existe: false, id: nuevoID, data: datos };
        }
    },

    // 3. RELACIONES: Genera el ID transaccional (Origen_Destino_N)
    generarIDTransaccion: async function(origenID, destinoID) {
        const ruta = `transacciones_contadores/${origenID}_${destinoID}`;
        const ref = firebase.database().ref(ruta);
        
        const snapshot = await ref.once('value');
        let contador = snapshot.exists() ? snapshot.val() + 1 : 1;
        
        await ref.set(contador);
        return `${origenID}_${destinoID}_${contador}`;
    },

    // 4. CARTERO: Función genérica de Firebase
    guardarEnDB: function(ruta, datos) {
        return firebase.database().ref(ruta).set(datos);
    }
};
