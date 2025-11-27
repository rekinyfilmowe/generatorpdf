/* =============================
    1) LOAD JSON
============================= */
async function loadData() {
    const params = new URLSearchParams(location.search);
    const key = params.get("key");
    if (!key) return null;

    const url = `https://raw.githubusercontent.com/rekinyfilmowe/generatorpdf/main/data/${key}`;
    const res = await fetch(url);

    if (!res.ok) return null;

    return res.json();
}

/* =============================
    2) RENDER
============================= */
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

    const tech = [];
    const rez = [];

    for (const op of oferta.wybraneOpcje) {
        if (op.podtyp === "2") rez.push(op);
        else tech.push(op);
    }

    if (tech.length) {
        lista.innerHTML += `<div class="category">Składowe Techniczne</div>`;
        tech.forEach(op => appendRow(op, lista));
    }

    if (rez.length) {
        lista.innerHTML += `<div class="category">Rezultaty Dzieła</div>`;
        rez.forEach(op => appendRow(op, lista));
    }

    function appendRow(op, lista) {
        lista.innerHTML += `
            <div class="option-row">
                <span>${op.nazwa}</span>
                <span>${op.cenaBrutto.toLocaleString("pl-PL")} zł</span>
            </div>
        `;
    }

    /* RODZAJ REZERWACJI */
    document.getElementById("rodzajRezerwacjiOpis").textContent =
        oferta.rodzajRezerwacjiOpis;

    if (oferta.bezzwrotnaDodatkowaKwota > 0) {
        document.getElementById("rodzajRezerwacjiCena").textContent =
            `+ ${oferta.bezzwrotnaDodatkowaKwota.toLocaleString("pl-PL")} zł`;
    } else {
        document.getElementById("rodzajRezerwacjiCena").textContent = `0 zł`;
    }

    /* PODSUMOWANIE */
    document.getElementById("sumaPrzedRabatem").textContent =
        oferta.sumaBruttoPrzedRabatem.toLocaleString("pl-PL") + " zł";

    document.getElementById("zgodaMarketingowa").textContent =
        oferta.wartoscVATPrzedRabatem > 0
            ? "- " + oferta.wartoscVATPrzedRabatem.toLocaleString("pl-PL") + " zł"
            : "0 zł";

    document.getElementById("sumaPoRabacie").textContent =
        oferta.sumaBrutto.toLocaleString("pl-PL") + " zł";

    document.getElementById("kosztDojazdu").textContent =
        oferta.kosztDojazdu.toLocaleString("pl-PL") + " zł";

    const suma =
        oferta.sumaBrutto + oferta.kosztDojazdu;

    document.getElementById("sumaKoncowa").textContent =
        suma.toLocaleString("pl-PL") + " zł";
}

/* =============================
    3) PDF
============================= */
function autoPDF() {
    html2pdf()
        .set({
            margin: 0,
            filename: "oferta.pdf",
            html2canvas: { scale: 3 },
            jsPDF: { unit: "mm", format: "a4" }
        })
        .from(document.getElementById("pdf-root"))
        .save();
}

/* =============================
    4) START
============================= */
window.onload = async () => {
    const data = await loadData();
    if (!data) return;

    renderOferta(data);
    setTimeout(autoPDF, 400);
};
