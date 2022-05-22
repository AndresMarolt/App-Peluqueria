let pagina = 1;
const cita = {
    nombre: '',
    fecha: '',
    hora: '',
    servicios: []
}

document.addEventListener('DOMContentLoaded', function() {
    iniciarApp();
});

function iniciarApp() {         // FUNCION QUE SE VA A ENCARGAR DE INICIAR OTRAS FUNCIONES
    mostrarServicios();

    // Resalta el DIV actual según la tab que se presione
    mostrarSeccion();

    // Oculta o muestra una sección según la tab que se presione
    cambiarSeccion();

    // Paginación siguiente y anterior
    paginaSiguiente();
    paginaAnterior();

    // Comprueba la página actual para ocultar o mostrar la paginación
    botonesPaginador();

    // Muestra el resúmen de la cita o mensaje de error en caso de no pasar la validación:
    mostrarResumen();

    // Almacena el nombre de la cita en el objeto
    nombreCita();

    // Almacena la fecha de la cita en el objeto
    fechaCita();

    // Deshabilita días pasados:
    deshabilitarFechaAnterior();

    // Almacena la hora de la cita en el objeto
    horaCita();



}

function mostrarSeccion() {

    const seccionAnterior = document.querySelector('.mostrar-seccion');
    if(seccionAnterior) {
        seccionAnterior.classList.remove('mostrar-seccion');
    }


    const seccionActual = document.querySelector(`#paso-${pagina}`);
    seccionActual.classList.add('mostrar-seccion');


    const tabAnterior = document.querySelector('.tabs .actual');
    if(tabAnterior) {
        tabAnterior.classList.remove('actual');
    }


    // Resalta el tab actual
    const tab = document.querySelector(`[data-paso="${pagina}"]`);
    tab.classList.add('actual');
}

function cambiarSeccion() {
    const enlaces = document.querySelectorAll('.tabs button');

    enlaces.forEach( enlace => {
        enlace.addEventListener('click', e => {
            e.preventDefault();
            pagina = parseInt(e.target.dataset.paso);

            // Llamar la función de Mostrar Sección
            mostrarSeccion();
            botonesPaginador();
        })
    })
}

async function mostrarServicios() {
    try {
        const resultado = await fetch('./servicios.json');
        const bd = await resultado.json();          // Indica qué tipo de respuesta es; si fuese texto en vez de un archivo .json sería resultado.text()

        const { servicios } = bd; // Equivale a:    const servicios = bd.servicios;
        
        // Generar el HTML
        servicios.forEach( servicio => {

            const { id, nombre, precio } = servicio;

            // DOM SCRIPTING:

            // Generar nombre de servicio:
            const nombreServicio = document.createElement('P');
            nombreServicio.textContent = nombre;
            nombreServicio.classList.add('nombre-servicio');

            // Generar precio de servicio:
            const precioServicio = document.createElement('P');
            precioServicio.textContent = `$ ${precio}`;
            precioServicio.classList.add('precio-servicio');

            // Generar DIV contenedor de servicios
            const servicioDiv = document.createElement('DIV');
            servicioDiv.classList.add('servicio');

            // Seleccionar un servicio para la cita
            servicioDiv.onclick = seleccionarServicio;

            //Inyectar precio y nombre al DIV de servicio
            servicioDiv.appendChild(nombreServicio);
            servicioDiv.appendChild(precioServicio);
            servicioDiv.dataset.idServicio = id;    // Hace que al DIV se le asigne el atributo "data-id-servicio". Ej: data-id-servicio = 1

            // Inyectarlo en el HTML
            document.querySelector('#servicios').appendChild(servicioDiv);
        })
    } catch(error) {
        console.log(error);
    }
}

function seleccionarServicio(e) {
    let elemento;

    // Forzar que el elemento al cual le demos click sea al DIV:
    if(e.target.tagName === 'P') {
        elemento = e.target.parentElement;
    } else {
        elemento = e.target;
    }

    // Si el DIV clickeado no estaba seleccionado se va a seleccionar. Si ya lo estaba se lo deselecciona:
    if(elemento.classList.contains('seleccionado') ) {
        elemento.classList.remove('seleccionado');

        const id = parseInt(elemento.dataset.idServicio);
        eliminarServicio(id);
    } else {
        elemento.classList.add('seleccionado');

        const servicioObj = {
            id: parseInt(elemento.dataset.idServicio),
            nombre: elemento.firstElementChild.textContent,
            precio: elemento.firstElementChild.nextElementSibling.textContent
        }
        //console.log(servicioObj);
        agregarServicio(servicioObj);
    }
}

function eliminarServicio(id) {
    const {servicios} = cita;
    cita.servicios = servicios.filter(servicio => servicio.id !== id);

    console.log(cita);
}

function agregarServicio(servicioObj) {
    const {servicios} = cita;
    cita.servicios = [...servicios, servicioObj];       // Hace que los servicios se vayan añadiendo al array de cita.servicios
    console.log(cita);

}


function paginaSiguiente() {
    const paginaSiguiente = document.querySelector('#siguiente');
    paginaSiguiente.addEventListener('click', () => {
        pagina++;

        console.log(pagina);

        botonesPaginador();         // Llama a esta funcion para revisar en qué página está y si corresponde o no borrar el boton de atrás o siguiente
    });
}

function paginaAnterior() {
    const paginaAnterior = document.querySelector('#anterior');
    paginaAnterior.addEventListener('click', () => {
        pagina--;

        console.log(pagina);

        botonesPaginador();         // Llama a esta funcion para revisar en qué página está y si corresponde o no borrar el boton de atrás o siguiente
    });
}

function botonesPaginador() {
    const paginaAnterior = document.querySelector('#anterior');
    const paginaSiguiente = document.querySelector('#siguiente');

    if(pagina === 1) {
        paginaAnterior.classList.add('ocultar');
    } else if(pagina === 3) {
        paginaSiguiente.classList.add('ocultar');
        paginaAnterior.classList.remove('ocultar');

        mostrarResumen();   // Estamos en la página 3; Carga el resumen de la cita 
    } else {
        paginaAnterior.classList.remove('ocultar');
        paginaSiguiente.classList.remove('ocultar');
    }

    mostrarSeccion();   // Cambia la sección que se muestra por la de la página actual
}

function mostrarResumen() {
    // Destructuring
    const {nombre, fecha, hora, servicios} = cita;


    // Seleccionar el resúmen:
    const resumenDiv = document.querySelector('.contenido-resumen');

    // Limpia el HTML previo:
    while(resumenDiv.firstChild) {  // Mientras que el elemento de la clase .contenido-resumen tenga contenido en él...
        resumenDiv.removeChild(resumenDiv.firstChild);
    }

    // Validación de objeto:
    if(Object.values(cita).includes('')) {
        const noServicios = document.createElement('P');
        noServicios.textContent = "Faltan datos de servicios, fecha, hora o nombre";

        noServicios.classList.add('invalidar-cita');

        // Agregar a resumenDiv:
        resumenDiv.appendChild(noServicios);

        return;
    } 

    // Mostrar el resumen:

    const headingCita = document.createElement('H3');
    headingCita.textContent = "Resumen de cita";

    const nombreCita = document.createElement('P');
    nombreCita.innerHTML = `<span>Nombre:</span> ${nombre}`;

    const fechaCita = document.createElement('P');
    fechaCita.innerHTML = `<span>Fecha:</span> ${fecha}`;

    const horaCita = document.createElement('P');
    horaCita.innerHTML = `<span>Hora:</span> ${hora}`;

    const serviciosCita = document.createElement('DIV');            // (DIV) serviciosCita
    serviciosCita.classList.add('resumen-servicios');

    const headingServicios = document.createElement('H3');
    headingServicios.textContent = "Resumen de servicios";

    serviciosCita.appendChild(headingServicios);

    let cantidad = 0;

    // Iterar sobre el array de servicios
    servicios.forEach( servicio => {

        const {nombre, precio} = servicio;
        const contenedorServicio = document.createElement('DIV');
        contenedorServicio.classList.add('contenedor-servicios');

        const textoServicio = document.createElement('P');
        textoServicio.textContent = nombre;

        const precioServicio = document.createElement('P');
        precioServicio.textContent = precio;
        precioServicio.classList.add('precio');

        const totalServicio = precio.split('$');
        cantidad += parseInt(totalServicio[1].trim());

        // Colocar texto y precio en el DIV
        contenedorServicio.appendChild(textoServicio);
        contenedorServicio.appendChild(precioServicio);

        serviciosCita.appendChild(contenedorServicio);              // (DIV) serviciosCita -> (DIV) contenedorServicio

        console.log(textoServicio);
    });

    console.log(cantidad);

    resumenDiv.appendChild(headingCita);
    resumenDiv.appendChild(nombreCita);
    resumenDiv.appendChild(fechaCita);
    resumenDiv.appendChild(horaCita);

    resumenDiv.appendChild(serviciosCita);                          // (DIV) resumenDiv -> (DIV) serviciosCita -> (DIV) contenedorServicio
    
    const precioTotal = document.createElement('P');
    precioTotal.classList.add('total');
    precioTotal.innerHTML = `<span>Total a Pagar: </span> $${cantidad}`;

    resumenDiv.appendChild(precioTotal);
}

function nombreCita() {
    const nombreInput = document.querySelector('#nombre');
    nombreInput.addEventListener('change', e => {
        const nombreTexto = e.target.value.trim();

        // Verifica que nombreTexto tenga algo:
        if(nombreTexto==='' || nombreTexto.length < 3) {
            mostrarAlerta('Nombre no válido', 'error');
        } else {
            const alerta = document.querySelector('.alerta');
            if(alerta) {
                alerta.remove();
            }
            cita.nombre = nombreTexto;

            console.log(cita);
        }
    })
}

function mostrarAlerta(mensaje, tipo) {
    
    // Si hay una alerta previa no crear otra:
    const alertaPrevia = document.querySelector('.alerta');
    if(alertaPrevia) {
        return;                 // Este return finaliza la función mostrarAlerta() en este punto. No se ejecuta lo de abajo
    }

    const alerta = document.createElement('DIV');
    alerta.textContent = mensaje;
    alerta.classList.add('alerta');

    if(tipo==='error') {
        alerta.classList.add('error');
    }

    // Insertar en el HTML:
    const formulario = document.querySelector('.formulario');
    formulario.appendChild( alerta );

    // Eliminar la alerta después de 3 segundos:
    setTimeout(() => {
        alerta.remove();
    }, 3000);
}

function fechaCita() {
    const fechaInput = document.querySelector('#fecha');
    fechaInput.addEventListener('change', (e) => {
        const dia = new Date (e.target.value).getUTCDay(); // Date convierte el string a formato de fecha. El método getUTCDate() retorna el número del día del 0 al 6 (0 es domingo, lunes 1, martes 2, etc).

        if([0, 6].includes(dia)) {
            e.preventDefault();         // Hace que en caso de que elijamos un día de fin de semana esta fecha no se ponga en el campo.
            fechaInput.value = '';      // En lugar de la fecha ilegal elegida, el campo va a quedar vacío.
            mostrarAlerta('Sólo válido de Lunes a Viernes', 'error');
        } else {
            cita.fecha = fechaInput.value;

            console.log(cita);
        }
    }) 
}

function deshabilitarFechaAnterior(){
    const inputFecha = document.querySelector('#fecha');
    const fechaActual =  new Date();
    const year =  fechaActual.getFullYear();
 
   // suma un día a la fecha actual sin inconvenientes, por ejemplo, si el 
   //día actual es 31 de marzo y se le suma un día, la fecha sería 1 de abril
   fechaActual.setDate(fechaActual.getDate() + 1);
 
   let dia = fechaActual.getDate();
   let mes = fechaActual.getMonth()+1;

   if(mes < 10) {
      mes = `0${mes}`;
   }
   if(dia < 10) {
      dia = `0${dia}`;
   }
 
   // Formato de la fecha minima AAAA-MM-DD 
   let fechaDeshabilitar = `${year}-${mes}-${dia}`;
 
   inputFecha.min = fechaDeshabilitar;
}

function horaCita() {
    const inputHora = document.querySelector('#hora');
    inputHora.addEventListener('change', e => {

        const horaCita = e.target.value;
        const hora = horaCita.split(':');      // .split(':') divide al string (por ejemplo 11:00) a partir de los dos puntos, quedando 11 por un lado y 00 por el otro

        if(hora[0] < 10 || hora[0] > 18) {      // hora[0] va a ser la hora, y hora[1] los minutos
            mostrarAlerta('Hora no válida', 'error');
            setTimeout(() => {
                inputHora.value = '';               // Para que el campo quede vacío si se elige una hora no válida
            }, 1500);
            
        } else {
            cita.hora = horaCita;

            console.log(cita);
        }
    })
}