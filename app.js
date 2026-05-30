


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

            alert(
                "Login fallito"
            );

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



        document.getElementById(
            "login-section"
        ).style.display = "none";



        // STAFF

        if (data.role === "staff") {

            document.getElementById(
                "staff-dashboard"
            ).style.display = "block";



            loadDoctors();

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

            loadDoctors();

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


function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    fetch(API + "/api/login", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ username, password })
    })
    .then(res => res.json())
    .then(data => {
       			if (data.success) {

    			document.getElementById("login-section").style.display = "none";

    			// PERSONALE SANITARIO
    			if (data.role === "staff") {

       				document.getElementById("staff-dashboard").style.display = "block";

        			document.getElementById("doctor-dashboard").style.display = "none";
    			}

    			// MEDICO SPECIALISTA
   			 else if (data.role === "doctor") {

        			document.getElementById("doctor-dashboard").style.display = "block";

        			document.getElementById("staff-dashboard").style.display = "none";
    			}
	}
    });
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
        alert("Compila tutti i campi");
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

    const doctor_id =
        document.getElementById("doctor_select").value;

    if (
        !rawDate ||
        !hour ||
        !description ||
        !patient_id ||
        !doctor_id
    ) {

        alert("Compila tutti i campi");

        return;
    }

    const parts = rawDate.split("-");

    const date =
        `${parts[2]}/${parts[1]}/${parts[0]}`;


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

            doctor_id
        })
    })

    .then(res => res.json())

    .then(data => {

        alert(data.message);
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
                        Prenotazione non trovata
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

        <input
            type="date"
            id="editDate_${appointment.id}">

        <select
            id="editHour_${appointment.id}">

            <option value="">
                Seleziona Orario
            </option>

            <option value="08:00">08:00</option>
            <option value="09:00">09:00</option>
            <option value="10:00">10:00</option>
            <option value="11:00">11:00</option>
            <option value="12:00">12:00</option>
            <option value="13:00">13:00</option>
            <option value="14:00">14:00</option>
            <option value="15:00">15:00</option>
            <option value="16:00">16:00</option>
            <option value="17:00">17:00</option>
            <option value="18:00">18:00</option>
            <option value="19:00">19:00</option>

        </select>

        <button
            class="btn-orange"
            onclick="updateAppointment(${appointment.id})">

            SALVA MODIFICA

        </button>

    </div>

    <!-- BOTTONI -->

<div class="appointment-actions">

   	<div class="action-item">

        <button
            class="edit-icon-btn"
            onclick="toggleEditForm(${appointment.id})"
            title="Modifica Prenotazione">

            <i class="fa-solid fa-pen"></i>

        </button>

        <span class="action-label">
            MODIFICA DATA/ORA
        </span>

    </div>

    <div class="action-item">

        <button
            class="delete-icon-btn"
            onclick="deleteAppointment(${appointment.id})"
            title="Elimina Prenotazione">

            <i class="fa-solid fa-trash"></i>

        </button>

        <span class="action-label">
            ELIMINA
        </span>

    </div>

</div>
    

</div>
`;

	       
        });

        return;
    }



    // RICERCA PER CODICE FISCALE

    if (fiscalCode) {

        sessionStorage.setItem(
            "searchFiscalCode",
            fiscalCode
        );

        window.location.href =
            "AppointmentsByFiscalCode.html";

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

        const parts = rawDate.split("-");

        formattedDate =
            `${parts[2]}/${parts[1]}/${parts[0]}`;
    }

    // salva filtri
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

    // apertura pagina
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

    const parts = rawDate.split("-");

    const formattedDate =
        `${parts[2]}/${parts[1]}/${parts[0]}`;

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

        searchAppointment();
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

    } else {

        form.style.display = "none";
    }
}