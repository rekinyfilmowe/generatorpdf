async function loadData() {
    const params = new URLSearchParams(location.search);
    const key = params.get("key");

    const url = `https://raw.githubusercontent.com/rekinyfilmowe/generatorpdf/main/data/${key}`;
    const res = await fetch(url);

    if (!res.ok) {
        alert("Błąd pobierania danych PDF: " + res.status);
        return null;
    }

    return res.json();
}

function formatPLN(num) {
    return num.toLocaleString("pl-PL") + " zł";
}

function renderOferta(data) {
    const { karta, oferta, tworca } = data;

    document.getElementById("dataUtworzenia").textContent =
        new Date(oferta._createdDate).toLocaleString("pl-PL");

    document.getElementById("autor").textContent =
        karta.daneDoUmowy?.imieZam1 || "—";

    document.getElementById("dataRealizacji").textContent =
        karta.dataRealizacji || "—";

    document.getElementById("miejsceRealizacji").textContent =
        karta.miejsceRealizacji?.formatted || "—";

    document.getElementById("typRealizacji").textContent =
        karta.typRealizacji || "—";

    document.getElementById("typUslugi").textContent =
        karta.typUslugi || "—";

    document.getElementById("tworca").textContent =
        tworca ? `${tworca.imie} ${tworca.nazwisko}` : "—";

    document.getElementById("liczbaOperatorow").textContent =
        oferta.liczbaAsystentow ? oferta.liczbaAsystentow + 1 : "—";

    // ----------------------------------------
    // OPCJE – kategorie 1:1 z Twoim layoutem
    // ----------------------------------------

    const lista = document.getElementById("listaOpcji");
    lista.innerHTML = "";

    // Kategorie
    const CATEGORIES = [
        {
            title: "Składowe Techniczne",
            filter: op => op.podtyp === "1" || op.podtyp === "14"
        },
        {
            title: "Rezultaty Dzieła",
            filter: op => op.podtyp === "2"
        }
    ];

    CATEGORIES.forEach(cat => {
        const items = oferta.wybraneOpcje.filter(cat.filter);
        if (!items.length) return;

        const catEl = document.createElement("div");
        catEl.className = "package-category";
        catEl.textContent = cat.title;
        lista.appendChild(catEl);

        items.forEach(op => {
            const itemEl = document.createElement("div");
            itemEl.className = "opcja-item";
            itemEl.innerHTML = `
                <span>${op.nazwa}</span>
                <span>${formatPLN(op.cenaBrutto)}</span>
            `;
            lista.appendChild(itemEl);
        });
    });

    // ----------------------------------------
    // RODZAJ REZERWACJI
    // ----------------------------------------
    document.getElementById("rodzajRezerwacji").textContent =
        oferta.rodzajRezerwacjiOpis || "—";

    // ----------------------------------------
    // PODSUMOWANIE FINANSOWE
    // ----------------------------------------
    document.getElementById("cenaPrzedRabatem").textContent =
        formatPLN(oferta.sumaBruttoPrzedRabatem);

    document.getElementById("zgodaMarketingowa").textContent =
        oferta.zgodaNazwaPubliczna ? "- " + oferta.wartoscVATPrzedRabatem + " zł" : "0 zł";

    document.getElementById("doZaplaty").textContent =
        formatPLN(oferta.sumaBrutto);

    document.getElementById("kosztDojazdu").textContent =
        formatPLN(oferta.kosztDojazdu);

    document.getElementById("doZaplatyFinal").textContent =
        formatPLN(oferta.sumaBrutto + oferta.kosztDojazdu);
}

function autoPDF() {
    const element = document.getElementById("pdf-root");

    const opt = {
        margin: 0,
        html2canvas: { scale: 3 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        filename: "oferta.pdf"
    };

    html2pdf().set(opt).from(element).save();
}

window.onload = async () => {
    const data = await loadData();
    if (!data) return;

    renderOferta(data);

    setTimeout(autoPDF, 500);
};
