🌆 CivicVoice – AI-Powered Public Grievance Intelligence Platform

CivicVoice is an **AI-assisted civic issue reporting and intelligence platform** that enables citizens to report infrastructure issues and helps authorities **prioritize, analyze, and resolve complaints efficiently**.

The platform combines **image-based classification, geospatial mapping, analytics dashboards, and real-time complaint tracking** to create a **data-driven civic governance system**.

🚀 Problem Statement

Cities receive thousands of complaints regarding infrastructure issues such as:

* Potholes
* Garbage accumulation
* Graffiti vandalism
* Fallen tree debris
* Abandoned vehicles
* Abandoned buildings

Most current systems suffer from:

* ❌ Manual categorization
* ❌ Poor prioritization
* ❌ Lack of geographic visualization
* ❌ Slow response times

CivicVoice addresses these challenges by providing **AI-driven complaint classification and analytics-based prioritization**.

---

# 💡 Solution

CivicVoice enables:

1. **Citizen Complaint Submission**
2. **AI Classification of Issue Type**
3. **Automatic Timestamp & Deadline Assignment**
4. **Geolocation-Based Complaint Mapping**
5. **Administrative Analytics Dashboard**
6. **Complaint Prioritization & Tracking**

This helps authorities **identify hotspots, allocate resources, and resolve issues faster**.

---

# 🧠 AI Capabilities

The system integrates an **image classification model** to automatically identify complaint categories.

Example classifications:

| Input Image     | Detected Issue |
| --------------- | -------------- |
| Road image      | Pothole        |
| Street waste    | Garbage        |
| Wall vandalism  | Graffiti       |
| Fallen branches | Tree debris    |

The AI model assists administrators by **reducing manual verification time**.

---

# 🗺️ Key Features

### 📍 Geospatial Complaint Mapping

* Interactive map displaying complaint locations
* Visual clustering of civic issues
* Enables hotspot detection

### 📊 Data Analytics Dashboard

Admin dashboard provides:

* Total complaints
* Daily complaint statistics
* Category distribution
* Issue hotspots

### 🗂 Complaint Management

Each complaint includes:

* Unique complaint ID
* Category
* Description
* GPS location
* Timestamp
* Status
* Deadline for resolution

### 🔍 Smart Filtering

Filter complaints by category:

* Potholes
* Garbage
* Graffiti
* Tree debris
* Abandoned vehicles
* Abandoned buildings

---

# 🏗️ System Architecture

```
Citizen Upload
      │
      ▼
AI Image Classification (CLIP Model)
      │
      ▼
FastAPI Backend
      │
      ▼
JSON Complaint Storage
      │
      ▼
React Admin Dashboard
      │
 ┌────┴─────────────┐
 ▼                  ▼
Analytics Panel     Complaint Map
```

---

# 🛠️ Tech Stack

## Frontend

* React
* React Hooks
* Chart.js
* Leaflet Maps
* CSS

## Backend

* FastAPI
* Python
* Uvicorn

## AI / ML

* CLIP Image Classification Model

## Data

* JSON-based complaint storage

---

# 📊 Example Complaint Data

```json
{
  "complaint_id": "CBR-1001",
  "email": "doodle.1eldood@gmail.com",
  "category": "pothole",
  "description": "Large pothole causing traffic slowdown",
  "latitude": 12.9716,
  "longitude": 77.5946,
  "status": "Pending",
  "created_at": "2026-03-14",
  "created_time": "08:40:48",
  "deadline": "2026-03-19"
}
```

---

# ⚙️ Installation

## 1️⃣ Clone the repository

```
git clone https://github.com/your-repo/civicpulse.git
cd civicpulse
```

---

## 2️⃣ Backend Setup

```
cd backend
pip install -r requirements.txt
```

Run server:

```
uvicorn main:app --reload
```

Backend runs on:

```
http://127.0.0.1:8000
```

---

## 3️⃣ Frontend Setup

```
cd frontend
npm install
npm run dev
```

Frontend runs on:

```
http://localhost:5173
```

---

# 📊 API Endpoints

### Get All Complaints

```
GET /complaints
```

### Get Analytics

```
GET /analytics
```

### Upload Complaint

```
POST /complaint
```

 🗺️ Bangalore Dataset

The project includes **realistic complaint datasets from Bangalore** to simulate urban infrastructure issues.

Example areas:

* Whitefield
* Electronic City
* BTM
* Indiranagar
* Koramangala

This enables **realistic geospatial analytics and heatmaps**.

 📷 Admin Dashboard

Features include:

* Complaint heatmap
* Category filtering
* Data analytics charts
* Complaint table with timestamps

🎯 Impact

CivicPulse can help cities:

* Identify **infrastructure issue hotspots**
* Improve **municipal response times**
* Enable **data-driven urban planning**
* Increase **citizen engagement**



🔮 Future Improvements

* Mobile application for citizens
* Automated complaint prioritization using ML
* Real-time municipal notifications
* Government department integration
* Predictive infrastructure maintenance


 👨‍💻 Team

Developed for an **AI-based societal solutions hackathon**.

Team members worked on:

* AI model integration
* Backend API development
* Data visualization dashboards
* Geospatial complaint mapping


# ⭐ Support

If you find this project useful, consider **starring the repository**.
