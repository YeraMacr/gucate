function iniciarSesion(evento) {
    evento.preventDefault();

    const nombre = document.getElementById("usuario").value;
    const contraseña = document.getElementById("contraseña").value;

    // Validaciones básicas
    if (!nombre || !contraseña) {
        mostrarError("Por favor, complete todos los campos");
        return false;
    }

    const datosLogin = {
        nombre: nombre,
        contraseña: contraseña
    };

    fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify(datosLogin)
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            // Guardar token y usuario en localStorage
            localStorage.setItem('token', data.token); // Usado por el backend
            localStorage.setItem('usuario', JSON.stringify(data.usuario));

            // Redirigir al dashboard
            window.location.href = "dashboard.html";
        } else {
            mostrarError(data.message || "Usuario o contraseña incorrectos");
        }
    })
    .catch(error => {
        console.error("Error al iniciar sesión:", error);
        mostrarError("No se pudo conectar al servidor. Intente más tarde.");
    });

    return false;
}

function mostrarError(mensaje) {
    let errorDiv = document.getElementById('error-message');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.id = 'error-message';
        errorDiv.className = 'error-message';
        document.querySelector('.login-container')?.appendChild(errorDiv);
    }
    errorDiv.textContent = mensaje;
    errorDiv.style.display = 'block';

    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 3000);
}

// Verificar si ya hay sesión activa
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    fetch("http://localhost:3000/api/verificar-token", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            // Redirigir si ya tiene sesión válida
            window.location.href = "dashboard.html";
        } else {
            localStorage.clear(); // Token inválido o expirado
        }
    })
    .catch(() => {
        localStorage.clear();
    });
});
