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

	.then(async res => {

    		const data = await res.json();

    		if (!res.ok) {

        		if (data.error === "CF_NOT_FOUND") {

            			alert(
                			"Attenzione!Codice Fiscale errato e/o inesistente"
            			);

            			sessionStorage.removeItem(
                			"searchFiscalCode"
            			);

            			window.location.href =
                			"Appointments.html";
        	}

        	return null;
    	}

    	return data;
})

.then(data => {

    	if (!data) return;
    

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

        		<select
    				id="editDate_${a.id}"
    				onchange="loadEditHours(${a.id})">

    				<option value="">
        				Seleziona Data
    				</option>

			</select>

			<select
    				id="editHour_${a.id}">

    				<option value="">
        				Seleziona Orario
    				</option>

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

            			<td colspan="9"
                			style="
                    				text-align:center;
                    				font-weight:bold;
                    				padding:20px;
                			">

                			Attenzione!Non risultano prenotazioni attive

            			</td>

        		</tr>

    		`;

    		return;
}


        
    });
}








// DELETE

function deleteAppointment(id) {

    if (
        !confirm(
            "Attenzione!Confermi eliminazione?"
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

        loadEditDates(id);

    } else {

        row.style.display =
            "none";
    }
}





//CARICA DATE MODIFICATE


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






// CARICA ORE MODIFICATE


function loadEditHours(id) {

    const date =
        document.getElementById(
            `editDate_${id}`
        ).value;

    const visit =
        document.getElementById(
            `editDate_${id}`
        ).dataset.visit;

    if (!date) return;

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
            "Inserire nuova data e orario"
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

        loadAppointments();
    })

    .catch(err => {

        console.error(err);

        alert(
            "Errore modifica prenotazione"
        );
    });
}