# \"\"\"Rekhay Atelier - Clothing E-commerce Backend\"\"\"
from dotenv import load_dotenv
from pathlib import Path
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import uuid
import logging
import asyncio
from datetime import datetime, timezone, timedelta
from typing import List, Optional

import bcrypt
import jwt
import requests
from bson import ObjectId
from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, Form, Request, Response, Header, Query
from fastapi.responses import StreamingResponse
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr, Field

# -------------------- Config --------------------
MONGO_URL = os.environ['MONGO_URL']
DB_NAME = os.environ['DB_NAME']
JWT_SECRET = os.environ.get('JWT_SECRET', 'change-me')
JWT_ALG = \"HS256\"
ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', 'admin@example.com')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'admin123')
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')
APP_NAME = os.environ.get('APP_NAME', 'rekhay-atelier')
BUSINESS_NAME = os.environ.get('BUSINESS_NAME', 'Rekhay Atelier')
BUSINESS_EMAIL = os.environ.get('BUSINESS_EMAIL', 'hello@rekhay.in')
RAZORPAY_KEY_ID = os.environ.get('RAZORPAY_KEY_ID', '')
RAZORPAY_KEY_SECRET = os.environ.get('RAZORPAY_KEY_SECRET', '')
RESEND_API_KEY = os.environ.get('RESEND_API_KEY', '')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')

STORAGE_URL = \"https://integrations.emergentagent.com/objstore/api/v1/storage\"

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# -------------------- DB --------------------
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# -------------------- Storage --------------------
storage_key = None

def init_storage():
    global storage_key
    if storage_key:
        return storage_key
    if not EMERGENT_LLM_KEY:
        logger.warning(\"EMERGENT_LLM_KEY not set; object storage disabled\")
        return None
    resp = requests.post(f\"{STORAGE_URL}/init\", json={\"emergent_key\": EMERGENT_LLM_KEY}, timeout=30)
    resp.raise_for_status()
    storage_key = resp.json()[\"storage_key\"]
    logger.info(\"Object storage initialized\")
    return storage_key

def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    resp = requests.put(
        f\"{STORAGE_URL}/objects/{path}\",
        headers={\"X-Storage-Key\": key, \"Content-Type\": content_type},
        data=data, timeout=120,
    )
    resp.raise_for_status()
    return resp.json()

def get_object(path: str):
    key = init_storage()
    resp = requests.get(
        f\"{STORAGE_URL}/objects/{path}\",
        headers={\"X-Storage-Key\": key}, timeout=60,
    )
    resp.raise_for_status()
    return resp.content, resp.headers.get(\"Content-Type\", \"application/octet-stream\")

# -------------------- Auth helpers --------------------
def hash_password(p: str) -> str:
    return bcrypt.hashpw(p.encode(), bcrypt.gensalt()).decode()

def verify_password(p: str, h: str) -> bool:
    try:
        return bcrypt.checkpw(p.encode(), h.encode())
    except Exception:
        return False

def create_access_token(user_id: str, email: str) -> str:
    payload = {\"sub\": user_id, \"email\": email,
               \"exp\": datetime.now(timezone.utc) + timedelta(days=7), \"type\": \"access\"}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)

async def get_current_admin(request: Request) -> dict:
    token = request.cookies.get(\"access_token\")
    if not token:
        auth = request.headers.get(\"Authorization\", \"\")
        if auth.startswith(\"Bearer \"):
            token = auth[7:]
    if not token:
        raise HTTPException(status_code=401, detail=\"Not authenticated\")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail=\"Token expired\")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail=\"Invalid token\")
    user = await db.users.find_one({\"_id\": ObjectId(payload[\"sub\"])})
    if not user or user.get(\"role\") != \"admin\":
        raise HTTPException(status_code=403, detail=\"Admin access required\")
    return {\"id\": str(user[\"_id\"]), \"email\": user[\"email\"], \"role\": user[\"role\"]}

# -------------------- Email --------------------
async def send_email_async(to_email: str, subject: str, html: str) -> dict:
    if not RESEND_API_KEY:
        logger.info(f\"[MOCK EMAIL] to={to_email} subject={subject}\")
        return {\"mock\": True, \"to\": to_email}
    import resend
    resend.api_key = RESEND_API_KEY
    params = {\"from\": SENDER_EMAIL, \"to\": [to_email], \"subject\": subject, \"html\": html}
    try:
        result = await asyncio.to_thread(resend.Emails.send, params)
        return {\"id\": result.get(\"id\"), \"mock\": False}
    except Exception as e:
        logger.error(f\"Email send failed: {e}\")
        return {\"error\": str(e), \"mock\": False}

def order_email_html(order: dict) -> str:
    items = \"\".join([
        f\"<tr><td style='padding:8px;border-bottom:1px solid #E8E2D6'>{i['name']} ({i.get('size','-')})</td>\"
        f\"<td style='padding:8px;border-bottom:1px solid #E8E2D6'>x{i['quantity']}</td>\"
        f\"<td style='padding:8px;border-bottom:1px solid #E8E2D6;text-align:right'>₹{i['price']*i['quantity']}</td></tr>\"
        for i in order.get(\"items\", [])
    ])
    return f\"\"\"
    <div style=\"font-family:Georgia,serif;background:#FDFBF7;padding:40px;color:#1A1A1A\">
      <h1 style=\"font-weight:400;letter-spacing:0.02em\">{BUSINESS_NAME}</h1>
      <p style=\"color:#5C5C5C\">Thank you for your order, {order.get('customer_name','')}.</p>
      <p>Order ID: <b>{order.get('id')}</b></p>
      <table style=\"width:100%;border-collapse:collapse;margin-top:20px\">{items}</table>
      <p style=\"margin-top:20px;font-size:18px\">Total: <b>₹{order.get('total',0)}</b></p>
      <hr style=\"border:none;border-top:1px solid #E8E2D6;margin:30px 0\"/>
      <p style=\"color:#5C5C5C;font-size:13px\">Shipping to: {order.get('address','')}</p>
      <p style=\"color:#5C5C5C;font-size:13px\">Questions? Reach us at {BUSINESS_EMAIL}.</p>
    </div>
    \"\"\"

# -------------------- Models --------------------
class LoginIn(BaseModel):
    email: EmailStr
    password: str

class ProductIn(BaseModel):
    name: str
    description: str
    price: int  # in INR (whole rupees)
    sizes: List[str] = []
    images: List[str] = []  # storage paths
    category: Optional[str] = \"Apparel\"
    stock: int = 10

class ProductOut(ProductIn):
    id: str
    created_at: str

class CartItem(BaseModel):
    product_id: str
    name: str
    price: int
    size: Optional[str] = None
    quantity: int = 1
    image: Optional[str] = None

class OrderIn(BaseModel):
    customer_name: str
    email: EmailStr
    phone: str
    address: str
    items: List[CartItem]

class CustomRequestIn(BaseModel):
    customer_name: str
    email: EmailStr
    phone: Optional[str] = \"\"
    notes: str
    measurements: Optional[str] = \"\"
    images: List[str] = []  # storage paths

# -------------------- App --------------------
app = FastAPI(title=\"Rekhay Atelier API\")
api = APIRouter(prefix=\"/api\")

@api.get(\"/\")
async def root():
    return {\"name\": BUSINESS_NAME, \"status\": \"ok\"}

# ---- Auth ----
@api.post(\"/auth/login\")
async def login(payload: LoginIn, response: Response):
    user = await db.users.find_one({\"email\": payload.email.lower()})
    if not user or not verify_password(payload.password, user[\"password_hash\"]):
        raise HTTPException(status_code=401, detail=\"Invalid credentials\")
    token = create_access_token(str(user[\"_id\"]), user[\"email\"])
    response.set_cookie(\"access_token\", token, httponly=True, secure=False, samesite=\"lax\",
                        max_age=7*24*3600, path=\"/\")
    return {\"token\": token, \"email\": user[\"email\"], \"role\": user[\"role\"]}

@api.post(\"/auth/logout\")
async def logout(response: Response):
    response.delete_cookie(\"access_token\", path=\"/\")
    return {\"ok\": True}

@api.get(\"/auth/me\")
async def me(admin: dict = Depends(get_current_admin)):
    return admin

# ---- Upload ----
@api.post(\"/upload\")
async def upload_file(file: UploadFile = File(...)):
    ext = (file.filename.rsplit(\".\", 1)[-1] if \".\" in (file.filename or \"\") else \"bin\").lower()
    if ext not in (\"jpg\", \"jpeg\", \"png\", \"webp\", \"gif\"):
        raise HTTPException(status_code=400, detail=\"Only image files allowed\")
    path = f\"{APP_NAME}/uploads/{uuid.uuid4()}.{ext}\"
    data = await file.read()
    ctype = file.content_type or f\"image/{'jpeg' if ext=='jpg' else ext}\"
    result = put_object(path, data, ctype)
    await db.files.insert_one({
        \"id\": str(uuid.uuid4()),
        \"storage_path\": result[\"path\"],
        \"original_filename\": file.filename,
        \"content_type\": ctype,
        \"size\": result.get(\"size\", len(data)),
        \"is_deleted\": False,
        \"created_at\": datetime.now(timezone.utc).isoformat(),
    })
    return {\"path\": result[\"path\"], \"url\": f\"/api/files/{result['path']}\"}

@api.get(\"/files/{path:path}\")
async def serve_file(path: str):
    record = await db.files.find_one({\"storage_path\": path, \"is_deleted\": False})
    if not record:
        raise HTTPException(status_code=404, detail=\"Not found\")
    data, ctype = get_object(path)
    return Response(content=data, media_type=record.get(\"content_type\", ctype))

# ---- Products ----
def _serialize_product(p: dict) -> dict:
    return {
        \"id\": str(p[\"_id\"]),
        \"name\": p[\"name\"],
        \"description\": p[\"description\"],
        \"price\": p[\"price\"],
        \"sizes\": p.get(\"sizes\", []),
        \"images\": p.get(\"images\", []),
        \"category\": p.get(\"category\", \"Apparel\"),
        \"stock\": p.get(\"stock\", 0),
        \"created_at\": p.get(\"created_at\", \"\"),
    }

@api.get(\"/products\")
async def list_products():
    cursor = db.products.find({\"is_deleted\": {\"$ne\": True}}).sort(\"created_at\", -1)
    items = [_serialize_product(p) async for p in cursor]
    return items

@api.get(\"/products/{product_id}\")
async def get_product(product_id: str):
    try:
        p = await db.products.find_one({\"_id\": ObjectId(product_id)})
    except Exception:
        raise HTTPException(status_code=400, detail=\"Invalid id\")
    if not p:
        raise HTTPException(status_code=404, detail=\"Not found\")
    return _serialize_product(p)

@api.post(\"/products\")
async def create_product(payload: ProductIn, admin: dict = Depends(get_current_admin)):
    doc = payload.model_dump()
    doc[\"created_at\"] = datetime.now(timezone.utc).isoformat()
    doc[\"is_deleted\"] = False
    result = await db.products.insert_one(doc)
    doc[\"_id\"] = result.inserted_id
    return _serialize_product(doc)

@api.put(\"/products/{product_id}\")
async def update_product(product_id: str, payload: ProductIn, admin: dict = Depends(get_current_admin)):
    try:
        oid = ObjectId(product_id)
    except Exception:
        raise HTTPException(status_code=400, detail=\"Invalid id\")
    await db.products.update_one({\"_id\": oid}, {\"$set\": payload.model_dump()})
    p = await db.products.find_one({\"_id\": oid})
    return _serialize_product(p)

@api.delete(\"/products/{product_id}\")
async def delete_product(product_id: str, admin: dict = Depends(get_current_admin)):
    try:
        oid = ObjectId(product_id)
    except Exception:
        raise HTTPException(status_code=400, detail=\"Invalid id\")
    await db.products.update_one({\"_id\": oid}, {\"$set\": {\"is_deleted\": True}})
    return {\"ok\": True}

# ---- Orders ----
def _serialize_order(o: dict) -> dict:
    return {
        \"id\": str(o[\"_id\"]),
        \"customer_name\": o[\"customer_name\"],
        \"email\": o[\"email\"],
        \"phone\": o.get(\"phone\", \"\"),
        \"address\": o[\"address\"],
        \"items\": o.get(\"items\", []),
        \"total\": o.get(\"total\", 0),
        \"status\": o.get(\"status\", \"pending\"),
        \"payment_status\": o.get(\"payment_status\", \"pending\"),
        \"razorpay_order_id\": o.get(\"razorpay_order_id\"),
        \"razorpay_payment_id\": o.get(\"razorpay_payment_id\"),
        \"created_at\": o.get(\"created_at\", \"\"),
    }

@api.post(\"/orders\")
async def create_order(payload: OrderIn):
    total = sum(i.price * i.quantity for i in payload.items)
    if total <= 0:
        raise HTTPException(status_code=400, detail=\"Empty cart\")

    razorpay_order_id = None
    razorpay_key_id_public = RAZORPAY_KEY_ID
    if RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET:
        try:
            import razorpay
            rzp = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
            rzp_order = rzp.order.create({
                \"amount\": total * 100,  # paise
                \"currency\": \"INR\",
                \"payment_capture\": 1,
            })
            razorpay_order_id = rzp_order[\"id\"]
        except Exception as e:
            logger.error(f\"Razorpay order create failed: {e}\")

    doc = {
        \"customer_name\": payload.customer_name,
        \"email\": payload.email.lower(),
        \"phone\": payload.phone,
        \"address\": payload.address,
        \"items\": [i.model_dump() for i in payload.items],
        \"total\": total,
        \"status\": \"pending\",
        \"payment_status\": \"pending\",
        \"razorpay_order_id\": razorpay_order_id,
        \"created_at\": datetime.now(timezone.utc).isoformat(),
    }
    result = await db.orders.insert_one(doc)
    doc[\"_id\"] = result.inserted_id
    return {
        \"order\": _serialize_order(doc),
        \"razorpay_key_id\": razorpay_key_id_public,
        \"razorpay_enabled\": bool(razorpay_order_id),
    }

@api.post(\"/orders/{order_id}/verify\")
async def verify_order_payment(order_id: str, body: dict):
    try:
        oid = ObjectId(order_id)
    except Exception:
        raise HTTPException(status_code=400, detail=\"Invalid id\")
    order = await db.orders.find_one({\"_id\": oid})
    if not order:
        raise HTTPException(status_code=404, detail=\"Order not found\")

    payment_id = body.get(\"razorpay_payment_id\")
    rzp_order_id = body.get(\"razorpay_order_id\")
    signature = body.get(\"razorpay_signature\")
    payment_status = \"paid\"

    # If Razorpay configured, verify signature
    if RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET and signature:
        try:
            import razorpay
            rzp = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
            rzp.utility.verify_payment_signature({
                \"razorpay_order_id\": rzp_order_id,
                \"razorpay_payment_id\": payment_id,
                \"razorpay_signature\": signature,
            })
        except Exception as e:
            logger.error(f\"Razorpay signature verification failed: {e}\")
            raise HTTPException(status_code=400, detail=\"Signature verification failed\")

    await db.orders.update_one({\"_id\": oid}, {\"$set\": {
        \"payment_status\": payment_status,
        \"status\": \"confirmed\",
        \"razorpay_payment_id\": payment_id,
    }})
    updated = await db.orders.find_one({\"_id\": oid})
    serialized = _serialize_order(updated)
    # Send confirmation email
    asyncio.create_task(send_email_async(
        updated[\"email\"],
        f\"Order Confirmed - {BUSINESS_NAME}\",
        order_email_html(serialized),
    ))
    return serialized

@api.get(\"/orders/{order_id}\")
async def get_order(order_id: str):
    try:
        oid = ObjectId(order_id)
    except Exception:
        raise HTTPException(status_code=400, detail=\"Invalid id\")
    o = await db.orders.find_one({\"_id\": oid})
    if not o:
        raise HTTPException(status_code=404, detail=\"Not found\")
    return _serialize_order(o)

@api.get(\"/admin/orders\")
async def admin_list_orders(admin: dict = Depends(get_current_admin)):
    cursor = db.orders.find().sort(\"created_at\", -1)
    return [_serialize_order(o) async for o in cursor]

# ---- Custom design requests ----
def _serialize_request(r: dict) -> dict:
    return {
        \"id\": str(r[\"_id\"]),
        \"customer_name\": r[\"customer_name\"],
        \"email\": r[\"email\"],
        \"phone\": r.get(\"phone\", \"\"),
        \"notes\": r[\"notes\"],
        \"measurements\": r.get(\"measurements\", \"\"),
        \"images\": r.get(\"images\", []),
        \"status\": r.get(\"status\", \"new\"),
        \"created_at\": r.get(\"created_at\", \"\"),
    }

@api.post(\"/custom-requests\")
async def create_custom_request(payload: CustomRequestIn):
    doc = payload.model_dump()
    doc[\"email\"] = doc[\"email\"].lower()
    doc[\"status\"] = \"new\"
    doc[\"created_at\"] = datetime.now(timezone.utc).isoformat()
    result = await db.custom_requests.insert_one(doc)
    doc[\"_id\"] = result.inserted_id
    # Send acknowledgement email
    asyncio.create_task(send_email_async(
        doc[\"email\"],
        f\"Custom Design Request Received - {BUSINESS_NAME}\",
        f\"<div style='font-family:Georgia,serif;color:#1A1A1A;padding:32px;background:#FDFBF7'>\"
        f\"<h2 style='font-weight:400'>{BUSINESS_NAME}</h2>\"
        f\"<p>Thank you {doc['customer_name']}, we've received your custom design request and will be in touch within 24-48 hours.</p>\"
        f\"<p style='color:#5C5C5C'>Your notes: {doc['notes']}</p>\"
        f\"<p style='color:#5C5C5C'>Reach us anytime at {BUSINESS_EMAIL}.</p></div>\",
    ))
    return _serialize_request(doc)

@api.get(\"/admin/custom-requests\")
async def admin_list_requests(admin: dict = Depends(get_current_admin)):
    cursor = db.custom_requests.find().sort(\"created_at\", -1)
    return [_serialize_request(r) async for r in cursor]

@api.put(\"/admin/custom-requests/{req_id}/status\")
async def update_request_status(req_id: str, body: dict, admin: dict = Depends(get_current_admin)):
    try:
        oid = ObjectId(req_id)
    except Exception:
        raise HTTPException(status_code=400, detail=\"Invalid id\")
    status = body.get(\"status\", \"new\")
    await db.custom_requests.update_one({\"_id\": oid}, {\"$set\": {\"status\": status}})
    r = await db.custom_requests.find_one({\"_id\": oid})
    return _serialize_request(r)

# -------------------- Wire up --------------------
app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=[\"*\"],
    allow_headers=[\"*\"],
)

# -------------------- Startup --------------------
@app.on_event(\"startup\")
async def startup_event():
    # Indexes
    await db.users.create_index(\"email\", unique=True)
    # Seed admin
    existing = await db.users.find_one({\"email\": ADMIN_EMAIL.lower()})
    if not existing:
        await db.users.insert_one({
            \"email\": ADMIN_EMAIL.lower(),
            \"password_hash\": hash_password(ADMIN_PASSWORD),
            \"name\": \"Admin\",
            \"role\": \"admin\",
            \"created_at\": datetime.now(timezone.utc).isoformat(),
        })
        logger.info(\"Admin seeded\")
    else:
        # Update hash if password changed
        if not verify_password(ADMIN_PASSWORD, existing[\"password_hash\"]):
            await db.users.update_one(
                {\"email\": ADMIN_EMAIL.lower()},
                {\"$set\": {\"password_hash\": hash_password(ADMIN_PASSWORD)}},
            )
            logger.info(\"Admin password updated\")
    # Storage init
    try:
        init_storage()
    except Exception as e:
        logger.error(f\"Storage init failed: {e}\")
    # Seed demo products if empty
    count = await db.products.count_documents({\"is_deleted\": {\"$ne\": True}})
    if count == 0:
        demo = [
            {
                \"name\": \"Hand-loomed Cotton Kurta\",
                \"description\": \"An effortlessly elegant kurta hand-woven by artisans in Bhuj. Made from breathable organic cotton.\",
                \"price\": 3499, \"sizes\": [\"S\", \"M\", \"L\", \"XL\"],
                \"images\": [\"https://images.unsplash.com/photo-1713881587420-113c1c43e28a?w=1200\"],
                \"category\": \"Kurtas\", \"stock\": 12,
                \"created_at\": datetime.now(timezone.utc).isoformat(),
                \"is_deleted\": False,
            },
            {
                \"name\": \"Indigo Linen Wrap Dress\",
                \"description\": \"A modern wrap silhouette in plant-dyed indigo linen. Soft, structured, and seasonless.\",
                \"price\": 5299, \"sizes\": [\"XS\", \"S\", \"M\", \"L\"],
                \"images\": [\"https://images.pexels.com/photos/7789139/pexels-photo-7789139.jpeg?w=1200\"],
                \"category\": \"Dresses\", \"stock\": 8,
                \"created_at\": datetime.now(timezone.utc).isoformat(),
                \"is_deleted\": False,
            },
            {
                \"name\": \"Terracotta Hand-block Saree\",
                \"description\": \"A six-yard story in mul cotton, hand-block printed in warm terracotta motifs.\",
                \"price\": 6899, \"sizes\": [\"Free Size\"],
                \"images\": [\"https://images.pexels.com/photos/15764781/pexels-photo-15764781.jpeg?w=1200\"],
                \"category\": \"Sarees\", \"stock\": 6,
                \"created_at\": datetime.now(timezone.utc).isoformat(),
                \"is_deleted\": False,
            },
            {
                \"name\": \"Forest Tussar Silk Jacket\",
                \"description\": \"A statement jacket cut from deep-forest tussar silk with a relaxed, oversized fit.\",
                \"price\": 8499, \"sizes\": [\"S\", \"M\", \"L\"],
                \"images\": [\"https://images.unsplash.com/photo-1589363460779-cd717d2ed8fa?w=1200\"],
                \"category\": \"Outerwear\", \"stock\": 4,
                \"created_at\": datetime.now(timezone.utc).isoformat(),
                \"is_deleted\": False,
            },
        ]
        await db.products.insert_many(demo)
        logger.info(\"Demo products seeded\")

@app.on_event(\"shutdown\")
async def shutdown_db_client():
    client.close()