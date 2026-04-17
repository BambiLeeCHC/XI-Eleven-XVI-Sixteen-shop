import os
import base64
import logging
import json
from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent

logger = logging.getLogger(__name__)

def get_api_key():
    return os.environ.get("EMERGENT_LLM_KEY")

async def analyze_body_dimensions_openai(image_base64: str, height_cm: float, weight_kg: float) -> dict:
    """Use OpenAI GPT-5.2 Vision to extract body dimensions from photo."""
    chat = LlmChat(
        api_key=get_api_key(),
        session_id=f"body-scan-openai-{os.urandom(4).hex()}",
        system_message="""You are an expert body measurement AI. Analyze the full-length photo and estimate body dimensions.
Given the person's height and weight, use proportional analysis to estimate measurements.
Return ONLY valid JSON with these fields (all in cm):
{
  "shoulder_width": number,
  "chest_circumference": number,
  "waist_circumference": number,
  "hip_circumference": number,
  "arm_length": number,
  "inseam": number,
  "torso_length": number,
  "neck_circumference": number,
  "thigh_circumference": number,
  "body_type": "slim|average|athletic|plus"
}"""
    ).with_model("openai", "gpt-5.2")

    image_content = ImageContent(image_base64=image_base64)
    msg = UserMessage(
        text=f"Analyze this full-length photo. Person's height: {height_cm}cm, weight: {weight_kg}kg. Extract body dimensions as JSON.",
        file_contents=[image_content]
    )
    response = await chat.send_message(msg)
    try:
        cleaned = response.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1].rsplit("```", 1)[0]
        return json.loads(cleaned)
    except json.JSONDecodeError:
        logger.error(f"OpenAI response parse error: {response}")
        return {}

async def analyze_body_dimensions_gemini(image_base64: str, height_cm: float, weight_kg: float) -> dict:
    """Use Gemini 3 Pro Vision for additional body analysis."""
    chat = LlmChat(
        api_key=get_api_key(),
        session_id=f"body-scan-gemini-{os.urandom(4).hex()}",
        system_message="""You are a precise body measurement analyst. Analyze the full-length photo to estimate body proportions.
Given height and weight, calculate proportional measurements.
Return ONLY valid JSON:
{
  "shoulder_width": number,
  "chest_circumference": number,
  "waist_circumference": number,
  "hip_circumference": number,
  "arm_length": number,
  "inseam": number,
  "torso_length": number,
  "neck_circumference": number,
  "thigh_circumference": number,
  "body_type": "slim|average|athletic|plus",
  "posture": "good|fair|poor",
  "proportions_note": "string"
}"""
    ).with_model("gemini", "gemini-2.5-flash")

    image_content = ImageContent(image_base64=image_base64)
    msg = UserMessage(
        text=f"Analyze this person's full-length photo. Height: {height_cm}cm, Weight: {weight_kg}kg. Return body dimensions JSON.",
        file_contents=[image_content]
    )
    response = await chat.send_message(msg)
    try:
        cleaned = response.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1].rsplit("```", 1)[0]
        return json.loads(cleaned)
    except json.JSONDecodeError:
        logger.error(f"Gemini response parse error: {response}")
        return {}

def merge_dimensions(openai_dims: dict, gemini_dims: dict) -> dict:
    """Merge results from both models, averaging numeric values for accuracy."""
    merged = {}
    numeric_keys = [
        "shoulder_width", "chest_circumference", "waist_circumference",
        "hip_circumference", "arm_length", "inseam", "torso_length",
        "neck_circumference", "thigh_circumference"
    ]
    for key in numeric_keys:
        vals = []
        if key in openai_dims and isinstance(openai_dims[key], (int, float)):
            vals.append(openai_dims[key])
        if key in gemini_dims and isinstance(gemini_dims[key], (int, float)):
            vals.append(gemini_dims[key])
        if vals:
            merged[key] = round(sum(vals) / len(vals), 1)
    merged["body_type"] = openai_dims.get("body_type") or gemini_dims.get("body_type", "average")
    merged["posture"] = gemini_dims.get("posture", "good")
    merged["proportions_note"] = gemini_dims.get("proportions_note", "")
    return merged

async def generate_virtual_twin(image_base64: str, dimensions: dict) -> str:
    """Use OpenAI to create a clean virtual twin description/analysis for the avatar."""
    chat = LlmChat(
        api_key=get_api_key(),
        session_id=f"vtwin-{os.urandom(4).hex()}",
        system_message="""You create detailed virtual twin descriptions for fashion try-on.
Analyze the photo and body dimensions to create a precise body profile description.
Return JSON with:
{
  "body_profile": "detailed description of body shape, proportions",
  "skin_tone": "description",
  "build": "slim/average/athletic/muscular/plus",
  "fit_preferences": "recommended fit types"
}"""
    ).with_model("openai", "gpt-5.2")

    image_content = ImageContent(image_base64=image_base64)
    msg = UserMessage(
        text=f"Create virtual twin profile from this photo. Dimensions: {json.dumps(dimensions)}",
        file_contents=[image_content]
    )
    response = await chat.send_message(msg)
    try:
        cleaned = response.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1].rsplit("```", 1)[0]
        return json.loads(cleaned)
    except json.JSONDecodeError:
        return {"body_profile": response, "skin_tone": "n/a", "build": dimensions.get("body_type", "average"), "fit_preferences": "regular"}

async def generate_tryon_visualization(user_image_base64: str, product_name: str, product_image_url: str, dimensions: dict) -> str:
    """Use AI to describe how a garment would look on the user's body."""
    chat = LlmChat(
        api_key=get_api_key(),
        session_id=f"tryon-{os.urandom(4).hex()}",
        system_message="""You are a virtual fashion stylist AI. Given a person's photo and body dimensions along with a clothing item,
provide a detailed analysis of how the garment will fit.
Return JSON:
{
  "fit_analysis": "how the garment fits on this body type",
  "size_notes": "specific notes about size areas",
  "style_rating": 1-10,
  "adjustments_needed": "any alterations recommended",
  "overall_look": "description of how it would look"
}"""
    ).with_model("openai", "gpt-5.2")

    image_content = ImageContent(image_base64=user_image_base64)
    msg = UserMessage(
        text=f"Analyze how '{product_name}' would fit on this person. Body dimensions: {json.dumps(dimensions)}. Product image: {product_image_url}",
        file_contents=[image_content]
    )
    response = await chat.send_message(msg)
    try:
        cleaned = response.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1].rsplit("```", 1)[0]
        return json.loads(cleaned)
    except json.JSONDecodeError:
        return {"fit_analysis": response, "size_notes": "", "style_rating": 7, "adjustments_needed": "none", "overall_look": response}
