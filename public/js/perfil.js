// perfil.js - Gestión Universal de Usuarios J.A.D.I
// =================================================

const db = firebase.database();
const auth = firebase.auth();

// 1. Obtener sesión local
const session = JSON.parse(localStorage.getItem('session_jadi'));

/**
 * Inicializa la carga del perfil
 */
async function cargarPerfil() {
    if (!session) {
        window.location.href = "../../index.html";
        return;
    }

    const uid = session.uid;
    toggleLoader(true);

    try {
        // Consulta a la base de datos para obtener datos frescos
        const snapshot = await db.ref(`usuarios/${uid}`).once('value');
        const userData = snapshot.val();

        if (userData) {
            renderizarDatos(userData);
        } else {
            console.error("No se encontraron datos del usuario en Firebase.");
        }
    } catch (error) {
        alert("Error al cargar perfil: " + error.message);
    } finally {
        toggleLoader(false);
    }
}

/**
 * Inyecta los datos en el HTML
 * @param {Object} data Datos del usuario desde Firebase
 */
function renderizarDatos(data) {
    // Campos universales
    document.getElementById('p-nombre').value = data.nombre || "";
    document.getElementById('p-email').value = data.email || "";
    document.getElementById('p-telefono').value = data.telefono || "";
    document.getElementById('p-uid').innerText = data.uid || "ID No disponible";
    
    // Mostrar Rol con formato amigable
    const rolesNombres = {
        'ZPT': 'Maestro Zapatero',
        'CLN': 'Cliente Distinguido',
        'ADM': 'Administrador Maestro',
        'SHP': 'Gestor de Tienda',
        'PRV': 'Proveedor Aliado'
    };
    document.getElementById('p-rol-texto').innerText = rolesNombres[data.rolCodigo] || data.rolCodigo;

    // Lógica Condicional por Rol
    const seccionEmpresa = document.getElementById('seccion-empresa');
    if (['ZPT', 'SHP', 'PRV', 'ADM'].includes(data.rolCodigo)) {
        seccionEmpresa.style.display = 'block';
        document.getElementById('p-empresa').value = data.empresaNombre || "J.A.D.I REPAIZ";
    }

    // Si es cliente, mostrar puntos (widget especial)
    if (data.rolCodigo === 'CLN') {
        const puntosDiv = document.getElementById('p-puntos-container');
        if(puntosDiv) {
            puntosDiv.style.display = 'flex';
            document.getElementById('p-puntos').innerText = data.puntos || 0;
        }
    }
}

/**
 * Guarda las modificaciones en Firebase y actualiza la sesión local
 */
async function guardarCambios() {
    const nuevoNombre = document.getElementById('p-nombre').value;
    const nuevoTel = document.getElementById('p-telefono').value;
    const nuevaEmpresa = document.getElementById('p-empresa')?.value || "";

    if (!nuevoNombre || !nuevoTel) return alert("Nombre y teléfono son obligatorios.");

    toggleLoader(true);

    const actualizaciones = {
        nombre: nuevoNombre,
        telefono: nuevoTel,
        empresaNombre: nuevaEmpresa
    };

    try {
        // 1. Actualizar Firebase
        await db.ref(`usuarios/${session.uid}`).update(actualizaciones);

        // 2. Actualizar LocalStorage para que el Dashboard se refresque
        const nuevaSesion = { ...session, ...actualizaciones };
        localStorage.setItem('session_jadi', JSON.stringify(nuevaSesion));

        alert("Perfil actualizado correctamente.");
    } catch (error) {
        alert("Error al guardar: " + error.message);
    } finally {
        toggleLoader(false);
    }
}

function toggleLoader(show) {
    const loader = document.getElementById('loader');
    if (loader) loader.style.display = show ? 'flex' : 'none';
}

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', cargarPerfil);
