


// LOGIN STAFF

function loginStaff() {

    const username = document.getElementById("username_staff").value;

    const password = document.getElementById("password_staff").value;

    loginUser(username, password);
}




// LOGIN DOCTOR

function loginDoctor() {

    const username =document.getElementById("username_doctor").value;

    const password =document.getElementById("password_doctor").value;

    loginUser(username,password);
}



// LOGIN USER

function loginUser(username,password) {

    fetch(API + "/api/login", {

        method: "POST",

        headers: {
            "Content-Type":
            "application/json"
        },

        body: JSON.stringify({
            username,
            password
        })
    })

    .then(res => res.json())

    .then(data => {

          if (!data.success) {

    		alert("Login fallito");

    		// Pulisce entrambi i form

    		document.getElementById(
        		"username_staff"
    		).value = "";

    		document.getElementById(
        		"password_staff"
    		).value = "";

    		document.getElementById(
        		"username_doctor"
    		).value = "";

    		document.getElementById(
        		"password_doctor"
    		).value = "";

    		return;
	}



        sessionStorage.setItem(
            "loggedIn",
            "true"
        );

        sessionStorage.setItem(
            "role",
            data.role
        );
	
	sessionStorage.setItem(
    		"username",
    		username
	);
	
	document.getElementById(
    		"username_staff"
	).value = "";

	document.getElementById(
    		"password_staff"
	).value = "";

	document.getElementById(
    		"username_doctor"
	).value = "";

	document.getElementById(
    		"password_doctor"
	).value = "";



        document.getElementById(
            "login-section"
        ).style.display = "none";



        // STAFF

        if (data.role === "staff") {

            document.getElementById(
                "staff-dashboard"
            ).style.display = "block";




            loadPatientsSelect();
        }



        // MEDICO

        if (data.role === "doctor") {

            document.getElementById(
                "doctor-dashboard"
            ).style.display = "block";
        }
    });
}




const API = "http://127.0.0.1:5000";

let selectedDoctorId = null;
let selectedDoctorName = null;




// CONTROLLA SESSIONE AL CARICAMENTO

window.onload = function () {

    const loggedIn =
        sessionStorage.getItem("loggedIn");

    const role =
        sessionStorage.getItem("role");






// NASCONDE TUTTE LE DASHBOARD

    document.getElementById(
        "staff-dashboard"
    ).style.display = "none";

    document.getElementById(
        "doctor-dashboard"
    ).style.display = "none";





// SESSIONE ATTIVA

    if (loggedIn === "true") {

        document.getElementById(
            "login-section"
        ).style.display = "none";



        // STAFF

        if (role === "staff") {

            document.getElementById(
                "staff-dashboard"
            ).style.display = "block";

            loadPatientsSelect();
        }



        // MEDICO

        if (role === "doctor") {

            document.getElementById(
                "doctor-dashboard"
            ).style.display = "block";
        }

    }




// NESSUN LOGIN

    else {

        document.getElementById(
            "login-section"
        ).style.display = "block";
    }
};





// LOGOUT

function logout() {

    sessionStorage.removeItem("loggedIn");

    	document.getElementById("staff-dashboard").style.display = "none";

	document.getElementById("doctor-dashboard").style.display = "none";
    	document.getElementById("login-section").style.display = "block";

    // pulisce campi login

   	document.getElementById("username_staff").value = "";
	document.getElementById("password_staff").value = "";

	document.getElementById("username_doctor").value = "";
	document.getElementById("password_doctor").value = "";
}













// LOAD DOCTORS (dropdown)

function loadDoctors() {

	

    fetch(API + "/api/doctors")

    .then(res => res.json())

    .then(data => {

        const select =
            document.getElementById(
                "doctor_select"
            );

        select.innerHTML =

            `<option value="">
                Seleziona Medico
            </option>`;

        data.forEach(d => {

            const option =
                document.createElement("option");

            option.value = d.id;

            option.textContent = d.name;

            select.appendChild(option);
        });
    });
}








// LOAD PATIENTS IN SELECT

function loadPatientsSelect() {

    fetch(API + "/api/patients")
    .then(res => res.json())
    .then(data => {

        const select = document.getElementById("patient_select");

        // reset
        select.innerHTML =
            '<option value="">Seleziona Paziente</option>';

        data.forEach(p => {

            const option = document.createElement("option");

            option.value = p.id;

            option.textContent =
                `${p.id} - ${p.name} ${p.surname}`;

            select.appendChild(option);
        });
    })
    .catch(err => {

        console.error(err);
        alert("Errore caricamento pazienti");
    });
}






//CARICA DOTTORE X VISITA

function loadDoctorsByVisit() {

    const visit =
        document.getElementById(
            "description"
        ).value;

    if (!visit) return;

    fetch(
        API +
        "/api/available-dates-by-visit/" +
        encodeURIComponent(visit)
    )

    .then(res => res.json())

    .then(data => {

        const dateSelect =
            document.getElementById(
                "date"
            );

        dateSelect.innerHTML =
            '<option value="">Seleziona Data</option>';

        data.forEach(d => {

            dateSelect.innerHTML +=
                `<option value="${d}">
                    ${d}
                </option>`;
        });
    });
}







//CARICA ORE DISPONIBILI

function loadAvailableHours() {

    const visit =
        document.getElementById(
            "description"
        ).value;

    const date =
        document.getElementById(
            "date"
        ).value;

    if (!visit || !date) {

        return;
    }

    fetch(
        API +
        "/api/available-hours-by-visit/" +
        encodeURIComponent(visit) +
        "/" +
        encodeURIComponent(date)
    )

    .then(res => res.json())

    .then(data => {

        const hourSelect =
            document.getElementById(
                "hour"
            );

        hourSelect.innerHTML =
            '<option value="">Seleziona Orario</option>';

        data.forEach(h => {

            hourSelect.innerHTML +=
                `<option value="${h}">
                    ${h}
                </option>`;
        });
    });
}







//LOAD PATIENTS

function loadPatients() {
    fetch(API + "/api/patients")
    .then(res => res.json())
    .then(data => {
        const list = document.getElementById("patients");
        list.innerHTML = "";

        data.forEach(p => {
            const li = document.createElement("li");
            li.textContent =
	    `
            ID: ${p.id}
	    - ${p.name} ${p.surname}
	    - CF: ${p.fiscal_code}
	    - TEL: ${p.phone}
	    - EMAIL: ${p.email}
	    `;
            list.appendChild(li);
        });
    })
    .catch(err => {
        console.error(err);
        alert("Errore nel caricamento pazienti");
    });
}









// CREATE PATIENT

function createPatient() {
    const name = document.getElementById("name").value;
    const surname = document.getElementById("surname").value;

    if (!name || !surname) {
        alert("Attenzione!Si prega di compilare tutti i campi");
        return;
    }

    fetch(API + "/api/patients", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ name, surname })
    })
    .then(res => res.json())
    .then(data => {

    alert(data.message);

    // aggiorna lista se visibile
    const container = document.getElementById("patients-container");

    if (container.style.display === "block") {
        loadPatients();
    }

      loadPatientsSelect();

 });

}










// OPEN PATIENTPAGE


function openPatientPage() {

    window.location.href = "patient.html";
}

function openPatientsPage() {

    window.location.href =
        "PatientsRegistry.html";
}











// CREATE APPOINTMENT

function createAppointment() {

    const rawDate =
        document.getElementById("date").value;

    const hour =
        document.getElementById("hour").value;

    const description =
        document.getElementById("description").value;

    const patient_id =
        document.getElementById("patient_select").value;


    if (
        !rawDate ||
        !hour ||
        !description ||
        !patient_id
    ) {

        alert("Attenzione!Si prega di compilare tutti i campi");
        return;
    }

    const date = rawDate;

    fetch(API + "/api/appointments", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({

            date,
            hour,
            description,
            patient_id,

        })
    })

    .then(res => res.json())

    .then(data => {

        alert(data.message);

        // RESET FORM

        document.getElementById("patient_select").selectedIndex = 0;

        document.getElementById("description").selectedIndex = 0;

        selectedDoctorId = null;
	selectedDoctorName = null;

        document.getElementById("date").innerHTML =
            '<option value="">Seleziona Data</option>';

        document.getElementById("hour").innerHTML =
            '<option value="">Seleziona Orario</option>';

    })

    .catch(err => {

        console.error(err);

        alert("Errore prenotazione");

    });
}











// DELETE APPOINTMENT

function deleteAppointmentById() {

    const id = document.getElementById("appointment_id").value;

    if (!id) {
        alert("Inserisci ID prenotazione");
        return;
    }

    fetch(API + "/api/appointments/" + id, {
        method: "DELETE"
    })
    .then(res => res.json())
    .then(data => {

        alert(data.message);

        // aggiorna lista SENZA alert
        loadAppointments(false);
    })
    .catch(err => {

        console.error(err);
        alert("Errore eliminazione");
    });
}









// SEARCH APPOINTMENT

function searchAppointment() {

    const appointmentId =

        document.getElementById(
            "searchAppointmentId"
        ).value;

    const fiscalCode =

        document.getElementById(
            "searchFiscalCode"
        ).value
        .trim();



  


  

// RICERCA PER ID

    if (appointmentId) {

        fetch(
            API + "/api/appointments"
        )

        .then(res => res.json())

        .then(data => {

	    document.getElementById(
    		"searchAppointmentId"
	    ).value = "";

            const appointment =

                data.appointments.find(

                    a =>
                    a.id ==
                    appointmentId
                );

            const container =

                document.getElementById(
                    "appointmentSearchResult"
                );

            if (!appointment) {

                container.innerHTML = `

                    <p>
                        ATTENZIONE: PRENOTAZIONE INESISTENTE!
                    </p>
                `;

                return;
            }
	   container.innerHTML = `

<div class="appointment-result">

    <p><strong>ID:</strong> ${appointment.id}</p>

    <p>
        <strong>Paziente:</strong>
        ${appointment.patient_name}
        ${appointment.patient_surname}
    </p>

    <p>
        <strong>Medico:</strong>
        ${appointment.doctor}
    </p>

    <p>
        <strong>Visita:</strong>
        ${appointment.description}
    </p>

    <p>
        <strong>Data:</strong>
        ${appointment.date}
    </p>

    <p>
        <strong>Ora:</strong>
        ${appointment.hour}
    </p>

    <!-- FORM NASCOSTO -->

    <div
        id="editForm_${appointment.id}"
        style="display:none; margin-top:20px;">

	<select
    		id="editDate_${appointment.id}"
    		onchange="loadEditHours(${appointment.id})">

    		<option value="">
        		Seleziona Data
    		</option>

	</select>

	<select
    		id="editHour_${appointment.id}">

    		<option value="">
        		Seleziona Orario
    		</option>

	</select>
        

        <button
            class="btn-orange"
            onclick="updateAppointment(${appointment.id})">

            SALVA MODIFICA

        </button>

    </div>

    <!-- BOTTONI -->

${appointment.status === "Prenotata" ? `

<div class="appointment-actions">

    <div class="action-item">

        <button
            class="edit-icon-btn"
            onclick="toggleEditForm(${appointment.id})">

            <i class="fa-solid fa-pen"></i>

        </button>

        <span class="action-label">
            MODIFICA DATA/ORA
        </span>

    </div>

    <div class="action-item">

        <button
            class="delete-icon-btn"
            onclick="deleteAppointment(${appointment.id})">

            <i class="fa-solid fa-trash"></i>

        </button>

        <span class="action-label">
            ELIMINA
        </span>

    </div>

</div>

` : `

<div style="
    margin-top:20px;
    padding:15px;
    background:#d4edda;
    color:#155724;
    border-radius:8px;
    text-align:center;
    font-weight:bold;
">

    ✓ VISITA EROGATA

</div>

`}
    

</div>
`;

	       
        });

        return;
    }











// RICERCA PER CODICE FISCALE

	if (fiscalCode) {

    		if (fiscalCode.length !== 16) {

        		alert(
            			"Attenzione!Codice Fiscale non valido"
        		);

			document.getElementById(
            			"searchFiscalCode"
        		).value = "";

        		return;
    	}
	
	fetch(
    		API +
    		"/api/patient-exists/" +
    		fiscalCode
	)

	.then(res => res.json())

	.then(data => {

    		if (!data.exists) {

        		alert(
            			"Attenzione! Questo paziente non esiste nel sistema!"
        		);
			document.getElementById(
        			"searchFiscalCode"
    			).value = "";

        		return;
    		}

    		sessionStorage.setItem(
        		"searchFiscalCode",
        		fiscalCode
    		);

    		window.location.href =
        		"AppointmentsByFiscalCode.html";
	});
    	

    	return;
	}

    alert(
        "Inserisci ID prenotazione o codice fiscale"
    );
}










// DELETE APPOINTMENT

function deleteAppointment(id) {

    if (
        !confirm(
            "Confermi eliminazione?"
        )
    ) {
        return;
    }

    fetch(

        API + "/api/appointments/" + id,

        {
            method: "DELETE"
        }
    )

    .then(res => res.json())

    .then(data => {

        alert(data.message);

        document.getElementById(
            "appointmentSearchResult"
        ).innerHTML = "";
    })

    .catch(err => {

        console.error(err);

        alert("Errore eliminazione");
    });
}






function loadEditDates(id) {

    fetch(
        API +
        "/api/appointment-details/" +
        id
    )

    .then(res => res.json())

    .then(appointment => {

        const visit =
            appointment.description;

        fetch(
            API +
            "/api/available-dates-by-visit/" +
            encodeURIComponent(visit)
        )

        .then(res => res.json())

        .then(dates => {

            const select =
                document.getElementById(
                    `editDate_${id}`
                );

            select.innerHTML =
                '<option value="">Seleziona Data</option>';

            dates.forEach(d => {

                select.innerHTML +=
                `<option value="${d}">
                    ${d}
                </option>`;
            });

            select.dataset.visit =
                visit;
        });
    });
}






function loadEditHours(id) {

    const date = document.getElementById(
        `editDate_${id}`
    ).value;

    const visit = document.getElementById(
        `editDate_${id}`
    ).dataset.visit;

    if (!date || !visit) {

        return;
    }

    fetch(
        API +
        "/api/available-hours-by-visit/" +
        encodeURIComponent(visit) +
        "/" +
        encodeURIComponent(date)
    )

    .then(res => res.json())

    .then(hours => {

        const select =
            document.getElementById(
                `editHour_${id}`
            );

        select.innerHTML =
            '<option value="">Seleziona Orario</option>';

        hours.forEach(h => {

            select.innerHTML +=
            `<option value="${h}">
                ${h}
            </option>`;
        });
    });
}












// LOAD APPOINTMENTS

function loadAppointments(showAlert = true) {

    fetch(API + "/api/appointments")
    .then(res => res.json())
    .then(data => {

        const list = document.getElementById("appointments");
        list.innerHTML = "";

        // Nessuna prenotazione
        if (data.appointments.length === 0) {

            // mostra alert SOLO se richiesto
            if (showAlert) {
                alert(data.message);
            }

            return;
        }

        // Lista prenotazioni
        data.appointments.forEach(a => {

            const li = document.createElement("li");

            li.textContent =
                `#${a.id} | ${a.date} - ${a.doctor} - ${a.patient_name} ${a.patient_surname}`;

            list.appendChild(li);
        });
    })
   
}









function openAppointmentsRegistry() {

    window.location.href =
        "AppointmentsRegistry.html";
}











function openMedicalReportsPage() {

    window.location.href =
        "MedicalReports.html";
}










function openFilteredAppointmentsPage() {

    const description =
        document.getElementById(
            "filter_description"
        ).value;

    const rawDate =
        document.getElementById(
            "filter_date"
        ).value;

    const hour =
        document.getElementById(
            "filter_hour"
        ).value;

    let formattedDate = "";

    if (rawDate) {

        const formattedDate = rawDate;
    }

    sessionStorage.setItem(
        "filter_description",
        description
    );

    sessionStorage.setItem(
        "filter_date",
        formattedDate
    );

    sessionStorage.setItem(
        "filter_hour",
        hour
    );

    sessionStorage.setItem(
        "showPending",
        document.getElementById(
            "showPending"
        ).checked
    );

    sessionStorage.setItem(
        "showCompleted",
        document.getElementById(
            "showCompleted"
        ).checked
    );

    window.location.href =
        "AppointmentsFiltered.html";
}










// DASHBOARD MEDICO - FILTRI VISITE

function openDoctorFilteredAppointmentsPage() {

    const description =

        document.getElementById(
            "doctor_filter_description"
        ).value;

    const rawDate =

        document.getElementById(
            "doctor_filter_date"
        ).value;

    const hour =

        document.getElementById(
            "doctor_filter_hour"
        ).value;

    let formattedDate = "";

    if (rawDate) {

        const parts = rawDate.split("-");

        formattedDate =
            `${parts[2]}/${parts[1]}/${parts[0]}`;
    }

    sessionStorage.setItem(
        "filter_description",
        description
    );

    sessionStorage.setItem(
        "filter_date",
        formattedDate
    );

    sessionStorage.setItem(
        "filter_hour",
        hour
    );

    window.location.href =
        "AppointmentsFiltered.html";
}











// MOSTRA FORM MODIFICA

function showEditForm(id) {

    const form =
        document.getElementById(
            `editForm_${id}`
        );

    if (form.style.display === "none") {

        form.style.display = "block";

    } else {

        form.style.display = "none";
    }
}









// MODIFICA PRENOTAZIONE


function updateAppointment(id) {

    const rawDate =
        document.getElementById(
            `editDate_${id}`
        ).value;

    const hour =
        document.getElementById(
            `editHour_${id}`
        ).value;

    if (!rawDate || !hour) {

        alert(
            "Inserisci data e orario"
        );

        return;
    }
	const formattedDate = rawDate;
    

    fetch(

        API + "/api/appointments/" + id,

        {

            method: "PUT",

            headers: {

                "Content-Type":
                "application/json"
            },

            body: JSON.stringify({

                date: formattedDate,

                hour: hour
            })
        }
    )

    .then(res => res.json())

    .then(data => {

    	alert(data.message);

    	// svuota i campi ricerca

    	document.getElementById(
        	"searchAppointmentId"
    	).value = "";

    	document.getElementById(
        	"searchFiscalCode"
    	).value = "";

    	// elimina il risultato visualizzato

    	document.getElementById(
        	"appointmentSearchResult"
    	).innerHTML = "";
    })

    .catch(err => {

        console.error(err);

        alert(
            "Errore modifica prenotazione"
        );
    });
}









// SHOW/HIDE FORM MODIFICA

function toggleEditForm(id) {

    const form =
        document.getElementById(
            `editForm_${id}`
        );

    if (form.style.display === "none") {

        form.style.display = "block";

        loadEditDates(id);

    } else {

        form.style.display = "none";
    }
}








function loadAvailableDates() {

    const doctorName = selectedDoctorName;

    fetch(
        API +
        "/api/available-dates/" +
        doctorName
    )     

    .then(res => res.json())

    .then(data => {

        const dateSelect =
            document.getElementById("date");

        dateSelect.innerHTML =
            '<option value="">Seleziona Data</option>';

        data.forEach(d => {

            dateSelect.innerHTML +=

                `<option value="${d}">
                    ${d}
                </option>`;
        });
    });
}




