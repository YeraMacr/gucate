function verificarAutenticacion() {
    const userLogged = localStorage.getItem('userLogged');
    const userToken = localStorage.getItem('userToken');

    if (!userLogged || userLogged.toLowerCase() !== 'true' || !userToken) {
        localStorage.clear();
        window.location.href = '/login.html';
        return false;
    }

    try {
        const decoded = atob(userToken); // base64 decode
        const [id, fecha] = decoded.split('-');
        if (!id || !fecha) throw new Error("Token inválido");
    } catch (e) {
        console.error("❌ Token inválido:", e.message);
        localStorage.clear();
        window.location.href = '/login.html';
        return false;
    }

    return true;
}


function obtenerToken() {
    return localStorage.getItem('userToken');
}

function actualizarHora() {
    const hora = document.getElementById('hora-actual');
    if (hora) {
        hora.textContent = new Date().toLocaleTimeString();
    }
}

function calcularPerdidaEstimada() {
    const pesoInput = document.getElementById('peso');
    const perdidaSpan = document.getElementById('perdida-estimada');
    const peso = parseFloat(pesoInput?.value) || 0;
    const perdida = peso * 0.05;

    if (perdidaSpan) {
        perdidaSpan.textContent = `${perdida.toFixed(2)} kg`;
    }
}

function enviarEntrada(event) {
    event.preventDefault();

    const tipoAguacate = document.getElementById('tipoAguacate')?.value;
    const peso = document.getElementById('peso')?.value;
    const proveedor = document.getElementById('proveedor')?.value;
    const fecha = document.getElementById('fecha')?.value;

    if (!tipoAguacate || !peso || !proveedor || !fecha) {
        return mostrarError("Todos los campos son obligatorios");
    }

    const entrada = {
        tipo_aguacate: tipoAguacate,
        peso: parseFloat(peso),
        proveedor,
        fecha
    };

    fetch('http://localhost:3000/api/entradas', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${obtenerToken()}`
        },
        body: JSON.stringify(entrada)
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            limpiarFormulario('entradaForm');
            mostrarMensajeExito("Entrada registrada con éxito");
            actualizarGraficasConDatos();
            actualizarResumenSemanal();
        } else {
            mostrarError(data.message || "Error al registrar la entrada");
        }
    })
    .catch(err => {
        console.error(err);
        mostrarError("Error al conectar con el servidor");
    });
}

function enviarVenta(event) {
    event.preventDefault();

    const tipo = document.getElementById('tipoAguacateSalida')?.value;
    const peso = document.getElementById('pesoSalida')?.value;
    const precio = document.getElementById('precioVenta')?.value;
    const cliente = document.getElementById('cliente')?.value;
    const fecha = document.getElementById('fechaSalida')?.value;

    if (!tipo || !peso || !precio || !cliente || !fecha) {
        return mostrarError("Todos los campos son obligatorios");
    }

    const venta = {
        tipo_aguacate: tipo,
        peso_venta: parseFloat(peso),
        precio_venta: parseFloat(precio),
        cliente,
        fecha_venta: fecha
    };

    fetch('http://localhost:3000/api/venta', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${obtenerToken()}`
        },
        body: JSON.stringify(venta)
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            limpiarFormulario('salidaForm');
            mostrarMensajeExito("Venta registrada");
            actualizarGraficasConDatos();
            actualizarResumenSemanal();
        } else {
            mostrarError(data.message || "Error al registrar venta");
        }
    })
    .catch(err => {
        console.error(err);
        mostrarError("Error al conectar con el servidor");
    });
}
function generarFactura() {
    const tipo = document.getElementById('tipoAguacateSalida')?.value;
    const peso = document.getElementById('pesoSalida')?.value;
    const precio = document.getElementById('precioVenta')?.value;
    const cliente = document.getElementById('cliente')?.value;
    const fecha = document.getElementById('fechaSalida')?.value;

    if (!tipo || !peso || !precio || !cliente || !fecha) {
        return mostrarError("Todos los campos son obligatorios para generar la factura");
    }

    const total = parseFloat(peso) * parseFloat(precio);

    const doc = new window.jspdf.jsPDF();
    doc.setFontSize(16);
    doc.text("Factura de Venta - AvocAPP", 20, 20);
    doc.setFontSize(12);
    doc.text(`Fecha: ${fecha}`, 20, 35);
    doc.text(`Cliente: ${cliente}`, 20, 45);

    doc.autoTable({
        head: [["Tipo Aguacate", "Peso (kg)", "Precio x Kg", "Total"]],
        body: [[tipo, peso, `$${precio}`, `$${total.toFixed(2)}`]]
    });

    doc.text("Gracias por su compra.", 20, doc.lastAutoTable.finalY + 20);
    doc.save(`Factura_${cliente}_${fecha}.pdf`);
}


function generarReporteExcel() {
    fetch('http://localhost:3000/api/entradas', {
        headers: {
            'Authorization': `Bearer ${obtenerToken()}`
        }
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            const entradas = data.entradas;
            const wb = XLSX.utils.book_new();
            const wsData = [
                ["Fecha", "Tipo de Aguacate", "Peso", "Proveedor", "Usuario"]
            ];

            entradas.forEach(e => {
                wsData.push([e.fecha, e.tipoAguacate, e.peso, e.proveedor, e.usuario]);
            });

            const ws = XLSX.utils.aoa_to_sheet(wsData);
            XLSX.utils.book_append_sheet(wb, ws, "Entradas");
            XLSX.writeFile(wb, "Reporte_Entradas.xlsx");
        } else {
            mostrarError("No se pudo generar el reporte");
        }
    })
    .catch(err => {
        console.error(err);
        mostrarError("Error al generar reporte");
    });
}

function generarReportePDF() {
    const doc = new jsPDF();
    doc.text("Reporte de Entradas", 10, 10);
    doc.autoTable({
        head: [["Fecha", "Tipo", "Peso", "Proveedor", "Usuario"]],
        body: [],
    });

    fetch('http://localhost:3000/api/entradas', {
        headers: {
            'Authorization': `Bearer ${obtenerToken()}`
        }
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            const bodyData = data.entradas.map(e => [e.fecha, e.tipoAguacate, e.peso, e.proveedor, e.usuario]);
            doc.autoTable({
                head: [["Fecha", "Tipo", "Peso", "Proveedor", "Usuario"]],
                body: bodyData
            });
            doc.save("Reporte_Entradas.pdf");
        } else {
            mostrarError("No se pudo generar el PDF");
        }
    })
    .catch(err => {
        console.error(err);
        mostrarError("Error al generar PDF");
    });
}

function actualizarGraficasConDatos() {
    fetch('http://localhost:3000/api/entradas', {
        headers: {
            'Authorization': `Bearer ${obtenerToken()}`
        }
    })
    .then(res => res.json())
    .then(data => {
        if (data.success && data.entradas?.length > 0) {
            actualizarGraficaMovimientos(data.entradas);
            actualizarGraficaPerdidas(data.entradas);
        } else {
            limpiarGraficas();
        }
    })
    .catch(err => {
        console.error(err);
        mostrarError("Error al cargar gráficas");
    });
}

function limpiarGraficas() {
    if (window.ventasChart && typeof window.ventasChart.destroy === 'function') {
        window.ventasChart.destroy();
        window.ventasChart = null;
    }
    if (window.perdidasChart && typeof window.perdidasChart.destroy === 'function') {
        window.perdidasChart.destroy();
        window.perdidasChart = null;
    }
}

function actualizarGraficaMovimientos(datos) {
    const canvas = document.getElementById('ventasChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const tipos = [...new Set(datos.map(d => d.tipoAguacate))];
    const pesos = tipos.map(tipo =>
        datos.filter(d => d.tipoAguacate === tipo)
             .reduce((sum, d) => sum + parseFloat(d.peso), 0)
    );

    if (window.ventasChart && typeof window.ventasChart.destroy === 'function') {
        window.ventasChart.destroy();
    }

    window.ventasChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: tipos,
            datasets: [{
                label: 'Entradas (kg)',
                data: pesos,
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: { y: { beginAtZero: true } }
        }
    });
}

function actualizarGraficaPerdidas(datos) {
    const canvas = document.getElementById('perdidasChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const tipos = [...new Set(datos.map(d => d.tipoAguacate))];
    const perdidas = tipos.map(tipo =>
        datos.filter(d => d.tipoAguacate === tipo)
             .reduce((sum, d) => sum + parseFloat(d.peso), 0) * 0.05
    );

    if (window.perdidasChart && typeof window.perdidasChart.destroy === 'function') {
        window.perdidasChart.destroy();
    }

    window.perdidasChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: tipos,
            datasets: [{
                label: 'Pérdida estimada (kg)',
                data: perdidas,
                backgroundColor: 'rgba(255, 99, 132, 0.4)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 2,
                fill: true
            }]
        },
        options: {
            responsive: true,
            scales: { y: { beginAtZero: true } }
        }
    });
}

function cargarTiposAguacate() {
    const tipos = ['Criollo', 'Chokei', 'Semil', 'Papelillo'];
    const selects = document.querySelectorAll('.tipo-aguacate-select');

    selects.forEach(select => {
        select.innerHTML = '<option value="">Seleccione un tipo</option>';
        tipos.forEach(tipo => {
            const opt = document.createElement('option');
            opt.value = tipo;
            opt.textContent = tipo;
            select.appendChild(opt);
        });
    });
}

function limpiarFormulario(id) {
    document.getElementById(id)?.reset();
}

function mostrarError(msg) {
    const div = document.getElementById('mensaje-error');
    if (div) {
        div.textContent = msg;
        div.style.display = 'block';
        setTimeout(() => div.style.display = 'none', 3000);
    }
}

function mostrarMensajeExito(msg) {
    const div = document.getElementById('mensaje-exito');
    if (div) {
        div.textContent = msg;
        div.style.display = 'block';
        setTimeout(() => div.style.display = 'none', 3000);
    }
}

async function actualizarResumenSemanal() {
    const contenedor = document.querySelector('.resumen-container');
    if (!contenedor) return;

    try {
        const res = await fetch('/api/resumen-semanal');
        const data = await res.json();

        if (data.success) {
            contenedor.innerHTML = `
                <div class="tarjeta-resumen">
                    <h3>Resumen Semanal</h3>
                    <p>Total Entradas: <span>${data.totalEntradas} kg</span></p>
                    <p>Total Salidas: <span>${data.totalSalidas} kg</span></p>
                    <p>Balance: <span>${data.balance} kg</span></p>
                </div>
            `;
        } else {
            contenedor.innerHTML = `<p class="error">No se pudo cargar el resumen.</p>`;
        }
    } catch (error) {
        console.error("Error al obtener resumen semanal:", error);
        contenedor.innerHTML = `<p class="error">Error al conectar con el servidor.</p>`;
    }
}

function mostrarSeccion(id) {
    document.querySelectorAll('.seccion').forEach(s => s.style.display = 'none');
    document.getElementById(id).style.display = 'block';
    if (id === 'verGraficas') actualizarGraficasConDatos();
}

function filtrarMovimientos() {
    alert("Funcionalidad de filtro aún no implementada completamente.");
}

function cerrarSesion() {
    localStorage.removeItem("userLogged");
    localStorage.removeItem("userToken");
    window.location.href = "/login.html";
}
async function actualizarDisponible() {
    const tipo = document.getElementById('tipoAguacateSalida')?.value;
    const disponibleDiv = document.getElementById('disponibleInfo');

    if (!tipo) {
        disponibleDiv.textContent = '';
        return;
    }

    try {
        const res = await fetch(`http://localhost:3000/api/disponible/${tipo}`, {
            headers: { 'Authorization': `Bearer ${obtenerToken()}` }
        });
        const data = await res.json();

        if (data.success) {
            disponibleDiv.textContent = `Disponible: ${data.disponible.toFixed(2)} kg`;
        } else {
            disponibleDiv.textContent = 'Error al obtener disponibilidad.';
        }
    } catch (err) {
        console.error("Error al consultar disponibilidad:", err);
        disponibleDiv.textContent = 'Error al consultar disponibilidad.';
    }
}

async function validarDisponibilidad(event) {
    event.preventDefault();

    const tipo = document.getElementById('tipoAguacateSalida')?.value;
    const peso = parseFloat(document.getElementById('pesoSalida')?.value);

    if (!tipo || isNaN(peso)) {
        mostrarError("Tipo y peso válidos son requeridos.");
        return false;
    }

    try {
        const res = await fetch(`http://localhost:3000/api/disponible/${tipo}`, {
            headers: { 'Authorization': `Bearer ${obtenerToken()}` }
        });
        const data = await res.json();

        if (data.success && peso <= data.disponible) {
            enviarVenta(event); // Si hay suficiente, registrar venta
        } else {
            mostrarError(`No hay suficiente ${tipo}. Solo hay disponible ${data.disponible.toFixed(2)} kg.`);
        }
    } catch (err) {
        console.error(err);
        mostrarError("Error al validar disponibilidad");
    }
}


document.addEventListener('DOMContentLoaded', () => {
    if (!verificarAutenticacion()) return;

    setInterval(actualizarHora, 1000);
    actualizarHora();
    cargarTiposAguacate();
    actualizarResumenSemanal();
    actualizarGraficasConDatos();

    document.getElementById('peso')?.addEventListener('input', calcularPerdidaEstimada);
    document.getElementById('entradaForm')?.addEventListener('submit', enviarEntrada);
    document.getElementById('salidaForm')?.addEventListener('submit', validarDisponibilidad);
});

