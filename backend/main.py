from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
import uvicorn
import uuid
import os
import json
from datetime import datetime, timedelta
from collections import Counter
from backend.clip_model import classify_image, get_severity
import matplotlib.pyplot as plt
from io import BytesIO
import base64

app = FastAPI()

# -------------------------------
# CORS CONFIGURATION
# -------------------------------

origins = [
    "http://localhost:5173",
    "https://civicvoice-frontend-three.vercel.app",
    "https://civicvoice-frontend-git-akshathaloc-akshathar2606s-projects.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------
# ROOT ENDPOINT
# -------------------------------

@app.get("/")
def home():
    return {"message": "CivicVoice API is running"}

# -------------------------------
# CONFIG
# -------------------------------

CATEGORY_DEADLINES = {
    "tree": 4,
    "garbage": 2,
    "graffiti": 7,
    "pothole": 5,
    "abandoned_vehicle": 7,
    "abandoned_building": 14,
    "broken_streetlight": 5,
    "water leakage": 4,
    "flooded_road": 10
}

UPLOAD_FOLDER = "uploads"
DATA_FILE = "complaints.json"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

if not os.path.exists(DATA_FILE):
    with open(DATA_FILE, "w") as f:
        json.dump([], f)

# -------------------------------
# FILE HELPERS
# -------------------------------

def load_complaints():
    with open(DATA_FILE, "r") as f:
        return json.load(f)

def save_complaints(data):
    with open(DATA_FILE, "w") as f:
        json.dump(data, f, indent=2)

# ------------------------------------------------
# SUBMIT COMPLAINT
# ------------------------------------------------

@app.post("/submit-complaint")
async def submit_complaint(
    category: str = Form("unknown"),
    description: str = Form(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    severity: str = Form("medium"),
    image: Optional[UploadFile] = File(None)
):

    complaints = load_complaints()

    complaint_id = f"CBR-{uuid.uuid4().hex[:4].upper()}"

    image_path = None

    if image and image.filename:

        ext = os.path.splitext(image.filename)[1]
        image_path = f"{UPLOAD_FOLDER}/{complaint_id}{ext}"

        with open(image_path, "wb") as f:
            f.write(await image.read())

        category = classify_image(image_path)
        severity = get_severity(category)

    deadline_days = CATEGORY_DEADLINES.get(category, 5)

    deadline_date = (
        datetime.now() + timedelta(days=deadline_days)
    ).strftime("%Y-%m-%d")

    complaint = {
        "complaint_id": complaint_id,
        "category": category,
        "description": description,
        "latitude": latitude,
        "longitude": longitude,
        "severity": severity,
        "status": "Pending",
        "image": image_path,
        "created_at": datetime.now().strftime("%Y-%m-%d"),
        "created_time": datetime.now().strftime("%H:%M:%S"),
        "timestamp": datetime.now().isoformat(),
        "deadline": deadline_date
    }

    complaints.append(complaint)
    save_complaints(complaints)

    return {
        "success": True,
        "complaint_id": complaint_id,
        "category": category,
        "severity": severity
    }

# ------------------------------------------------
# GET COMPLAINTS
# ------------------------------------------------

@app.get("/complaints")
def get_complaints():

    complaints = load_complaints()

    complaints.sort(
        key=lambda x: x["created_at"],
        reverse=True
    )

    return complaints

# ------------------------------------------------
# ANALYTICS
# ------------------------------------------------

@app.get("/analytics")
def analytics():

    complaints = load_complaints()

    total = len(complaints)
    today = datetime.now().strftime("%Y-%m-%d")

    today_count = sum(1 for c in complaints if c.get("created_at") == today)
    high_severity = sum(1 for c in complaints if c.get("severity") == "high")

    category_counts = Counter(c.get("category", "unknown") for c in complaints)
    severity_counts = Counter(c.get("severity", "medium") for c in complaints)
    daily_counts = Counter(c.get("created_at", "unknown") for c in complaints)

    location_counts = {}

    for c in complaints:
        key = f"{round(c['latitude'],3)},{round(c['longitude'],3)}"
        location_counts[key] = location_counts.get(key, 0) + 1

    hotspots = sorted(location_counts.items(), key=lambda x: x[1], reverse=True)[:5]

    hotspots = [
        {"location": loc, "count": count}
        for loc, count in hotspots
    ]

    # Chart 1: Trend

    fig1, ax1 = plt.subplots()

    ax1.plot(list(daily_counts.keys()), list(daily_counts.values()), marker="o")
    ax1.set_title("Complaint Trend")

    plt.xticks(rotation=45)

    buf1 = BytesIO()
    plt.tight_layout()
    plt.savefig(buf1, format="png")

    buf1.seek(0)

    trend_chart = base64.b64encode(buf1.read()).decode("utf-8")
    plt.close()

    # Chart 2: Category pie

    fig2, ax2 = plt.subplots()

    ax2.pie(
        category_counts.values(),
        labels=category_counts.keys(),
        autopct="%1.0f%%"
    )

    ax2.set_title("Category Distribution")

    buf2 = BytesIO()
    plt.savefig(buf2, format="png")

    buf2.seek(0)

    category_chart = base64.b64encode(buf2.read()).decode("utf-8")

    plt.close()

    return {
        "total": total,
        "today": today_count,
        "high_severity": high_severity,
        "category_counts": category_counts,
        "severity_counts": severity_counts,
        "daily_counts": daily_counts,
        "hotspots": hotspots,
        "trend_chart": trend_chart,
        "category_chart": category_chart
    }

# ------------------------------------------------
# TRACK COMPLAINT
# ------------------------------------------------

@app.get("/track/{complaint_id}")
def track_complaint(complaint_id: str):

    complaints = load_complaints()

    for c in complaints:

        if c["complaint_id"] == complaint_id:

            deadline = datetime.strptime(c["deadline"], "%Y-%m-%d")
            today = datetime.today()

            days_left = (deadline - today).days

            return {
                "complaint_id": c["complaint_id"],
                "category": c["category"],
                "status": c["status"],
                "created_at": c["created_at"],
                "deadline": c["deadline"],
                "days_left": days_left,
                "description": c["description"]
            }

    return {"error": "Complaint not found"}

# ------------------------------------------------
# RUN SERVER
# ------------------------------------------------

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)