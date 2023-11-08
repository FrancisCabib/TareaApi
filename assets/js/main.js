// Seleccionamos los elementos del DOM necesarios para la conversión
const selectOrigen = document.querySelector("#divisaOrigen");
const selectDestino = document.querySelector("#divisaDestino");
const inputCantidad = document.querySelector("#montoConvertir");
const botonConvertir = document.querySelector("#botonConvertir");
const divResultado = document.querySelector("#valorConvertido");
const divError = document.querySelector("#mensajeError");
const canvasGrafico = document.querySelector("#graficoHistorial");
let graficoHistorial;

botonConvertir.addEventListener("click", () => {
    obtenerIndicador(inputCantidad.value, selectOrigen.value, selectDestino.value);
});

async function obtenerIndicador(cantidad, monedaOrigen, monedaDestino) {
    try {
        const respuesta = await fetch("https://mindicador.cl/api");
        const datos = await respuesta.json();
        calcularResultado(datos, cantidad, monedaOrigen, monedaDestino);
    } catch (e) {
        divError.textContent = `¡Uy! algo salió mal: ${e.message}`;
    }
}

function calcularResultado(datos, cantidad, monedaOrigen, monedaDestino) {
    let resultadoConversion = 0;
    cantidad = parseFloat(cantidad);

    if (monedaOrigen !== "clp") {
        cantidad *= datos[monedaOrigen].valor;
    }

    if (monedaDestino !== "clp") {
        resultadoConversion = (cantidad / datos[monedaDestino].valor).toFixed(2);
    } else {
        resultadoConversion = cantidad.toFixed(2);
    }

    divResultado.textContent = `Total recibido: ${resultadoConversion}`;
    graficar(datos, monedaDestino);
}
async function graficar(datos, monedaDestino) {
    const datosGrafica = await obtenerUltimosValores(datos, monedaDestino);

    if (graficoHistorial) {
        graficoHistorial.destroy();
    }

    const configuracion = {
        type: 'line',
        data: {
            labels: datosGrafica.fechas,
            datasets: [{
                label: `Valor de ${monedaDestino.toUpperCase()}`,
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                data: datosGrafica.valores,
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        }
    };

    graficoHistorial = new Chart(canvasGrafico, configuracion);
}

async function obtenerUltimosValores(datos, monedaDestino) {
    let fechas = [];
    let valores = [];
    try {
        const respuesta = await fetch(`https://mindicador.cl/api/${monedaDestino}`);
        const datosMoneda = await respuesta.json();

        datosMoneda.serie.slice(0, 10).forEach(item => {
            fechas.push(item.fecha.substring(0, 10));
            valores.push(item.valor);
        });
    } catch (e) {
        divError.textContent = `¡Upsi, algo salió mal al momento de gráficar! Error: ${e.message}`;
    }
    return { fechas, valores };
}
