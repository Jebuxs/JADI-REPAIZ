/**
 * JADI REPAIZ - SISTEMA DE ESTILO MULTI-TEMA
 * Versiones: Elegante, Azul Eléctrico, Tomate, Verde Fosfo, Estándar
 */

const JadiEstilo = {
    // Configuración de los temas
    temas: {
        elegante: {
            fondo: '#000000',
            tarjeta: '#1a1a1a',
            primario: '#D4AF37', // Dorado
            texto: '#ffffff',
            boton: '#D4AF37',
            textoBoton: '#000000'
        },
        azul: {
            fondo: '#001f3f',
            tarjeta: '#003366',
            primario: '#0074D9', // Azul Eléctrico
            texto: '#ffffff',
            boton: '#0074D9',
            textoBoton: '#ffffff'
        },
        tomate: {
            fondo: '#2d1400',
            tarjeta: '#4d2600',
            primario: '#FF6347', // Tomate
            texto: '#ffffff',
            boton: '#FF6347',
            textoBoton: '#ffffff'
        },
        verde: {
            fondo: '#0a1a0a',
            tarjeta: '#142d14',
            primario: '#39FF14', // Verde Fosfo
            texto: '#ffffff',
            boton: '#39FF14',
            textoBoton: '#000000'
        },
        estandar: {
            fondo: '#f4f4f4',
            tarjeta: '#ffffff',
            primario: '#333333', // Gris oscuro/Negro estándar
            texto: '#333333',
            boton: '#007bff',
            textoBoton: '#ffffff'
        }
    },

    // Función para aplicar el traje visual
    aplicar(nombreTema = 'elegante') {
        const t = this.temas[nombreTema] || this.temas.elegante;
        
        const css = `
            body { 
                background-color: ${t.fondo} !important; 
                color: ${t.texto} !important; 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                margin: 0; padding: 20px;
            }
            .card-jadi {
                background-color: ${t.tarjeta};
                border-radius: 15px;
                padding: 25px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                max-width: 500px;
                margin: auto;
                border: 1px solid ${t.primario}33;
            }
            h2 { color: ${t.primario}; text-align: center; text-transform: uppercase; }
            label { display: block; margin-top: 15px; font-weight: bold; color: ${t.primario}; }
            input, select, textarea {
                width: 100%; padding: 12px; margin-top: 5px;
                background: ${nombreTema === 'estandar' ? '#fff' : '#222'};
                border: 1px solid ${t.primario};
                border-radius: 8px; color: ${t.texto};
                box-sizing: border-box;
            }
            button {
                width: 100%; padding: 15px; margin-top: 25px;
                background-color: ${t.boton};
                color: ${t.textoBoton};
                border: none; border-radius: 8px;
                font-weight: bold; cursor: pointer;
                transition: transform 0.2s;
            }
            button:hover { transform: scale(1.02); opacity: 0.9; }
        `;

        // Inyectar el CSS al estilo de la página
        let styleTag = document.getElementById('jadi-style-tag');
        if (!styleTag) {
            styleTag = document.createElement('style');
            styleTag.id = 'jadi-style-tag';
            document.head.appendChild(styleTag);
        }
        styleTag.innerHTML = css;
    }
};

// Se ejecuta automáticamente al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    // Aquí puedes cambiar 'elegante' por 'azul', 'tomate', etc.
    JadiEstilo.aplicar('elegante'); 
});
