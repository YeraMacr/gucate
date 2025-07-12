// Verificación de autenticación
function verificarAutenticacion() {
    const userLogged = localStorage.getItem('userLogged');
    const userToken = localStorage.getItem('userToken');

    if (!userLogged || userLogged !== 'true' || !userToken) {
        localStorage.clear();
        window.location.href = 'login.html';
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

function enviarVenta(event) {
    event.preventDefault();

    const tipo = document.getElementById('tipoAguacateVenta')?.value;
    const peso = document.getElementById('pesoVenta')?.value;
    const precio = document.getElementById('precioVenta')?.value;
    const fecha = document.getElementById('fechaVenta')?.value;

    if (!tipo || !peso || !precio || !fecha) {
        return mostrarError("Todos los campos son obligatorios");
    }

    const venta = {
        tipo_aguacate: tipo,
        peso_venta: parseFloat(peso),
        precio_venta: parseFloat(precio),
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
            limpiarFormulario('ventaForm');
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

function actualizarResumenSemanal() {
    const contenedor = document.querySelector('.resumen-container');
    if (!contenedor) return;
    contenedor.innerHTML = `
        <div class="tarjeta-resumen">
            <h3>Resumen Semanal</h3>
            <p>Total Entradas: <span>0 kg</span></p>
            <p>Total Salidas: <span>0 kg</span></p>
            <p>Balance: <span>0 kg</span></p>
        </div>
    `;
}

function mostrarSeccion(id) {
    document.querySelectorAll('.seccion').forEach(s => s.style.display = 'none');
    document.getElementById(id).style.display = 'block';
    if (id === 'verGraficas') actualizarGraficasConDatos();
}

function cerrarSesion() {
    localStorage.removeItem("token");
    window.location.href = "/";
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
    document.getElementById('ventaForm')?.addEventListener('submit', enviarVenta);
});
