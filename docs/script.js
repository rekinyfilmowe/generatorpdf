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

/* FORMATERY WIX */
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
        new Date().toLocaleString("pl-PL");

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

    const nocleg = (oferta.nocleg ?? "").toString().trim();
    document.getElementById("noclegFinal").textContent =
        nocleg !== "" ? nocleg : "-";

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

        if (op.podtyp) {
            const m = String(op.podtyp).match(/\d+/);
            if (m && Number(m[0]) >= 2) {
                if (op.idLocal === "bazaCeny" || op.idLocalOpcji === "bazaCeny") {
                    parts.push(`ilość godzin pracy: ${m[0]} (maksymalnie do 00:30)`);
                } else {
                    parts.push(`ilość: ${m[0]}`);
                }
            }
        }

        let czas = op.czasTrwania || extractTimeFromName(op.nazwa) || "";
        if (czas) parts.push(`długość: ${formatDuration(czas)}`);

        if (op.meta?.plikWynikowy) {
            const dni = op.terminOddania ?? op.meta?.terminOddania ?? 180;
            const termin = formatTermin(karta.dataRealizacji, dni);
            if (termin) parts.push(`termin oddania: ${termin}`);
        }

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
            <div class="option-block nosplit">

                <div class="option-row">
                    <span>${op.nazwa}</span>
                    <span>${op.cenaBrutto.toLocaleString("pl-PL")} zł</span>
                </div>

                ${opisTechniczny ? `<div class="option-meta">${opisTechniczny}</div>` : ""}
                ${op.opis ? `<div class="option-desc">${op.opis}</div>` : ""}

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

    let nazwaRodzaju = "";
    if (oferta.bezzwrotnaDodatkowaKwota > 0) {
        nazwaRodzaju = "Rezerwacja zwrotna";
    } else if (oferta.bezzwrotna === true) {
        nazwaRodzaju = "Rezerwacja bezzwrotna";
    }

    lista.innerHTML += `
        <div class="category">Rodzaj rezerwacji</div>

        <div class="option-block nosplit">
            <div class="option-row">
                <span>${nazwaRodzaju}</span>
                <span>${
                    oferta.bezzwrotnaDodatkowaKwota > 0
                        ? oferta.bezzwrotnaDodatkowaKwota + " zł"
                        : "0 zł"
                }</span>
            </div>

            <div class="option-desc">${oferta.rodzajRezerwacjiOpis || ""}</div>
        </div>
    `;

    /* PODSUMOWANIE */

    document.getElementById("sumaPrzedRabatem").textContent =
        oferta.sumaBruttoPrzedRabatem.toLocaleString("pl-PL") + " zł";

    let zgoda = oferta.zgodaNazwaPubliczna || "Zgoda marketingowa";
    zgoda = zgoda.replace(/<\/?[^>]+(>|$)/g, "").trim();
    document.getElementById("zgodaMarketingowaLabel").textContent = zgoda;

    const sumaPrzed = oferta.sumaBruttoPrzedRabatem || 0;
    const sumaPo = oferta.sumaBrutto || 0;

    const rabat = Math.round(sumaPrzed - sumaPo);

    document.getElementById("zgodaMarketingowa").textContent =
        rabat > 0 ? `- ${rabat.toLocaleString("pl-PL")} zł` : "0 zł";

    document.getElementById("sumaPoRabacie").textContent =
        oferta.sumaBrutto.toLocaleString("pl-PL") + " zł";

    document.getElementById("kosztDojazdu").textContent =
        oferta.kosztDojazdu.toLocaleString("pl-PL") + " zł";

    const suma = oferta.sumaBrutto + oferta.kosztDojazdu;

    document.getElementById("sumaKoncowa").textContent =
        suma.toLocaleString("pl-PL") + " zł";

    window.__pdfKwota = suma;
    window.__pdfDataRealizacji = karta.dataRealizacji;
}

/* PDF GENERATOR */
function autoPDF() {
    const dataReal = formatDateForFilename(window.__pdfDataRealizacji || "");
    const kwota = (window.__pdfKwota || 0)
        .toLocaleString("pl-PL")
        .replace(/\s+/g, "_");

    const nazwaPliku = `Rekiny_Filmowe_Oferta_${kwota}_zl_${dataReal}.pdf`;

    html2pdf()
        .set({
            margin: [18, 0, 18, 0],
            filename: nazwaPliku,
            html2canvas: {
                scale: 4,
                letterRendering: true,
                backgroundColor: "#ffffff"
            },
            jsPDF: {
                unit: "mm",
                format: "a4",
                orientation: "portrait",
                putOnlyUsedFonts: true
            },
            pagebreak: {
                mode: "css"
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

function formatDateForFilename(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
}
