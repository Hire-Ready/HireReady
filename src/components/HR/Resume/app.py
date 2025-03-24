from flask import Flask, request, jsonify
import PyPDF2
import spacy
from spacy.training.example import Example

app = Flask(__name__)

# Load or initialize the NER model
nlp = spacy.load("en_core_web_sm")  # Replace with your custom model later

# Dummy NER function (to be replaced with your trained model)
def parse_resume(text):
    doc = nlp(text)
    skills = []
    experience = ""
    education = ""

    # Simple rule-based extraction (customize with your NER model)
    for ent in doc.ents:
        if ent.label_ == "SKILL":  # Custom label from your model
            skills.append(ent.text)
        elif ent.label_ == "EXPERIENCE":
            experience += ent.text + "; "
        elif ent.label_ == "EDUCATION":
            education += ent.text + "; "

    return {"skills": skills, "experience": experience, "education": education}

@app.route('/parse-resumes', methods=['POST'])
def parse_resumes():
    if 'resumes' not in request.files:
        return jsonify({"error": "No resumes uploaded"}), 400

    files = request.files.getlist('resumes')
    parsed_results = []

    for file in files:
        if file.filename.endswith('.pdf'):
            # Extract text from PDF
            pdf_reader = PyPDF2.PdfReader(file)
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
        else:
            # Assume plain text for simplicity
            text = file.read().decode('utf-8')

        # Parse the text with the NER model
        parsed_data = parse_resume(text)
        parsed_data["filename"] = file.filename
        parsed_results.append(parsed_data)

    return jsonify(parsed_results)

if __name__ == '__main__':
    app.run(debug=True, port=5000)