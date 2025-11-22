/* =========================================================
   1) ŁADOWANIE DANYCH JSON Z GITHUB (key → data/key.json)
========================================================= */
async function loadData() {
    const params = new URLSearchParams(location.search);
    const key = params.get("key");
    if (!key) {
        alert("Brak klucza PDF");
        return null;
    }

    const url = `https://raw.githubusercontent.com/rekinyfilmowe/generatorpdf/main/data/${key}`;
    const response = await fetch(url);

    if (!response.ok) {
        alert("Błąd pobierania danych PDF: " + response.status);
        return null;
    }

    return response.json();
}

/* =========================================================
   2) RENDEROWANIE OFERTY NA STRONIE HTML
========================================================= */

function renderOferta(data) {
    const { karta, oferta, tworca, spolka } = data;

    // --- podstawowe dane ---
    document.getElementById("dataUtworzenia").textContent =
        new Date(oferta._createdDate).toLocaleString("pl-PL");

    document.getElementById("autor").textContent =
        oferta.imieNazwiskoZamawiajacego || "—";

    document.getElementById("dataRealizacji").textContent =
        karta.dataRealizacji
            ? new Date(karta.dataRealizacji).toLocaleDateString("pl-PL")
            : "—";

    document.getElementById("miejsceRealizacji").textContent =
        karta.miejsceRealizacji?.formattedAddressLine || "—";

    document.getElementById("typRealizacji").textContent =
        karta.typRealizacji || "—";

    document.getElementById("typUslugi").textContent =
        karta.typUslugi || "—";

    // --- twórca ---
    if (tworca) {
        document.getElementById("tworca").textContent =
            `${tworca.imie} ${tworca.nazwisko}`;
    }

    // --- lista opcji ---
    const listaOpcji = document.getElementById("listaOpcji");
    listaOpcji.innerHTML = "";

    oferta.wybraneOpcje.forEach(op => {
        const el = document.createElement("div");
        el.className = "opcja";

        el.innerHTML = `
            <div class="nazwaOpcji">${op.nazwa}</div>
            <div class="opisOpcji">${op.opisKanoniczny || ""}</div>
            <div class="cenaOpcji">${op.cenaBrutto} zł</div>
        `;

        listaOpcji.appendChild(el);
    });

    // --- podsumowanie ---
    document.getElementById("cenaNetto").textContent =
        oferta.sumaNetto + " zł";

    document.getElementById("cenaVat").textContent =
        oferta.wartoscVAT + " zł";

    document.getElementById("cenaBrutto").textContent =
        oferta.sumaCalkowita + " zł";

    document.getElementById("kosztDojazdu").textContent =
        oferta.kosztDojazdu + " zł";

    // --- spółka ---
    if (spolka) {
        document.getElementById("spolkaNazwa").textContent = spolka.nazwa || "";
        document.getElementById("spolkaNip").textContent = "NIP: " + (spolka.nip || "");
        document.getElementById("spolkaAdres").textContent = spolka.adres || "";
    }
}

/* =========================================================
   3) GENEROWANIE PDF
========================================================= */

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

/* =========================================================
   4) START
========================================================= */

window.onload = async () => {
    const data = await loadData();
    if (!data) return;

    renderOferta(data);

    // mały delay, żeby DOM się narysował
    setTimeout(autoPDF, 300);
};
