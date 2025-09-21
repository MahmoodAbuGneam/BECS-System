# 🩸 BECS – Fullstack Implementation Plan

## 📖 Overview
Build a **Fullstack Blood Establishment Computer Software (BECS)** system with:
- **Frontend**: React  
- **Backend**: Python (FastAPI)  
- **Database**: MongoDB  

The system supports **donation intake, routine blood distribution, and emergency blood distribution**.

---

## 🏗️ System Architecture
```
[ React Frontend ]  <-->  [ FastAPI Backend ]  <-->  [ MongoDB Database ]
```

- **Frontend (React)**  
  - Provides user-friendly forms and dashboards.  
  - Communicates with backend via REST API (JSON).  

- **Backend (FastAPI, Python)**  
  - Handles business logic:
    - Blood compatibility validation  
    - Stock management (add/remove units)  
    - Emergency handling (O- logic)  
  - Exposes REST endpoints for frontend.  

- **Database (MongoDB)**  
  - Collections:  
    - `donors` → donor info, donation records  
    - `inventory` → blood stock by type  
    - `transactions` → logs of distribution (routine/emergency)  

---

## 🎨 Frontend (React)

### Pages / Components
1. **Home Dashboard**
   - Quick overview of blood stock.  
   - Buttons to access each mode (Donation / Routine / Emergency).  

2. **Donation Intake Page**
   - Form fields:  
     - Donor ID  
     - Full Name  
     - Blood Type (dropdown)  
     - Date of Donation  
   - Submits to backend → updates inventory.  

3. **Routine Distribution Page**
   - Form fields:  
     - Requested Blood Type  
     - Number of Units  
   - Output:  
     - If available → confirmation & stock updated.  
     - If not → recommended alternative type (based on compatibility + rarity).  

4. **Emergency Distribution Page**
   - Button: “Dispense O-”  
   - Backend returns max available units or error if stock empty.  

---

## ⚙️ Backend (FastAPI)

### Endpoints
- **POST /donations**  
  → Add donation (update inventory + log donor info).  

- **POST /distribute/routine**  
  → Request blood for routine operation.  
  - Input: `{ blood_type, units }`  
  - Output: `{ status, units_provided, alternative? }`  

- **POST /distribute/emergency**  
  → Request blood in emergency.  
  - Always tries O-.  
  - Output: `{ status, units_provided }`.  

- **GET /inventory**  
  → Returns current stock levels for all blood types.  

---

## 🗄️ Database (MongoDB)

### Collections & Schemas

#### `donors`
```json
{
  "donor_id": "123456789",
  "full_name": "John Doe",
  "blood_type": "A+",
  "donation_date": "2025-09-21"
}
```

#### `inventory`
```json
{
  "blood_type": "A+",
  "units": 42
}
```

#### `transactions`
```json
{
  "transaction_type": "routine",
  "blood_type": "A+",
  "units": 3,
  "timestamp": "2025-09-21T14:00:00Z"
}
```

---

## 🧪 Testing Strategy
1. Unit tests for backend logic (FastAPI + Pytest).  
2. Integration tests for API calls (Postman/Insomnia).  
3. Manual frontend testing (React forms + API).  
4. Edge cases:  
   - Request more units than available.  
   - Emergency with no O- stock.  
   - Invalid blood type input.  

---

## 🚀 Milestones
1. **Setup Phase**
   - Initialize React project.  
   - Setup FastAPI backend with MongoDB connection.  

2. **Backend Development**
   - Implement `/donations` endpoint.  
   - Implement `/distribute/routine` with compatibility logic.  
   - Implement `/distribute/emergency`.  
   - Implement `/inventory`.  

3. **Frontend Development**
   - Create Donation Intake form.  
   - Create Routine Distribution form with alternative recommendations.  
   - Create Emergency Distribution page.  
   - Create Dashboard with inventory view.  

4. **Integration**
   - Connect React forms to FastAPI endpoints.  
   - Verify real-time updates to MongoDB.  

5. **Testing & Finalization**
   - Write unit/integration tests.  
   - Edge case validation.  
   - Polish UI for usability.  

