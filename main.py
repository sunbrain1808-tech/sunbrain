import json
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

# --- 1. CẤU HÌNH CORS (Bắt buộc để Frontend gọi được Backend) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 2. HỆ THỐNG LƯU TRỮ DỮ LIỆU TÀI KHOẢN (JSON) ---
DB_FILE = "users_db.json" 

def load_users():
    """Hàm đọc dữ liệu tài khoản từ ổ cứng"""
    if not os.path.exists(DB_FILE):
        return {"sinhvien@tdtu.edu.vn": {"password": "123", "name": "Nguyễn Văn A"}}
    
    with open(DB_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def save_users(db_data):
    """Hàm ghi đè dữ liệu mới xuống ổ cứng"""
    with open(DB_FILE, "w", encoding="utf-8") as f:
        json.dump(db_data, f, ensure_ascii=False, indent=4)

# --- 3. DỮ LIỆU SẢN PHẨM ---
products_db = [
    {"id": 1, "title": "Triết học Mác - Lênin", "price": 49000, "tag": "Môn Đại Cương"},
    {"id": 2, "title": "Kinh tế Chính trị", "price": 49000, "tag": "Môn Đại Cương"}
]

# --- 4. ĐỊNH NGHĨA MODEL DỮ LIỆU ---
class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str

# --- 5. TẠO CÁC API ENDPOINTS ---

@app.get("/")
def read_root():
    return {"message": "Chào mừng đến với Sunbrain API"}

@app.get("/api/products")
def get_products():
    """API trả về danh sách tài liệu"""
    return {"status": "success", "data": products_db}

@app.post("/api/register")
def register(request: RegisterRequest):
    """API xử lý đăng ký tài khoản"""
    users_db = load_users() # Đọc dữ liệu từ file lên
    
    if request.email in users_db:
        raise HTTPException(status_code=400, detail="Email này đã được sử dụng!")
    
    # Thêm người dùng mới vào danh sách
    users_db[request.email] = {
        "password": request.password,
        "name": request.name
    }
    
    save_users(users_db) # Lưu toàn bộ danh sách mới xuống ổ cứng
    
    return {"status": "success", "message": "Đăng ký thành công!"}

@app.post("/api/login")
def login(request: LoginRequest):
    """API xử lý đăng nhập"""
    users_db = load_users() # Đọc dữ liệu mới nhất từ file
    
    user = users_db.get(request.email)
    
    if user and user["password"] == request.password:
        return {
            "status": "success", 
            "message": "Đăng nhập thành công!",
            "user_info": {"name": user["name"], "email": request.email}
        }
    
    raise HTTPException(status_code=401, detail="Email hoặc mật khẩu không đúng")

# Lệnh chạy server (dùng trong terminal): py -m uvicorn main:app --reload