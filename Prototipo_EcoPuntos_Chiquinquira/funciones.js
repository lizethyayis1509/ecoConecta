
/* =====================================
   1. INFORMACIÓN DE LOS MATERIALES
===================================== */

const materiales = {
    "Papel": {
        emoji: "📄",
        color: "#4b9bd5",
        info: "Hojas, periódicos y revistas limpias y secas."
    },

    "Cartón": {
        emoji: "📦",
        color: "#b58a55",
        info: "Cajas y cartón limpio, seco y preferiblemente plegado."
    },

    "Plástico": {
        emoji: "🧴",
        color: "#e4a52b",
        info: "Botellas y envases plásticos vacíos y limpios."
    },

    "Vidrio": {
        emoji: "🍾",
        color: "#299b70",
        info: "Frascos y botellas de vidrio vacíos. Manipúlalos con cuidado."
    },

    "Metal": {
        emoji: "🥫",
        color: "#89939b",
        info: "Latas y envases metálicos vacíos y limpios."
    }
};


/* =====================================
   2. RECUPERAR REGISTROS GUARDADOS
===================================== */

let registros = JSON.parse(
    localStorage.getItem("registrosEcoPuntos") || "[]"
);


/* =====================================
   3. MOSTRAR LOS CINCO CONTENEDORES
===================================== */

function mostrarContenedores() {

    const zona = document.getElementById("contenedores");

    zona.innerHTML = "";

    for (const nombre in materiales) {

        const material = materiales[nombre];

        zona.innerHTML += `
            <div class="contenedor-residuo"
                 style="border-top-color:${material.color}">

                <div class="emoji">${material.emoji}</div>

                <h3>${nombre}</h3>

                <p>${material.info}</p>

            </div>
        `;
    }
}


/* =====================================
   4. CONSULTAR INFORMACIÓN QR
===================================== */

function consultarQR(nombre) {

    const material = materiales[nombre];

    const texto = nombre + ": " + material.info;

    const qr = "https://api.qrserver.com/v1/create-qr-code/?size=180x180&data="
        + encodeURIComponent(texto);

    document.getElementById("informacionQR").innerHTML = `
        <h3>${material.emoji} ${nombre}</h3>

        <p>${material.info}</p>

        <img src="${qr}" alt="Código QR de ${nombre}">

        <p>Escanea este código para consultar las instrucciones.</p>
    `;
}


/* =====================================
   5. GUARDAR REGISTROS
===================================== */

function guardarRegistros() {

    localStorage.setItem(
        "registrosEcoPuntos",
        JSON.stringify(registros)
    );
}


/* =====================================
   6. REGISTRAR RESIDUOS
===================================== */

document.getElementById("formulario").addEventListener("submit", function(event) {

    event.preventDefault();

    const material = document.getElementById("material").value;

    const cantidad = Number(
        document.getElementById("cantidad").value
    );

    if (!material || !Number.isFinite(cantidad) || cantidad <= 0) {

        alert("Ingresa un material y una cantidad válida.");

        return;
    }

    const registro = {
        material: material,
        cantidad: cantidad,
        fecha: new Date().toLocaleString("es-CO"),
        tiempo: Date.now()
    };

    registros.push(registro);

    guardarRegistros();

    document.getElementById("mensaje").textContent =
        "¡Registro realizado correctamente!";

    document.getElementById("formulario").reset();

    actualizarSistema();
});


/* =====================================
   7. CALCULAR ESTADÍSTICAS
===================================== */

function actualizarEstadisticas() {

    const total = registros.reduce(
        (suma, r) => suma + r.cantidad,
        0
    );

    document.getElementById("totalKg").textContent =
        total.toFixed(2) + " kg";

    document.getElementById("totalRegistros").textContent =
        registros.length;

    const cantidades = {};

    for (const nombre in materiales) {
        cantidades[nombre] = 0;
    }

    registros.forEach(r => {

        if (cantidades[r.material] !== undefined) {
            cantidades[r.material] += r.cantidad;
        }

    });

    let mayor = "-";
    let maximo = 0;

    for (const nombre in cantidades) {

        if (cantidades[nombre] > maximo) {

            maximo = cantidades[nombre];

            mayor = nombre;
        }
    }

    document.getElementById("materialMayor").textContent = mayor;

    const grafico = document.getElementById("grafico");

    grafico.innerHTML = "";

    for (const nombre in materiales) {

        const cantidad = cantidades[nombre];

        const porcentaje = total > 0
            ? (cantidad / total) * 100
            : 0;

        grafico.innerHTML += `
            <p>
                <strong>${nombre}: ${cantidad.toFixed(2)} kg</strong>
            </p>

            <div class="barra-fondo">

                <div class="barra"
                     style="width:${porcentaje}%; background:${materiales[nombre].color}">
                </div>

            </div>
        `;
    }
}


/* =====================================
   8. MOSTRAR HISTORIAL
===================================== */

function actualizarHistorial() {

    const tabla = document.getElementById("historial");

    tabla.innerHTML = "";

    registros.forEach((r, i) => {

        tabla.innerHTML += `
            <tr>
                <td>${i + 1}</td>
                <td>${r.material}</td>
                <td>${r.cantidad.toFixed(2)}</td>
                <td>${r.fecha}</td>
            </tr>
        `;

    });
}


/* =====================================
   9. GRÁFICO DE DISPERSIÓN
===================================== */

function actualizarDispersion() {

    const zona = document.getElementById("graficoDispersión");

    if (registros.length === 0) {

        zona.innerHTML = "<p>No hay datos para graficar.</p>";

        return;
    }

    const maximo = Math.max(
        ...registros.map(r => r.cantidad),
        1
    );

    const ancho = 600;
    const alto = 250;
    const margen = 40;

    const puntos = registros.map((r, i) => {

        const x = registros.length === 1
            ? ancho / 2
            : margen + i * (ancho - 2 * margen) / (registros.length - 1);

        const y = alto - margen -
            (r.cantidad / maximo) * (alto - 2 * margen);

        return {
            x,
            y,
            cantidad: r.cantidad,
            numero: i + 1
        };
    });

    let dibujo = `
        <h3>Dispersión: número de prueba vs. cantidad (kg)</h3>

        <svg class="grafico-svg"
             viewBox="0 0 ${ancho} ${alto}">

            <line x1="${margen}" y1="${alto - margen}"
                  x2="${ancho - margen}" y2="${alto - margen}"
                  stroke="#555"/>

            <line x1="${margen}" y1="${margen}"
                  x2="${margen}" y2="${alto - margen}"
                  stroke="#555"/>

            <text x="10" y="18" font-size="12">kg</text>

            <text x="${ancho / 2}" y="${alto - 5}"
                  text-anchor="middle" font-size="12">
                Número de prueba
            </text>
    `;

    puntos.forEach(p => {

        dibujo += `
            <circle cx="${p.x}" cy="${p.y}" r="6" fill="#218653">

                <title>
                    Prueba ${p.numero}: ${p.cantidad} kg
                </title>

            </circle>
        `;
    });

    dibujo += "</svg>";

    zona.innerHTML = dibujo;
}


/* =====================================
   10. CARGAR DATOS DE PRUEBA
===================================== */

document.getElementById("prueba").addEventListener("click", function() {

    const datosPrueba = [

        { material: "Papel", cantidad: 2 },

        { material: "Cartón", cantidad: 3 },

        { material: "Plástico", cantidad: 4 },

        { material: "Vidrio", cantidad: 1.5 },

        { material: "Metal", cantidad: 2.5 }

    ];

    datosPrueba.forEach(d => {

        registros.push({

            ...d,

            fecha: new Date().toLocaleString("es-CO"),

            tiempo: Date.now()

        });

    });

    guardarRegistros();

    actualizarSistema();

    document.getElementById("mensaje").textContent =
        "Datos de prueba cargados correctamente.";

});


/* =====================================
   11. ELIMINAR REGISTROS
===================================== */

document.getElementById("limpiar").addEventListener("click", function() {

    if (confirm("¿Deseas borrar todos los registros?")) {

        registros = [];

        guardarRegistros();

        actualizarSistema();

        document.getElementById("mensaje").textContent =
            "Los registros fueron eliminados.";

    }

});


/* =====================================
   12. ACTUALIZAR TODO EL SISTEMA
===================================== */

function actualizarSistema() {

    actualizarEstadisticas();

    actualizarHistorial();

    actualizarDispersion();

    const total = registros.reduce(
        (suma, r) => suma + r.cantidad,
        0
    );

    document.getElementById("resultadoPruebas").textContent =

        registros.length > 0

            ? "El sistema ha realizado " + registros.length +
              " registros y ha procesado " +
              total.toFixed(2) + " kg de residuos."

            : "Realiza registros para observar los resultados del sistema.";
}


/* =====================================
   13. INICIALIZAR EL SISTEMA
===================================== */

mostrarContenedores();

actualizarSistema();
