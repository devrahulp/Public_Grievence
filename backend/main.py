from fastapi import FastAPI,UploadFile,File,Form
from fastapi.middleware.cors import CORSMiddleware
import uuid
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

complaints = []

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER,exist_ok=True)


@app.post("/submit-complaint")
async def submit_complaint(
    category: str = Form(...),
    description: str = Form(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    image: UploadFile = File(...)
):

    complaint_id = str(uuid.uuid4())[:8]

    filepath = f"{UPLOAD_FOLDER}/{complaint_id}_{image.filename}"

    with open(filepath,"wb") as f:
        f.write(await image.read())

    complaint = {
    "complaint_id": complaint_id,
    "category": category,
    "description": description,
    "latitude": latitude,
    "longitude": longitude,
    "image": filepath,
    "status": "Pending"
}

    complaints.append(complaint)

    return {"complaint_id":complaint_id}


@app.get("/complaints")
def get_complaints():
    return complaints