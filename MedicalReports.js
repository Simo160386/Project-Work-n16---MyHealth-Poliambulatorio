const API = "http://127.0.0.1:5000";

window.onload = function () {

    loadReports();
};



// CREATE REPORT

function createReport() {

    const appointment_id =

        document
        .getElementById(
            "appointment_id"
        )
        .value;

    const diagnosis =

        document
        .getElementById(
            "diagnosis"
        )
        .value
        .trim();

    const therapy =

        document
        .getElementById(
            "therapy"
        )
        .value
        .trim();

    const notes =

        document
        .getElementById(
            "notes"
        )
        .value
        .trim();

    if (
        !appointment_id ||
        !diagnosis ||
        !therapy
    ) {

        alert(
            "Compila tutti i campi obbligatori"
        );

        return;
    }

    fetch(API + "/api/reports", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({

            appointment_id,

            diagnosis,

            therapy,

            notes
        })
    })

    .then(res => res.json())

    .then(data => {

        alert(data.message);

        loadReports();
    })

    .catch(err => {

        console.error(err);

        alert(
            "Errore creazione referto"
        );
    });
}



// LOAD REPORTS

function loadReports() {

    fetch(API + "/api/reports")

    .then(res => res.json())

    .then(data => {

        const body =

            document.getElementById(
                "reportsBody"
            );

        body.innerHTML = "";

        data.forEach(r => {

            const tr =
                document.createElement("tr");

            tr.innerHTML = `

                <td>${r.id}</td>

                <td>${r.appointment_id}</td>

                <td>${r.date}</td>

                <td>${r.visit_type}</td>

                <td>${r.patient}</td>

                <td>${r.doctor}</td>

                <td>${r.diagnosis}</td>

                <td>${r.therapy}</td>

                <td>${r.notes}</td>

            `;

            body.appendChild(tr);
        });
    })

    .catch(err => {

        console.error(err);

        alert(
            "Errore caricamento referti"
        );
    });
}



// FILTER REPORTS

function filterReports() {

    const input =

        document
        .getElementById(
            "searchAppointmentId"
        )
        .value
        .trim();

    const rows =

        document.querySelectorAll(
            "#reportsBody tr"
        );

    rows.forEach(row => {

        const cells =
            row.querySelectorAll("td");

        const appointmentId =
            cells[1]
            .textContent
            .trim();

        row.style.display =

            appointmentId === input
            ? ""
            : "none";
    });

    if (input === "") {

        rows.forEach(row => {

            row.style.display = "";
        });
    }
}



// TORNA DASHBOARD

function goBackDashboard() {

    window.location.href =
        "index.html";
}