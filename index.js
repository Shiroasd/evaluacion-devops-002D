/* global module */

// Variables de estado
let perroActual = "";
let votosLikes = 0;
let votosDislikes = 0;

// Referencias del DOM (inicializadas solo si document existe)
let perroActualElement = null;
let spinner = null;
let perrosLikeContainer = null;
let perrosDislikeContainer = null;
let mensajeErrorElement = null;
let contadorLikesElement = null;
let contadorDislikesElement = null;

/**
 * Valida si una URL corresponde a un recurso de imagen válido (HTTP/HTTPS y extensiones soportadas).
 * @param {string} url - URL del recurso a validar.
 * @returns {boolean} - Retorna true si el formato y la extensión son válidos.
 */
function validarUrlImagen(url) {
  if (typeof url !== "string" || !url.trim()) {
    return false;
  }
  const patron = /^https?:\/\/[^\s/$.?#].[^\s]*\.(jpg|jpeg|png|gif|webp)$/i;
  return patron.test(url.trim());
}

/**
 * Incrementa de forma segura un valor numérico para contadores de interacción.
 * @param {number|string} conteoActual - Valor actual del contador.
 * @param {number} incremento - Cantidad a sumar (por defecto 1).
 * @returns {number} - Nuevo total calculado.
 */
function actualizarContador(conteoActual = 0, incremento = 1) {
  const valor = Number(conteoActual);
  if (isNaN(valor) || valor < 0) {
    return Math.max(0, incremento);
  }
  return valor + incremento;
}

/**
 * Actualiza el estado inmutable de contadores según el tipo de interacción recibida.
 * @param {Object} contadores - Objeto con contadores actuales { likes, dislikes }.
 * @param {string} tipo - Tipo de interacción ('+' o '-' / 'like' o 'dislike').
 * @returns {Object} - Nuevo objeto de contadores actualizado.
 */
function registrarInteraccion(contadores, tipo) {
  const estado = contadores && typeof contadores === "object"
    ? { ...contadores }
    : { likes: 0, dislikes: 0 };

  if (tipo === "+" || tipo === "like") {
    estado.likes = actualizarContador(estado.likes, 1);
  } else if (tipo === "-" || tipo === "dislike") {
    estado.dislikes = actualizarContador(estado.dislikes, 1);
  }
  return estado;
}

/**
 * Maneja y estructura errores de red de manera controlada.
 * @param {Error|Object|string} error - Objeto o mensaje de error capturado.
 * @returns {Object} - Respuesta estandarizada de error.
 */
function manejarErrorRed(error) {
  const mensaje = error && error.message ? error.message : "Error de red desconocido";
  return {
    success: false,
    error: mensaje,
    status: "error"
  };
}

/**
 * Realiza la petición a la API externa para obtener una imagen aleatoria.
 * @param {Function} fetchClient - Cliente HTTP (por defecto fetch nativo).
 * @param {string} endpoint - URL de la API externa.
 * @returns {Promise<Object>} - Resultado con éxito o fallo controlado.
 */
async function obtenerPerroAleatorio(fetchClient = (typeof fetch !== "undefined" ? fetch : null), endpoint = "https://dog.ceo/api/breeds/image/random") {
  try {
    if (!fetchClient) {
      throw new Error("Cliente fetch no disponible");
    }
    const respuesta = await fetchClient(endpoint);
    if (!respuesta.ok) {
      throw new Error(`HTTP error! status: ${respuesta.status}`);
    }
    const datos = await respuesta.json();
    if (datos && datos.status === "success" && validarUrlImagen(datos.message)) {
      return {
        success: true,
        url: datos.message,
        status: "success"
      };
    }
    throw new Error("Formato de respuesta de API inválido");
  } catch (error) {
    return manejarErrorRed(error);
  }
}

/**
 * Registra la preferencia del usuario (like/dislike), actualiza contadores y DOM, y pide el siguiente perro.
 * @param {string} ranking - "+" para me gusta, "-" para no me gusta.
 */
function rankearPerro(ranking) {
  if (typeof document === "undefined") return;

  const nuevaImagen = document.createElement("img");
  nuevaImagen.src = perroActual;

  if (ranking === "+" || ranking === "like") {
    votosLikes = actualizarContador(votosLikes, 1);
    if (contadorLikesElement) contadorLikesElement.textContent = String(votosLikes);
    if (perrosLikeContainer) {
      perrosLikeContainer.appendChild(nuevaImagen);
      perrosLikeContainer.classList.remove("escondido");
    }
  } else {
    votosDislikes = actualizarContador(votosDislikes, 1);
    if (contadorDislikesElement) contadorDislikesElement.textContent = String(votosDislikes);
    if (perrosDislikeContainer) {
      perrosDislikeContainer.appendChild(nuevaImagen);
      perrosDislikeContainer.classList.remove("escondido");
    }
  }
  nuevoPerro();
}

/**
 * Controla la carga y visualización de una nueva imagen de perro.
 */
async function nuevoPerro() {
  if (typeof document !== "undefined") {
    if (perroActualElement) perroActualElement.classList.add("escondido");
    if (mensajeErrorElement) mensajeErrorElement.classList.add("escondido");
    if (spinner) spinner.classList.remove("escondido");
  }

  const resultado = await obtenerPerroAleatorio();
  if (resultado.success) {
    perroActual = resultado.url;
    if (perroActualElement) {
      perroActualElement.src = perroActual;
    }
  } else {
    if (typeof document !== "undefined") {
      if (spinner) spinner.classList.add("escondido");
      if (mensajeErrorElement) {
        mensajeErrorElement.classList.remove("escondido");
      }
    }
  }
}

/**
 * Inicializa los manejadores de eventos del DOM en el navegador.
 */
function inicializarApp() {
  if (typeof document === "undefined") return;

  perroActualElement = document.getElementById("perroActual");
  spinner = document.getElementById("spinner");
  perrosLikeContainer = document.getElementById("perrosLikeContainer");
  perrosDislikeContainer = document.getElementById("perrosDislikeContainer");
  mensajeErrorElement = document.getElementById("mensajeError");
  contadorLikesElement = document.getElementById("contadorLikes");
  contadorDislikesElement = document.getElementById("contadorDislikes");

  const likeBtn = document.getElementById("like");
  const dislikeBtn = document.getElementById("dislike");
  const saltearBtn = document.getElementById("saltear");

  if (likeBtn) likeBtn.addEventListener("click", () => rankearPerro("+"));
  if (dislikeBtn) dislikeBtn.addEventListener("click", () => rankearPerro("-"));
  if (saltearBtn) saltearBtn.addEventListener("click", nuevoPerro);

  if (perroActualElement && spinner) {
    perroActualElement.addEventListener("load", () => {
      spinner.classList.add("escondido");
      perroActualElement.classList.remove("escondido");
    });
  }

  if (perroActualElement) {
    nuevoPerro();
  }
}

// Inicialización automática si se ejecuta en navegador
if (typeof window !== "undefined" && typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inicializarApp);
  } else {
    inicializarApp();
  }
}

// Exportación modular para pruebas unitarias con Jest
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    validarUrlImagen,
    actualizarContador,
    registrarInteraccion,
    manejarErrorRed,
    obtenerPerroAleatorio,
    rankearPerro,
    nuevoPerro,
    inicializarApp,
    getPerroActual: () => perroActual,
    setPerroActual: (url) => { perroActual = url; },
    getVotosLikes: () => votosLikes,
    getVotosDislikes: () => votosDislikes
  };
}
