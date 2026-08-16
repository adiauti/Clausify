# Clausify

## 📋 What is Clausify?

**Clausify** is an AI-powered legal document analyzer that helps you understand contracts and agreements in plain language. Simply upload any legal document, and Clausify will:

- 📝 **Summarize** the document's key points
- ⚠️ **Identify risks** and assign a risk score
- 🔍 **Highlight suspicious clauses** that may need attention
- 💬 **Answer your questions** about the document through a chat interface

Think of it as your personal legal assistant that reads dense contracts and explains what really matters.

---

## 🎯 Who is it for?

- 📄 Anyone signing a contract (employment, rental, NDA, service agreements)
- 💼 Freelancers and small business owners reviewing client contracts
- 🏠 Tenants reading lease agreements
- 🎓 Students learning to understand legal language
- 🔍 Anyone who wants a second opinion before signing

---

## ✨ Features

- **Smart Document Analysis** — Upload PDF or text documents for instant analysis
- **Risk Scoring** — Get a clear risk level (low / medium / high) with a numeric score
- **Clause Highlighting** — See exactly which parts of the document are flagged
- **Interactive Chat** — Ask follow-up questions like *"What are my biggest risks?"* or *"Can I negotiate this clause?"*
- **Privacy-First** — Your documents and API credentials stay secure on your own machine

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (LTS version) — [Download here](https://nodejs.org)
- **Anthropic API Key** — [Get one here](https://console.anthropic.com)
- A modern web browser

### Installation

1. **Clone or download this repository**
2. **Install dependencies** by running `npm install` in the project folder
3. **Set up your API key** in a `.env` file (see Configuration below)
4. **Start the server** with `npm start`
5. **Open the app** in your browser and upload a document

### Configuration

Create a `.env` file in the project root and add your Anthropic API key:

```
ANTHROPIC_API_KEY=your-api-key-here
```

⚠️ **Never share or commit your API key.** The `.env` file is already excluded from version control.

---

## 🖥️ How to Use

1. **Start the server** (see Installation above)
2. **Open the web app** in your browser
3. **Upload a document** (PDF or text)
4. **Wait for analysis** — usually takes a few seconds
5. **Review the results**:
   - Read the summary
   - Check the risk score
   - Look at highlighted clauses
6. **Ask questions** in the chat box if you want more details

---

## 💡 Example Use Cases

- *"I'm about to sign a 2-year employment contract — what should I worry about?"*
- *"Does this rental agreement have any unusual terms?"*
- *"Explain this NDA in simple language"*
- *"What's the termination clause in this service agreement?"*

---

## 🔒 Privacy & Security

- All processing happens on your local machine
- Your API key is stored locally and never exposed to the frontend
- Documents are sent to the Anthropic API for analysis only — not stored anywhere
- No data is sent to third parties other than the AI provider

⚠️ **Disclaimer:** Clausify is an educational tool and does **not** constitute legal advice. Always consult a qualified attorney for important legal matters.

---

## 🛠️ Troubleshooting

| Problem | Solution |
|---------|----------|
| Server won't start | Make sure Node.js is installed and dependencies are installed |
| "API key not found" error | Check that your `.env` file exists and contains a valid key |
| Connection refused | Ensure the backend server is running before opening the app |
| Port already in use | Change the port in your configuration |
| Invalid API key | Generate a new key from the Anthropic console |

---

## 📚 Resources

- [Anthropic API Documentation](https://docs.anthropic.com)
- [Node.js Documentation](https://nodejs.org/en/docs)
- [Express.js Guide](https://expressjs.com)

---

## 📄 License

This project is for personal and educational use. Please respect the terms of service of any third-party APIs used.

---

**Happy analyzing! 🚀**
