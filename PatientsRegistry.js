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
		
		let formattedBirthDate = p.birth_date;

    		if (
        		p.birth_date &&
       	 		p.birth_date.includes("-")
    		) {

        		const parts =
            			p.birth_date.split("-");

        		formattedBirthDate =
            			`${parts[2]}-${parts[1]}-${parts[0]}`;
    		}

    		const tr =
        		document.createElement("tr");

            
		tr.innerHTML = `

    			<td>${p.id}</td>

    			<td>${p.name}</td>

    			<td>${p.surname}</td>

    			<td id="birthCell_${p.id}">
    				${formattedBirthDate}
			</td>

			<td>${p.gender}</td>

			<td id="phoneCell_${p.id}">
    				${p.phone}
			</td>

			<td id="emailCell_${p.id}">
    				${p.email}
			</td>

			<td id="cfCell_${p.id}">
   	 			${p.fiscal_code}
			</td>

			<td>

			<button
    				class="edit-icon-btn"
    				onclick="togglePatientEdit(${p.id})"
    				title="Modifica Paziente">

    				<i class="fa-solid fa-pen"></i>

			</button>

			</td>

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

    let found = false;

    rows.forEach(row => {

        const cells =
            row.querySelectorAll("td");

        const patientName =
            cells[1]
            .textContent
            .toLowerCase()
            .trim();

        const patientSurname =
            cells[2]
            .textContent
            .toLowerCase()
            .trim();

        const matchName =
            patientName.includes(nameInput);

        const matchSurname =
            patientSurname.includes(
                surnameInput
            );

        const visible =
            matchName &&
            matchSurname;

        row.style.display =
            visible ? "" : "none";

        if (visible) {

            found = true;
        }
    });

    if (
        !found &&
        (nameInput || surnameInput)
    ) {

        alert(
            "Nome e/o Cognome non validi o non presenti nel sistema"
        );

        rows.forEach(row => {

            row.style.display = "";

        });

        document.getElementById(
            "searchName"
        ).value = "";

        document.getElementById(
            "searchSurname"
        ).value = "";

        document.getElementById(
            "searchName"
        ).focus();
    }
}








// TORNA DASHBOARD

function goBackDashboard() {

    window.location.href = "index.html";
}

function updatePatient(id) {

    const birth_date =
        document.getElementById(
            `birth_${id}`
        ).value;

    const phone =
        document.getElementById(
            `phone_${id}`
        ).value.trim();

    const email =
        document.getElementById(
            `email_${id}`
        ).value.trim();

    const fiscal_code =
        document.getElementById(
            `cf_${id}`
        ).value.trim();

    fetch(
        API + "/api/patients/" + id,
        {
            method: "PUT",

            headers: {
                "Content-Type":
                "application/json"
            },

            body: JSON.stringify({

                birth_date,

                phone,

                email,

                fiscal_code
            })
        }
    )

    .then(async res => {

    const data = await res.json();

    if (!res.ok) {

        alert(data.message);

        return;
    }

    alert(data.message);

    loadPatients();
    })

    .catch(err => {

        console.error(err);

        alert(
            "Errore modifica paziente"
        );
    });
}









function togglePatientEdit(id) {

    const birthCell =
        document.getElementById(
            `birthCell_${id}`
        );

    const phoneCell =
        document.getElementById(
            `phoneCell_${id}`
        );

    const emailCell =
        document.getElementById(
            `emailCell_${id}`
        );

    const cfCell =
        document.getElementById(
            `cfCell_${id}`
        );

    if (
        !document.getElementById(
            `birth_${id}`
        )
    ) {

        const birth =
            birthCell.textContent.trim();
	let birthForInput = birth;

	if (
    		birth.includes("-") &&
   	 	birth.split("-").length === 3
	) {

    		const parts =
        		birth.split("-");

    		birthForInput =
        		`${parts[2]}-${parts[1]}-${parts[0]}`;
	}

        const phone =
            phoneCell.textContent.trim();

        const email =
            emailCell.textContent.trim();

        const cf =
            cfCell.textContent.trim();

        birthCell.innerHTML = `
    		<input
        		type="date"
        		id="birth_${id}"
        		value="${birthForInput}">
	`;

        phoneCell.innerHTML = `
            <input
                type="text"
                id="phone_${id}"
                value="${phone}">
        `;

        emailCell.innerHTML = `
            <input
                type="email"
                id="email_${id}"
                value="${email}">
        `;

        cfCell.innerHTML = `
            <input
                type="text"
                id="cf_${id}"
                value="${cf}">
        `;

    } else {

        updatePatient(id);
    }
}