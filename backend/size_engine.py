"""Size recommendation engine - matches body dimensions to garment specs."""

from printful_service import SIZE_SPECS

def recommend_size(dimensions: dict, category: str) -> dict:
    """Given user body dimensions and product category, recommend best size."""
    if category not in SIZE_SPECS:
        category = "tops"
    
    specs = SIZE_SPECS.get(category, SIZE_SPECS["tops"])
    best_size = "M"
    best_score = float('inf')
    size_breakdown = {}

    for size, measurements in specs.items():
        score = 0
        breakdown = {}

        if category == "tops":
            chest = dimensions.get("chest_circumference", 96)
            diff = abs(measurements["chest"] - chest)
            ease = measurements["chest"] - chest
            score += diff * 2
            breakdown["chest"] = {
                "garment": measurements["chest"],
                "body": chest,
                "ease": round(ease, 1),
                "fit": "perfect" if 4 <= ease <= 10 else ("tight" if ease < 4 else "loose")
            }
            shoulder = dimensions.get("shoulder_width", 44)
            diff_s = abs(measurements["shoulder"] - shoulder)
            score += diff_s * 1.5
            breakdown["shoulder"] = {
                "garment": measurements["shoulder"],
                "body": shoulder,
                "diff": round(measurements["shoulder"] - shoulder, 1)
            }
            arm = dimensions.get("arm_length", 63)
            diff_a = abs(measurements["sleeve"] - arm)
            score += diff_a
            breakdown["sleeve"] = {
                "garment": measurements["sleeve"],
                "body": arm,
                "diff": round(measurements["sleeve"] - arm, 1)
            }

        elif category == "bottoms":
            waist = dimensions.get("waist_circumference", 76)
            diff_w = abs(measurements["waist"] - waist)
            ease_w = measurements["waist"] - waist
            score += diff_w * 2
            breakdown["waist"] = {
                "garment": measurements["waist"],
                "body": waist,
                "ease": round(ease_w, 1),
                "fit": "perfect" if 2 <= ease_w <= 6 else ("tight" if ease_w < 2 else "loose")
            }
            hip = dimensions.get("hip_circumference", 96)
            diff_h = abs(measurements["hip"] - hip)
            score += diff_h * 1.5
            breakdown["hip"] = {
                "garment": measurements["hip"],
                "body": hip,
                "diff": round(measurements["hip"] - hip, 1)
            }
            inseam = dimensions.get("inseam", 80)
            diff_i = abs(measurements["inseam"] - inseam)
            score += diff_i
            breakdown["inseam"] = {
                "garment": measurements["inseam"],
                "body": inseam,
                "diff": round(measurements["inseam"] - inseam, 1)
            }

        elif category == "outerwear":
            chest = dimensions.get("chest_circumference", 96)
            ease = measurements["chest"] - chest
            score += abs(ease - 6) * 2
            breakdown["chest"] = {
                "garment": measurements["chest"],
                "body": chest,
                "ease": round(ease, 1),
                "fit": "perfect" if 6 <= ease <= 14 else ("tight" if ease < 6 else "loose")
            }
            shoulder = dimensions.get("shoulder_width", 44)
            diff_s = abs(measurements["shoulder"] - shoulder)
            score += diff_s * 1.5
            breakdown["shoulder"] = {
                "garment": measurements["shoulder"],
                "body": shoulder,
                "diff": round(measurements["shoulder"] - shoulder, 1)
            }

        size_breakdown[size] = {"score": round(score, 2), "breakdown": breakdown}
        if score < best_score:
            best_score = score
            best_size = size

    confidence = max(0, min(100, int(100 - best_score * 2)))
    
    return {
        "recommended_size": best_size,
        "confidence": confidence,
        "size_breakdown": size_breakdown,
        "all_sizes": list(specs.keys())
    }
