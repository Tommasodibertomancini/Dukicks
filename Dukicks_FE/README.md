![DuKicks Logo](Dukicks_FE/public/assets/img/DuKicks.png)

---

# DuKicks

---

**DuKicks** è un'applicazione e-commerce full-stack, moderna e responsive pensata per gli amanti delle sneakers. Offre un'esperienza utente fluida e funzionale, con un'interfaccia intuitiva, un potente sistema di filtraggio e gestione del carrello, oltre a un backend solido e sicuro.

🔗 **Live demo**: [dukicks.vercel.app](https://dukicks.vercel.app)

---

## ✨ Funzionalità principali

- 🏠 Home con prodotti in evidenza
- 🔍 Ricerca e filtri per nome, categoria, brand e prezzo
- 👟 Pagina dettagliata del prodotto con selezione taglie e recensioni
- 🛒 Carrello dinamico con modifica quantità
- 💳 Checkout intuitivo
- 👤 Autenticazione utente con login e registrazione
- ❤️ Wishlist (preferiti)
- 🌗 Tema chiaro/scuro
- 📱 Responsive
- 🎨 Animazioni fluide con CSS personalizzato
- 🔐 Accesso admin per gestione prodotti

---

## 🛠️ Stack tecnologico

### Frontend

- **React** + **Redux Toolkit**
- **React Router** per il routing
- **React Bootstrap** + **CSS custom**
- **Vercel** per il deploy automatico

### Backend

- **ASP.NET Core API**
- **SQL Server** con **Entity Framework Core**
- **JWT** per autenticazione
- **Azure** per il deploy backend

---

## 🏗️ Architettura

DuKicks adotta una classica architettura client-server:

```
Dukicks/
├── Dukicks_FE/    # Frontend React
└── Dukicks_BE/    # Backend ASP.NET Core
```

- **Frontend**:
  - Componenti modulari React
  - Stato gestito via Redux
  - Routing dichiarativo
  - Responsive e accessibile

- **Backend**:
  - API RESTful
  - Repository pattern per accesso ai dati
  - JWT per la sicurezza

---

## 📁 Struttura del frontend

```
src/
├── components/    # Componenti riutilizzabili
├── pages/         # Pagine principali
├── redux/         # Store e slice Redux
├── services/      # Servizi API
├── styles/        # Temi e CSS
└── utils/         # Funzioni di utilità
```

---

## 🚀 Come installare

### Prerequisiti
- Node.js 14+
- .NET SDK
- SQL Server

### Clonazione e setup

```bash
git clone https://github.com/Tommasodibertomancini/Dukicks.git
cd Dukicks
```

#### Avvio backend

```bash
cd Dukicks_BE
dotnet build
dotnet run
```

#### Avvio frontend

```bash
cd ../Dukicks_FE
npm install
npm start
```
---

## 🔨 Build

```bash
# Frontend
npm run build
```

---

## 👥 Autori

- **Tommaso Di Berto Mancini** – *Full Stack Developer* – [GitHub](https://github.com/Tommasodibertomancini)
