const perroActualElement = document.getElementById("perroActual");
const spinner = document.getElementById("spinner");
const perrosLikeContainer = document.getElementById("perrosLikeContainer");
const perrosDislikeContainer = document.getElementById(
  "perrosDislikeContainer"
);
perrosLikeContainer.classList.toggle("escondido");
perrosDislikeContainer.classList.toggle("escondido");

let perroActual;

document.getElementById("like").addEventListener("click", () => {
  rankearPerro("+");
});
document.getElementById("dislike").addEventListener("click", () => {
  rankearPerro("-");
});
document.getElementById("saltear").addEventListener("click", nuevoPerro);
perroActualElement.addEventListener("load", () => {
  spinner.classList.toggle("escondido", true);
  perroActualElement.classList.toggle("escondido", false);
});

function rankearPerro(ranking) {
  const nuevaImagen = document.createElement("img");
  nuevaImagen.src = perroActual;
  if (ranking === "+") {
    perrosLikeContainer.appendChild(nuevaImagen);
    perrosLikeContainer.classList.toggle("escondido",false)
  } else {
    perrosDislikeContainer.appendChild(nuevaImagen);
    perrosDislikeContainer.classList.toggle("escondido",false)
  }
  nuevoPerro();
}

const mensajeErrorElement = document.getElementById("mensajeError");

async function nuevoPerro() {
  perroActualElement.classList.toggle("escondido", true);
  if (mensajeErrorElement) mensajeErrorElement.classList.add("escondido");
  spinner.classList.toggle("escondido", false);

  try {
    const res = await fetch("https://dog.ceo/api/breeds/image/random");
    if (!res.ok) {
      throw new Error(`Error HTTP: ${res.status}`);
    }
    const jsonRes = await res.json();
    if (jsonRes.status === "success" && jsonRes.message) {
      perroActual = jsonRes.message;
      perroActualElement.src = perroActual;
    } else {
      throw new Error("Respuesta no exitosa de la API");
    }
  } catch (error) {
    console.error("Fallo de red en API Dog.ceo:", error);
    spinner.classList.toggle("escondido", true);
    if (mensajeErrorElement) {
      mensajeErrorElement.classList.remove("escondido");
    } else {
      perroActual = "https://images.dog.ceo/breeds/retriever-golden/n02099233_100.jpg";
      perroActualElement.src = perroActual;
      perroActualElement.classList.toggle("escondido", false);
    }
  }
}

//Ejecución
nuevoPerro();
