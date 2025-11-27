/* =========================================================
   1) ŁADOWANIE DANYCH JSON Z GITHUB
========================================================= */
async function loadData() {
    const params = new URLSearchParams(location.search);
    const key = params.get("key");
    if (!key) {
        alert("Brak klucza PDF");
        return null;
    }

    const url = `https://raw.githubusercontent.com/rekinyfilmowe/generatorpdf/main/data/${key}`;

    const res = await fetch(url);
    if (!res.ok) {
        alert("Błąd pobierania danych PDF: " + res.status);
        return null;
    }

    return res.json();
}

/* =========================================================
   2) RENDER
========================================================= */

function renderOferta(data) {
    const { karta, oferta, tworca, spolka } = data;

    /* METADANE */

    document.getElementById("dataUtworzenia").textContent =
        new Date(oferta._createdDate).toLocaleString("pl-PL");

    document.getElementById("autor").textContent =
        oferta.autor || "—";

    document.getElementById("dataRealizacji").textContent =
        karta.dataRealizacji
            ? karta.dataRealizacji
            : "—";

    document.getElementById("miejsceRealizacji").textContent =
        karta.miejsceRealizacji?.formatted || "—";

    document.getElementById("typRealizacji").textContent =
        karta.typRealizacji || "—";

    document.getElementById("typUslugi").textContent =
        karta.typUslugi || "—";

    document.getElementById("tworca").textContent =
        `${tworca.imie} ${tworca.nazwisko}`;

    document.getElementById("liczbaOperatorow").textContent =
        oferta.liczbaAsystentow
            ? oferta.liczbaAsystentow + 1
            : 1;

    /* KATEGORIE OPCJI */

    const lista = document.getElementById("listaOpcji");
    lista.innerHTML = "";

    const opcje = oferta.wybraneOpcje;

    const categories = {
        tech: [],
        rezultaty: []
    };

    // podział wg plikWynikowy
    for (const op of opcje) {
        if (op.podtyp === "2") categories.rezultaty.push(op);
        else categories.tech.push(op);
    }

    if (categories.tech.length > 0) {
        lista.innerHTML += `<div class="category">Składowe Techniczne</div>`;
        categories.tech.forEach(op => {
            lista.innerHTML += `
                <div class="option-row">
                    <span>${op.nazwa}</span>
                    <span>${op.cenaBrutto.toLocaleString("pl-PL")} zł</span>
                </div>`;
        });
    }

    if (categories.rezultaty.length > 0) {
        lista.innerHTML += `<div class="category">Rezultaty Dzieła</div>`;
        categories.rezultaty.forEach(op => {
            lista.innerHTML += `
                <div class="option-row">
                    <span>${op.nazwa}</span>
                    <span>${op.cenaBrutto.toLocaleString("pl-PL")} zł</span>
                </div>`;
        });
    }

    /* RODZAJ REZERWACJI */

    document.getElementById("rodzajRezerwacjiOpis").textContent =
        oferta.rodzajRezerwacjiOpis;

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

    const sumaKoncowa =
        oferta.sumaBrutto + oferta.kosztDojazdu;

    document.getElementById("sumaKoncowa").textContent =
        sumaKoncowa.toLocaleString("pl-PL") + " zł";
}

/* =========================================================
   3) GENEROWANIE PDF
========================================================= */

function autoPDF() {
    const element = document.getElementById("pdf-root");

    html2pdf()
        .set({
            margin: 0,
            filename: "oferta.pdf",
            image: { type: "jpeg", quality: 1 },
            html2canvas: { scale: 3 },
            jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
        })
        .from(element)
        .save();
}

/* =========================================================
   4) START
========================================================= */

window.onload = async () => {
    const data = await loadData();
    if (!data) return;

    renderOferta(data);

    setTimeout(autoPDF, 400);
};
