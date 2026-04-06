/**
 * JADI REPAIZ - SISTEMA DE ALIMENTACIÓN DE IA (CEREBRO MAGÍCO)
 * Seguridad de Alto Nivel: Validación de Rol + Firebase Auth
 */

const JadiIA_Alimentador = {
    // Configuración de categorías maestras para que la IA no se confunda
    categoriasValidas: ['calzado', 'marroquineria', 'prendas_cuero', 'limpieza', 'otros'],

    /**
     * Función principal: Envía un caso de éxito a la base de entrenamiento
     */
    async alimentarConocimiento(datos) {
        try {
            // 1. SEGURIDAD DE ACCESO: ¿Quién intenta alimentar la IA?
            const user = firebase.auth().currentUser;
            
            if (!user) {
                throw new Error("Acceso denegado: Debes iniciar sesión.");
            }

            // 2. VALIDACIÓN DE ROL (Viene de tu base de usuarios en Firebase)
            const userSnap = await firebase.database().ref(`usuarios/${user.uid}`).once('value');
            const userData = userSnap.val();

            if (!userData || (userData.rol !== 'zapatero' && userData.rol !== 'super_admin')) {
                throw new Error("Seguridad Nivel 1: No tienes permisos de entrenamiento.");
            }

            // 3. INTEGRIDAD DE DATOS: Validar que la información sea útil
            if (!this.categoriasValidas.includes(datos.categoria)) {
                throw new Error("Datos corruptos: Categoría de material no válida.");
            }

            // 4. ESTRUCTURA DE ALTA CALIDAD PARA EL JASON DE ENTRENAMIENTO
            const paqueteEntrenamiento = {
                metadata: {
                    fecha: firebase.database.ServerValue.TIMESTAMP,
                    autor: user.uid,
                    pais: userData.pais || 'Ecuador', // Tu visión global
                    version_ia: "v1.0_jadi_repaiz"
                },
                datos_aprendizaje: {
                    foto_url: datos.url_foto,
                    hash_visual: datos.hash, // El "DNI" de la imagen que hablamos
                    descripcion_maestra: datos.descripcion.toLowerCase().trim(),
                    categoria_objeto: datos.categoria,
                    tipo_reparacion: datos.tipo_trabajo, // Ej: "Cambio de suela"
                    material_detectado: datos.material // Ej: "Cuero Vacuno"
                },
                estado: "pendiente_validacion" // Un Admin revisará antes de que la IA lo aprenda
            };

            // 5. ENVÍO A LA BÓVEDA DE ENTRENAMIENTO (Rama protegida)
            await firebase.database().ref('entrenamiento_ia/cola_aprendizaje').push(paqueteEntrenamiento);

            console.log("✅ Conocimiento JADI guardado con éxito. La IA será más inteligente mañana.");
            return { success: true, message: "Caso enviado a revisión." };

        } catch (error) {
            console.error("🚨 BRECHA DE SEGURIDAD O ERROR:", error.message);
            return { success: false, error: error.message };
        }
    }
};
