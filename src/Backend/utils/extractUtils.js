function extractEmailFromResume(resumeText) {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const matches = resumeText.match(emailRegex);
  return matches ? matches[0] : null;
}

module.exports = { extractEmailFromResume };
