/* LOAD JSON */
async function loadData() {
    const params = new URLSearchParams(location.search);
    const key = params.get("key");
    if (!key) return null;

    const url = `https://raw.githubusercontent.com/rekinyfilmowe/generatorpdf/main/data/${key}`;
    const res = await fetch(url);

    if (!res.ok) return null;
    return res.json();
}

/* FORMATERY WIX (przeniesione 1:1) */
function formatDuration(timeStr) {
    if (!timeStr) return "";
    const clean = timeStr.trim().toLowerCase();

    if (clean.includes("sek") || clean.includes("min") || clean.includes("godz"))
        return timeStr.trim();

    const num = Number(clean);
    if (!isNaN(num)) return `${num} min`;

    return timeStr.trim();
}

function extractTimeFromName(name) {
    if (!name) return "";

    const m = name.match(/(\d+(\s*[-–]\s*\d+)?)(\s*)(min|sek|godz)/i);
    if (m) return m[1] + " " + m[4];

    return "";
}

function formatTermin(kartaData, dni) {
    if (!kartaData) return "";
    const base = new Date(kartaData);
    if (isNaN(base.getTime())) return "";
   base.setDate(base.getDate() + dni);
    return base.toLocaleDateString("pl-PL");
}

/* RENDER */
function renderOferta({ karta, oferta, tworca }) {

    /* METADANE */
    document.getElementById("dataUtworzenia").textContent =
        new Date(oferta._createdDate).toLocaleString("pl-PL");

    document.getElementById("autor").textContent =
        oferta.autor || "—";

    document.getElementById("dataRealizacji").textContent =
        karta.dataRealizacji || "—";

    document.getElementById("miejsceRealizacji").textContent =
        karta.miejsceRealizacji?.formatted || "—";

    document.getElementById("typRealizacji").textContent =
        karta.typRealizacji;

    document.getElementById("typUslugi").textContent =
        karta.typUslugi;

    document.getElementById("tworca").textContent =
        `${tworca.imie} ${tworca.nazwisko}`;

    document.getElementById("liczbaOperatorow").textContent =
       oferta.liczbaAsystentow ? oferta.liczbaAsystentow + 1 : 1;

    /* OPCJE */
    const lista = document.getElementById("listaOpcji");
    lista.innerHTML = "";

    let opcje = oferta.wybraneOpcje.sort((a, b) =>
        (a.meta?.kanonicznaKolejnosc ?? 9999) -
        (b.meta?.kanonicznaKolejnosc ?? 9999)
    );

    const tech = [];
    const rez = [];

    for (const op of opcje) {
        if (op.meta?.plikWynikowy) rez.push(op);
        else tech.push(op);
    }

    function kategoria(txt) {
      lista.innerHTML += `<div class="category">${txt}</div>`;
    }

    function getOpisTechniczny(op) {

        const parts = [];

        // ilość
        if (op.podtyp) {
           const m = String(op.podtyp).match(/\d+/);
            if (m && Number(m[0]) >= 2) parts.push(`ilość: ${m[0]}`);
        }

        // czas trwania
        let czas = op.czasTrwania || extractTimeFromName(op.nazwa) || "";
        if (czas) {
            parts.push(`długość: ${formatDuration(czas)}`);
        }

        // termin oddania (tylko dla plików wynikowych)
        if (op.meta?.plikWynikowy) {
            const dni = op.terminOddania ?? op.meta?.terminOddania ?? 180;
            const termin = formatTermin(karta.dataRealizacji, dni);
            if (termin) parts.push(`termin oddania: ${termin}`);
        }

        // 🔥 SPECJALNY CASE: bazaCeny → dodaj ilość operatorów
if (op.idLocal === "bazaCeny" || op.idLocalOpcji === "bazaCeny") {
    const asystenci = Number(oferta.liczbaAsystentow ?? 0);
    const operatorzy = 1 + (isNaN(asystenci) ? 0 : asystenci);
    parts.push(`ilość operatorów: ${operatorzy}`);
}


        return parts.length ? parts.join(" • ") : "";
    }

    function addOpcja(op) {

        const opisTechniczny = getOpisTechniczny(op);

        lista.innerHTML += `
            <div class="option-block">

                <div class="option-row">
                    <span>${op.nazwa}</span>
                    <span>${op.cenaBrutto.toLocaleString("pl-PL")} zł</span>
                </div>

                ${opisTechniczny
                    ? `<div class="option-meta">${opisTechniczny}</div>`
                    : ""}

                ${op.opis
                    ? `<div class="option-desc">${op.opis}</div>`
                    : ""}

            </div>
        `;
    }

    if (tech.length) {
        kategoria("Składowe Techniczne");
        tech.forEach(addOpcja);
    }

    if (rez.length) {
        kategoria("Rezultaty Dzieła");
        rez.forEach(addOpcja);
    }

    /* RODZAJ REZERWACJI */
    document.getElementById("rodzajRezerwacjiOpis").textContent =
        oferta.rodzajRezerwacjiOpis;

    document.getElementById("rodzajRezerwacjiCena").textContent =
        oferta.bezzwrotnaDodatkowaKwota > 0
            ? `${oferta.bezzwrotnaDodatkowaKwota} zł`
            : "0 zł";

    /* PODSUMOWANIE */
    document.getElementById("sumaPrzedRabatem").textContent =
        oferta.sumaBruttoPrzedRabatem.toLocaleString("pl-PL") + " zł";

    let zgoda = oferta.zgodaNazwaPubliczna || "Zgoda marketingowa";

// Usuń wszystkie tagi HTML (p, strong, span itp.)
zgoda = zgoda.replace(/<\/?[^>]+(>|$)/g, "").trim();

document.getElementById("zgodaMarketingowaLabel").textContent = zgoda;

// Wyliczamy rabat identycznie jak w Wix
const sumaPrzed = oferta.sumaBruttoPrzedRabatem || 0;
const sumaPo = oferta.sumaBrutto || 0;

const rabat = Math.round(sumaPrzed - sumaPo);

document.getElementById("zgodaMarketingowa").textContent =
    rabat > 0
        ? `- ${rabat.toLocaleString("pl-PL")} zł`
        : "0 zł";

    document.getElementById("sumaPoRabacie").textContent =
        oferta.sumaBrutto.toLocaleString("pl-PL") + " zł";

    document.getElementById("kosztDojazdu").textContent =
        oferta.kosztDojazdu.toLocaleString("pl-PL") + " zł";

    const suma = oferta.sumaBrutto + oferta.kosztDojazdu;

    document.getElementById("sumaKoncowa").textContent =
        suma.toLocaleString("pl-PL") + " zł";
}

/* PDF */
function autoPDF() {
    html2pdf()
        .set({
            margin: 0,
            filename: "oferta.pdf",
            html2canvas: {
                scale: 2,
                letterRendering: true,
                backgroundColor: "#ffffff"
            },
            jsPDF: {
                unit: "mm",
                format: "a4",
                orientation: "portrait"
            },
            pagebreak: {
                mode: ['css', 'legacy'],
                avoid: ['.option-block', '.rezerwacja-row']
            }
        })
        .from(document.getElementById("pdf-root"))
        .save();
}

window.onload = async () => {
    const data = await loadData();
    if (!data) return;

    renderOferta(data);

    setTimeout(autoPDF, 500);
};
