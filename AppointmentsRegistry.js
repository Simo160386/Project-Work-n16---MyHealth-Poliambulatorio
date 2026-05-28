const API = "http://127.0.0.1:5000";

window.onload = function () {

    loadAppointments();
};



// LOAD APPOINTMENTS

function loadAppointments() {

    fetch(API + "/api/appointments")

    .then(res => res.json())

    .then(data => {

        const body =
            document.getElementById(
                "appointmentsBody"
            );

        body.innerHTML = "";

        data.appointments.forEach(a => {

            const tr =
                document.createElement("tr");

            tr.innerHTML = `

                <td>${a.id}</td>

                <td>${a.date}</td>

		<td>${a.hour}</td>

                <td>${a.description}</td>

                <td>${a.doctor}</td>

                <td>
                    ${a.patient_name}
                    ${a.patient_surname}
                </td>

            `;

            body.appendChild(tr);
        });
    })

    .catch(err => {

        console.error(err);

        alert(
            "Errore caricamento prenotazioni"
        );
    });
}



// RICERCA

function filterAppointments() {

    const input =

        document
        .getElementById(
            "searchAppointmentId"
        )
        .value
        .trim();

    const rows =

        document.querySelectorAll(
            "#appointmentsBody tr"
        );

    rows.forEach(row => {

        const cells =
            row.querySelectorAll("td");

        const appointmentId =
            cells[0].textContent.trim();

        row.style.display =

            appointmentId === input
            ? ""
            : "none";
    });

    // Se input vuoto → mostra tutto
    if (input === "") {

        rows.forEach(row => {

            row.style.display = "";
        });
    }
}



// TORNA DASHBOARD

function goBackDashboard() {

    window.location.href = "index.html";
}