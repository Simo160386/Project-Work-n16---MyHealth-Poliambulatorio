const API = "http://127.0.0.1:5000";

window.onload = function () {

    loadAppointments();
};



// LOAD APPOINTMENTS

function loadAppointments() {

    const fiscalCode =

        sessionStorage.getItem(
            "searchFiscalCode"
        );

    fetch(

        API +
        "/api/appointments/fiscal/" +
        fiscalCode
    )

    .then(res => res.json())

    .then(data => {

        const body =

            document.getElementById(
                "appointmentsBody"
            );

        body.innerHTML = "";

        data.forEach(a => {

            const tr =
                document.createElement("tr");

            tr.innerHTML = `

                <td>${a.id}</td>

                <td>${a.fiscal_code}</td>

                <td>${a.name}</td>

                <td>${a.surname}</td>

                <td>${a.date}</td>

                <td>${a.hour}</td>

                <td>${a.description}</td>
		
	


                <td>

    			<button
        			class="edit-icon-btn"
        			onclick="
            				toggleEditForm(${a.id})
        			"
        			title="Modifica Prenotazione">

        			<i class="fa-solid fa-pen"></i>

    			</button>

		</td>

		<td>

    			<button
        			class="delete-icon-btn"
        			onclick="
            				deleteAppointment(${a.id})
        			"
        			title="Elimina Prenotazione">

        			<i class="fa-solid fa-trash"></i>

    			</button>

		</td>
            `;

            body.appendChild(tr);

		// RIGA MODIFICA

		const editRow =
    			document.createElement("tr");

		editRow.id =
    			`editRow_${a.id}`;

		editRow.style.display = "none";

		editRow.innerHTML = `

		<td colspan="9">

    		<div style="padding:20px;">

        		<input
            			type="date"
            			id="editDate_${a.id}">

        		<select
            			id="editHour_${a.id}">

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
            			onclick="updateAppointment(${a.id})">

            			SALVA MODIFICA

        		</button>

    	</div>

</td>
`;

body.appendChild(editRow);	

        });



        if (data.length === 0) {

            body.innerHTML = `

                <tr>

                    <td colspan="8"
                        style="
                            text-align:center;
                            padding:20px;
                        ">

                        Nessuna prenotazione trovata

                    </td>

                </tr>
            `;
        }
    });
}



// DELETE

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

        loadAppointments();
    });
}



// BACK

function goBackDashboard() {

    window.location.href =
        "index.html";
}

// SHOW/HIDE MODIFICA

function toggleEditForm(id) {

    const row =
        document.getElementById(
            `editRow_${id}`
        );

    if (row.style.display === "none") {

        row.style.display =
            "table-row";

    } else {

        row.style.display =
            "none";
    }
}



// UPDATE APPOINTMENT

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

    const parts =
        rawDate.split("-");

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

        loadAppointments();
    })

    .catch(err => {

        console.error(err);

        alert(
            "Errore modifica prenotazione"
        );
    });
}