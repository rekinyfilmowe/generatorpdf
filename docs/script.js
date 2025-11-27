async function loadData() {
    const params = new URLSearchParams(location.search);
    const key = params.get("key");
    if (!key) return null;

    const url = `data/${key}`;
    const res = await fetch(url);
    if (!res.ok) return null;

    return res.json();
}

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

    function opisOpcji(op) {
        return op.opis || op.meta?.opisKanoniczny || "";
    }

    function addKategoria(title) {
        lista.innerHTML += `<div class="category">${title}</div>`;
    }

    function addOpcja(op) {
        const opis = opisOpcji(op);

        lista.innerHTML += `
            <div class="option-block">
                <div class="option-row">
                    <span class="option-name">${op.nazwa}</span>
                    <span class="option-price">${op.cenaBrutto.toLocaleString("pl-PL")} zł</span>
                </div>
                ${opis ? `<div class="option-desc">${opis}</div>` : ""}
            </div>
        `;
    }

    if (tech.length) {
        addKategoria("Składowe Techniczne:");
        tech.forEach(addOpcja);
    }

    if (rez.length) {
        addKategoria("Rezultaty Dzieła:");
        rez.forEach(addOpcja);
    }

    /* RODZAJ REZERWACJI */
    document.getElementById("rodzajRezerwacjiOpis").textContent =
        oferta.rodzajRezerwacjiOpis;

    document.getElementById("rodzajRezerwacjiCena").textContent =
        oferta.bezzwrotnaDodatkowaKwota > 0
            ? `+ ${oferta.bezzwrotnaDodatkowaKwota.toLocaleString("pl-PL")} zł`
            : "0 zł";

    /* PODSUMOWANIE */
    document.getElementById("sumaPrzedRabatem").textContent =
        oferta.sumaBruttoPrzedRabatem.toLocaleString("pl-PL") + " zł";

    document.getElementById("zgodaMarketingowa").textContent =
        oferta.wartoscVATPrzedRabatem > 0
            ? `- ${oferta.wartoscVATPrzedRabatem.toLocaleString("pl-PL")} zł`
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

function autoPDF() {
    html2pdf()
        .set({
            margin: 0,
            filename: "oferta.pdf",
            html2canvas: { scale: 3, useCORS: true },
            jsPDF: { unit: "mm", format: "a4" }
        })
        .from(document.getElementById("pdf-root"))
        .save();
}

window.onload = async () => {
    const data = await loadData();
    if (!data) return;

    renderOferta(data);

    setTimeout(autoPDF, 600);
};
