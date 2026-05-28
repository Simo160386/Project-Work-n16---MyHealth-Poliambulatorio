const API = "http://127.0.0.1:5000";

function createPatient() {

    const name =
        document.getElementById("name").value.trim();

    const surname =
        document.getElementById("surname").value.trim();

    const birth_date =
        document.getElementById("birth_date").value;

    const gender =
        document.getElementById("gender").value;

    const phone =
        document.getElementById("phone").value.trim();

    const email =
        document.getElementById("email").value.trim();

    const fiscal_code =
        document.getElementById("fiscal_code").value.trim();

    // CONTROLLO CAMPI
    if (
        !name ||
        !surname ||
        !birth_date ||
        !gender ||
        !phone ||
        !email ||
        !fiscal_code
    ) {

        alert("Compila tutti i campi");
        return;
    }

    // VALIDAZIONE EMAIL
    const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {

        alert("Inserisci una e-mail valida");
        return;
    }

    // VALIDAZIONE TELEFONO
    if (!/^\d+$/.test(phone)) {

        alert("Il telefono deve contenere solo numeri");
        return;
    }

    fetch(API + "/api/patients", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            name,
            surname,
            birth_date,
            gender,
            phone,
            email,
            fiscal_code
        })
    })
    .then(res => res.json())
    .then(data => {

        alert(data.message);

        if (data.message === "Paziente creato!") {

            window.location.href = "index.html";
        }
    })
    .catch(err => {

        console.error(err);

        alert("Errore creazione paziente");
    });
}


function goBackDashboard() {

    window.location.href = "index.html";
}