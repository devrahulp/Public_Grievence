from transformers import CLIPProcessor, CLIPModel
from PIL import Image

model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

labels = [
"pothole",
"garbage",
"broken streetlight",
"water leakage",
"flooded road",
"tree",
"abandoned vehicle",
"abandoned building",
"graffiti",
]

def classify_image(image_path):

    image = Image.open(image_path)

    inputs = processor(
        text=labels,
        images=image,
        return_tensors="pt",
        padding=True
    )

    outputs = model(**inputs)

    logits = outputs.logits_per_image
    probs = logits.softmax(dim=1)

    index = probs.argmax().item()

    return labels[index]


def get_severity(issue):

    high = ["flooded road", "tree"]
    medium = ["pothole", "water leakage", "garbage"]
    low=["broken streetlight", "abandoned vehicle", "abandoned building", "graffiti"]

    if issue in high:
        return "high"
    elif issue in medium:
        return "medium"
    else:
        return "low"