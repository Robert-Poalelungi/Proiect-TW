# 📘 Prezență -- Proiect Tehnologii Web

**Aplicație Web SPA (React) + Backend Minimal (Node & Express)**\
**Autor:** *\[Numele tău\]*\
**Materie:** Tehnologii Web

------------------------------------------------------------------------

# 📝 0. Cerințe generale proiect

## 🎯 Obiectiv general
- Realizarea unei aplicații pe una dintre temele specificate, cu backend RESTful care accesează date stocate într-o bază relațională, un API de persistență și date expuse de un serviciu extern, plus frontend SPA realizat cu un framework bazat pe componente.

## 🛠️ Limitări tehnologice
- Frontend cu framework bazat pe componente (React.js/Angular/Vue.js).
- Backend cu interfață REST și implementare în Node.js.
- Stocare peste bază de date relațională, acces prin ORM.
- Cod versionat în Git cu commit-uri incrementale și descrieri clare.
- Aplicația trebuie deployată pe un server (tier free acceptat: Azure/AWS etc.).

## 🎨 Stil și calitate a codului
- Aplicație coerentă din punct de vedere al logicii de business.
- Cod organizat, nume sugestive, convenție unitară (e.g. camelCase), indentare corectă.
- Cod documentat cu comentarii la clase, funcții etc.
- Aplicațiile nefuncționale nu primesc punctaj; se poate demonstra doar backend sau frontend.
- Opțional: test coverage.

## 🗓️ Livrabile parțiale
- 16.11.2025: specificații detaliate, plan de proiect, proiect inițial în Git.
- 06.12.2025: serviciu RESTful funcțional în repository + instrucțiuni de rulare.
- Ultimul seminar: aplicația completă (demo) livrată.

------------------------------------------------------------------------

# 🧾 1. Introducere

Acest proiect reprezintă o aplicație web pentru monitorizarea prezenței
la evenimente, realizată în arhitectură **Single Page Application
(SPA)** folosind **React** pentru frontend și **Node.js + Express**
pentru backend.

Aplicația permite unui organizator să creeze evenimente și grupuri de
evenimente, să genereze coduri unice pentru acces și să monitorizeze în
timp real participanții care își confirmă prezența. Participanții pot
accesa evenimentul introducând codul primit.

Proiectul respectă **toate cerințele minime obligatorii** ale temei.

------------------------------------------------------------------------

# 🎯 2. Obiectivul proiectului

Scopul aplicației este:

-   gestionarea evenimentelor și grupurilor de evenimente,
-   generarea codurilor unice pentru acces,
-   înregistrarea și monitorizarea participanților,
-   afișarea și exportarea listelor de prezență,
-   realizarea unei aplicații web moderne, în arhitectură SPA.

------------------------------------------------------------------------

# 📌 3. Cerințe minime (realizate 100%)

### ✔ Organizatorul poate:

-   crea un grup de evenimente,
-   crea unul sau mai multe evenimente,
-   genera automat coduri de acces,
-   vedea starea evenimentelor (OPEN / CLOSED),
-   vizualiza lista participanților,
-   exporta listele în format CSV.

### ✔ Participanții pot:

-   introduce codul evenimentului,
-   introduce numele și confirma prezența,
-   pot participa doar dacă evenimentul este OPEN.

### ✔ Aplicația:

-   este accesibilă pe desktop, tabletă și mobil,
-   funcționează ca o Single Page Application,
-   gestionează evenimentele pe baza timpului local,
-   folosește un backend simplu, fără baze de date.

------------------------------------------------------------------------

# 📡 4. Arhitectură generală

Aplicația este împărțită în două module:

------------------------------------------------------------------------

## 🔵 4.1. Frontend -- React (SPA)

-   creat cu comanda seminarului:

        npm init react-app@latest presence-monitor

-   component-based design,

-   schimbarea paginilor se face prin state (fără router),

-   comunică cu backend-ul prin fetch API.

Componente principale:

-   `Home.jsx` -- pagina principală cu alegerea rolului,
-   `Organizer.jsx` -- creare & gestionare grupuri/evenimente,
-   `Join.jsx` -- confirmare prezență,
-   `EventDetails.jsx` -- afișarea participanților.

------------------------------------------------------------------------

## 🟢 4.2. Backend -- Node.js + Express + Sequelize (MySQL)

- rulează pe `http://localhost:4000`,
- persistă datele în MySQL prin **Sequelize** (stil seminare),
- expune un API REST pentru:
  - gestionarea grupurilor/evenimentelor,
  - înregistrarea participanților,
  - export CSV.

Funcționalitate principală:

- generare cod unic (automat),
- determinarea statusului OPEN/CLOSED,
- stocare participanți și ore în DB,
- generare CSV.

------------------------------------------------------------------------

# 🧱 5. Structura proiectului

## 📂 Frontend (`frontend/`)

    src/
  ├── components/App.jsx
     ├── api.js
     ├── main.jsx
     ├── components/
     │    ├── Home.jsx
     │    ├── Organizer.jsx
     │    ├── Join.jsx
     │    └── EventDetails.jsx

## 📂 Backend (`backend/`)

    index.js
    dbConfig.js
    entities/
      ├── EventGroup.js
      ├── Event.js
      ├── Participant.js
      └── associations.js
    dataAccess/
    routes/
    .env.example

  ### 🔧 Setup rapid (backend)

  1. Editează `.env` și setează credențialele MySQL (DB_DATABASE=prezente).
  2. Instalează dependențele: `cd backend && npm install`.
  3. Inițializează tabelele: `npm start` apoi `GET http://localhost:4000/api/config/init`.
  4. Rulează frontend-ul: `cd ../frontend && npm install && npm run dev`.

------------------------------------------------------------------------

# 🔍 6. Descrierea funcționalităților

## ✔ 6.1. Crearea grupurilor de evenimente

Organizatorul introduce:

-   numele grupului,
-   numele evenimentului,
-   data și ora de început,
-   data și ora de final.

Backend-ul creează:

-   grupul,
-   evenimentul,
-   codul unic.

Codul poate fi afișat pe proiector sau transmis participanților.

------------------------------------------------------------------------

## ✔ 6.2. Codul unic al evenimentului

Generat automat:

    Math.random().toString(36).substring(2, 8).toUpperCase()

Caracteristici:

-   6 caractere,
-   ușor de introdus,
-   sigur statistic.

------------------------------------------------------------------------

## ✔ 6.3. Status OPEN / CLOSED

Backend-ul stabilește statusul în funcție de timp:

  Timp față de eveniment   Status
  ------------------------ --------
  înainte de start         CLOSED
  între start și end       OPEN
  după end                 CLOSED

Nu este necesară intervenția organizatorului.

------------------------------------------------------------------------

## ✔ 6.4. Confirmarea prezenței

Participanții:

1.  introduc codul,
2.  introduc numele,
3.  backend-ul verifică statusul,
4.  backend-ul salvează ora exactă (`joinedAt`).

Organizatorul vede participanții în timp real.

------------------------------------------------------------------------

## ✔ 6.5. Export CSV

Organizatorul poate exporta:

-   un singur eveniment,
-   întregul grup.

Backend-ul servește automat fișierul `.csv`.

------------------------------------------------------------------------

# 🔧 7. Instalare și rulare

------------------------------------------------------------------------

## 7.1. Backend

``` bash
cd presence-backend
npm install
npm start
```

Backend-ul rulează la:

    http://localhost:4000

------------------------------------------------------------------------

## 7.2. Frontend

``` bash
cd presence-monitor
npm install
npm run dev
```

Frontend-ul rulează la:

    http://localhost:5173

------------------------------------------------------------------------

## 7.3. Configurare proxy (frontend)

În `presence-monitor/package.json`:

``` json
"proxy": "http://localhost:4000"
```

Asigură comunicarea simplă frontend → backend.

------------------------------------------------------------------------

# 📡 8. Documentație completă API

------------------------------------------------------------------------

## 🔹 GET `/api/event-groups`

Returnează toate grupurile de evenimente.

------------------------------------------------------------------------

## 🔹 POST `/api/event-groups`

Creează grup + evenimente.

**Body:**

``` json
{
  "name": "Grup A",
  "events": [
    {
      "name": "Eveniment 1",
      "startTime": "2025-12-10T10:00",
      "endTime": "2025-12-10T12:00"
    }
  ]
}
```

------------------------------------------------------------------------

## 🔹 POST `/api/join`

Confirmă participarea.

**Body:**

``` json
{
  "code": "ABC123",
  "name": "Ion"
}
```

------------------------------------------------------------------------

## 🔹 GET `/api/events/:id`

Detalii complete eveniment.

------------------------------------------------------------------------

## 🔹 GET `/api/events/:id/participants`

Lista participanților.

------------------------------------------------------------------------

## 🔹 GET `/api/export/event/:id`

Export CSV pentru un singur eveniment.

------------------------------------------------------------------------

## 🔹 GET `/api/export/group/:id`

Export CSV pentru toate evenimentele unui grup.

------------------------------------------------------------------------

# 🛠️ 9. Tehnologii utilizate

### Frontend:

-   React
-   JSX
-   Fetch API
-   HTML5
-   CSS minimalist

### Backend:

-   Node.js
-   Express
-   CORS
-   CSV generator manual
-   In-memory storage

------------------------------------------------------------------------

# 🎨 Paletă de culori (UI)

-   Primar: #574d68 (fundal header, text accent) și #f5f3f8 (text pe fond închis)
-   Accent verde: gradient #afc97e → #8da965 (butoane primare)
-   Fundal app: #d3cdd7 (background global și contururi soft)
-   Suprafețe: #ffffff → #f1eff5 (gradienți carduri/panouri), borduri #d3cdd7
-   Text secundar: #574d68, #0e1116
-   Status OPEN: fond rgba(46, 204, 113, 0.18), contur #2ecc71, text #1c7c3a
-   Status CLOSED / pericol: fond rgba(231, 76, 60, 0.18), contur #e74c3c, text #c1121f / #b42318

------------------------------------------------------------------------

# 🧪 10. Scenarii de testare

  Scenariu                                        Rezultat
  ----------------------------------------------- ------------------------------
  Eveniment CLOSED → participant încearcă acces   ❌ refuzat
  Cod greșit                                      ❌ eroare
  Confirmare prezență validă                      ✔ acceptată
  Eveniment OPEN → participant intră              ✔ apare în listă
  Export CSV                                      ✔ fișier descărcat corect
  Export CSV grup                                 ✔ toate evenimentele incluse

------------------------------------------------------------------------

# 📉 11. Limitări (intenționate)

-   datele sunt stocate doar în memorie (se șterg la restart),
-   UI simplu (cerință minimă),
-   fără autentificare,
-   nu există baze de date.

------------------------------------------------------------------------

# 🚀 12. Îmbunătățiri posibile

-   integrare bază de date (Mongo / SQLite),
-   sistem de login pentru organizator,
-   React Router,
-   WebSockets pentru live updates,
-   statistici și grafice.

------------------------------------------------------------------------

# ✔ 13. Concluzie

Acest proiect realizează **toate cerințele minime** ale temei:

-   SPA complet funcțional\
-   backend minimal dar complet\
-   cod unic pentru fiecare eveniment\
-   gestionare OPEN/CLOSED\
-   confirmare prezență\
-   monitorizare participanți în timp real\
-   export CSV

Fișierul `README.md` documentează complet aplicația pentru predare și
evaluare.
