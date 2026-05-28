const API = "http://127.0.0.1:5000";

window.onload = function () {

    loadPatients();
};



// CARICA PAZIENTI

function loadPatients() {

    fetch(API + "/api/patients")

    .then(res => res.json())

    .then(data => {

        const body =
            document.getElementById("patientsBody");

        body.innerHTML = "";

        data.forEach(p => {

            const tr =
                document.createElement("tr");

            tr.innerHTML = `

                <td>${p.id}</td>

                <td>${p.name}</td>

                <td>${p.surname}</td>

                <td>${p.birth_date}</td>

                <td>${p.gender}</td>

                <td>${p.phone}</td>

                <td>${p.email}</td>

                <td>${p.fiscal_code}</td>

            `;

            body.appendChild(tr);
        });
    })

    .catch(err => {

        console.error(err);

        alert("Errore caricamento pazienti");
    });
}



// RICERCA PAZIENTE

function filterPatients() {

    const nameInput =

        document
        .getElementById("searchName")
        .value
        .toLowerCase()
        .trim();

    const surnameInput =

        document
        .getElementById("searchSurname")
        .value
        .toLowerCase()
        .trim();

    const rows =

        document.querySelectorAll(
            "#patientsBody tr"
        );

    rows.forEach(row => {

        const cells =
            row.querySelectorAll("td");

        const patientName =
            cells[1]
            .textContent
            .toLowerCase();

        const patientSurname =
            cells[2]
            .textContent
            .toLowerCase();

        const matchName =
            patientName.includes(nameInput);

        const matchSurname =
            patientSurname.includes(
                surnameInput
            );

        row.style.display =

            (matchName && matchSurname)
            ? ""
            : "none";
    });
}


// TORNA DASHBOARD

function goBackDashboard() {

    window.location.href = "index.html";
}