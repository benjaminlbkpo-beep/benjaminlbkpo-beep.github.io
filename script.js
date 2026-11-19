// 1. Modo oscuro / claro con classList.toggle("oscuro")
const btnTema = document.getElementById("btn-tema");
if (btnTema) {
  btnTema.addEventListener("click", () => {
    document.body.classList.toggle("oscuro");
    const esOscuro = document.body.classList.contains("oscuro");
    btnTema.textContent = esOscuro ? "Modo claro" : "Modo oscuro";
  });
}

// 2. Navbar al hacer scroll usando window.onscroll
const header = document.getElementById("navbar");
window.onscroll = () => {
  if (!header) return;
  if (window.scrollY > 20) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
  }
};

// 3. Validación del formulario sin alert()
const formContacto = document.getElementById("form-contacto");
const errorForm = document.getElementById("error-form");

if (formContacto && errorForm) {
  formContacto.addEventListener("submit", (e) => {
    const email = document.getElementById("email").value.trim();
    const mensaje = document.getElementById("mensaje").value.trim();
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!emailValido) {
      e.preventDefault();
      errorForm.textContent = "Ingresá un correo electrónico válido.";
      return;
    }

    if (mensaje.length < 10) {
      e.preventDefault();
      errorForm.textContent = "El mensaje debe tener al menos 10 caracteres.";
      return;
    }

    errorForm.textContent = "";
  });
}

// 4. Transición de gota entre secciones
//    Al tocar un link del menú nace una gota en el punto del clic, se expande
//    con borde orgánico y revela la sección nueva con su paleta y tipografía.
const gota = document.querySelector(".gota");
const secciones = document.querySelectorAll("main section[data-tema]");
const enlacesInternos = document.querySelectorAll('a[href^="#"]');
const reducirMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let enTransicion = false;

// Forma de la gota: un círculo deformado con ondas, así el borde no es perfecto
const PUNTOS = 56;

function contorno(cx, cy, radio, fase) {
  const pts = [];
  for (let i = 0; i < PUNTOS; i++) {
    const a = (i / PUNTOS) * Math.PI * 2;
    const k =
      1 +
      0.16 * Math.sin(3 * a + fase) +
      0.1 * Math.sin(5 * a - fase * 1.3) +
      0.06 * Math.sin(8 * a + fase * 0.7);
    pts.push([cx + Math.cos(a) * radio * k, cy + Math.sin(a) * radio * k]);
  }
  return pts;
}

const fmt = (p) => `${p[0].toFixed(1)}px ${p[1].toFixed(1)}px`;

function recorteGota(cx, cy, radio, fase) {
  return `polygon(${contorno(cx, cy, radio, fase).map(fmt).join(",")})`;
}

// Aro: dos contornos con regla evenodd, queda solo el borde de color
function recorteAro(cx, cy, radio, fase, grosor) {
  const ext = contorno(cx, cy, radio + grosor, fase);
  const int = contorno(cx, cy, Math.max(radio - 10, 0), fase);
  return `polygon(evenodd,${[...ext, ext[0], ...int, int[0]].map(fmt).join(",")})`;
}

function irASeccion(id, x, y) {
  const destino = document.getElementById(id);
  if (!destino || enTransicion) return;

  const tema = destino.dataset.tema || "crema";
  const top = id === "hero" ? 0 : Math.max(0, destino.offsetTop - header.offsetHeight);

  // Sin soporte o con "reducir movimiento": cambio simple, sin gota
  if (!document.startViewTransition || reducirMovimiento) {
    document.body.dataset.tema = tema;
    destino.scrollIntoView({ behavior: reducirMovimiento ? "auto" : "smooth" });
    history.pushState(null, "", `#${id}`);
    return;
  }

  enTransicion = true;
  const raiz = document.documentElement;
  raiz.classList.add("cambiando");

  // Este es el estado "nuevo" que se revela dentro de la gota
  const cambiar = () => {
    document.body.dataset.tema = tema;
    window.scrollTo({ top, behavior: "instant" });
    gota.classList.add("visible");
    document.querySelectorAll(".tinte").forEach((s) => s.classList.remove("tinte"));
    destino.classList.add("tinte");
  };

  const transicion = document.startViewTransition(cambiar);

  transicion.ready
    .then(() => {
      const rMax = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)) * 1.55;
      const pasos = 28;
      const revelar = [];
      const aro = [];

      for (let i = 0; i <= pasos; i++) {
        const t = i / pasos;
        const r = rMax * t;
        const fase = t * 5; // la forma "respira" mientras crece
        revelar.push({ clipPath: recorteGota(x, y, r, fase) });
        aro.push({ clipPath: recorteAro(x, y, r, fase, 36) });
      }

      const opciones = {
        duration: 1200,
        easing: "cubic-bezier(0.65, 0, 0.25, 1)",
        fill: "forwards",
      };

      raiz.animate(revelar, { ...opciones, pseudoElement: "::view-transition-new(root)" });
      raiz.animate(aro, { ...opciones, pseudoElement: "::view-transition-new(gota)" });
    })
    .catch(() => {});

  transicion.finished.finally(() => {
    gota.classList.remove("visible");
    raiz.classList.remove("cambiando");
    history.pushState(null, "", `#${id}`);
    setTimeout(() => (enTransicion = false), 150);
  });
}

enlacesInternos.forEach((enlace) => {
  const id = enlace.getAttribute("href").slice(1);
  if (!id || !document.getElementById(id)) return;

  enlace.addEventListener("click", (e) => {
    e.preventDefault();
    // Con teclado el clic llega en (0,0): usamos el centro del enlace
    const r = enlace.getBoundingClientRect();
    const x = e.detail === 0 ? r.left + r.width / 2 : e.clientX;
    const y = e.detail === 0 ? r.top + r.height / 2 : e.clientY;
    irASeccion(id, x, y);
  });
});

// Si el usuario hace scroll a mano, el tema sigue a la sección visible (sin gota)
if (secciones.length) {
  const observador = new IntersectionObserver(
    (entradas) => {
      if (enTransicion) return;
      entradas.forEach((entrada) => {
        if (entrada.isIntersecting) {
          document.body.dataset.tema = entrada.target.dataset.tema;
        }
      });
    },
    { rootMargin: "-80px 0px -80% 0px" }
  );
  secciones.forEach((s) => observador.observe(s));
}