const API = "http://127.0.0.1:5000";

window.onload = function () {

    loadReports();
};



// CREATE REPORT

function createReport() {

    const appointment_id =
        document.getElementById(
            "appointment_id"
        ).value;

    const fiscal_code =
        document.getElementById(
            "fiscal_code"
        ).value.trim();

    const notes =
        document.getElementById(
            "notes"
        ).value.trim();

    const attachment =
        document.getElementById(
            "attachment"
        ).files[0];

    if (
        !appointment_id ||
        !fiscal_code
    ) {

        alert(
            "Compila tutti i campi obbligatori"
        );

        return;
    }

    const formData =
        new FormData();

    formData.append(
        "appointment_id",
        appointment_id
    );

    formData.append(
        "fiscal_code",
        fiscal_code
    );

    formData.append(
        "notes",
        notes
    );

    if (attachment) {

        formData.append(
            "attachment",
            attachment
        );
    }

    fetch(API + "/api/reports", {

        method: "POST",

        body: formData
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

                <td>${r.name}</td>

		<td>${r.surname}</td>

                <td>${r.fiscal_code}</td>

		<td>
    		    ${
        		r.attachment
        		? `<a href="${API}/${r.attachment}"
             			target="_blank"
             			style="
                			color:#007bff;
                			font-weight:bold;
                			text-decoration:none;
             			">
             			<i class="fa-solid fa-paperclip"></i>
             			Apri
           		    </a>`
        		: 'Nessun allegato'
    		    }
		</td>

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

    const idSearch =

        document
        .getElementById(
            "searchAppointmentId"
        )
        .value
        .trim();

    const cfSearch =

        document
        .getElementById(
            "searchFiscalCode"
        )
        .value
        .trim()
        .toUpperCase();

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

        const fiscalCode =
            cells[5]
            .textContent
            .trim()
            .toUpperCase();

        let visible = true;

        if (
            idSearch &&
            appointmentId !== idSearch
        ) {

            visible = false;
        }

        if (
            cfSearch &&
            fiscalCode !== cfSearch
        ) {

            visible = false;
        }

        row.style.display =
            visible ? "" : "none";
    });
}


// TORNA DASHBOARD

function goBackDashboard() {

    window.location.href =
        "index.html";
}