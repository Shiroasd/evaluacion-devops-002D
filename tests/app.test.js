/**
 * Suite de Pruebas Automatizadas Unitarias
 * Marco de pruebas: Jest con entorno JSDOM
 */

const {
  validarUrlImagen,
  actualizarContador,
  registrarInteraccion,
  manejarErrorRed,
  obtenerPerroAleatorio,
  rankearPerro,
  nuevoPerro,
  inicializarApp,
  getPerroActual,
  setPerroActual,
  getVotosLikes,
  getVotosDislikes
} = require("../index");

describe("Suite de Pruebas Unitarias - Aplicación Web Lista de Perros", () => {
  beforeEach(() => {
    // Configuración limpia del DOM para cada prueba
    document.body.innerHTML = `
      <main class="tarjeta-perro">
        <div id="fotoPrincipalContainer">
          <div class="loader" id="spinner"></div>
          <div id="mensajeError" class="escondido">
            <p>Error</p>
          </div>
          <img src="" alt="Perrito lindo" id="perroActual" />
        </div>
        <div id="botonesContainer">
          <button id="like" class="btn btn-like">👍🏻</button>
          <button id="saltear" class="btn btn-saltear">Saltear</button>
          <button id="dislike" class="btn btn-dislike">👎🏻</button>
        </div>
      </main>
      <section id="panelContador">
        <strong id="contadorLikes">0</strong>
        <strong id="contadorDislikes">0</strong>
      </section>
      <div id="perrosLikeContainer" class="escondido"></div>
      <div id="perrosDislikeContainer" class="escondido"></div>
    `;
    inicializarApp();
  });

  describe("Módulo 1: Validación de URLs de imágenes (validarUrlImagen)", () => {
    test("Debe retornar true para URLs válidas con extensiones jpg, jpeg, png, webp y gif", () => {
      const urlsValidas = [
        "https://images.dog.ceo/breeds/retriever-golden/n02099212_1001.jpg",
        "https://images.dog.ceo/breeds/terrier-welsh/lucy.jpeg",
        "https://images.dog.ceo/breeds/poodle-standard/dog.png",
        "https://images.dog.ceo/breeds/husky/snow.webp",
        "https://images.dog.ceo/breeds/boxer/play.gif",
        "http://images.dog.ceo/breeds/hound/n02089973_1.JPG"
      ];

      urlsValidas.forEach((url) => {
        expect(validarUrlImagen(url)).toBe(true);
      });
    });

    test("Debe retornar false para URLs sin extensiones de imagen soportadas", () => {
      const urlsInvalidas = [
        "https://images.dog.ceo/breeds/retriever/info.pdf",
        "https://images.dog.ceo/breeds/retriever/index.html",
        "https://images.dog.ceo/api/breeds/image/random",
        "ftp://images.dog.ceo/breeds/dog.jpg"
      ];

      urlsInvalidas.forEach((url) => {
        expect(validarUrlImagen(url)).toBe(false);
      });
    });

    test("Debe retornar false para valores nulos, vacíos, indefinidos o tipos no permitidos", () => {
      expect(validarUrlImagen("")).toBe(false);
      expect(validarUrlImagen("   ")).toBe(false);
      expect(validarUrlImagen(null)).toBe(false);
      expect(validarUrlImagen(undefined)).toBe(false);
      expect(validarUrlImagen(12345)).toBe(false);
    });
  });

  describe("Módulo 2: Lógica de contadores y registro de interacción", () => {
    test("actualizarContador: incrementa correctamente a partir de valores válidos", () => {
      expect(actualizarContador(0, 1)).toBe(1);
      expect(actualizarContador(5, 1)).toBe(6);
      expect(actualizarContador(10, 5)).toBe(15);
    });

    test("actualizarContador: maneja valores inválidos o negativos asignando valor seguro", () => {
      expect(actualizarContador(undefined, 1)).toBe(1);
      expect(actualizarContador(null, 1)).toBe(1);
      expect(actualizarContador("invalido", 1)).toBe(1);
      expect(actualizarContador(-5, 1)).toBe(1);
    });

    test("actualizarContador: utiliza parámetros por defecto si no se especifican", () => {
      expect(actualizarContador()).toBe(1);
      expect(actualizarContador(10)).toBe(11);
    });

    test("registrarInteraccion: actualiza el estado inmutablemente para likes y dislikes", () => {
      const estadoInicial = { likes: 0, dislikes: 0 };

      const estadoConLike = registrarInteraccion(estadoInicial, "+");
      expect(estadoConLike.likes).toBe(1);
      expect(estadoConLike.dislikes).toBe(0);
      expect(estadoInicial.likes).toBe(0);

      const estadoConDislike = registrarInteraccion(estadoConLike, "-");
      expect(estadoConDislike.likes).toBe(1);
      expect(estadoConDislike.dislikes).toBe(1);

      const estadoConAlias = registrarInteraccion(estadoConDislike, "like");
      expect(estadoConAlias.likes).toBe(2);
      expect(estadoConAlias.dislikes).toBe(1);

      const estadoConAliasDislike = registrarInteraccion(estadoConAlias, "dislike");
      expect(estadoConAliasDislike.likes).toBe(2);
      expect(estadoConAliasDislike.dislikes).toBe(2);

      const estadoSinCambio = registrarInteraccion(estadoConAliasDislike, "neutro");
      expect(estadoSinCambio).toEqual(estadoConAliasDislike);

      const estadoDesdeNull = registrarInteraccion(null, "dislike");
      expect(estadoDesdeNull.likes).toBe(0);
      expect(estadoDesdeNull.dislikes).toBe(1);
    });
  });

  describe("Módulo 3: Captura de errores de red y consumo de API", () => {
    test("manejarErrorRed: estructura estándar con mensaje descriptivo", () => {
      const error = new Error("Connection refused");
      const respuesta = manejarErrorRed(error);

      expect(respuesta).toEqual({
        success: false,
        error: "Connection refused",
        status: "error"
      });

      const respuestaVacia = manejarErrorRed(null);
      expect(respuestaVacia.error).toBe("Error de red desconocido");
    });

    test("obtenerPerroAleatorio: responde con éxito ante respuesta válida de la API", async () => {
      const mockFetchExito = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          status: "success",
          message: "https://images.dog.ceo/breeds/husky/dog.jpg"
        })
      });

      const resultado = await obtenerPerroAleatorio(mockFetchExito);

      expect(mockFetchExito).toHaveBeenCalledTimes(1);
      expect(resultado.success).toBe(true);
      expect(resultado.url).toBe("https://images.dog.ceo/breeds/husky/dog.jpg");
    });

    test("obtenerPerroAleatorio: captura errores de respuesta HTTP no exitosa (ej. 500)", async () => {
      const mockFetchError = jest.fn().mockResolvedValue({
        ok: false,
        status: 500
      });

      const resultado = await obtenerPerroAleatorio(mockFetchError);

      expect(resultado.success).toBe(false);
      expect(resultado.error).toContain("500");
    });

    test("obtenerPerroAleatorio: maneja rechazos de promesa (excepciones de red)", async () => {
      const mockFetchFalla = jest.fn().mockRejectedValue(new Error("Network timeout"));

      const resultado = await obtenerPerroAleatorio(mockFetchFalla);

      expect(resultado.success).toBe(false);
      expect(resultado.error).toBe("Network timeout");
    });

    test("obtenerPerroAleatorio: captura formato inválido de respuesta", async () => {
      const mockFetchFormatoInvalido = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          status: "success",
          message: "no-es-una-imagen"
        })
      });

      const resultado = await obtenerPerroAleatorio(mockFetchFormatoInvalido);

      expect(resultado.success).toBe(false);
      expect(resultado.error).toBe("Formato de respuesta de API inválido");
    });

    test("obtenerPerroAleatorio: lanza error si no hay fetch disponible", async () => {
      const resultado = await obtenerPerroAleatorio(null);
      expect(resultado.success).toBe(false);
      expect(resultado.error).toBe("Cliente fetch no disponible");
    });
  });

  describe("Módulo 4: Manipulación del DOM y ciclo visual de la aplicación", () => {
    test("rankearPerro (+): agrega imagen a perrosLikeContainer y actualiza contador", () => {
      setPerroActual("https://images.dog.ceo/breeds/husky/dog.jpg");
      expect(getPerroActual()).toBe("https://images.dog.ceo/breeds/husky/dog.jpg");
      const conteoInicial = getVotosLikes();

      rankearPerro("+");

      const likeContainer = document.getElementById("perrosLikeContainer");
      const contadorLikes = document.getElementById("contadorLikes");

      expect(likeContainer.children.length).toBeGreaterThan(0);
      expect(likeContainer.classList.contains("escondido")).toBe(false);
      expect(Number(contadorLikes.textContent)).toBe(conteoInicial + 1);
    });

    test("rankearPerro (-): agrega imagen a perrosDislikeContainer y actualiza contador", () => {
      setPerroActual("https://images.dog.ceo/breeds/boxer/dog.jpg");
      const conteoInicial = getVotosDislikes();

      rankearPerro("-");

      const dislikeContainer = document.getElementById("perrosDislikeContainer");
      const contadorDislikes = document.getElementById("contadorDislikes");

      expect(dislikeContainer.children.length).toBeGreaterThan(0);
      expect(dislikeContainer.classList.contains("escondido")).toBe(false);
      expect(Number(contadorDislikes.textContent)).toBe(conteoInicial + 1);
    });

    test("nuevoPerro: activa spinner y oculta perro actual antes de cargar", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          status: "success",
          message: "https://images.dog.ceo/breeds/labrador/dog.jpg"
        })
      });

      await nuevoPerro();

      const perroActualImg = document.getElementById("perroActual");
      expect(perroActualImg.src).toBe("https://images.dog.ceo/breeds/labrador/dog.jpg");
    });

    test("nuevoPerro: muestra mensaje de error si la petición falla", async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error("API Down"));

      await nuevoPerro();

      const mensajeError = document.getElementById("mensajeError");
      const spinner = document.getElementById("spinner");

      expect(mensajeError.classList.contains("escondido")).toBe(false);
      expect(spinner.classList.contains("escondido")).toBe(true);
    });

    test("inicializarApp: vincula eventos de botones y ciclo de carga de imagen", () => {
      const perroActualImg = document.getElementById("perroActual");
      const spinner = document.getElementById("spinner");
      const likeBtn = document.getElementById("like");
      const dislikeBtn = document.getElementById("dislike");
      const saltearBtn = document.getElementById("saltear");

      // Simula evento de carga completa de la imagen del perro
      perroActualImg.dispatchEvent(new Event("load"));
      expect(spinner.classList.contains("escondido")).toBe(true);
      expect(perroActualImg.classList.contains("escondido")).toBe(false);

      // Simula clicks en botones interactivos
      setPerroActual("https://images.dog.ceo/breeds/boxer/dog.jpg");
      likeBtn.click();
      dislikeBtn.click();
      saltearBtn.click();
    });

    test("rankearPerro: funciona correctamente con alias 'like' y 'dislike'", () => {
      setPerroActual("https://images.dog.ceo/breeds/beagle/dog.jpg");
      rankearPerro("like");
      expect(getPerroActual()).toBe("https://images.dog.ceo/breeds/beagle/dog.jpg");

      rankearPerro("dislike");
      expect(document.getElementById("perrosDislikeContainer").children.length).toBeGreaterThan(0);
    });

    test("inicializarApp: se comporta de forma segura si los elementos del DOM no existen", () => {
      document.body.innerHTML = "";
      expect(() => inicializarApp()).not.toThrow();
    });
  });
});
