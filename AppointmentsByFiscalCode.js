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
    					class="delete-icon-btn"
    					onclick="
        					deleteAppointment(
            						${a.id}
    	    					)					
    					"
    					title="Elimina Prenotazione">

    					<i class="fa-solid fa-trash"></i>

				</button>

			</button>
                    

                </td>
            `;

            body.appendChild(tr);
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