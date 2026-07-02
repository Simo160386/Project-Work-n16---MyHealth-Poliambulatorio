const API = "http://127.0.0.1:5000";

window.onload = function () {

     loadDoctorAppointments();
     loadReports();
};










function loadDoctorAppointments() {

    const doctorName =
        sessionStorage.getItem(
            "username"
        );

    fetch(

        API +

        "/api/appointments-by-doctor/" +

        doctorName
    )

    .then(res => res.json())

    .then(data => {

        const select =

            document.getElementById(
                "appointment_select"
            );

        select.innerHTML =

            '<option value="">Seleziona Visita</option>';

        data.forEach(a => {

          select.innerHTML += `

    		<option value="${a.id}"

        		data-name="${a.patient_name}"

        		data-surname="${a.patient_surname}"

        		data-cf="${a.fiscal_code}">

        		ID ${a.id} - ${a.description}

    		</option>

	`;
        });
    });
}








function loadAppointmentData() {

    const select = document.getElementById("appointment_select");

    const option = select.options[select.selectedIndex];

    document.getElementById("patient_name").value = option.dataset.name || "";

    document.getElementById("patient_surname").value =option.dataset.surname || "";

    document.getElementById("fiscal_code").value = option.dataset.cf || "";
}








// CREATE REPORT

function createReport() {

    const appointment_id = document.getElementById("appointment_select").value;

    const patient_name = document.getElementById("patient_name").value.trim();

    const patient_surname = document.getElementById("patient_surname").value.trim();

    const fiscal_code = document.getElementById("fiscal_code").value.trim();

    const notes = document.getElementById("notes").value.trim();

    const attachment = document.getElementById("attachment").files[0];

    if (!attachment) {

    	alert(
        	"ATTENZIONE: Obbligatorio allegare il referto"
   	);

    	return;
    }


    if (
        !appointment_id ||
        !patient_name ||
        !patient_surname ||
        !fiscal_code
    ) {

        alert(
            "ATTENZIONE: Compila tutti i campi obbligatori"
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
        "patient_name",
        patient_name
    );

    formData.append(
        "patient_surname",
        patient_surname
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

    .then(async res => {

        const data =
            await res.json();

        if (!res.ok) {

            alert(
                data.message
            );

            return;
        }

        alert(
            data.message
        );
	document.getElementById(
    		"appointment_select"
	).selectedIndex = 0;

	document.getElementById(
    		"patient_name"
	).value = "";

	document.getElementById(
    		"patient_surname"
	).value = "";

	document.getElementById(
    		"fiscal_code"
	).value = "";

	document.getElementById(
    		"notes"
	).value = "";

	document.getElementById(
    		"attachment"
	).value = "";

	loadDoctorAppointments();
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

    const doctorName =
        sessionStorage.getItem(
            "username"
        );

    fetch(
        API +
        "/api/reports-by-doctor/" +
        doctorName
    )

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

    let found = false;

    rows.forEach(row => {

        const cells =
            row.querySelectorAll("td");

        const appointmentId =
            cells[1]
            .textContent
            .trim();

        const fiscalCode =
            cells[6]
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

        if (visible) {
            found = true;
        }

    });

     if (
    	!found &&
    	(idSearch || cfSearch)
     ) {

    	alert(
        	"Attenzione: ID Visita o Codice Fiscale errato e/o inesistente!"
    	);

    	rows.forEach(row => {

        	row.style.display = "";

    	});

    	document.getElementById(
        	"searchAppointmentId"
    	).value = "";

    	document.getElementById(
        	"searchFiscalCode"
    	).value = "";
    }

    
}

function goBackDashboard() {

    window.location.href =
        "index.html";
}