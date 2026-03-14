import random

# Temporarily disabled CLIP model to allow fast backend startup for deployment
# from transformers import CLIPProcessor, CLIPModel
# from PIL import Image
#
# model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
# processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

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
    # Dummy classification for rapid deployment
    return random.choice(labels)

def get_severity(issue):
    high = ["flooded road", "tree"]
    medium = ["pothole", "water leakage", "garbage"]
    low = ["broken streetlight", "abandoned vehicle", "abandoned building", "graffiti"]

    if issue in high:
        return "high"
    elif issue in medium:
        return "medium"
    else:
        return "low"
