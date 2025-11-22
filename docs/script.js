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

    /* ===============================
       DANE PODSTAWOWE
    =============================== */

    document.getElementById("dataUtworzenia").textContent =
        new Date(oferta._createdDate).toLocaleString("pl-PL");

    // klient - brak w JSON → placeholder
    document.getElementById("autor").textContent = "—";

    /* ===============================
       DANE REALIZACJI
    =============================== */

    document.getElementById("dataRealizacji").textContent =
        karta.dataRealizacji
            ? new Date(karta.dataRealizacji).toLocaleDateString("pl-PL")
            : "—";

    document.getElementById("miejsceRealizacji").textContent =
        karta.miejsceRealizacji?.formatted || "—";

    document.getElementById("typRealizacji").textContent =
        karta.typRealizacji || "—";

    document.getElementById("typUslugi").textContent =
        karta.typUslugi || "—";

    /* ===============================
       TWÓRCA
    =============================== */

    if (tworca) {
        document.getElementById("tworca").textContent =
            `${tworca.imie} ${tworca.nazwisko}`;
    } else {
        document.getElementById("tworca").textContent = "—";
    }

    /* ===============================
       POZYCJE
    =============================== */

    const listaOpcji = document.getElementById("listaOpcji");
    listaOpcji.innerHTML = "";

    oferta.wybraneOpcje.forEach(op => {
        const el = document.createElement("div");
        el.className = "opcja";

        el.innerHTML = `
            <div class="nazwaOpcji">${op.nazwa}</div>
            <div class="cenaOpcji">${op.cenaBrutto.toLocaleString("pl-PL")} zł</div>
        `;

        listaOpcji.appendChild(el);
    });

    /* ===============================
       PODSUMOWANIE
    =============================== */

    document.getElementById("cenaNetto").textContent =
        oferta.sumaNetto.toLocaleString("pl-PL") + " zł";

    document.getElementById("cenaVat").textContent =
        oferta.wartoscVAT.toLocaleString("pl-PL") + " zł";

    document.getElementById("cenaBrutto").textContent =
        oferta.sumaBrutto.toLocaleString("pl-PL") + " zł";

    document.getElementById("kosztDojazdu").textContent =
        oferta.kosztDojazdu.toLocaleString("pl-PL") + " zł";

    /* ===============================
       SPÓŁKA
    =============================== */

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
