/* ---------------- navigation étapes ---------------- */
let currentStep = 1;
const totalSteps = 5;
const steps = document.querySelectorAll(".form-step");
const sidebarItems = document.querySelectorAll(".sidebar li");
const title = document.getElementById("step-title");

document.getElementById("next").addEventListener("click", () => changeStep(1));
document.getElementById("prev").addEventListener("click", () => changeStep(-1));

sidebarItems.forEach((li, idx) => {
  li.addEventListener("click", () => {
    goToStep(idx + 1);
  });
});

function changeStep(direction) {
  goToStep(currentStep + direction);
}

function goToStep(step) {
  if (step < 1) step = 1;
  if (step > totalSteps) step = totalSteps;
  steps[currentStep - 1].classList.remove("active");
  sidebarItems[currentStep - 1].classList.remove("active");

  currentStep = step;

  steps[currentStep - 1].classList.add("active");
  sidebarItems[currentStep - 1].classList.add("active");
  title.textContent = `Étape ${currentStep} : ${sidebarItems[currentStep - 1].textContent.slice(3)}`;
}

/* ---------------- Ajouts dynamiques ---------------- */
document.getElementById("add-extra").addEventListener("click", () => {
  const div = document.createElement("div");
  div.innerHTML = `<input type="text" placeholder="Autre info (ex: Permis B, Nationalité...)">`;
  document.querySelector(".extra-fields").appendChild(div);
});

document.getElementById("add-experience").addEventListener("click", () => addItem("step-2", "Expérience", ["Poste", "Entreprise", "Période", "Description"]));
document.getElementById("add-diplome").addEventListener("click", () => addItem("step-3", "Diplôme", ["Intitulé", "Établissement", "Année"]));
document.getElementById("add-langue").addEventListener("click", () => addItem("step-4", "Langue", ["Langue (ex: Français)", "Niveau (Moyen / Bien / Très bien)"]));
document.getElementById("add-competence").addEventListener("click", () => addItem("step-5", "Compétence", ["Nom de la compétence"]));

function addItem(stepId, titleText, fields) {
  const container = document.querySelector(`#${stepId} .items-container`);
  const div = document.createElement("div");
  div.classList.add("item-block");
  div.style.marginBottom = "12px";
  div.style.border = "1px solid #e0e0e0";
  div.style.padding = "10px";
  div.style.borderRadius = "6px";

  let html = `<h4 style="margin:0 0 8px 0;">${titleText}</h4>`;
  fields.forEach(f => html += `<input type="text" placeholder="${f}"><br>`);
  html += `<div style="text-align:right;margin-top:6px;"><button type="button" class="btn small remove-item">Supprimer</button></div>`;
  div.innerHTML = html;
  container.appendChild(div);

  div.querySelector(".remove-item").addEventListener("click", () => div.remove());
}

/* ---------------- Photo -> base64 ---------------- */
let photoBase64 = "";
document.getElementById("photo").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    photoBase64 = reader.result;
  };
  reader.readAsDataURL(file);
});

/* ---------------- Génération du CV ---------------- */
document.getElementById("generateCV").addEventListener("click", generateCV);
document.getElementById("printCV").addEventListener("click", () => {
  window.print();
});
document.getElementById("editCV").addEventListener("click", () => {
  document.getElementById("cv-preview").classList.add("hidden");
  document.getElementById("form-container").classList.remove("hidden");
  document.getElementById("cv-preview").setAttribute("aria-hidden","true");
});

function generateCV() {
  // Champs identifiables par id
  const nameVal = document.getElementById("full-name").value || "";
  const birth = document.getElementById("birth").value || "";
  const address = document.getElementById("address").value || "";
  const email = document.getElementById("email").value || "";
  const phone = document.getElementById("phone").value || "";
  const profile = document.getElementById("profile").value || "";
  const style = document.getElementById("cv-style").value || "classique";

  // Extra fields
  const extra = [...document.querySelectorAll(".extra-fields input")].map(e => e.value).filter(v => v);

  // Experiences
  const experiences = [...document.querySelectorAll("#step-2 .item-block")].map(block => {
    const i = block.querySelectorAll("input");
    return { poste: i[0]?.value || "", entreprise: i[1]?.value || "", periode: i[2]?.value || "", description: i[3]?.value || "" };
  }).filter(e => e.poste || e.entreprise);

  // Diplômes
  const diplomes = [...document.querySelectorAll("#step-3 .item-block")].map(block => {
    const i = block.querySelectorAll("input");
    return { titre: i[0]?.value || "", etab: i[1]?.value || "", annee: i[2]?.value || "" };
  }).filter(d => d.titre || d.etab);

  // Langues
  const langues = [...document.querySelectorAll("#step-4 .item-block")].map(block => {
    const i = block.querySelectorAll("input");
    return { langue: i[0]?.value || "", niveau: i[1]?.value || "" };
  }).filter(l => l.langue);

  // Compétences
  const competences = [...document.querySelectorAll("#step-5 .item-block input")].map(i => i.value).filter(v => v);

  // Build left column - contact & compétences
  let leftHtml = `
    <div class="cv-left">
      <div class="cv-photo">${photoBase64 ? `<img src="${photoBase64}" alt="Photo">` : ""}</div>
      <h4 style="text-align:center">${escapeHtml(nameVal) || "Nom & Prénom"}</h4>
      <div class="cv-block">
        <h5>Contact</h5>
        <ul class="contact-list">
          ${phone ? `<li>📞 ${escapeHtml(phone)}</li>` : ""}
          ${email ? `<li>✉️ ${escapeHtml(email)}</li>` : ""}
          ${address ? `<li>📍 ${escapeHtml(address)}</li>` : ""}
          ${birth ? `<li>🎂 ${escapeHtml(birth)}</li>` : ""}
          ${extra.map(e => `<li>• ${escapeHtml(e)}</li>`).join("")}
        </ul>
      </div>

      ${langues.length ? `<div class="cv-block"><h5>Langues</h5>` : ""}
      ${langues.map(l => {
        const perc = niveauToPercent(l.niveau);
        return `<div class="lang-item"><div class="lang-name">${escapeHtml(l.langue)}</div><div class="lang-bar"><div class="lang-fill" style="width:${perc}%"></div></div></div>`;
      }).join("")}
      ${langues.length ? `</div>` : ""}

      ${competences.length ? `<div class="cv-block"><h5>Compétences</h5><ul class="skills-list">${competences.map(s => `<li>${escapeHtml(s)}</li>`).join("")}</ul></div>` : ""}
    </div>
  `;

  // Build right column - header / body
  let rightHtml = `
    <div class="cv-right">
      <div class="cv-header-area">
        <div class="cv-header">
          <div style="flex:1"></div>
          <div style="text-align:right">
            <h1>${escapeHtml(nameVal) || "Nom & Prénom"}</h1>
            <!-- Intitulé du poste supprimé -->
          </div>
        </div>
      </div>

      <div class="cv-body">
        ${profile ? `<div class="cv-section"><h3>Profil</h3><p>${escapeHtml(profile)}</p></div>` : ""}

        ${experiences.length ? `<div class="cv-section"><h3>Expériences Professionnelles</h3>` : ""}
        ${experiences.map(e => `
          <div class="exp-item">
            <strong>${escapeHtml(e.poste)}</strong>
            <div class="exp-meta">${escapeHtml(e.entreprise)} ${e.periode ? `| ${escapeHtml(e.periode)}` : ""}</div>
            ${e.description ? `<p>${escapeHtml(e.description)}</p>` : ""}
          </div>
        `).join("")}
        ${experiences.length ? `</div>` : ""}

        ${diplomes.length ? `<div class="cv-section"><h3>Formation</h3>` : ""}
        ${diplomes.map(d => `<p><strong>${escapeHtml(d.titre)}</strong> - ${escapeHtml(d.etab)} ${d.annee ? `| ${escapeHtml(d.annee)}` : ""}</p>`).join("")}
        ${diplomes.length ? `</div>` : ""}
      </div>
    </div>
  `;

  // wrap into render with chosen style
  const fullHtml = `
    <div class="cv-render cv-style-${style}">
      ${leftHtml}
      ${rightHtml}
    </div>
  `;

  document.getElementById("cv-content").innerHTML = fullHtml;
  // show preview, hide form
  document.getElementById("form-container").classList.add("hidden");
  document.getElementById("cv-preview").classList.remove("hidden");
  document.getElementById("cv-preview").setAttribute("aria-hidden","false");
}

/* ---------------- helpers ---------------- */
function niveauToPercent(niveau) {
  if (!niveau) return 40;
  const s = niveau.toLowerCase();
  if (s.includes("tr") || s.includes("tres") || s.includes("très")) return 95;
  if (s.includes("bien")) return 80;
  if (s.includes("moy") || s.includes("moyen")) return 60;
  return 50;
}
function escapeHtml(text) {
  if (text === null || text === undefined) return "";
  return String(text).replace(/[&<>"']/g, function (m) { return ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[m]; });
}
