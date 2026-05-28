const API = "http://127.0.0.1:5000";

window.onload = function () {

    loadFilteredAppointments();
};



// LOAD FILTERED APPOINTMENTS

function loadFilteredAppointments() {

    fetch(API + "/api/appointments")

    .then(res => res.json())

    .then(data => {

        const body =

            document.getElementById(
                "appointmentsBody"
            );

        body.innerHTML = "";



        const filterDescription =

            sessionStorage.getItem(
                "filter_description"
            );

        const filterDate =

            sessionStorage.getItem(
                "filter_date"
            );

        const filterHour =

            sessionStorage.getItem(
                "filter_hour"
            );



        const filteredAppointments =

            data.appointments.filter(a => {

                const matchDescription =

                    !filterDescription ||

                    a.description ===
                    filterDescription;

                const matchDate =

                    !filterDate ||

                    a.date === filterDate;

                const matchHour =

                    !filterHour ||

                    a.hour === filterHour;

                return (
                    matchDescription &&
                    matchDate &&
                    matchHour
                );
            });



        filteredAppointments.forEach(a => {

            const tr =
                document.createElement("tr");

            tr.innerHTML = `

    			<td>${a.id}</td>

    			<td>${a.description}</td>

    			<td>${a.patient_name} ${a.patient_surname}</td>

    			<td>${a.doctor}</td>

    			<td>${a.date}</td>

    			<td>${a.hour}</td>
`			;

            body.appendChild(tr);
        });



        // nessun risultato

        if (filteredAppointments.length === 0) {

            body.innerHTML = `

                <tr>

                    <td colspan="6"
                        style="
                            text-align:center;
                            font-weight:bold;
                            padding:20px;
                        ">

                        Nessuna visita trovata

                    </td>

                </tr>
            `;
        }
    })

    .catch(err => {

        console.error(err);

        alert(
            "Errore caricamento visite"
        );
    });
}



// TORNA DASHBOARD

function goBackDashboard() {

    window.location.href =
        "index.html";
}

// DOWNLOAD PDF

function downloadPDF() {

    const { jsPDF } = window.jspdf;

    const doc = new jsPDF();

    doc.setFontSize(18);

    doc.text(
        "Report Visite Prenotate",
        14,
        20
    );

    const rows = [];

    const tableRows =

        document.querySelectorAll(
            "#appointmentsBody tr"
        );

    tableRows.forEach(row => {

        const cols =
            row.querySelectorAll("td");

        if (cols.length > 1) {

            rows.push([

                cols[0].textContent,
                cols[1].textContent,
                cols[2].textContent,
                cols[3].textContent,
                cols[4].textContent,
                cols[5].textContent
            ]);
        }
    });

    doc.autoTable({

        startY: 30,

        head: [[

            "ID",

            "TIPOLOGIA",

            "PAZIENTE",

            "MEDICO",

            "DATA",

            "ORA"
        ]],

        body: rows
    });

    doc.save(
        "report_visite_prenotate.pdf"
    );
}



// DOWNLOAD DOC

// DOWNLOAD DOC

function downloadDOC() {

    const table =
        document.querySelector("table");

    const html = `

        <html xmlns:o='urn:schemas-microsoft-com:office:office'
              xmlns:w='urn:schemas-microsoft-com:office:word'
              xmlns='http://www.w3.org/TR/REC-html40'>

        <head>

            <meta charset='utf-8'>

            <title>
                Report Visite Prenotate
            </title>

            <style>

                body {

                    font-family: Arial;
                }

                table {

                    border-collapse: collapse;

                    width: 100%;
                }

                th, td {

                    border: 1px solid black;

                    padding: 8px;

                    text-align: left;
                }

                th {

                    background: #4CAF50;

                    color: white;
                }

            </style>

        </head>

        <body>

            <h1>
                Report Visite Prenotate
            </h1>

            ${table.outerHTML}

        </body>

        </html>
    `;

    const blob = new Blob(

        ['\\ufeff', html],

        {
            type:
            'application/msword'
        }
    );

    saveAs(

        blob,

        'report_visite_prenotate.doc'
    );
}