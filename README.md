Tech Stack
Frontend:

Next.js 14 (App Router)

TypeScript

Tailwind CSS

Axios

Backend:

Node.js + Express.js

MongoDB + Mongoose

AI:

Ollama (local AI model runner)

LLaMA 3.2:1b (lightweight language model)

🧩 Features
✅ Real-time chat (streaming responses)
✅ Chat history (MongoDB storage)
✅ Multiple conversations with rename/delete
✅ Smart timestamps (e.g., "2h ago")
✅ Mobile-responsive UI
✅ Graceful error handling

🛠️ Setup Guide (Local)
Clone the repo:


git clone <repo-url>
cd Chatbot
Install Ollama & Model


ollama pull llama3.2:1b
ollama serve
MongoDB Setup

Use MongoDB Atlas or local instance

Get connection URI and whitelist IP

Backend


cd backend
npm install
Add .env:


PORT=3001
MONGODB_URI=mongodb+srv://<your_uri>
OLLAMA_API=http://localhost:11434/api/generate
Frontend

bash
Copy
Edit
cd frontend/my-app
npm install
npm run dev
🏗️ Folder Structure
pgsql
Copy
Edit
Chatbot/
├── backend/
│   ├── controllers/ ─ chat logic
│   ├── models/ ─ Chat & Message schemas
│   ├── routes/ ─ API routes
│   └── app.js ─ server setup
├── frontend/my-app/
│   ├── components/ ─ Sidebar, ChatWindow, Input
│   ├── app/ ─ page.tsx, layout.tsx
│   └── lib/ ─ API utility
🔌 API Overview
Chats:

GET /api/chats

POST /api/chats

PUT /api/chats/:id/rename

DELETE /api/chats/:id

Messages:

GET /api/chats/:id/messages

POST /api/chats/:id/messages (streaming)

🧠 Assumptions & Constraints
Assumptions:

Runs locally

Single user (no login)

Requires RAM for AI model

Not built for multiple users

Plain-text message storage

🐞 Common Issues
Ollama error / timeout:

Ensure ollama serve is running

Re-pull the model if needed

MongoDB errors:

Check URI and IP whitelist

Ensure internet access

CORS/frontend issues:

Confirm backend is on localhost:3001

Validate API URL in api.ts

🔮 Future Improvements
 Login/auth system

 Chat search

 File sharing

 Dark/light mode

 Mobile app version