WorkshopMasterFE 🎨⚛️

Frontend för WorkshopMaster – ett system för att hantera bokningar, kunder och fordon i en bilverkstad.
Byggt i React + TypeScript + Vite och kommunicerar med backend-API:t i WorkshopMaster-projektet.

🚀 Komma igång
git clone https://github.com/id0r3a/WorkshopMasterFE.git
cd WorkshopMasterFE
npm install


Skapa .env i projektroten:

VITE_API_BASE_URL=http://localhost:5222


Starta utvecklingsservern:

npm run dev


Frontend öppnas på:
👉 http://localhost:5173

🧩 Funktioner

📋 Visa bokningar

🔍 Filtrera på status & registreringsnummer

🧑‍🔧 Visa kund- och fordonsdetaljer

➕ Skapa nya bokningar

📊 Dashboard-KPI från backend

🎨 Ren och responsiv layout

📁 Projektstruktur
src/
 ├─ pages/WorkshopMasterPage.tsx
 ├─ components/workshopMaster/
 ├─ styles/
 └─ api/

🔌 Backendkrav

Backend måste köras på t.ex.:

http://localhost:5222


API används för att hämta bokningar, kunder, fordon, tjänster och dashboard-statistik.

🐞 Kända begränsningar

Ingen autentisering ännu

Enbart desktop-optimerad layout
