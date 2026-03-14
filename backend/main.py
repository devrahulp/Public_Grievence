from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
import uvicorn
import uuid
import os
import json
from datetime import datetime
from collections import Counter
from clip_model import classify_image, get_severity
import matplotlib.pyplot as plt
from io import BytesIO
import base64
from datetime import timedelta

app = FastAPI()
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

# -------------------------------
# CORS
# -------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_FOLDER = "uploads"
DATA_FILE = "complaints.json"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

if not os.path.exists(DATA_FILE):
    with open(DATA_FILE, "w") as f:
        json.dump([], f)


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

        # AI classification
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

    today_count = sum(1 for c in complaints if c["created_at"] == today)

    high_severity = sum(1 for c in complaints if c["severity"] == "high")

    category_counts = Counter(c["category"] for c in complaints)

    severity_counts = Counter(c["severity"] for c in complaints)

    daily_counts = Counter(c["created_at"] for c in complaints)

    # ---------- hotspot detection ----------

    location_counts = {}

    for c in complaints:

        key = f"{round(c['latitude'],3)},{round(c['longitude'],3)}"

        location_counts[key] = location_counts.get(key,0) + 1

    hotspots = sorted(location_counts.items(), key=lambda x:x[1], reverse=True)[:5]

    hotspots = [
        {"location":loc,"count":count}
        for loc,count in hotspots
    ]

    # ---------- Chart 1: trend ----------

    fig1, ax1 = plt.subplots()

    ax1.plot(list(daily_counts.keys()), list(daily_counts.values()), marker="o")

    ax1.set_title("Complaint Trend")

    ax1.set_xlabel("Date")

    ax1.set_ylabel("Complaints")

    plt.xticks(rotation=45)

    buf1 = BytesIO()

    plt.tight_layout()

    plt.savefig(buf1, format="png")

    buf1.seek(0)

    trend_chart = base64.b64encode(buf1.read()).decode("utf-8")

    plt.close()

    # ---------- Chart 2: category pie ----------

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


@app.get("/")
def root():
    return {"status": "API running"}


from datetime import datetime

def compute_priority(complaint, all_complaints):

    score = 0

    # 1️⃣ Severity weight
    severity = complaint.get("severity_score",0)

    score += severity * 50


    # 2️⃣ Waiting time weight
    created = datetime.strptime(complaint["created_at"], "%Y-%m-%d")

    days_waiting = (datetime.now() - created).days

    score += days_waiting * 5


    # 3️⃣ Deadline urgency
    deadline = datetime.strptime(complaint["deadline"], "%Y-%m-%d")

    days_left = (deadline - datetime.now()).days

    if days_left <= 1:
        score += 25
    elif days_left <= 3:
        score += 10


    # 4️⃣ Nearby complaints (hotspot detection)

    lat = complaint["latitude"]
    lon = complaint["longitude"]

    nearby = 0

    for c in all_complaints:

        if abs(c["latitude"]-lat) < 0.01 and abs(c["longitude"]-lon) < 0.01:
            nearby += 1

    score += nearby * 3

    return round(score,2)

@app.get("/track/{complaint_id}")
def track_complaint(complaint_id: str):

    with open("complaints.json") as f:
        complaints = json.load(f)

    for c in complaints:

        if c["complaint_id"] == complaint_id:

            from datetime import datetime

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

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)