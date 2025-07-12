function recuperarPassword(evento) {
    evento.preventDefault();

    const email = document.getElementById("email").value;

    // Validación básica
    if (!email) {
        mostrarError("Por favor, ingrese su correo electrónico");
        return false;
    }

    fetch("http://localhost:3000/api/recuperar-password", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
    })
    .then(res => {
        if (!res.ok) {
            throw new Error('Error en la solicitud');
        }
        return res.json();
    })
    .then(data => {
        if (data.success) {
            mostrarMensaje("Se han enviado las instrucciones a su correo electrónico", "success");
            setTimeout(() => {
                window.location.href = "login.html";
            }, 3000);
        } else {
            mostrarError(data.message || "No se pudo procesar la solicitud");
        }
    })
    .catch(error => {
        console.error("Error al recuperar contraseña:", error);
        mostrarError("Error al conectar con el servidor. Por favor, intente más tarde.");
    });

    return false;
}

function mostrarError(mensaje) {
    mostrarMensaje(mensaje, "error");
}

function mostrarMensaje(mensaje, tipo) {
    let mensajeDiv = document.getElementById('mensaje');
    if (!mensajeDiv) {
        mensajeDiv = document.createElement('div');
        mensajeDiv.id = 'mensaje';
        document.querySelector('.login-container').appendChild(mensajeDiv);
    }

    mensajeDiv.textContent = mensaje;
    mensajeDiv.className = `mensaje ${tipo}`;
    mensajeDiv.style.display = 'block';

    if (tipo === "error") {
        setTimeout(() => {
            mensajeDiv.style.display = 'none';
        }, 3000);
    }
} 