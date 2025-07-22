AI Chatbot with LLaMA 3.2:1b, Node.js & Next.js
A full-stack AI-powered chatbot featuring real-time streaming responses, conversation history, and a clean mobile-friendly UI. Powered by Next.js 14 (App Router) on the frontend and Node.js + Express on the backend, with LLaMA 3.2:1b running locally via Ollama.

🧰 Tech Stack
Frontend
⚛️ Next.js 14 (App Router)

💬 TypeScript

🎨 Tailwind CSS

📡 Axios

Backend
🟢 Node.js + Express.js

🗃️ MongoDB + Mongoose

AI
🧠 Ollama (local AI model runner)

🦙 LLaMA 3.2:1b (lightweight language model)

✨ Features
✅ Real-time chat with streaming responses

💾 Chat history stored in MongoDB

🧠 Multiple conversations (rename & delete supported)

⏱️ Smart timestamps (e.g., "2h ago")

📱 Fully mobile-responsive UI

❗ Graceful error handling

🚀 Setup Guide (Local)
1. Clone the repository
bash
Copy
Edit
git clone <repo-url>
cd Chatbot
2. Install Ollama & Pull AI Model
bash
Copy
Edit
ollama pull llama3.2:1b
ollama serve
Make sure ollama serve keeps running in the background.

3. MongoDB Setup
Use MongoDB Atlas or your local MongoDB

Get your MongoDB connection URI

Whitelist your current IP

4. Backend Setup
bash
Copy
Edit
cd backend
npm install
Create a .env file:

env
Copy
Edit
PORT=3001
MONGODB_URI=mongodb+srv://<your_mongodb_uri>
OLLAMA_API=http://localhost:11434/api/generate
Start the server:

bash
Copy
Edit
node app.js
5. Frontend Setup
bash
Copy
Edit
cd frontend/my-app
npm install
npm run dev
Open: http://localhost:3000

📁 Folder Structure
bash
Copy
Edit
Chatbot/
├── backend/
│   ├── controllers/      # Chat logic
│   ├── models/           # Chat & Message schemas
│   ├── routes/           # API routes
│   └── app.js            # Express server
├── frontend/my-app/
│   ├── components/       # Sidebar, ChatWindow, Input
│   ├── app/              # layout.tsx, page.tsx
│   └── lib/              # API utility (axios config)
🔌 API Overview
Chats
Method	Endpoint	Description
GET	/api/chats	Get all chats
POST	/api/chats	Create new chat
PUT	/api/chats/:id/rename	Rename a chat
DELETE	/api/chats/:id	Delete a chat

Messages
Method	Endpoint	Description
GET	/api/chats/:id/messages	Get messages for a chat
POST	/api/chats/:id/messages	Send message (with streaming)

💡 Assumptions & Constraints
Runs locally only

Designed for single user use

AI model requires sufficient RAM

No login/auth currently

Messages stored as plain text in DB

🐛 Common Issues
Ollama-related:
❌ Error or timeout:

Ensure ollama serve is running

Re-pull model if corrupted

MongoDB:
❌ Connection error:

Check URI and ensure IP is whitelisted

Make sure MongoDB is online

CORS / Frontend:
❌ API not responding:

Backend must run on http://localhost:3001

Confirm API URL in lib/api.ts

🔮 Future Improvements
🔐 Add login & authentication

🔍 Chat search functionality

📎 File sharing

🌓 Light/Dark mode toggle

📱 Native mobile app