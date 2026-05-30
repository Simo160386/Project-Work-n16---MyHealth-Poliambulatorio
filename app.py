
#IMPORT LIBRERIE

from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import re
import os
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
    phone = db.Column(db.String(30))
    email = db.Column(db.String(120))
    fiscal_code = db.Column(db.String(16), unique=True)

    __table_args__ = (
        db.UniqueConstraint('name', 'surname', name='unique_patient'),
    )



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
    fiscal_code = data.get('fiscal_code', '').strip().upper()

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
            "message": "Compila tutti i campi"
        }), 400

    # VALIDAZIONE EMAIL
    email_regex = r'^[\w\.-]+@[\w\.-]+\.\w+$'

    if not re.match(email_regex, email):

        return jsonify({
            "message": "E-mail non valida"
        }), 400

    # VALIDAZIONE TELEFONO
    if not phone.isdigit():

        return jsonify({
            "message": "Il telefono deve contenere solo numeri"
        }), 400

    # CONTROLLO CODICE FISCALE DUPLICATO
    existing_cf = Patient.query.filter_by(
        fiscal_code=fiscal_code
    ).first()

    if existing_cf:

        return jsonify({
            "message": "Codice fiscale già presente"
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
        "message": "Paziente creato!"
    })



# GET DOCTORS


@app.route('/api/doctors', methods=['GET'])
def get_doctors():
    doctors = Doctor.query.all()
    return jsonify([{"id": d.id, "name": d.name} for d in doctors])



# CREATE APPOINTMENT


@app.route('/api/appointments', methods=['POST'])
def create_appointment():

    data = request.json

    hour = data.get('hour')
    date = data.get('date')
    description = data.get('description')
    patient_id = data.get('patient_id')
    doctor_id = data.get('doctor_id')

    if (
    	not date or
    	not hour or
    	not description or
    	not patient_id or
    	not doctor_id
	):

        return jsonify({
            "message": "Compila tutti i campi"
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
        "message": "Prenotazione effettuata!"
    })


# MODIFICA PRENOTAZIONE


@app.route(
    "/api/appointments/<int:id>",
    methods=["PUT"]
)
def update_appointment(id):

    appointment = Appointment.query.get(id)

    if not appointment:

        return jsonify({
            "message": "Prenotazione non trovata"
        }), 404

    data = request.json

    appointment.date = data.get("date")

    appointment.hour = data.get("hour")

    db.session.commit()

    return jsonify({

        "success": True,

        "message":
        "Prenotazione modificata con successo"
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

@app.route(
    '/api/patients/<int:id>',
    methods=['PUT']
)
def update_patient(id):

    patient = Patient.query.get(id)

    if not patient:

        return jsonify({
            "message":
            "Paziente non trovato"
        }), 404

    data = request.json

    patient.birth_date = data.get(
        "birth_date",
        patient.birth_date
    )

    patient.phone = data.get(
        "phone",
        patient.phone
    )

    patient.email = data.get(
        "email",
        patient.email
    )

    patient.fiscal_code = data.get(
        "fiscal_code",
        patient.fiscal_code
    ).upper()

    db.session.commit()

    return jsonify({

        "message":
        "Paziente aggiornato con successo"
    })



# GET APPOINTMENTS


@app.route('/api/appointments', methods=['GET'])
def get_appointments():

    appointments = Appointment.query.filter_by(
    	status="Prenotata"
    ).all()

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

   			"patient_surname": patient.surname if patient else "N/A"
	})

    return jsonify({
        "message": "Nessuna visita prenotata" if len(result) == 0 else "",
        "appointments": result
    })



# DELETE APPOINTMENT

@app.route('/api/appointments/<int:appointment_id>', methods=['DELETE'])
def delete_appointment(appointment_id):
    appointment = Appointment.query.get(appointment_id)

    if not appointment:
        return jsonify({"message": "Prenotazione non trovata"}), 404

    db.session.delete(appointment)
    db.session.commit()

    return jsonify({"message": "Prenotazione eliminata con successo"})






# SEARCH APPOINTMENTS BY FISCAL CODE

@app.route(
    '/api/appointments/fiscal/<fiscal_code>',
    methods=['GET']
)
def get_appointments_by_fiscal_code(
    fiscal_code
):

    patient = Patient.query.filter_by(
        fiscal_code=fiscal_code
    ).first()

    if not patient:

        return jsonify([])

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

    # CONTROLLI CAMPI OBBLIGATORI

    if (
        not appointment_id or
        not patient_name or
        not patient_surname or
        not fiscal_code
    ):

        return jsonify({
            "message":
            "Compila tutti i campi obbligatori"
        }), 400

    # CONTROLLO VISITA ESISTENTE

    appointment = Appointment.query.get(
        appointment_id
    )

    if not appointment:

        return jsonify({
            "message":
            "ID Visita non presente nel sistema"
        }), 400

    # CONTROLLO REFERTO DUPLICATO

    existing_report = MedicalReport.query.filter_by(
        appointment_id=appointment_id
    ).first()

    if existing_report:

        return jsonify({
            "message":
            "Referto già presente per questa visita"
        }), 409

    # CONTROLLO PAZIENTE ASSOCIATO ALLA VISITA

    patient = Patient.query.get(
        appointment.patient_id
    )

    if not patient:

        return jsonify({
            "message":
            "Paziente non trovato"
        }), 404

    # CONTROLLO NOME

    if patient.name.strip().lower() != \
       patient_name.strip().lower():

        return jsonify({
            "message":
            "Nome paziente non coerente con la visita"
        }), 400

    # CONTROLLO COGNOME

    if patient.surname.strip().lower() != \
       patient_surname.strip().lower():

        return jsonify({
            "message":
            "Cognome paziente non coerente con la visita"
        }), 400

    # CONTROLLO CODICE FISCALE

    if patient.fiscal_code.strip().upper() != \
       fiscal_code.strip().upper():

        return jsonify({
            "message":
            "Codice fiscale non coerente con la visita"
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


# INITIALIZATION DB + DATI DI DEFAULT
if __name__ == "__main__":

    with app.app_context():

        db.create_all()

        # =========================
        # PERSONALE SANITARIO
        # =========================

        admin_exists = User.query.filter_by(
            username="admin"
        ).first()

        if not admin_exists:

            db.session.add(

                User(

                    username="admin",

                    password="admin",

                    role="staff"
                )
            )

        # =========================
        # MEDICI SPECIALISTI
        # =========================

        specialists = [

            "rossi",

            "bianchi",

            "verdi"
        ]

        for specialist in specialists:

            existing = User.query.filter_by(
                username=specialist
            ).first()

            if not existing:

                db.session.add(

                    User(

                        username=specialist,

                        password="12345",

                        role="doctor"
                    )
                )

        # =========================
        # CREA MEDICI
        # =========================

        if not Doctor.query.first():

            db.session.add_all([

                Doctor(name="Rossi"),

                Doctor(name="Bianchi"),

                Doctor(name="Verdi")
            ])

        db.session.commit()

    app.run(debug=True)







