function registrarUsuario(evento) {
    evento.preventDefault();
    
    const nombre = document.getElementById('nombre').value;
    const telefono = document.getElementById('telefono').value;
    const contraseña = document.getElementById('contraseña').value;
    const confirmarContraseña = document.getElementById('confirmarContraseña').value;
    
    // Validaciones
    if (!nombre || !telefono || !contraseña || !confirmarContraseña) {
        mostrarError("Todos los campos son obligatorios");
        return;
    }

    if (contraseña !== confirmarContraseña) {
        mostrarError("Las contraseñas no coinciden");
        return;
    }

    const datosRegistro = {
        nombre: nombre,
        telefono: telefono,
        contraseña: contraseña
    };

    fetch('http://localhost:3000/api/registro', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(datosRegistro)
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => {
                throw new Error(err.message || 'Error en el registro');
            });
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            // Mostrar mensaje de éxito
            mostrarMensaje("Registro exitoso. Redirigiendo al login...", "success");
            // Redirigir después de 2 segundos
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } else {
            mostrarError(data.message || 'Error al registrar usuario');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        mostrarError(error.message || 'Error de conexión');
    });
}

function mostrarError(mensaje) {
    const mensajeError = document.getElementById('mensajeError');
    mensajeError.textContent = mensaje;
    mensajeError.style.display = 'block';
    mensajeError.className = 'error-message';
}

function mostrarMensaje(mensaje, tipo) {
    const mensajeError = document.getElementById('mensajeError');
    mensajeError.textContent = mensaje;
    mensajeError.style.display = 'block';
    mensajeError.className = tipo === 'success' ? 'success-message' : 'error-message';
} 