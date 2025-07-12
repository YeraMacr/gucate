function registrarSalida(evento) {
    evento.preventDefault();  // Evita que el formulario se envíe de forma tradicional

    // Obtener los valores de los campos
    const destino_V = document.getElementById("destino").value;
    const cantidadSalida_V = document.getElementById("cantidadSalida").value;
    const fechaSalida_V = document.getElementById("fechaSalida").value;
    const id_usuario_V = document.getElementById("id_usuario").value;

    // Validar que los campos no estén vacíos
    if (!destino_V || !cantidadSalida_V || !fechaSalida_V || !id_usuario_V) {
        alert("Todos los campos son obligatorios.");
        return;
    }

    // Crear el objeto con los datos que enviarás al servidor
    const salidas = {
        destino: destino_V,
        cantidadSalida: parseInt(cantidadSalida_V),  // Asegúrate de que sea un número entero
        fechaSalida: fechaSalida_V,
        id_usuario: parseInt(id_usuario_V)  // Asegúrate de que sea un número entero
    };

    // Enviar los datos al servidor utilizando Fetch API
    fetch("http://localhost:3000/api/salidas", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(salidas)
    })
    .then(respuesta => {
        if (!respuesta.ok) {
            throw new Error('Error en la solicitud al servidor');
        }
        return respuesta.json();
    })
    .then(data => {
        if (data.success) {
            alert("Salida registrada correctamente");
        } else {
            alert("Hubo un problema al registrar la salida: " + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Hubo un error al registrar la salida. Intenta nuevamente.');
    });
}
