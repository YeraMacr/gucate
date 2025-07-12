function registrarPedido(evento) {
    evento.preventDefault();  // Evita que el formulario se envíe de forma tradicional

    // Obtener los valores de los campos
    const cliente_V = document.getElementById("cliente").value;
    const cantidad_V = document.getElementById("cantidad").value;
    const fechaPedido_V = document.getElementById("fechaPedido").value;
    const id_usuario_V = document.getElementById("id_usuario").value;

    // Validar que los campos no estén vacíos
    if (!cliente_V || !cantidad_V || !fechaPedido_V || !id_usuario_V) {
        alert("Todos los campos son obligatorios.");
        return;
    }

    // Crear el objeto con los datos que enviarás al servidor
    const pedidos = {
        cliente: cliente_V,
        cantidad: parseInt(cantidad_V),  // Asegúrate de que sea un número entero
        fechaPedido: fechaPedido_V,
        id_usuario: parseInt(id_usuario_V)  // Asegúrate de que sea un número entero
    };

    // Enviar los datos al servidor utilizando Fetch API
    fetch("http://localhost:3000/api/pedidos", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(pedidos)
    })
    .then(respuesta => {
        if (!respuesta.ok) {
            throw new Error('Error en la solicitud al servidor');
        }
        return respuesta.json();
    })
    .then(data => {
        if (data.success) {
            alert("ingreso registrado correctamente");
        } else {
            alert("Hubo un problema al registrar el ingreso: " + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Hubo un error al registrar el ingreso. Intenta nuevamente.');
    });
}