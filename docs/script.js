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

function renderOferta(data) {
    const { karta, oferta, tworca, spolka } = data;

    document.getElementById("dataUtworzenia").textContent =
        new Date(oferta._createdDate).toLocaleString("pl-PL");

    document.getElementById("autor").textContent = karta.daneDoUmowy?.imieZam1 || "—";

    document.getElementById("dataRealizacji").textContent =
        karta.dataRealizacji || "—";

    document.getElementById("miejsceRealizacji").textContent =
        karta.miejsceRealizacji?.formatted || "—";

    document.getElementById("typRealizacji").textContent = karta.typRealizacji || "—";

    document.getElementById("typUslugi").textContent = karta.typUslugi || "—";

    document.getElementById("tworca").textContent =
        tworca ? `${tworca.imie} ${tworca.nazwisko}` : "—";

    document.getElementById("liczbaOperatorow").textContent =
        oferta.liczbaAsystentow ? oferta.liczbaAsystentow + 1 : "—";

    // opcje
    const lista = document.getElementById("listaOpcji");

    lista.innerHTML = "";

    oferta.wybraneOpcje.forEach(op => {
        const el = document.createElement("div");
        el.className = "opcja-item";
        el.innerHTML = `
            <span>${op.nazwa}</span>
            <span>${op.cenaBrutto.toLocaleString("pl-PL")} zł</span>
        `;
        lista.appendChild(el);
    });

    // rodzaj rezerwacji
    document.getElementById("rodzajRezerwacji").textContent =
        oferta.rodzajRezerwacjiOpis || "—";

    // podsumowanie finansowe
    document.getElementById("cenaPrzedRabatem").textContent =
        oferta.sumaBruttoPrzedRabatem.toLocaleString("pl-PL") + " zł";

    document.getElementById("zgodaMarketingowa").textContent =
        oferta.zgodaNazwaPubliczna ? "- " + oferta.wartoscVATPrzedRabatem : "0 zł";

    document.getElementById("doZaplaty").textContent =
        oferta.sumaBrutto.toLocaleString("pl-PL") + " zł";

    document.getElementById("kosztDojazdu").textContent =
        oferta.kosztDojazdu.toLocaleString("pl-PL") + " zł";

    const final = oferta.sumaBrutto + oferta.kosztDojazdu;
    document.getElementById("doZaplatyFinal").textContent =
        final.toLocaleString("pl-PL") + " zł";
}

function autoPDF() {
    const element = document.getElementById("pdf-root");

    const opt = {
        margin: 0,
        filename: "oferta.pdf",
        html2canvas: { scale: 3 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
    };

    html2pdf().set(opt).from(element).save();
}

window.onload = async () => {
    const data = await loadData();
    if (!data) return;

    renderOferta(data);

    setTimeout(autoPDF, 500);
};
