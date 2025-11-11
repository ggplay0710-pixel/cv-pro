// éléments
const btnGenerate = document.getElementById("generateLetter");
const btnPrint = document.getElementById("printLetter");
const btnEdit = document.getElementById("editLetter");
const previewSection = document.getElementById("letter-preview");
const formContainer = document.getElementById("form-container");
const letterContent = document.getElementById("letterContent");
const enPoste = document.getElementById("enPoste");
const currentJobFields = document.getElementById("currentJobFields");
const interneSelect = document.getElementById("interne");
const motivationLabel = document.getElementById("motivationLabel");
const motivationField = document.getElementById("motivation");

// s'assurer que preview est caché au démarrage
previewSection.classList.add("hidden");
previewSection.setAttribute("aria-hidden", "true");

// gestion affichage champs poste actuel
enPoste.addEventListener("change", () => {
  currentJobFields.classList.toggle("hidden", enPoste.value === "non");
  if (enPoste.value === "non") {
    interneSelect.value = "non";
    motivationLabel.textContent = "Pourquoi cette entreprise :";
  }
});

// changer label si candidature interne
interneSelect.addEventListener("change", () => {
  if (interneSelect.value === "oui") {
    motivationLabel.textContent = "Pourquoi ce poste :(ou laisser vide ce remplis automatiquement avec l'IA)";
    motivationField.placeholder = "Ex : envie d’évoluer vers de nouvelles responsabilités...";
  } else {
    motivationLabel.textContent = "Pourquoi cette entreprise :";
    motivationField.placeholder = "Ex : entreprise innovante, valeurs humaines...";
  }
});

// génération de la lettre (affiche le preview centré)
btnGenerate.addEventListener("click", () => {
  // récupération des valeurs
  const name = document.getElementById("name").value.trim();
  const address = document.getElementById("address").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const poste = document.getElementById("poste").value.trim();
  const entreprise = document.getElementById("entreprise").value.trim();
  const forces = document.getElementById("forces").value.trim();
  const motivation = document.getElementById("motivation").value.trim();

  const isInJob = enPoste.value === "oui";
  const posteActuel = document.getElementById("posteActuel").value.trim();
  const entrepriseActuelle = document.getElementById("entrepriseActuelle").value.trim();
  const dureePoste = document.getElementById("dureePoste").value.trim();
  const interne = document.getElementById("interne").value === "oui";

  const today = new Date().toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" });

  // composition du texte d'intro
  let introTexte = "";
  if (isInJob && interne) {
    introTexte = `Actuellement ${posteActuel || "employé"} au sein de votre entreprise ${entrepriseActuelle || ""} depuis ${dureePoste || ""}, je souhaite aujourd’hui évoluer en interne et postuler pour le poste de ${poste || "nouveau poste"}.`;
  } else if (isInJob && !interne) {
    introTexte = `Actuellement ${posteActuel || "salarié"} chez ${entrepriseActuelle || ""} depuis ${dureePoste || ""}, je souhaite donner un nouvel élan à ma carrière en rejoignant votre société ${entreprise || ""} pour le poste de ${poste || "poste souhaité"}.`;
  } else {
    introTexte = `Je souhaite vous proposer ma candidature pour le poste de ${poste || "poste souhaité"} au sein de votre entreprise ${entreprise || ""}.`;
  }

  let motivationTexte = interne ? (motivation || "ce poste représente une opportunité d’évolution naturelle au sein de votre structure, me permettant de relever de nouveaux défis tout en continuant à contribuer à la réussite de l’entreprise.") : (motivation || "elle correspond à mes valeurs professionnelles et représente un environnement stimulant pour évoluer.");

  // construire le HTML de la lettre

letterContent.innerHTML = `
<div class="letter-header">
  <div class="infos-gauche">
    <p><strong>${escapeHtml(name)}</strong></p>
    <p>${escapeHtml(address)}</p>
    <p>${escapeHtml(email)}</p>
    <p>${escapeHtml(phone)}</p>
  </div>
  <div class="date-droite">
    <p>${today}</p>
  </div>
</div>

<div class="letter-body">


  <p>Objet : Candidature au poste de ${escapeHtml(poste) || "poste souhaité"}</p>

  <p>Madame, Monsieur,</p>

  <p>${escapeHtml(introTexte)}</p>

  <p>Doté(e) d’un excellent sens du relationnel et ${escapeHtml(forces) || "motivé(e), dynamique et rigoureux(se)"}, je suis convaincu(e) de pouvoir apporter une contribution positive à vos équipes.</p>

  <p>J’ai choisi ${interne ? "ce poste" : "votre entreprise"} car ${escapeHtml(motivationTexte)}</p>

  <p>Je serais ravi(e) de pouvoir échanger avec vous lors d’un entretien afin de vous présenter plus en détail mes compétences et ma motivation.</p>

  <p>Dans l’attente de votre retour, je vous prie d’agréer, Madame, Monsieur, mes salutations distinguées.</p>

  <p><strong>${escapeHtml(name)}</strong></p>
</div>
`;


  // afficher le preview et cacher le formulaire
  previewSection.classList.remove("hidden");
  previewSection.setAttribute("aria-hidden", "false");
  formContainer.classList.add("hidden");

  // faire défiler jusqu'à la preview et centrer visuellement
  setTimeout(() => {
    // scroll to center of preview
    previewSection.scrollIntoView({ behavior: "smooth", block: "center" });
  }, 50);
});

// imprimer
btnPrint && btnPrint.addEventListener("click", () => {
  window.print();
});

// revenir modifier
btnEdit && btnEdit.addEventListener("click", () => {
  previewSection.classList.add("hidden");
  previewSection.setAttribute("aria-hidden", "true");
  formContainer.classList.remove("hidden");
  // remettre le focus au formulaire
  document.getElementById("name").focus();
});

// petit helper sécurité XSS
function escapeHtml(text) {
  if (!text) return "";
  return String(text).replace(/[&<>"']/g, function (m) { return ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[m]; });
}


