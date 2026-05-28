__pycache__/
*.pyc
.ipynb_checkpoints/
venv/
.env

#IMPORT LIBRERIE

from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import re

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///healthcare.db'
db = SQLAlchemy(app)


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


class MedicalReport(db.Model):

    id = db.Column(db.Integer, primary_key=True)

    appointment_id = db.Column(
        db.Integer,
        db.ForeignKey('appointment.id')
    )

    diagnosis = db.Column(db.String(500))

    therapy = db.Column(db.String(500))

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

    	doctor_id=doctor_id
	)

    db.session.add(appointment)

    db.session.commit()

    return jsonify({
        "message": "Prenotazione effettuata!"
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





# CREATE MEDICAL REPORT

@app.route('/api/reports', methods=['POST'])
def create_report():

    data = request.json

    appointment_id = data.get('appointment_id')

    diagnosis = data.get('diagnosis', '').strip()

    therapy = data.get('therapy', '').strip()

    notes = data.get('notes', '').strip()

    # controlli
    if (
        not appointment_id or
        not diagnosis or
        not therapy
    ):

        return jsonify({
            "message":
            "Compila tutti i campi obbligatori"
        }), 400

    # verifica visita
    appointment =Appointment.query.get(appointment_id)

    if not appointment:

        return jsonify({
            "message": "Visita non trovata"
        }), 404

    # controllo referto già esistente
    existing_report = MedicalReport.query.filter_by(appointment_id=appointment_id).first()

    if existing_report:

        return jsonify({
            "message":
            "Referto già presente per questa visita"
        }), 409

    report = MedicalReport(

        appointment_id=appointment_id,

        diagnosis=diagnosis,

        therapy=therapy,

        notes=notes
    )

    db.session.add(report)

    db.session.commit()

    return jsonify({
        "message":
        "Referto creato con successo"
    })



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
        patient_id=patient.id
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





# GET REPORTS

@app.route('/api/reports', methods=['GET'])
def get_reports():

    reports = MedicalReport.query.all()

    result = []

    for r in reports:

        appointment = Appointment.query.get(r.appointment_id)

        patient = None
        doctor = None

        if appointment:

            patient = Patient.query.get(appointment.patient_id)

            doctor = Doctor.query.get(appointment.doctor_id)

        result.append({

            "id": r.id,

            "appointment_id":
                r.appointment_id,

            "diagnosis":
                r.diagnosis,

            "therapy":
                r.therapy,

            "notes":
                r.notes,

            "date":
                appointment.date
                if appointment else "N/A",

            "visit_type":
                appointment.description
                if appointment else "N/A",

            "doctor":
                doctor.name
                if doctor else "N/A",

            "patient":
                f"{patient.name} {patient.surname}"
                if patient else "N/A"
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

                Doctor(name="Dr. Rossi"),

                Doctor(name="Dr. Bianchi"),

                Doctor(name="Dr. Verdi")
            ])



        db.session.commit()



    app.run(debug=True)
