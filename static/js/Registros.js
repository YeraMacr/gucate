function registrar(evento) {
    evento.preventDefault();  // Esto previene que el formulario se envíe de manera tradicional y recargue la página

    // Obtener los valores de los campos
    const nombre = document.getElementById("usuario").value;
    const telefono = document.getElementById("telefono").value;
    const contraseña = document.getElementById("contraseña").value;
    const confirmarContraseña = document.getElementById("confirmar-contraseña").value;

    // Validar que las contraseñas coincidan
    if (contraseña !== confirmarContraseña) {
        alert("Las contraseñas no coinciden");
        return;
    }

    // Crear el objeto con los datos que enviarás al servidor
    const datosUsuario = {
        nombre: nombre,
        telefono: telefono,
        contraseña: contraseña
    };

    // Enviar los datos al servidor utilizando Fetch API
    fetch("http://localhost:3000/api/registro", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(datosUsuario)
    })
    .then(respuesta => respuesta.json())
    .then(data => {
        if (data.success) {
            alert("Usuario registrado exitosamente");
            window.location.href = "login.html";  // Redirige al login
        } else {
            alert("Error al registrar el usuario: " + data.message);
        }
    })
    .catch(error => {
        console.error("Error en la solicitud:", error);
        alert("Hubo un error en el registro. Intenta nuevamente.");
    });
}
