#IMPORT LIBRERIE

from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import re
import os
import pandas as pd
from datetime import datetime
from werkzeug.utils import secure_filename







app = Flask(__name__)
CORS(app)


app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///healthcare.db'
db = SQLAlchemy(app)
UPLOAD_FOLDER = "uploads"


app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

os.makedirs(UPLOAD_FOLDER, exist_ok=True)








# MODELS e CLASSES


class User(db.Model):

    id = db.Column(db.Integer,primary_key=True)
    username = db.Column(db.String(50),unique=True)
    password = db.Column(db.String(50))
    role = db.Column(db.String(50))




class Patient(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    name = db.Column(db.String(100))
    surname = db.Column(db.String(100))

    birth_date = db.Column(db.String(20))
    gender = db.Column(db.String(10))
    phone = db.Column(db.String(30),unique=True)
    email = db.Column(db.String(120))
    fiscal_code = db.Column(db.String(16), unique=True)

  





class Doctor(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))




class Appointment(db.Model):

    id = db.Column(db.Integer, primary_key=True)

    date = db.Column(db.String(20))

    hour = db.Column(db.String(10))

    description = db.Column(db.String(200))

    patient_id = db.Column(db.Integer)

    doctor_id = db.Column(db.Integer)

    status = db.Column(
        db.String(20),
        default="Prenotata"
    )



class MedicalReport(db.Model):

    id = db.Column(db.Integer, primary_key=True)

    appointment_id = db.Column(db.Integer)

    name = db.Column(db.String(100))

    surname = db.Column(db.String(100))

    fiscal_code = db.Column(db.String(16))

    attachment = db.Column(db.String(255))

    notes = db.Column(db.String(1000))










# LOGIN


@app.route('/api/login', methods=['POST'])
def login():

    data = request.json

    username = data['username']
    password = data['password']


    # PERSONALE SANITARIO
    if username == "admin" and password == "admin":

        return jsonify({
            "success": True,
            "role": "staff"
        })


    # MEDICI SPECIALISTI
    doctor = Doctor.query.filter(
        Doctor.name.ilike(f"%{username}%")
    ).first()

    if doctor and password == "12345":

        return jsonify({
            "success": True,
            "role": "doctor"
        })

    return jsonify({
        "success": False
    })








# CREATE PATIENT


@app.route('/api/patients', methods=['POST'])
def create_patient():

    data = request.json

    name = data.get('name', '').strip()
    surname = data.get('surname', '').strip()
    birth_date = data.get('birth_date', '').strip()
    gender = data.get('gender', '').strip()
    phone = data.get('phone', '').strip()
    email = data.get('email', '').strip()
    fiscal_code = data.get(
        'fiscal_code',
        ''
    ).strip().upper()

    # VALIDAZIONE CODICE FISCALE

    if len(fiscal_code) != 16:

        return jsonify({
            "message":
            "Attenzione: Il Codice Fiscale deve contenere 16 caratteri"
        }), 400

    if not fiscal_code.isalnum():

        return jsonify({
            "message":
            "Attenzione: Il Codice Fiscale deve essere alfanumerico"
        }), 400

    if not any(c.isalpha() for c in fiscal_code):

        return jsonify({
            "message":
            "Attenzione: Il Codice Fiscale deve contenere almeno una lettera"
        }), 400

    if not any(c.isdigit() for c in fiscal_code):

        return jsonify({
            "message":
            "Attenzione: Il Codice Fiscale deve contenere almeno un numero"
        }), 400

    # CONTROLLO CAMPI VUOTI
    if (
        not name or
        not surname or
        not birth_date or
        not gender or
        not phone or
        not email or
        not fiscal_code
    ):

        return jsonify({
            "message":
            "Attenzione: Si prega di compilare tutti i campi"
        }), 400

    # VALIDAZIONE EMAIL
    # VALIDAZIONE EMAIL

    email = email.lower()

    email_regex = (
        r'^[A-Za-z0-9._%+-]+'
        r'@[A-Za-z0-9.-]+'
        r'\.[A-Za-z]{2,}$'
    )

    if not re.match(email_regex, email):

        return jsonify({
            "message":
            "Attenzione!E-mail non valida"
        }), 400

    if " " in email:

        return jsonify({
            "message":
            "Attenzione!L'e-mail non può contenere spazi"
        }), 400

    if email.count("@") != 1:

        return jsonify({
            "message":
            "Attenzione!Formato e-mail non valido"
        }), 400


    # VALIDAZIONE TELEFONO

    if not phone.isdigit():

        return jsonify({
            "message":
            "Attenzione!Il numero di telefono deve contenere solo numeri"
        }), 400

    if len(phone) != 10:

        return jsonify({
            "message":
            "Attenzione!Il numero di telefono deve contenere esattamente 10 cifre"
       }), 400

    # CONTROLLO TELEFONO DUPLICATO

    existing_phone = Patient.query.filter_by(
        phone=phone
    ).first()

    if existing_phone:

        return jsonify({
            "message":
            "Attenzione!Numero di telefono già presente nel sistema"
        }), 409

    # CONTROLLO CODICE FISCALE DUPLICATO
    existing_cf = Patient.query.filter_by(
        fiscal_code=fiscal_code
    ).first()

    if existing_cf:

        return jsonify({
            "message": "Attenzione!Codice fiscale risulta presente, Paziente già registrato"
        }), 409

    patient = Patient(
        name=name,
        surname=surname,
        birth_date=birth_date,
        gender=gender,
        phone=phone,
        email=email,
        fiscal_code=fiscal_code
    )

    db.session.add(patient)
    db.session.commit()

    return jsonify({
        "message": "PAZIENTE CREATO CON SUCCESSO!"
    })







# GET DOCTORS


@app.route('/api/doctors', methods=['GET'])
def get_doctors():
    doctors = Doctor.query.all()
    return jsonify([{"id": d.id, "name": d.name} for d in doctors])


# GET DOCTOR SPECIALTIES

@app.route(
    "/api/doctor-specialties",
    methods=["GET"]
)
def get_doctor_specialties():

    result = []

    for _, row in SPECIALIZZAZIONI.iterrows():

        result.append({

            "doctor":
                row["MEDICO"],

            "visit":
                row["VISITA"]
        })

    return jsonify(result)


#GET DOCTOR SCHEDULES

@app.route(
    "/api/doctor-schedules",
    methods=["GET"]
)
def get_doctor_schedules():

    result = []

    for _, row in TURNI.iterrows():

        result.append({

            "doctor":
                row["MEDICO"],

            "day":
                row["GIORNO"],

            "from":
                row["DALLE"],

            "to":
                row["ALLE"]
        })

    return jsonify(result)



# DATE DISPONIBILI PER VISITA

@app.route(
    "/api/available-dates-by-visit/<visit>",
    methods=["GET"]
)
def available_dates_by_visit(visit):

    

    rows = SPECIALIZZAZIONI[
        SPECIALIZZAZIONI["VISITA"]
        .astype(str)
        .str.strip()
        .str.lower()
        ==
        visit.strip().lower()
    ]

    

    doctors = rows["MEDICO"].tolist()

    

    dates = []

    for doctor in doctors:

        

        turni = TURNI[
            TURNI["MEDICO"]
            .astype(str)
            .str.strip()
            ==
            str(doctor).strip()
        ]

        

        for _, row in turni.iterrows():

            giorno = pd.to_datetime(
                row["GIORNO"]
            ).strftime("%d/%m/%Y")


            if giorno not in dates:

                dates.append(giorno)


    return jsonify(dates)



@app.route(
    "/api/available-hours-by-visit/<visit>/<path:date>",
    methods=["GET"]
)
def available_hours_by_visit(visit, date):

    rows = SPECIALIZZAZIONI[
        SPECIALIZZAZIONI["VISITA"]
        .astype(str)
        .str.strip()
        .str.lower()
        ==
        visit.strip().lower()
    ]

    if rows.empty:
        return jsonify([])

    doctors = rows["MEDICO"].tolist()

    hours = []

    from datetime import datetime
    

    for doctor in doctors:

        filtered = TURNI[
            (TURNI["MEDICO"] == doctor)
        ]

        for _, row in filtered.iterrows():

            giorno = pd.to_datetime(
                row["GIORNO"]
            ).strftime("%d/%m/%Y")

            if giorno != date:
                continue

            start = datetime.strptime(
                str(row["DALLE"])[:5],
                "%H:%M"
            ).hour

            end = datetime.strptime(
                str(row["ALLE"])[:5],
                "%H:%M"
            ).hour

        

            for h in range(start, end + 1):

                ora = f"{h:02d}:00"

                if ora not in hours:
                    hours.append(ora)

    hours.sort()

    return jsonify(hours)









#ORE DISPONIBILI PER VISITA


@app.route(
    "/api/available-hours/<doctor>/<path:date>",
    methods=["GET"]
)
def available_hours(doctor, date):

    turni = TURNI.copy()

    turni["GIORNO_FORMATTATO"] = pd.to_datetime(
        turni["GIORNO"]
    ).dt.strftime("%d-%m-%Y")

    filtered = turni[
        (
            turni["MEDICO"]
            .astype(str)
            .str.strip()
            .str.lower()
            ==
            doctor.strip().lower()
        )
        &
        (
            turni["GIORNO_FORMATTATO"]
            ==
            date
        )
    ]

    hours = []

    from datetime import datetime

    for _, row in filtered.iterrows():

        start = datetime.strptime(
            str(row["DALLE"])[:5],
            "%H:%M"
        ).hour

        end = datetime.strptime(
            str(row["ALLE"])[:5],
            "%H:%M"
        ).hour

        for h in range(start, end + 1):

            hours.append(
                f"{h:02d}:00"
            )

    doctor_obj = Doctor.query.filter(
        Doctor.name == doctor
    ).first()

    occupied = []

    if doctor_obj:

        appointments = Appointment.query.filter_by(
            doctor_id=doctor_obj.id,
            status="Prenotata"
        ).all()

        occupied = [
            a.hour
            for a in appointments
        ]

    available_hours = [

        h for h in hours

        if h not in occupied
    ]

    return jsonify(
        available_hours
    )








#AVAILABLE DATES 

@app.route(
    "/api/available-dates/<doctor>",
    methods=["GET"]
)
def available_dates(doctor):

    filtered = TURNI[
        TURNI["MEDICO"]
        .astype(str)
        .str.strip()
        .str.lower()
        ==
        doctor.strip().lower()
    ]

    dates = []

    for _, row in filtered.iterrows():

        date_value = pd.to_datetime(
            row["GIORNO"]
        )

        dates.append(
            date_value.strftime("%d/%m/%Y")
        )

    return jsonify(dates)









# CREATE APPOINTMENT

@app.route('/api/appointments', methods=['POST'])
def create_appointment():

    data = request.json

    hour = data.get('hour')
    date = data.get('date')
    description = data.get('description')
    patient_id = data.get('patient_id')

    doctor_id = None

    specialists = SPECIALIZZAZIONI[
        SPECIALIZZAZIONI["VISITA"] == description
    ]

    for _, spec in specialists.iterrows():

        doctor_name = spec["MEDICO"]

        turni = TURNI[
            TURNI["MEDICO"] == doctor_name
        ]

        for _, turno in turni.iterrows():

            giorno = pd.to_datetime(
                    turno["GIORNO"]
            ).strftime("%d/%m/%Y")

            if giorno != date:
                    continue

            start_hour = int(
                    str(turno["DALLE"])[:2]
            )

            end_hour = int(
                    str(turno["ALLE"])[:2]
            )	

            selected_hour = int(
                    hour[:2]
            )

            if start_hour <= selected_hour <= end_hour:

                    doctor = Doctor.query.filter_by(
                        name=doctor_name
                        ).first()

                    if doctor:

                        doctor_id = doctor.id

                    break

        if doctor_id:
            break

    if (
        not date or
        not hour or
        not description or
        not patient_id
    ):

        return jsonify({
            "message":
            "Attenzione!Si prega di compilare tutti i campi"
        }), 400

    appointment = Appointment(
        date=date,
        hour=hour,
        description=description,
        patient_id=patient_id,
        doctor_id=doctor_id,
        status="Prenotata"
    )

    db.session.add(appointment)
    db.session.commit()

    return jsonify({
        "message":
        "PRENOTAZIONE VISITA EFFETTUATA!"
    })







#APPOINTMENTS BY DOCTOR

@app.route(
    "/api/appointments-by-doctor/<doctor>",
    methods=["GET"]
)
def appointments_by_doctor(doctor):

    doctor_obj = Doctor.query.filter_by(
        name=doctor
    ).first()

    if not doctor_obj:

        return jsonify([])

    # Tutte le visite del medico
    appointments = Appointment.query.filter_by(
        doctor_id=doctor_obj.id
    ).all()

    result = []

    for a in appointments:

        # Se esiste già un referto, salta la visita
        existing_report = MedicalReport.query.filter_by(
            appointment_id=a.id
        ).first()

        if existing_report:
            continue

        patient = Patient.query.get(
            a.patient_id
        )

        result.append({

            "id": a.id,

            "patient_name":
                patient.name if patient else "",

            "patient_surname":
                patient.surname if patient else "",

            "fiscal_code":
                patient.fiscal_code if patient else "",

            "description":
                a.description,

            "date":
                a.date

        })

    return jsonify(result)









# MODIFICA PRENOTAZIONE

@app.route("/api/appointments/<int:id>", methods=["PUT"])
def update_appointment(id):

    appointment = Appointment.query.get(id)

    if not appointment:

        return jsonify({
            "message": "Prenotazione non trovata"
        }), 404

    if appointment.status == "Completata":

        return jsonify({
            "message":
            "Non è possibile modificare una visita già erogata"
        }), 400

    data = request.json

    date = data.get("date")
    hour = data.get("hour")

    if not date or not hour:

        return jsonify({
            "message":
            "Data e orario obbligatori"
        }), 400

    if "-" in date:

        parts = date.split("-")

        if len(parts[0]) == 4:

            date = f"{parts[2]}/{parts[1]}/{parts[0]}"

    doctor_id = None

    specialists = SPECIALIZZAZIONI[
        SPECIALIZZAZIONI["VISITA"]
        == appointment.description
    ]

    for _, spec in specialists.iterrows():

        doctor_name = spec["MEDICO"]

        turni = TURNI[
            TURNI["MEDICO"] == doctor_name
        ]

        for _, turno in turni.iterrows():

            giorno = pd.to_datetime(
                turno["GIORNO"]
            ).strftime("%d/%m/%Y")

            if giorno != date:
                continue

            start_hour = int(
                str(turno["DALLE"])[:2]
            )

            end_hour = int(
                str(turno["ALLE"])[:2]
            )

            selected_hour = int(
                hour[:2]
            )

            if start_hour <= selected_hour <= end_hour:

                doctor = Doctor.query.filter_by(
                    name=doctor_name
                ).first()

                if doctor:

                    doctor_id = doctor.id

                break

        if doctor_id:
            break

    appointment.date = date
    appointment.hour = hour

    if doctor_id:
        appointment.doctor_id = doctor_id

    db.session.commit()

    return jsonify({
        "success": True,
        "message":
        "PRENOTAZIONE MODIFICATA CON SUCCESSO!"
    })







#GET DOCTOR-VISIT

@app.route(
    "/api/appointment-doctor/<int:id>",
    methods=["GET"]
)
def get_appointment_doctor(id):

    appointment = Appointment.query.get(id)

    if not appointment:

        return jsonify({}), 404

    doctor = Doctor.query.get(
        appointment.doctor_id
    )

    if not doctor:

        return jsonify({}), 404

    return jsonify({

        "doctor_id": doctor.id,

        "doctor_name": doctor.name

    })







#DETTAGLI APPUNTAMENTO

@app.route(
    "/api/appointment-details/<int:id>",
    methods=["GET"]
)
def get_appointment_details(id):

    appointment = Appointment.query.get(id)

    if not appointment:

        return jsonify({}), 404

    return jsonify({

        "id": appointment.id,

        "description": appointment.description,

        "date": appointment.date,

        "hour": appointment.hour

    })






# GET PATIENTS

@app.route('/api/patients', methods=['GET'])
def get_patients():
    patients = Patient.query.all()

    return jsonify([
    {
        "id": p.id,
        "name": p.name,
        "surname": p.surname,
        "birth_date": p.birth_date,
        "gender": p.gender,
        "phone": p.phone,
        "email": p.email,
        "fiscal_code": p.fiscal_code
    }
    for p in patients
])








# UPDATE PATIENT

@app.route('/api/patients/<int:id>', methods=['PUT'])
def update_patient(id):

    patient = Patient.query.get(id)

    if not patient:

        return jsonify({
            "message": "Attenzione!Paziente non trovato"
        }), 404

    data = request.json
    new_email = data.get(
        "email",
        patient.email
    ).strip().lower()

    new_phone = data.get(
        "phone",
        patient.phone
    ).strip()


    # VALIDAZIONE TELEFONO

    if not new_phone.isdigit():

           return jsonify({
            "message":
            "Attenzione!Il numero di telefono deve contenere solo numeri"
           }), 400

    if len(new_phone) != 10:

           return jsonify({
            "message":
            "Attenzione!Il numero di telefono deve contenere esattamente 10 cifre"
        }), 400
    new_fiscal_code = data.get(
            "fiscal_code",
            patient.fiscal_code
        ).strip().upper()

        # VALIDAZIONE EMAIL

    email_regex = (
        r'^[A-Za-z0-9._%+-]+'
        r'@[A-Za-z0-9.-]+'
        r'\.[A-Za-z]{2,}$'
    )

    if not re.match(email_regex, new_email):

        return jsonify({
            "message":
            "Attenzione!E-mail non valida"
        }), 400

    if " " in new_email:

        return jsonify({
            "message":
            "Attenzione!L'e-mail non può contenere spazi"
        }), 400

    if new_email.count("@") != 1:

        return jsonify({
            "message":
            "Attenzione!Formato e-mail non valido"
        }), 400

    # VALIDAZIONE CODICE FISCALE

    if len(new_fiscal_code) != 16:

        return jsonify({
            "message":
            "Attenzione!Il Codice Fiscale deve contenere 16 caratteri"
        }), 400

    if not new_fiscal_code.isalnum():

        return jsonify({
            "message":
            "Attenzione!Il Codice Fiscale deve essere alfanumerico"
        }), 400

    if not any(c.isalpha() for c in new_fiscal_code):

        return jsonify({
            "message":
            "Attenzione!Il Codice Fiscale deve contenere almeno una lettera"
        }), 400

    if not any(c.isdigit() for c in new_fiscal_code):

        return jsonify({
            "message":
            "Attenzione!Il Codice Fiscale deve contenere almeno un numero"
        }), 400
    

   # CONTROLLO CF DUPLICATO

    existing_patient = Patient.query.filter_by(
        fiscal_code=new_fiscal_code
    ).first()

    if (
        existing_patient and
        existing_patient.id != patient.id
    ):

        return jsonify({
            "message":
            "Attenzione!Codice fiscale già presente nel sistema"
        }), 409

        

    # CONTROLLO TELEFONO DUPLICATO

        

    existing_phone = Patient.query.filter_by(
        phone=new_phone
    ).first()

    if (
        existing_phone and
        existing_phone.id != patient.id
    ):

        return jsonify({
            "message":
            "Attenzione!Numero di telefono già presente nel sistema"
        }), 409

    patient.birth_date = data.get(
        "birth_date",
        patient.birth_date
    )

    patient.phone = new_phone

    patient.email = new_email

    patient.fiscal_code = new_fiscal_code

    db.session.commit()

    return jsonify({
        "message":
        "PAZIENTE AGGIORNATO CON SUCCESSO!"
    })








# GET APPOINTMENTS


@app.route('/api/appointments', methods=['GET'])
def get_appointments():

    appointments = Appointment.query.all()

    result = []

    for a in appointments:

        doctor = Doctor.query.get(a.doctor_id)
        patient = Patient.query.get(a.patient_id)

        result.append({

                "id": a.id,

                "date": a.date,

            "hour": a.hour,

               "description": a.description,

                "patient_id": a.patient_id,

                "doctor": doctor.name if doctor else "N/A",

                "patient_name": patient.name if patient else "N/A",

               "patient_surname": patient.surname if patient else "N/A",

            "status": a.status,
    })

    return jsonify({
        "message": "Attenzione!Nessuna visita prenotata" if len(result) == 0 else "",
        "appointments": result
    })









# DELETE APPOINTMENT

@app.route('/api/appointments/<int:appointment_id>', methods=['DELETE'])
def delete_appointment(appointment_id):
    appointment = Appointment.query.get(appointment_id)

    if not appointment:
        return jsonify({"message": "Attenzione!Prenotazione non trovata"}), 404

    if appointment.status == "Completata":

        return jsonify({
            "message":
            "Attenzione!Non è possibile eliminare una visita già erogata"
        }), 400

    db.session.delete(appointment)
    db.session.commit()

    return jsonify({"message": "PRENOTAZIONE ELIMINATA CON SUCCESSO!"})



#PATIENT EXIST-FISCAL CODE

@app.route(
    "/api/patient-exists/<fiscal_code>",
    methods=["GET"]
)
def patient_exists(fiscal_code):

    patient = Patient.query.filter_by(
        fiscal_code=fiscal_code
    ).first()

    return jsonify({
        "exists": patient is not None
    })








# SEARCH APPOINTMENTS BY FISCAL CODE

@app.route('/api/appointments/fiscal/<fiscal_code>',methods=['GET'])
def get_appointments_by_fiscal_code(
    fiscal_code
):

    patient = Patient.query.filter_by(
        fiscal_code=fiscal_code
    ).first()

    if not patient:

        return jsonify({
            "Attenzione": "Codice Fiscale non esistente"
    }), 404

    appointments = Appointment.query.filter_by(
        patient_id=patient.id,
        status="Prenotata"
    ).all()

    result = []

    for a in appointments:

        doctor = Doctor.query.get(
            a.doctor_id
        )

        result.append({

            "id": a.id,

            "fiscal_code":
                patient.fiscal_code,

            "name":
                patient.name,

            "surname":
                patient.surname,

            "date":
                a.date,

            "hour":
                a.hour,

            "description":
                a.description,

            "doctor":
                doctor.name
                if doctor else "N/A"
        })

    return jsonify(result)









#CREATE REPORT


@app.route('/api/reports', methods=['POST'])
def create_report():

    appointment_id = request.form.get(
        "appointment_id"
    )

    appointment = Appointment.query.get(
        appointment_id
    )

    if not appointment:

        return jsonify({

            "message":
            "Visita non trovata"

        }), 404

    patient_name = request.form.get(
        "patient_name"
    )

    patient_surname = request.form.get(
        "patient_surname"
    )

    fiscal_code = request.form.get(
        "fiscal_code"
    )

    notes = request.form.get(
        "notes"
    )

    file = request.files.get(
        "attachment"
    )

    if not file or file.filename == "":

        return jsonify({
            "message":
               "Attenzione!Obbligatorio allegare il referto"
        }), 400

    # CONTROLLI CAMPI OBBLIGATORI

    if (
        not appointment_id or
        not patient_name or
        not patient_surname or
        not fiscal_code
    ):

        return jsonify({
            "message":
            "Attenzione!Si prega di compilare tutti i campi obbligatori"
        }), 400


    # UPLOAD FILE

    filename = ""

    if file and file.filename != "":

        filename = secure_filename(
            file.filename
        )

        file.save(
            os.path.join(
                app.config["UPLOAD_FOLDER"],
                filename
            )
        )

    report = MedicalReport(

        appointment_id=appointment_id,

        name=patient_name,

        surname=patient_surname,

        fiscal_code=fiscal_code,

        attachment=filename,

        notes=notes
    )

    db.session.add(report)

    appointment.status = "Completata"

    db.session.commit()

    return jsonify({

        "message":
        "Referto creato con successo"
    })









# GET REPORTS

@app.route('/api/reports', methods=['GET'])
def get_reports():

    reports = MedicalReport.query.all()

    result = []

    for r in reports:

        appointment = Appointment.query.get(
            r.appointment_id
        )

        patient = None

        if appointment:

            patient = Patient.query.get(
                appointment.patient_id
            )

        result.append({

            "id": r.id,

            "appointment_id":
                r.appointment_id,

            "name":
                patient.name
                if patient else "N/A",

            "surname":
                patient.surname
                if patient else "N/A",

            "fiscal_code":
                r.fiscal_code,

            "attachment":
                r.attachment,

            "notes":
                r.notes,

            "date":
                appointment.date
                if appointment else "N/A",

            "visit_type":
                appointment.description
                if appointment else "N/A"
        })

    return jsonify(result)









#REPORTS BY DOCTOR

@app.route(
    '/api/reports-by-doctor/<doctor>',
    methods=['GET']
)
def get_reports_by_doctor(doctor):

    doctor_obj = Doctor.query.filter_by(
        name=doctor
    ).first()

    if not doctor_obj:
        return jsonify([])

    appointments = Appointment.query.filter_by(
        doctor_id=doctor_obj.id
    ).all()

    appointment_ids = [
        a.id for a in appointments
    ]

    reports = MedicalReport.query.all()

    result = []

    for r in reports:

        if r.appointment_id not in appointment_ids:
            continue

        appointment = Appointment.query.get(
            r.appointment_id
        )

        patient = Patient.query.get(
            appointment.patient_id
        ) if appointment else None

        result.append({

            "id": r.id,

            "appointment_id":
                r.appointment_id,

            "name":
                patient.name if patient else "",

            "surname":
                patient.surname if patient else "",

            "fiscal_code":
                r.fiscal_code,

            "attachment":
                r.attachment,

            "notes":
                r.notes,

            "date":
                appointment.date if appointment else "",

            "visit_type":
                appointment.description if appointment else ""
        })

    return jsonify(result)







# INITIALIZATION DB + DATI DI DEFAULT

CONFIG_FILE = "config_medici.xlsx"

try:

    SPECIALIZZAZIONI = pd.read_excel(
        CONFIG_FILE,
        sheet_name="SPECIALIZZAZIONI"
    )

    TURNI = pd.read_excel(
        CONFIG_FILE,
        sheet_name="TURNI"
    )

    SPECIALIZZAZIONI.columns = (
        SPECIALIZZAZIONI.columns
        .astype(str)
        .str.strip()
        .str.upper()
    )

    TURNI.columns = (
        TURNI.columns
        .astype(str)
        .str.strip()
        .str.upper()
    )


    print("Configurazione medici caricata")

except Exception as e:

    print(
        f"Errore caricamento Excel: {e}"
    )

    SPECIALIZZAZIONI = pd.DataFrame()

    TURNI = pd.DataFrame()

with app.app_context():

    db.create_all()

    if Doctor.query.count() == 0:

        for doctor_name in SPECIALIZZAZIONI["MEDICO"].unique():

            db.session.add(
                Doctor(name=doctor_name)
            )

        db.session.commit()


if __name__ == "__main__":

    app.run(
        debug=True,
        host="0.0.0.0",
        port=5000
    )