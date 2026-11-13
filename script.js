document.addEventListener("DOMContentLoaded", () => {

  /* MENÚ HAMBURGUESA */
  const hamburguesa = document.getElementById("hamburguesa");
  const menu = document.getElementById("menu");

  if (hamburguesa && menu) {
    hamburguesa.addEventListener("click", () => {
      const abierto = menu.classList.toggle("abierto");
      hamburguesa.setAttribute("aria-expanded", String(abierto));
    });
  }

  /* CAMBIO ENTRE SECCIONES */
  document.querySelectorAll("[data-pagina]").forEach(boton => {
    boton.addEventListener("click", () => {
      const destino = document.getElementById(boton.dataset.pagina);
      if (!destino || !destino.classList.contains("pagina")) return;

      document.querySelectorAll(".pagina").forEach(pagina => {
        pagina.classList.remove("activa");
      });

      destino.classList.add("activa");
      if (menu) menu.classList.remove("abierto");
      if (hamburguesa) hamburguesa.setAttribute("aria-expanded", "false");

      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  /* CERRAR MENÚ Y MODALES CON ESCAPE */
  document.addEventListener("keydown", evento => {
    if (evento.key === "Escape") {
      if (menu) menu.classList.remove("abierto");
      if (hamburguesa) hamburguesa.setAttribute("aria-expanded", "false");
      cerrarTodosLosModalesDeInformacion();
    }
  });

  /* CARRUSELES DE PRODUCTOS */
  document.querySelectorAll(".galeria").forEach(galeria => {
    const productos = Array.from(galeria.querySelectorAll(".catalogo-carrusel .ficha-producto"));
    const botonAnterior = galeria.querySelector(".anterior");
    const botonSiguiente = galeria.querySelector(".siguiente");
    const contador = galeria.querySelector(".contador-fotos");

    if (productos.length === 0) return;

    let indiceActual = 0;

    function mostrarProducto() {
      productos.forEach((producto, indice) => {
        producto.classList.toggle("activo", indice === indiceActual);
      });
      if (contador) {
        contador.textContent = `${indiceActual + 1} de ${productos.length}`;
      }
    }

    if (botonAnterior) {
      botonAnterior.addEventListener("click", () => {
        indiceActual = (indiceActual - 1 + productos.length) % productos.length;
        mostrarProducto();
      });
    }

    if (botonSiguiente) {
      botonSiguiente.addEventListener("click", () => {
        indiceActual = (indiceActual + 1 + productos.length) % productos.length;
        mostrarProducto();
      });
    }

    mostrarProducto();
  });

  /* =====================================
     CARRITO DE COMPRAS, WHATSAPP Y PAYPAL
  ===================================== */
  let carrito = [];

  const contadorCarrito = document.getElementById("contador-carrito");
  const btnCarritoFlotante = document.getElementById("btn-carrito-flotante");
  const modalCarrito = document.getElementById("modal-carrito");
  const cerrarModal = document.getElementById("cerrar-modal");
  const listaItemsCarrito = document.getElementById("lista-items-carrito");
  const carritoTotalPrecio = document.getElementById("carrito-total-precio");
  const btnVaciarCarrito = document.getElementById("btn-vaciar-carrito");
  const btnWhatsappPedido = document.getElementById("btn-whatsapp-pedido");
  const btnPaypalRespaldo = document.getElementById("btn-paypal-respaldo");

  if (btnCarritoFlotante && modalCarrito) {
    btnCarritoFlotante.addEventListener("click", () => {
      modalCarrito.style.display = "flex";
      actualizarVistaCarrito();
    });
  }

  if (cerrarModal && modalCarrito) {
    cerrarModal.addEventListener("click", () => {
      modalCarrito.style.display = "none";
    });
  }

  window.addEventListener("click", (e) => {
    if (e.target === modalCarrito) {
      modalCarrito.style.display = "none";
    }
  });

  /* AGREGAR BOTÓN DE COMPRA EXCLUSIVAMENTE EN SECCIONES DE PRODUCTOS */
  const seccionesProductos = ["nina", "nino", "accesorios"];
  seccionesProductos.forEach(idSeccion => {
    const seccion = document.getElementById(idSeccion);
    if (seccion) {
      seccion.querySelectorAll(".ficha-producto").forEach(ficha => {
        const detalles = ficha.querySelector(".detalles-producto");
        if (detalles && !detalles.querySelector(".btn-agregar")) {
          const btnAgregar = document.createElement("button");
          btnAgregar.textContent = "Agregar a la Canasta";
          btnAgregar.className = "btn-agregar";
          detalles.appendChild(btnAgregar);
        }
      });
    }
  });

  // Escuchar clics para agregar productos
  document.addEventListener("click", (e) => {
    if (e.target && e.target.classList.contains("btn-agregar")) {
      const ficha = e.target.closest(".ficha-producto");
      const nombre = ficha.querySelector("h3").textContent;
      const precioTexto = ficha.querySelector(".precio-producto").textContent;
      const precio = parseFloat(precioTexto.replace(/[^0-9.]/g, '')) || 0;

      const productoExistente = carrito.find(item => item.nombre === nombre);
      if (productoExistente) {
        productoExistente.cantidad++;
      } else {
        carrito.push({ nombre, precio, cantidad: 1 });
      }

      actualizarContador();
      mostrarAvisoFlotante(`🛍️ Agregado: ${nombre}`);
    }
  });

  function mostrarAvisoFlotante(texto) {
    const aviso = document.createElement("div");
    aviso.textContent = texto;
    aviso.style.position = "fixed";
    aviso.style.bottom = "110px";
    aviso.style.right = "25px";
    aviso.style.background = "#00D2E0";
    aviso.style.color = "#0A3C42";
    aviso.style.padding = "10px 18px";
    aviso.style.borderRadius = "12px";
    aviso.style.fontWeight = "bold";
    aviso.style.fontSize = "14px";
    aviso.style.boxShadow = "0 6px 16px rgba(0,0,0,0.2)";
    aviso.style.zIndex = "2500";
    document.body.appendChild(aviso);

    setTimeout(() => {
      aviso.remove();
    }, 2000);
  }

  function actualizarContador() {
    if (contadorCarrito) {
      const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);
      contadorCarrito.textContent = totalItems;
    }
  }

  function actualizarVistaCarrito() {
    if (!listaItemsCarrito) return;
    listaItemsCarrito.innerHTML = "";

    if (carrito.length === 0) {
      listaItemsCarrito.innerHTML = `<p class="empty-cart-msg">Tu canasta está vacía</p>`;
      if (carritoTotalPrecio) carritoTotalPrecio.textContent = "$0.00 MXN";
      return;
    }

    let totalGeneral = 0;

    carrito.forEach((item, index) => {
      const subtotal = item.precio * item.cantidad;
      totalGeneral += subtotal;

      const divItem = document.createElement("div");
      divItem.style.display = "flex";
      divItem.style.justifyContent = "space-between";
      divItem.style.alignItems = "center";
      divItem.style.marginBottom = "10px";
      divItem.style.paddingBottom = "8px";
      divItem.style.borderBottom = "1px solid #eee";

      divItem.innerHTML = `
        <div style="max-width: 55%;">
          <strong>${item.nombre}</strong><br>
          <small>$${item.precio.toFixed(2)} c/u</small>
        </div>
        <div style="display: flex; align-items: center; gap: 6px;">
          <button onclick="window.cambiarCantidad(${index}, -1)" style="background:#f1f1f1; border:none; width:24px; height:24px; border-radius:6px; font-weight:bold; cursor:pointer;">-</button>
          <span style="font-weight:bold;">${item.cantidad}</span>
          <button onclick="window.cambiarCantidad(${index}, 1)" style="background:#f1f1f1; border:none; width:24px; height:24px; border-radius:6px; font-weight:bold; cursor:pointer;">+</button>
          <span style="color: #C73873; font-weight: bold; margin-left:6px;">$${subtotal.toFixed(2)}</span>
          <button onclick="window.eliminarItem(${index})" style="background:none; border:none; color:#e74c3c; cursor:pointer; font-size:18px; margin-left:4px;">×</button>
        </div>
      `;
      listaItemsCarrito.appendChild(divItem);
    });

    if (carritoTotalPrecio) {
      carritoTotalPrecio.textContent = `$${totalGeneral.toFixed(2)} MXN`;
    }
  }

  window.cambiarCantidad = function(index, cambio) {
    carrito[index].cantidad += cambio;
    if (carrito[index].cantidad <= 0) {
      carrito.splice(index, 1);
    }
    actualizarContador();
    actualizarVistaCarrito();
  };

  window.eliminarItem = function(index) {
    carrito.splice(index, 1);
    actualizarContador();
    actualizarVistaCarrito();
  };

  if (btnVaciarCarrito) {
    btnVaciarCarrito.addEventListener("click", () => {
      carrito = [];
      actualizarContador();
      actualizarVistaCarrito();
    });
  }

  // Enviar pedido por WhatsApp al número 5529954235
  if (btnWhatsappPedido) {
    btnWhatsappPedido.addEventListener("click", () => {
      if (carrito.length === 0) {
        alert("Tu canasta está vacía. Agrega productos antes de realizar el pedido.");
        return;
      }

      let mensaje = "Hola, ¡quiero realizar el siguiente pedido en Mi Pequeño Bazar!:%0A%0A";
      let totalGeneral = 0;

      carrito.forEach(item => {
        let subtotal = item.precio * item.cantidad;
        totalGeneral += subtotal;
        mensaje += `- *${item.nombre}* (${item.cantidad} pz) - $${subtotal.toFixed(2)} MXN%0A`;
      });

      mensaje += `%0A*Total a Pagar:* $${totalGeneral.toFixed(2)} MXN`;

      const numeroWhatsApp = "5215529954235";
      const url = `https://wa.me/${numeroWhatsApp}?text=${mensaje}`;
      window.open(url, "_blank");
    });
  }

  // Integración de PayPal
  const containerPayPal = document.getElementById('paypal-button-container');
  if (typeof paypal !== 'undefined' && containerPayPal) {
    containerPayPal.innerHTML = "";
    paypal.Buttons({
      style: {
        layout: 'vertical',
        color:  'gold',
        shape:  'rect',
        label:  'paypal'
      },
      createOrder: function(data, actions) {
        let totalCalculado = carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
        if (totalCalculado <= 0) {
          alert("Agrega productos a tu canasta antes de pagar con PayPal.");
          return;
        }
        return actions.order.create({
          purchase_units: [{
            description: "Compra en Mi Pequeño Bazar",
            amount: {
              value: totalCalculado.toFixed(2)
            }
          }]
        });
      },
      onApprove: function(data, actions) {
        return actions.order.capture().then(function(details) {
          alert('¡Pago completado con éxito por ' + details.payer.name.given_name + '!');
          carrito = [];
          actualizarContador();
          actualizarVistaCarrito();
          if (modalCarrito) modalCarrito.style.display = "none";
        });
      }
    }).render('#paypal-button-container');
  } else if (btnPaypalRespaldo) {
    btnPaypalRespaldo.style.display = "block";
    btnPaypalRespaldo.addEventListener("click", () => {
      let totalCalculado = carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
      if (totalCalculado <= 0) {
        alert("Agrega productos a tu canasta antes de pagar.");
        return;
      }
      window.open(`https://www.paypal.com/cgi-bin/webscr?cmd=_xclick¤cy_code=MXN&amount=${totalCalculado.toFixed(2)}&item_name=Compra+Mi+Pequeno+Bazar`, "_blank");
    });
  }

  /* =========================================
     LÓGICA DE VENTANAS MODALES DE INFORMACIÓN
  ========================================= */
  const modalesDeInformacion = document.querySelectorAll('.info-modal-overlay');

  document.querySelectorAll('[data-modal]').forEach(boton => {
    boton.addEventListener('click', () => {
      const modalId = boton.getAttribute('data-modal');
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.classList.add('abierto');
        const cuerpoModal = modal.querySelector('.info-modal-body');
        if (cuerpoModal) cuerpoModal.scrollTop = 0;
      }
    });
  });

  document.querySelectorAll('.close-info-modal').forEach(boton => {
    boton.addEventListener('click', () => {
      const modal = boton.closest('.info-modal-overlay');
      if (modal) modal.classList.remove('abierto');
    });
  });

  modalesDeInformacion.forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('abierto');
      }
    });
  });

  function cerrarTodosLosModalesDeInformacion() {
    modalesDeInformacion.forEach(modal => {
      modal.classList.remove('abierto');
    });
  }

  /* AÑO AUTOMÁTICO */
  const anio = document.getElementById("anio");
  if (anio) {
    anio.textContent = new Date().getFullYear();
  }

});