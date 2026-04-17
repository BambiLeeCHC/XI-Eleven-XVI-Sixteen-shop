import aiohttp
import logging

logger = logging.getLogger(__name__)
PRINTFUL_API_V2 = "https://api.printful.com/v2"
PRINTFUL_API_V1 = "https://api.printful.com"

async def get_printful_headers(db):
    """Get Printful API key from admin settings in DB."""
    settings = await db.settings.find_one({"key": "printful_api_key"}, {"_id": 0})
    if not settings or not settings.get("value"):
        return None
    return {"Authorization": f"Bearer {settings['value']}"}

async def fetch_catalog_products(db, category_id=None, limit=20, offset=0):
    """Fetch products from Printful catalog."""
    headers = await get_printful_headers(db)
    if not headers:
        return {"error": "Printful API key not configured"}
    try:
        params = {"limit": limit, "offset": offset}
        if category_id:
            params["category_id"] = category_id
        async with aiohttp.ClientSession() as session:
            async with session.get(f"{PRINTFUL_API_V1}/products", headers=headers, params=params) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    return data
                else:
                    text = await resp.text()
                    logger.error(f"Printful catalog error {resp.status}: {text}")
                    return {"error": f"Printful API error: {resp.status}"}
    except Exception as e:
        logger.error(f"Printful fetch error: {e}")
        return {"error": str(e)}

async def fetch_product_details(db, product_id: int):
    """Fetch specific product details including variants and sizing."""
    headers = await get_printful_headers(db)
    if not headers:
        return {"error": "Printful API key not configured"}
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(f"{PRINTFUL_API_V1}/products/{product_id}", headers=headers) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    return data
                else:
                    text = await resp.text()
                    return {"error": f"Printful API error: {resp.status}"}
    except Exception as e:
        return {"error": str(e)}

async def fetch_store_products(db, limit=20, offset=0):
    """Fetch synced store products."""
    headers = await get_printful_headers(db)
    if not headers:
        return {"error": "Printful API key not configured"}
    try:
        params = {"limit": limit, "offset": offset}
        async with aiohttp.ClientSession() as session:
            async with session.get(f"{PRINTFUL_API_V1}/store/products", headers=headers, params=params) as resp:
                if resp.status == 200:
                    return await resp.json()
                else:
                    text = await resp.text()
                    return {"error": f"Printful API error: {resp.status}"}
    except Exception as e:
        return {"error": str(e)}

async def fetch_store_product_detail(db, sync_product_id: int):
    """Fetch details of a synced store product."""
    headers = await get_printful_headers(db)
    if not headers:
        return {"error": "Printful API key not configured"}
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(f"{PRINTFUL_API_V1}/store/products/{sync_product_id}", headers=headers) as resp:
                if resp.status == 200:
                    return await resp.json()
                else:
                    return {"error": f"Printful API error: {resp.status}"}
    except Exception as e:
        return {"error": str(e)}

async def sync_products_to_db(db):
    """Sync all Printful store products into local MongoDB for fast access."""
    headers = await get_printful_headers(db)
    if not headers:
        return {"error": "Printful API key not configured", "synced": 0}
    try:
        all_products = []
        offset = 0
        limit = 100
        async with aiohttp.ClientSession() as session:
            while True:
                async with session.get(
                    f"{PRINTFUL_API_V1}/store/products",
                    headers=headers,
                    params={"limit": limit, "offset": offset}
                ) as resp:
                    if resp.status != 200:
                        break
                    data = await resp.json()
                    results = data.get("result", [])
                    if not results:
                        break
                    all_products.extend(results)
                    offset += limit
                    if len(results) < limit:
                        break

        synced = 0
        for product in all_products:
            sync_id = product.get("id")
            # Fetch full details for each product
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{PRINTFUL_API_V1}/store/products/{sync_id}",
                    headers=headers
                ) as resp:
                    if resp.status == 200:
                        detail = await resp.json()
                        result = detail.get("result", {})
                        sync_product = result.get("sync_product", {})
                        sync_variants = result.get("sync_variants", [])

                        doc = {
                            "printful_id": sync_id,
                            "name": sync_product.get("name", ""),
                            "thumbnail_url": sync_product.get("thumbnail_url", ""),
                            "is_ignored": sync_product.get("is_ignored", False),
                            "variants": [],
                            "category": categorize_product(sync_product.get("name", "")),
                            "synced": True,
                            "active": True
                        }

                        for v in sync_variants:
                            variant_doc = {
                                "variant_id": v.get("id"),
                                "name": v.get("name", ""),
                                "sku": v.get("sku", ""),
                                "retail_price": v.get("retail_price"),
                                "currency": v.get("currency", "USD"),
                                "product_id": v.get("product", {}).get("product_id"),
                                "variant_id_printful": v.get("product", {}).get("variant_id"),
                                "image": v.get("files", [{}])[0].get("preview_url", "") if v.get("files") else "",
                                "size": extract_size(v.get("name", "")),
                                "color": extract_color(v.get("name", ""))
                            }
                            doc["variants"].append(variant_doc)

                        await db.products.update_one(
                            {"printful_id": sync_id},
                            {"$set": doc},
                            upsert=True
                        )
                        synced += 1

        return {"synced": synced, "total_found": len(all_products)}
    except Exception as e:
        logger.error(f"Sync error: {e}")
        return {"error": str(e), "synced": 0}

def categorize_product(name: str) -> str:
    name_lower = name.lower()
    if any(w in name_lower for w in ["shirt", "tee", "t-shirt", "top", "polo", "henley"]):
        return "tops"
    elif any(w in name_lower for w in ["pant", "jean", "trouser", "short", "jogger"]):
        return "bottoms"
    elif any(w in name_lower for w in ["jacket", "hoodie", "coat", "sweater", "cardigan"]):
        return "outerwear"
    elif any(w in name_lower for w in ["hat", "cap", "beanie", "bag", "sock", "accessory"]):
        return "accessories"
    elif any(w in name_lower for w in ["dress", "skirt"]):
        return "dresses"
    return "other"

def extract_size(variant_name: str) -> str:
    sizes = ["XXS", "XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"]
    parts = variant_name.split("/")
    for part in parts:
        clean = part.strip().upper()
        if clean in sizes:
            return clean
    return ""

def extract_color(variant_name: str) -> str:
    parts = variant_name.split("/")
    if parts:
        return parts[0].strip()
    return ""

# Size specifications for common garment types (in cm)
SIZE_SPECS = {
    "tops": {
        "XS": {"chest": 86, "length": 66, "shoulder": 40, "sleeve": 59},
        "S": {"chest": 91, "length": 69, "shoulder": 42, "sleeve": 61},
        "M": {"chest": 96, "length": 72, "shoulder": 44, "sleeve": 63},
        "L": {"chest": 102, "length": 74, "shoulder": 47, "sleeve": 65},
        "XL": {"chest": 107, "length": 76, "shoulder": 49, "sleeve": 67},
        "2XL": {"chest": 112, "length": 78, "shoulder": 52, "sleeve": 69},
        "3XL": {"chest": 119, "length": 80, "shoulder": 54, "sleeve": 71},
    },
    "bottoms": {
        "XS": {"waist": 66, "hip": 86, "inseam": 76, "length": 99},
        "S": {"waist": 71, "hip": 91, "inseam": 78, "length": 101},
        "M": {"waist": 76, "hip": 96, "inseam": 80, "length": 103},
        "L": {"waist": 81, "hip": 102, "inseam": 81, "length": 105},
        "XL": {"waist": 86, "hip": 107, "inseam": 82, "length": 107},
        "2XL": {"waist": 91, "hip": 112, "inseam": 83, "length": 109},
        "3XL": {"waist": 97, "hip": 119, "inseam": 84, "length": 111},
    },
    "outerwear": {
        "XS": {"chest": 91, "length": 63, "shoulder": 42, "sleeve": 61},
        "S": {"chest": 96, "length": 66, "shoulder": 44, "sleeve": 63},
        "M": {"chest": 102, "length": 69, "shoulder": 47, "sleeve": 65},
        "L": {"chest": 107, "length": 72, "shoulder": 49, "sleeve": 67},
        "XL": {"chest": 112, "length": 74, "shoulder": 52, "sleeve": 69},
        "2XL": {"chest": 119, "length": 76, "shoulder": 54, "sleeve": 71},
        "3XL": {"chest": 124, "length": 78, "shoulder": 57, "sleeve": 73},
    }
}
