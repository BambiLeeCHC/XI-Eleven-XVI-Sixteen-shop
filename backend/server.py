from dotenv import load_dotenv
from pathlib import Path
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from fastapi import FastAPI, APIRouter, Request, HTTPException, UploadFile, File, Form, Response, Query
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import uuid
import base64
from datetime import datetime, timezone
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from bson import ObjectId

from auth import (
    hash_password, verify_password, create_access_token,
    create_refresh_token, get_current_user, seed_admin
)
from storage import init_storage, put_object, get_object
from ai_service import (
    analyze_body_dimensions_openai, analyze_body_dimensions_gemini,
    merge_dimensions, generate_virtual_twin, generate_tryon_visualization,
    generate_tryon_image, generate_ad_image
)
from printful_service import (
    fetch_catalog_products, fetch_product_details, fetch_store_products,
    fetch_store_product_detail, sync_products_to_db, SIZE_SPECS
)
from size_engine import recommend_size

from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionResponse, CheckoutStatusResponse, CheckoutSessionRequest

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

# ─── CORS ─────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Pydantic Models ─────────────────────────────────────
class RegisterInput(BaseModel):
    email: str
    password: str
    name: str

class LoginInput(BaseModel):
    email: str
    password: str

class SettingUpdate(BaseModel):
    key: str
    value: str

class AddressInput(BaseModel):
    full_name: str = ""
    address_line1: str = ""
    address_line2: str = ""
    city: str = ""
    state: str = ""
    zip_code: str = ""
    country: str = "US"
    phone: str = ""

class OrderInput(BaseModel):
    product_id: str
    variant_index: int = 0
    quantity: int = 1
    size: str = ""

class CartItemInput(BaseModel):
    product_printful_id: int
    variant_index: int = 0
    size: str = ""
    color: str = ""
    quantity: int = 1

# ─── Startup ─────────────────────────────────────────────
@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await seed_admin(db)
    try:
        init_storage()
    except Exception as e:
        logger.error(f"Storage init error: {e}")
    # Write test credentials
    os.makedirs("/app/memory", exist_ok=True)
    with open("/app/memory/test_credentials.md", "w") as f:
        f.write("# Test Credentials\n\n")
        f.write(f"## Admin\n- Email: {os.environ.get('ADMIN_EMAIL', 'admin@xixvi.com')}\n")
        f.write(f"- Password: {os.environ.get('ADMIN_PASSWORD', 'admin123')}\n- Role: admin\n\n")
        f.write("## Auth Endpoints\n- POST /api/auth/register\n- POST /api/auth/login\n- POST /api/auth/logout\n- GET /api/auth/me\n")

@app.on_event("shutdown")
async def shutdown():
    client.close()

# ─── Health ───────────────────────────────────────────────
@api_router.get("/")
async def root():
    return {"message": "XI XVI API", "status": "ok"}

# ─── Auth Routes ─────────────────────────────────────────
@api_router.post("/auth/register")
async def register(data: RegisterInput, response: Response):
    email = data.email.strip().lower()
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed = hash_password(data.password)
    user_doc = {
        "email": email,
        "password_hash": hashed,
        "name": data.name.strip(),
        "role": "customer",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "measurements": None,
        "virtual_twin": None,
        "photo_path": None,
        "address": None
    }
    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)
    access_token = create_access_token(user_id, email)
    refresh_token = create_refresh_token(user_id)
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=False, samesite="lax", max_age=3600, path="/")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=False, samesite="lax", max_age=604800, path="/")
    return {"id": user_id, "email": email, "name": data.name.strip(), "role": "customer"}

@api_router.post("/auth/login")
async def login(data: LoginInput, response: Response):
    email = data.email.strip().lower()
    user = await db.users.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    user_id = str(user["_id"])
    access_token = create_access_token(user_id, email)
    refresh_token = create_refresh_token(user_id)
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=False, samesite="lax", max_age=3600, path="/")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=False, samesite="lax", max_age=604800, path="/")
    return {
        "id": user_id, "email": email, "name": user.get("name", ""),
        "role": user.get("role", "customer"),
        "measurements": user.get("measurements"),
        "virtual_twin": user.get("virtual_twin"),
        "photo_path": user.get("photo_path")
    }

@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    return {"message": "Logged out"}

@api_router.get("/auth/me")
async def me(request: Request):
    user = await get_current_user(request, db)
    return user

# ─── Profile Routes ──────────────────────────────────────
@api_router.put("/profile/address")
async def update_address(data: AddressInput, request: Request):
    user = await get_current_user(request, db)
    await db.users.update_one(
        {"_id": ObjectId(user["_id"])},
        {"$set": {"address": data.model_dump()}}
    )
    return {"message": "Address updated"}

@api_router.get("/profile")
async def get_profile(request: Request):
    user = await get_current_user(request, db)
    return user

# ─── Body Scan & Virtual Twin ────────────────────────────
@api_router.post("/scan/upload")
async def upload_and_scan(
    request: Request,
    file: UploadFile = File(...),
    height_cm: float = Form(...),
    weight_kg: float = Form(...)
):
    user = await get_current_user(request, db)
    user_id = user["_id"]

    # Read and encode image
    image_data = await file.read()
    image_base64 = base64.b64encode(image_data).decode("utf-8")

    # Upload to object storage
    ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    storage_path = f"xixvi-shop/photos/{user_id}/{uuid.uuid4()}.{ext}"
    try:
        put_object(storage_path, image_data, file.content_type or "image/jpeg")
    except Exception as e:
        logger.error(f"Storage upload error: {e}")

    # Run both AI models
    try:
        openai_dims = await analyze_body_dimensions_openai(image_base64, height_cm, weight_kg)
    except Exception as e:
        logger.error(f"OpenAI scan error: {e}")
        openai_dims = {}

    try:
        gemini_dims = await analyze_body_dimensions_gemini(image_base64, height_cm, weight_kg)
    except Exception as e:
        logger.error(f"Gemini scan error: {e}")
        gemini_dims = {}

    # Merge dimensions
    merged = merge_dimensions(openai_dims, gemini_dims)
    merged["height_cm"] = height_cm
    merged["weight_kg"] = weight_kg

    # Generate virtual twin profile
    try:
        twin_profile = await generate_virtual_twin(image_base64, merged)
    except Exception as e:
        logger.error(f"Virtual twin error: {e}")
        twin_profile = {"body_profile": "Profile pending", "build": merged.get("body_type", "average")}

    # Save to user profile
    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {
            "measurements": merged,
            "virtual_twin": twin_profile,
            "photo_path": storage_path,
            "scan_date": datetime.now(timezone.utc).isoformat()
        }}
    )

    # Store in files collection
    await db.files.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "storage_path": storage_path,
        "original_filename": file.filename,
        "content_type": file.content_type,
        "type": "body_photo",
        "is_deleted": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    })

    return {
        "measurements": merged,
        "virtual_twin": twin_profile,
        "photo_path": storage_path,
        "openai_raw": openai_dims,
        "gemini_raw": gemini_dims
    }

@api_router.get("/files/{path:path}")
async def serve_file(path: str, request: Request, auth: str = Query(None)):
    # Try cookie auth first, then query param
    try:
        user = await get_current_user(request, db)
    except Exception:
        if not auth:
            raise HTTPException(status_code=401, detail="Not authenticated")
        # Minimal auth check via query param
        user = None

    try:
        data, content_type = get_object(path)
        return Response(content=data, media_type=content_type)
    except Exception as e:
        raise HTTPException(status_code=404, detail="File not found")

# ─── Products / Shop ─────────────────────────────────────
@api_router.get("/products")
async def get_products(
    category: Optional[str] = None,
    search: Optional[str] = None,
    page: int = 1,
    limit: int = 20
):
    query = {"active": True}
    if category and category != "all":
        query["category"] = category
    if search:
        query["name"] = {"$regex": search, "$options": "i"}

    skip = (page - 1) * limit
    products = await db.products.find(query, {"_id": 0}).skip(skip).limit(limit).to_list(limit)
    total = await db.products.count_documents(query)
    categories = await db.products.distinct("category", {"active": True})

    return {
        "products": products,
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit if total > 0 else 1,
        "categories": categories
    }

@api_router.get("/products/{printful_id}")
async def get_product(printful_id: int):
    product = await db.products.find_one({"printful_id": printful_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

# ─── Size Recommendation ─────────────────────────────────
@api_router.post("/size-recommend")
async def size_recommendation(request: Request, body: dict):
    user = await get_current_user(request, db)
    measurements = user.get("measurements")
    if not measurements:
        raise HTTPException(status_code=400, detail="No body measurements found. Please complete body scan first.")
    category = body.get("category", "tops")
    result = recommend_size(measurements, category)
    return result

# ─── Virtual Try-On ──────────────────────────────────────
@api_router.post("/tryon")
async def virtual_tryon(request: Request, body: dict):
    user = await get_current_user(request, db)
    if not user.get("photo_path"):
        raise HTTPException(status_code=400, detail="No photo uploaded. Please complete body scan first.")
    measurements = user.get("measurements", {})

    product_name = body.get("product_name", "")
    product_image = body.get("product_image", "")

    # Fetch user photo from storage
    try:
        photo_data, _ = get_object(user["photo_path"])
        photo_base64 = base64.b64encode(photo_data).decode("utf-8")
    except Exception:
        raise HTTPException(status_code=400, detail="Could not retrieve your photo")

    result = await generate_tryon_visualization(photo_base64, product_name, product_image, measurements)
    return result

# ─── Virtual Try-On Image Rendering ──────────────────────
@api_router.post("/tryon/render")
async def virtual_tryon_render(request: Request, body: dict):
    user = await get_current_user(request, db)
    if not user.get("photo_path"):
        raise HTTPException(status_code=400, detail="No photo uploaded. Please complete body scan first.")
    measurements = user.get("measurements", {})
    product_name = body.get("product_name", "")
    product_description = body.get("product_description", product_name)

    # Fetch user photo from storage
    try:
        photo_data, _ = get_object(user["photo_path"])
        photo_base64 = base64.b64encode(photo_data).decode("utf-8")
    except Exception:
        raise HTTPException(status_code=400, detail="Could not retrieve your photo")

    image_b64 = await generate_tryon_image(photo_base64, product_name, product_description, measurements)
    if not image_b64:
        raise HTTPException(status_code=500, detail="Image generation failed")
    return {"image_base64": image_b64}

# ─── Orders ──────────────────────────────────────────────
@api_router.post("/orders")
async def create_order(data: OrderInput, request: Request):
    user = await get_current_user(request, db)
    product = await db.products.find_one({"printful_id": int(data.product_id)}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    variant = product["variants"][data.variant_index] if data.variant_index < len(product.get("variants", [])) else None
    price = float(variant["retail_price"]) if variant and variant.get("retail_price") else 0

    order_doc = {
        "id": str(uuid.uuid4()),
        "user_id": user["_id"],
        "product_printful_id": int(data.product_id),
        "product_name": product.get("name", ""),
        "variant": variant,
        "size": data.size,
        "quantity": data.quantity,
        "total_price": round(price * data.quantity, 2),
        "currency": variant.get("currency", "USD") if variant else "USD",
        "status": "pending",
        "tracking_number": None,
        "shipping_address": user.get("address"),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    await db.orders.insert_one(order_doc)
    order_doc.pop("_id", None)
    return order_doc

@api_router.get("/orders")
async def get_orders(request: Request):
    user = await get_current_user(request, db)
    orders = await db.orders.find(
        {"user_id": user["_id"]},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    return {"orders": orders}

@api_router.get("/orders/{order_id}")
async def get_order(order_id: str, request: Request):
    user = await get_current_user(request, db)
    order = await db.orders.find_one({"id": order_id, "user_id": user["_id"]}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

# ─── Admin Routes ─────────────────────────────────────────
async def require_admin(request: Request):
    user = await get_current_user(request, db)
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

@api_router.get("/admin/settings")
async def get_settings(request: Request):
    await require_admin(request)
    settings = await db.settings.find({}, {"_id": 0}).to_list(100)
    return {"settings": settings}

@api_router.put("/admin/settings")
async def update_setting(data: SettingUpdate, request: Request):
    await require_admin(request)
    await db.settings.update_one(
        {"key": data.key},
        {"$set": {"key": data.key, "value": data.value, "updated_at": datetime.now(timezone.utc).isoformat()}},
        upsert=True
    )
    return {"message": f"Setting '{data.key}' updated"}

@api_router.post("/admin/sync-products")
async def admin_sync_products(request: Request):
    await require_admin(request)
    result = await sync_products_to_db(db)
    return result

@api_router.get("/admin/products")
async def admin_get_products(request: Request, page: int = 1, limit: int = 50):
    await require_admin(request)
    skip = (page - 1) * limit
    products = await db.products.find({}, {"_id": 0}).skip(skip).limit(limit).to_list(limit)
    total = await db.products.count_documents({})
    return {"products": products, "total": total, "page": page}

@api_router.put("/admin/products/{printful_id}")
async def admin_update_product(printful_id: int, body: dict, request: Request):
    await require_admin(request)
    update_fields = {}
    if "active" in body:
        update_fields["active"] = body["active"]
    if "category" in body:
        update_fields["category"] = body["category"]
    if "name" in body:
        update_fields["name"] = body["name"]
    if "description" in body:
        update_fields["description"] = body["description"]
    if "sale_price" in body:
        update_fields["sale_price"] = body["sale_price"]
    if "featured" in body:
        update_fields["featured"] = body["featured"]
    if "ad_images" in body:
        update_fields["ad_images"] = body["ad_images"]
    if update_fields:
        await db.products.update_one({"printful_id": printful_id}, {"$set": update_fields})
    return {"message": "Product updated"}

# ─── Admin AI Ad Generator ────────────────────────────────
@api_router.post("/admin/generate-ad")
async def admin_generate_ad(body: dict, request: Request):
    await require_admin(request)
    product_name = body.get("product_name", "")
    product_description = body.get("product_description", "")
    style_notes = body.get("style_notes", "")
    if not product_name:
        raise HTTPException(status_code=400, detail="Product name required")
    
    image_b64 = await generate_ad_image(product_name, product_description, style_notes)
    if not image_b64:
        raise HTTPException(status_code=500, detail="Ad image generation failed")
    
    # Store the generated ad image in object storage
    image_data = base64.b64decode(image_b64)
    storage_path = f"xixvi-shop/ads/{uuid.uuid4()}.png"
    try:
        result = put_object(storage_path, image_data, "image/png")
        storage_path = result.get("path", storage_path)
    except Exception as e:
        logger.error(f"Ad image storage error: {e}")
    
    # If printful_id provided, attach to product
    printful_id = body.get("printful_id")
    if printful_id:
        await db.products.update_one(
            {"printful_id": int(printful_id)},
            {"$push": {"ad_images": {"path": storage_path, "created_at": datetime.now(timezone.utc).isoformat()}}}
        )
    
    return {"image_base64": image_b64, "storage_path": storage_path}

@api_router.get("/admin/orders")
async def admin_get_orders(request: Request, page: int = 1, limit: int = 50, status: Optional[str] = None):
    await require_admin(request)
    query = {}
    if status:
        query["status"] = status
    skip = (page - 1) * limit
    orders = await db.orders.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    total = await db.orders.count_documents(query)
    return {"orders": orders, "total": total, "page": page}

@api_router.put("/admin/orders/{order_id}")
async def admin_update_order(order_id: str, body: dict, request: Request):
    await require_admin(request)
    update_fields = {}
    if "status" in body:
        update_fields["status"] = body["status"]
    if "tracking_number" in body:
        update_fields["tracking_number"] = body["tracking_number"]
    update_fields["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.orders.update_one({"id": order_id}, {"$set": update_fields})
    return {"message": "Order updated"}

@api_router.get("/admin/users")
async def admin_get_users(request: Request, page: int = 1, limit: int = 50):
    await require_admin(request)
    skip = (page - 1) * limit
    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).skip(skip).limit(limit).to_list(limit)
    total = await db.users.count_documents({})
    return {"users": users, "total": total, "page": page}

@api_router.get("/admin/stats")
async def admin_stats(request: Request):
    await require_admin(request)
    total_users = await db.users.count_documents({})
    total_products = await db.products.count_documents({"active": True})
    total_orders = await db.orders.count_documents({})
    pending_orders = await db.orders.count_documents({"status": "pending"})
    return {
        "total_users": total_users,
        "total_products": total_products,
        "total_orders": total_orders,
        "pending_orders": pending_orders
    }

# ─── Printful Proxy (for catalog browsing) ───────────────
@api_router.get("/printful/catalog")
async def printful_catalog(category_id: Optional[int] = None, limit: int = 20, offset: int = 0):
    result = await fetch_catalog_products(db, category_id, limit, offset)
    return result

@api_router.get("/printful/product/{product_id}")
async def printful_product(product_id: int):
    result = await fetch_product_details(db, product_id)
    return result

# ─── Cart ─────────────────────────────────────────────────
@api_router.get("/cart")
async def get_cart(request: Request):
    user = await get_current_user(request, db)
    cart = await db.carts.find_one({"user_id": user["_id"]}, {"_id": 0})
    if not cart:
        return {"items": [], "total": 0}
    return cart

@api_router.post("/cart/add")
async def add_to_cart(data: CartItemInput, request: Request):
    user = await get_current_user(request, db)
    product = await db.products.find_one({"printful_id": data.product_printful_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    variant = product["variants"][data.variant_index] if data.variant_index < len(product.get("variants", [])) else product["variants"][0] if product.get("variants") else None
    price = float(variant["retail_price"]) if variant and variant.get("retail_price") else 0

    cart_item = {
        "id": str(uuid.uuid4()),
        "product_printful_id": data.product_printful_id,
        "product_name": product.get("name", ""),
        "thumbnail_url": product.get("thumbnail_url", ""),
        "variant_index": data.variant_index,
        "size": data.size,
        "color": data.color,
        "quantity": data.quantity,
        "price": price,
        "image": variant.get("image", "") if variant else ""
    }

    cart = await db.carts.find_one({"user_id": user["_id"]})
    if cart:
        await db.carts.update_one({"user_id": user["_id"]}, {"$push": {"items": cart_item}})
    else:
        await db.carts.insert_one({"user_id": user["_id"], "items": [cart_item]})

    # Recalculate total
    cart = await db.carts.find_one({"user_id": user["_id"]})
    total = sum(item["price"] * item["quantity"] for item in cart.get("items", []))
    await db.carts.update_one({"user_id": user["_id"]}, {"$set": {"total": round(total, 2)}})
    updated = await db.carts.find_one({"user_id": user["_id"]}, {"_id": 0})
    return updated

@api_router.delete("/cart/{item_id}")
async def remove_from_cart(item_id: str, request: Request):
    user = await get_current_user(request, db)
    await db.carts.update_one({"user_id": user["_id"]}, {"$pull": {"items": {"id": item_id}}})
    cart = await db.carts.find_one({"user_id": user["_id"]})
    if cart:
        total = sum(item["price"] * item["quantity"] for item in cart.get("items", []))
        await db.carts.update_one({"user_id": user["_id"]}, {"$set": {"total": round(total, 2)}})
    updated = await db.carts.find_one({"user_id": user["_id"]}, {"_id": 0})
    return updated or {"items": [], "total": 0}

@api_router.delete("/cart")
async def clear_cart(request: Request):
    user = await get_current_user(request, db)
    await db.carts.delete_one({"user_id": user["_id"]})
    return {"items": [], "total": 0}

# ─── Stripe Checkout ──────────────────────────────────────
@api_router.post("/checkout/create")
async def create_checkout(request: Request, body: dict):
    user = await get_current_user(request, db)
    cart = await db.carts.find_one({"user_id": user["_id"]})
    if not cart or not cart.get("items"):
        raise HTTPException(status_code=400, detail="Cart is empty")

    total = sum(item["price"] * item["quantity"] for item in cart["items"])
    if total <= 0:
        raise HTTPException(status_code=400, detail="Invalid cart total")

    origin_url = body.get("origin_url", os.environ.get("FRONTEND_URL", "http://localhost:3000"))
    success_url = f"{origin_url}/checkout/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{origin_url}/cart"

    stripe_key = os.environ.get("STRIPE_API_KEY")
    webhook_url = f"{str(request.base_url).rstrip('/')}/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=stripe_key, webhook_url=webhook_url)

    checkout_request = CheckoutSessionRequest(
        amount=round(total, 2),
        currency="usd",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={"user_id": user["_id"], "user_email": user.get("email", "")}
    )

    session = await stripe_checkout.create_checkout_session(checkout_request)

    # Create payment transaction record
    await db.payment_transactions.insert_one({
        "id": str(uuid.uuid4()),
        "session_id": session.session_id,
        "user_id": user["_id"],
        "email": user.get("email", ""),
        "amount": round(total, 2),
        "currency": "usd",
        "payment_status": "initiated",
        "cart_items": cart["items"],
        "created_at": datetime.now(timezone.utc).isoformat()
    })

    return {"url": session.url, "session_id": session.session_id}

@api_router.get("/checkout/status/{session_id}")
async def checkout_status(session_id: str, request: Request):
    user = await get_current_user(request, db)
    stripe_key = os.environ.get("STRIPE_API_KEY")
    webhook_url = f"{str(request.base_url).rstrip('/')}/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=stripe_key, webhook_url=webhook_url)

    status = await stripe_checkout.get_checkout_status(session_id)

    # Update payment transaction
    txn = await db.payment_transactions.find_one({"session_id": session_id})
    if txn and txn.get("payment_status") != "paid":
        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {"$set": {"payment_status": status.payment_status, "status": status.status, "updated_at": datetime.now(timezone.utc).isoformat()}}
        )
        # If paid, create orders and clear cart
        if status.payment_status == "paid":
            for item in txn.get("cart_items", []):
                order_doc = {
                    "id": str(uuid.uuid4()),
                    "user_id": txn["user_id"],
                    "product_printful_id": item.get("product_printful_id"),
                    "product_name": item.get("product_name", ""),
                    "variant": None,
                    "size": item.get("size", ""),
                    "quantity": item.get("quantity", 1),
                    "total_price": round(item.get("price", 0) * item.get("quantity", 1), 2),
                    "currency": "usd",
                    "status": "pending",
                    "tracking_number": None,
                    "shipping_address": (await db.users.find_one({"_id": ObjectId(txn["user_id"]) if not isinstance(txn["user_id"], str) else txn["user_id"]}) or {}).get("address"),
                    "payment_session_id": session_id,
                    "created_at": datetime.now(timezone.utc).isoformat(),
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }
                await db.orders.insert_one(order_doc)
            # Clear cart
            user_id = txn["user_id"]
            await db.carts.delete_one({"user_id": user_id})

    return {
        "status": status.status,
        "payment_status": status.payment_status,
        "amount_total": status.amount_total,
        "currency": status.currency
    }

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    body = await request.body()
    sig = request.headers.get("Stripe-Signature", "")
    stripe_key = os.environ.get("STRIPE_API_KEY")
    webhook_url = f"{str(request.base_url).rstrip('/')}/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=stripe_key, webhook_url=webhook_url)
    try:
        event = await stripe_checkout.handle_webhook(body, sig)
        if event.payment_status == "paid" and event.session_id:
            await db.payment_transactions.update_one(
                {"session_id": event.session_id},
                {"$set": {"payment_status": "paid", "updated_at": datetime.now(timezone.utc).isoformat()}}
            )
        return {"received": True}
    except Exception as e:
        logger.error(f"Webhook error: {e}")
        return {"received": True}

# ─── Admin Delete Product ─────────────────────────────────
@api_router.delete("/admin/products/{printful_id}")
async def admin_delete_product(printful_id: int, request: Request):
    await require_admin(request)
    result = await db.products.delete_one({"printful_id": printful_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted"}

app.include_router(api_router)
