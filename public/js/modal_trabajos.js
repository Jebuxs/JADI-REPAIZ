// Estructura base de una orden en J.A.D.I
let ordenActual = {
    id: null, // Null si es nueva
    uidCliente: null,
    uidZapatero: null,
    fechaCreacion: null,
    status: 'Pendiente', // Pendiente, En Proceso, Terminado, Entregado
    cliente: {
        celular: '',
        nombre: ''
    },
    trabajos: [
        // { cant: 1, item: 'Zapato', detalle: 'Cambio suela', precio: 15.00 }
    ],
    totales: {
        cobrado: 0,
        abono: 0,
        saldo: 0
    }
};
