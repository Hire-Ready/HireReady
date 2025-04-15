import spacy
import re
from typing import Dict, List

# Load spaCy's small English model
nlp = spacy.load("en_core_web_sm")

# Define keyword lists for section detection
education_keywords = ["education", "academic", "university", "college", "degree"]
experience_keywords = ["experience", "work", "employment", "job", "professional"]
skills_keywords = ["skills", "technologies", "proficiencies", "tools"]
tech_terms = ["python", "java", "react", "sql", "javascript", "aws", "docker"]  # Expand as needed

def detect_section(lines: List[str], keywords: List[str]) -> bool:
    """Check if any line contains a section keyword."""
    return any(keyword in line.lower() for keyword in keywords for line in lines)

def extract_until_next_section(lines: List[str], start_idx: int) -> str:
    """Extract text until a new section is detected (ALL-CAPS or ends with ':')."""
    extracted = []
    for line in lines[start_idx:]:
        if line.isupper() or line.strip().endswith(":"):
            break
        extracted.append(line.strip())
    return " ".join(extracted)

def extract_skills_fallback(text: str) -> List[str]:
    """Scan entire text for tech terms if no Skills section is found."""
    doc = nlp(text.lower())
    skills = []
    for token in doc:
        if token.text in tech_terms:
            skills.append(token.text)
    return list(set(skills))  # Remove duplicates

def parse_resume(text: str) -> Dict[str, str]:
    """Parse resume text into structured sections."""
    lines = [line.strip() for line in text.split("\n") if line.strip()]
    result = {"education": "", "experience": "", "skills": []}

    for i, line in enumerate(lines):
        # Detect and extract Education section
        if detect_section([line], education_keywords):
            result["education"] = extract_until_next_section(lines, i + 1)
        # Detect and extract Experience section
        elif detect_section([line], experience_keywords):
            result["experience"] = extract_until_next_section(lines, i + 1)
        # Detect and extract Skills section
        elif detect_section([line], skills_keywords):
            skills_text = extract_until_next_section(lines, i + 1)
            doc = nlp(skills_text.lower())
            result["skills"] = [token.text for token in doc if token.text in tech_terms]

    # Fallback: If no skills section found, scan the whole text
    if not result["skills"]:
        result["skills"] = extract_skills_fallback(text)

    return result

if __name__ == "__main__":
    # Example usage
    sample_resume = """
    EDUCATION
    B.S. Computer Science, XYZ University
    WORK EXPERIENCE
    Software Engineer: Developed Python and Java apps
    SKILLS
    Python, Java, React
    """
    parsed = parse_resume(sample_resume)
    import json
    print(json.dumps(parsed, indent=2))