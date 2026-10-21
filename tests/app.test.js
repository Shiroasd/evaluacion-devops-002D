const {
  validarUrlImagen,
  actualizarContador,
  registrarInteraccion,
  manejarErrorRed,
  obtenerPerroAleatorio
} = require("../index");

describe("Suite de Pruebas Automatizadas - Aplicación Web", () => {
  describe("Test 1: Validación del formato de URLs y extensiones de imágenes permitidas", () => {
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

    test("Debe retornar false para entradas no válidas, cadenas vacías o valores nulos", () => {
      expect(validarUrlImagen("")).toBe(false);
      expect(validarUrlImagen("   ")).toBe(false);
      expect(validarUrlImagen(null)).toBe(false);
      expect(validarUrlImagen(undefined)).toBe(false);
      expect(validarUrlImagen(12345)).toBe(false);
    });
  });

  describe("Test 2: Validación de la lógica de incremento y actualización de contadores de interacción", () => {
    test("Debe incrementar correctamente el contador numérico a partir del valor actual", () => {
      expect(actualizarContador(0, 1)).toBe(1);
      expect(actualizarContador(5, 1)).toBe(6);
      expect(actualizarContador(10, 5)).toBe(15);
    });

    test("Debe manejar valores iniciales inválidos o nulos asignando el incremento por defecto", () => {
      expect(actualizarContador(undefined, 1)).toBe(1);
      expect(actualizarContador(null, 1)).toBe(1);
      expect(actualizarContador("invalido", 1)).toBe(1);
      expect(actualizarContador(-2, 1)).toBe(1);
    });

    test("Debe actualizar el estado de me gusta y no me gusta de forma inmutable", () => {
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
    });
  });

  describe("Test 3: Manejo y captura controlada ante errores de red simulados", () => {
    test("Debe estructurar un objeto de error estándar cuando el servicio falla", () => {
      const errorSimulado = new Error("Connection refused");
      const respuestaError = manejarErrorRed(errorSimulado);

      expect(respuestaError).toEqual({
        success: false,
        error: "Connection refused",
        status: "error"
      });
    });

    test("Debe manejar excepciones de fetch retornando fallo controlado sin romper la ejecución", async () => {
      const mockFetchConFallo = jest.fn().mockRejectedValue(new Error("Network timeout"));

      const resultado = await obtenerPerroAleatorio(mockFetchConFallo);

      expect(mockFetchConFallo).toHaveBeenCalledTimes(1);
      expect(resultado.success).toBe(false);
      expect(resultado.error).toBe("Network timeout");
      expect(resultado.status).toBe("error");
    });

    test("Debe capturar respuestas HTTP no exitosas como status 500", async () => {
      const mockFetchHttpError = jest.fn().mockResolvedValue({
        ok: false,
        status: 500
      });

      const resultado = await obtenerPerroAleatorio(mockFetchHttpError);

      expect(resultado.success).toBe(false);
      expect(resultado.error).toContain("500");
    });

    test("Debe retornar éxito con la URL procesada cuando el servicio responde exitosamente", async () => {
      const mockFetchExito = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          status: "success",
          message: "https://images.dog.ceo/breeds/husky/dog.jpg"
        })
      });

      const resultado = await obtenerPerroAleatorio(mockFetchExito);

      expect(resultado.success).toBe(true);
      expect(resultado.url).toBe("https://images.dog.ceo/breeds/husky/dog.jpg");
      expect(resultado.status).toBe("success");
    });
  });
});
