function getDataFromURL() {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get("data");
    if (!encoded) return null;

    try {
        const json = decodeURIComponent(escape(atob(encoded)));
        return JSON.parse(json);
    } catch (e) {
        console.error("Błąd dekodowania:", e);
        return null;
    }
}

function renderOferta(data) {
    const { karta, oferta, tworca, spolka } = data;

    document.getElementById("dataUtworzenia").textContent =
        new Date(oferta._createdDate).toLocaleString("pl-PL");

    document.getElementById("utworzyl").textContent =
        tworca ? `${tworca.imie} ${tworca.nazwisko}` : "—";

    document.getElementById("dataRealizacji").textContent =
        karta.dataRealizacji ? new Date(karta.dataRealizacji).toLocaleDateString("pl-PL") : "—";

    document.getElementById("miejsceRealizacji").textContent =
        karta.miejsceRealizacji?.formattedAddressLine || "—";

    document.getElementById("typRealizacji").textContent = karta.typRealizacji || "—";
    document.getElementById("typUslugi").textContent = karta.typUslugi || "—";

    const listaOpcji = document.getElementById("listaOpcji");
    listaOpcji.innerHTML = "";

    oferta.wybraneOpcje.forEach(op => {
        const div = document.createElement("div");
        div.className = "opcja";

        div.innerHTML = `
            <div class="nazwa">${op.nazwa}</div>
            <div class="opis">${op.opis || ""}</div>
            <div>Cena: <strong>${op.cenaBrutto} zł</strong></div>
        `;

        listaOpcji.appendChild(div);
    });

    document.getElementById("sumaNetto").textContent = oferta.sumaNetto + " zł";
    document.getElementById("sumaVAT").textContent = oferta.wartoscVAT + " zł";
    document.getElementById("sumaBrutto").textContent = oferta.sumaCalkowita + " zł";
    document.getElementById("kosztDojazdu").textContent = oferta.kosztDojazdu + " zł";

    document.getElementById("firma").textContent =
        `${spolka.nazwa}, NIP ${spolka.nip}`;
}

function autoPDF() {
    const element = document.getElementById("pdf-root");

    const opt = {
        margin: 0,
        filename: 'oferta.pdf',
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { scale: 3 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
}

window.onload = () => {
    const data = getDataFromURL();
    if (!data) return;

    renderOferta(data);

    setTimeout(autoPDF, 300);
};
