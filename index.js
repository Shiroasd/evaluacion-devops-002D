/* global module */

// Variables de estado y elementos del DOM
let perroActualElement = null;
let spinner = null;
let perrosLikeContainer = null;
let perrosDislikeContainer = null;
let perroActual = "";

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
async function obtenerPerroAleatorio(fetchClient = fetch, endpoint = "https://dog.ceo/api/breeds/image/random") {
  try {
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
 * Registra visualmente la preferencia del usuario y solicita la siguiente imagen.
 * @param {string} ranking - "+" para me gusta, "-" para no me gusta.
 */
function rankearPerro(ranking) {
  if (typeof document === "undefined") return;

  const nuevaImagen = document.createElement("img");
  nuevaImagen.src = perroActual;

  if (ranking === "+") {
    if (perrosLikeContainer) {
      perrosLikeContainer.appendChild(nuevaImagen);
      perrosLikeContainer.classList.toggle("escondido", false);
    }
  } else {
    if (perrosDislikeContainer) {
      perrosDislikeContainer.appendChild(nuevaImagen);
      perrosDislikeContainer.classList.toggle("escondido", false);
    }
  }
  nuevoPerro();
}

/**
 * Controla el ciclo de vida de carga para solicitar una nueva imagen.
 */
async function nuevoPerro() {
  if (perroActualElement) perroActualElement.classList.toggle("escondido", true);
  if (spinner) spinner.classList.toggle("escondido", false);

  const resultado = await obtenerPerroAleatorio();
  if (resultado.success) {
    perroActual = resultado.url;
    if (perroActualElement) perroActualElement.src = perroActual;
  } else {
    if (typeof document !== "undefined" && perroActualElement) {
      nuevoPerro();
    }
  }
}

// Inicialización controlada del DOM en entorno de navegador
if (typeof document !== "undefined") {
  perroActualElement = document.getElementById("perroActual");
  spinner = document.getElementById("spinner");
  perrosLikeContainer = document.getElementById("perrosLikeContainer");
  perrosDislikeContainer = document.getElementById("perrosDislikeContainer");

  if (perrosLikeContainer) perrosLikeContainer.classList.toggle("escondido");
  if (perrosDislikeContainer) perrosDislikeContainer.classList.toggle("escondido");

  const likeBtn = document.getElementById("like");
  const dislikeBtn = document.getElementById("dislike");
  const saltearBtn = document.getElementById("saltear");

  if (likeBtn) likeBtn.addEventListener("click", () => rankearPerro("+"));
  if (dislikeBtn) dislikeBtn.addEventListener("click", () => rankearPerro("-"));
  if (saltearBtn) saltearBtn.addEventListener("click", nuevoPerro);

  if (perroActualElement && spinner) {
    perroActualElement.addEventListener("load", () => {
      spinner.classList.toggle("escondido", true);
      perroActualElement.classList.toggle("escondido", false);
    });
  }

  if (perroActualElement) {
    nuevoPerro();
  }
}

// Exportación condicional para Jest en entorno Node sin romper ejecución en navegador
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    validarUrlImagen,
    actualizarContador,
    registrarInteraccion,
    manejarErrorRed,
    obtenerPerroAleatorio,
    rankearPerro,
    nuevoPerro
  };
}
