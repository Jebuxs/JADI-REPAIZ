/**
 * JADI REPAIZ - SISTEMA DE ALIMENTACIÓN DE IA (CEREBRO MÁGICO)
 * Seguridad de Alto Nivel: Validación de RolCodigo + Firebase Auth
 */

const JadiIA_Alimentador = {
    // Categorías maestras para el entrenamiento
    categoriasValidas: ['calzado', 'marroquineria', 'prendas_cuero', 'limpieza', 'otros'],

    /**
     * Función principal: Envía un caso de éxito a la base de entrenamiento
     */
    async alimentarConocimiento(datos) {
        try {
            // 1. SEGURIDAD DE ACCESO
            const user = firebase.auth().currentUser;
            
            if (!user) {
                throw new Error("Acceso denegado: Debes iniciar sesión con Google.");
            }

            // 2. VALIDACIÓN DE ROL (CONEXIÓN DIRECTA CON TU BD)
            // IMPORTANTE: Buscamos en la ruta de usuarios el UID del que está logueado
            const userSnap = await firebase.database().ref(`usuarios/${user.uid}`).once('value');
            const userData = userSnap.val();

            // REVISIÓN MAESTRA: Usamos 'rolCodigo' y aceptamos 'ADM' o 'zapatero'
            if (!userData || (userData.rolCodigo !== 'zapatero' && userData.rolCodigo !== 'ADM')) {
                throw new Error("Seguridad Nivel 1: No tienes permisos de entrenamiento (Rol no válido).");
            }

            // 3. INTEGRIDAD DE DATOS
            if (!this.categoriasValidas.includes(datos.categoria)) {
                throw new Error("Datos corruptos: Categoría de material no válida.");
            }

            // 4. ESTRUCTURA PARA EL JSON DE ENTRENAMIENTO
            const paqueteEntrenamiento = {
                metadata: {
                    fecha: firebase.database.ServerValue.TIMESTAMP,
                    autor: user.uid,
                    nombre_autor: userData.nombre || 'Maestro J.A.D.I',
                    pais: userData.pais || 'Ecuador',
                    version_ia: "v1.0_jadi_repaiz"
                },
                datos_aprendizaje: {
                    foto_url: datos.url_foto,
                    hash_visual: datos.hash, 
                    descripcion_maestra: datos.descripcion.toLowerCase().trim(),
                    categoria_objeto: datos.categoria,
                    tipo_reparacion: datos.tipo_trabajo, 
                    material_detectado: datos.material 
                },
                estado: "pendiente_validacion" 
            };

            // 5. ENVÍO A LA BÓVEDA (Cola de aprendizaje)
            await firebase.database().ref('entrenamiento_ia/cola_aprendizaje').push(paqueteEntrenamiento);

            console.log("✅ Conocimiento JADI guardado. ¡La IA de J.A.D.I REPAIZ es más inteligente!");
            return { success: true, message: "Caso enviado a revisión con éxito." };

        } catch (error) {
            console.error("🚨 ERROR DE SEGURIDAD JADI:", error.message);
            return { success: false, error: error.message };
        }
    }
};
