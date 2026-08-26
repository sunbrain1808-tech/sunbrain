// ==========================================
// 1. TÍNH NĂNG TÌM KIẾM
// ==========================================

function removeVietnameseAccents(str) {
    return str.normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .replace(/đ/g, "d")
              .replace(/Đ/g, "D")
              .toLowerCase();
}

document.getElementById('searchInput').addEventListener('input', function(e) {
    const searchTerm = removeVietnameseAccents(e.target.value);
    const cards = document.querySelectorAll('.grid .card');
    
    cards.forEach(card => {
        const titleElement = card.querySelector('.card-title');
        if (titleElement) {
            const titleText = removeVietnameseAccents(titleElement.innerText);
            if (titleText.includes(searchTerm)) {
                card.classList.remove('hidden');
            } else {
                card.classList.add('hidden');
            }
        }
    });
});

// ==========================================
// 2. TÍNH NĂNG THANH TOÁN (TẠO QR CODE)
// ==========================================

function thanhToan(tenMon) {
    // 1. KIỂM TRA TRẠNG THÁI ĐĂNG NHẬP TRƯỚC TIÊN
    const userString = localStorage.getItem('currentUser');
    if (!userString) {
        alert("Vui lòng đăng nhập tài khoản để tiến hành mua tài liệu nhé!");
        openLoginModal(); // Lập tức bật khung đăng nhập lên màn hình
        return; // Lệnh return này cực kỳ quan trọng: Nó sẽ dừng hàm lại ngay lập tức, không chạy phần tạo QR ở dưới nữa.
    }

    // 2. NẾU ĐÃ ĐĂNG NHẬP, TIẾP TỤC TẠO QR THANH TOÁN
    const NganHang = "BIDV"; 
    const SoTaiKhoan = "6612920731"; 
    const TenChuTaiKhoan = "LE MINH NHAT"; 
    
    let giaTien = 49000; // Giá mặc định
    
    // Kiểm tra tên món để set giá cho Combo
    if (tenMon === 'Combo 2 Môn') { 
        giaTien = 79000; 
    } else if (tenMon === 'Combo 3 Môn') {
        giaTien = 107000; 
    }

    const noiDungCK = "Mua tai lieu " + tenMon;
    const linkQR = `https://img.vietqr.io/image/${NganHang}-${SoTaiKhoan}-compact2.png?amount=${giaTien}&addInfo=${encodeURIComponent(noiDungCK)}&accountName=${encodeURIComponent(TenChuTaiKhoan)}`;

    const xacNhan = confirm(`🛒 Xác nhận mua đơn hàng:\n- Sản phẩm: ${tenMon}\n- Số tiền: ${giaTien.toLocaleString('vi-VN')} VNĐ\n\nBấm "OK" để hiển thị mã QR thanh toán nhé!`);
    
    if (xacNhan) {
        window.open(linkQR, "_blank");
    }
}

// ==========================================
// 3. TÍNH NĂNG TÀI KHOẢN (ĐĂNG NHẬP / ĐĂNG KÝ)
// ==========================================

// Bổ sung hàm toggleAuthForms bị thiếu
function toggleAuthForms(formType) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const modalTitle = document.getElementById('modalTitle');

    if (formType === 'register') {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
        if(modalTitle) modalTitle.innerText = 'Đăng ký tài khoản';
    } else {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        if(modalTitle) modalTitle.innerText = 'Đăng nhập hệ thống';
    }
}

function openLoginModal() {
    const modal = document.getElementById('loginModal');
    modal.style.display = 'flex';
    toggleAuthForms('login'); // Đảm bảo luôn mở form đăng nhập đầu tiên
}

function openRegister() {
    openLoginModal(); 
    toggleAuthForms('register'); 
}

function closeLoginModal() {
    const modal = document.getElementById('loginModal');
    modal.style.display = 'none';
}

window.onclick = function(event) {
    const modal = document.getElementById('loginModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}

// --- KIỂM TRA TRẠNG THÁI ĐĂNG NHẬP ---

function checkLoginStatus() {
    const userString = localStorage.getItem('currentUser');
    const authActions = document.getElementById('authActions');
    if (!authActions) return;

    if (userString) {
        const user = JSON.parse(userString);
        // Biến Tên thành một nút bấm có thể click được (thêm con trỏ chuột pointer và sự kiện onclick)
        authActions.innerHTML = `
            <span style="font-weight: bold; color: var(--primary-color); cursor: pointer;" onclick="showProfile()">
                👤 Chào, ${user.name} ▾
            </span>
            <button class="register-btn-header" onclick="logout()">Đăng xuất</button>
        `;
    } else {
        authActions.innerHTML = `
            <button class="register-btn-header" onclick="openRegister()">Đăng ký</button>
            <button class="login-btn" onclick="openLoginModal()">👤 Đăng nhập</button>
        `;
    }
}

// --- HÀM MỞ GIAO DIỆN TÀI KHOẢN ---
function showProfile() {
    const userString = localStorage.getItem('currentUser');
    if (!userString) return;
    
    const user = JSON.parse(userString);

    // 1. Điền thông tin vào khung tài khoản
    document.getElementById('profileName').innerText = user.name;
    document.getElementById('profileEmail').innerText = user.email;

    // 2. Ẩn trang chủ, Hiện trang cá nhân
    document.getElementById('heroSection').style.display = 'none';
    document.getElementById('productSection').style.display = 'none';
    document.getElementById('profileSection').style.display = 'block';
}

// --- HÀM QUAY LẠI TRANG CHỦ MUA SẮM ---
function showHome() {
    document.getElementById('heroSection').style.display = 'block';
    document.getElementById('productSection').style.display = 'block';
    document.getElementById('profileSection').style.display = 'none';
}

// --- CẬP NHẬT HÀM ĐĂNG XUẤT ---
function logout() {
    localStorage.removeItem('currentUser'); 
    checkLoginStatus(); 
    showHome(); // Đăng xuất xong tự động văng về trang chủ
    alert("Bạn đã đăng xuất thành công!");
}
// --- XỬ LÝ GỬI FORM ĐĂNG NHẬP LÊN BACKEND ---
const loginForm = document.getElementById('loginForm');
if(loginForm) { // Thêm lệnh if để tránh lỗi nếu trang không có thẻ form này
    loginForm.addEventListener('submit', async function(event) {
        event.preventDefault(); 
        
        const email = document.getElementById('emailInput').value;
        const password = document.getElementById('passwordInput').value;
        
        try {
            const response = await fetch('https://sunbrain.onrender.com/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: email, password: password })
            });
            
            const result = await response.json();
            
            if (response.ok) {
                localStorage.setItem('currentUser', JSON.stringify(result.user_info));
                alert('Đăng nhập thành công! Xin chào, ' + result.user_info.name);
                closeLoginModal();
                checkLoginStatus();
                document.getElementById('emailInput').value = '';
                document.getElementById('passwordInput').value = '';
            } else {
                alert('Lỗi: ' + result.detail);
            }
        } catch (error) {
            console.error('Lỗi kết nối server:', error);
            alert('Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại backend!');
        }
    });
}
// --- XỬ LÝ GỬI FORM ĐĂNG KÝ LÊN BACKEND ---
const registerForm = document.getElementById('registerForm');
if(registerForm) {
    registerForm.addEventListener('submit', async function(event) {
        event.preventDefault(); // Ngăn trình duyệt tải lại trang
        
        // Lấy dữ liệu người dùng nhập
        const name = document.getElementById('regNameInput').value;
        const email = document.getElementById('regEmailInput').value;
        const password = document.getElementById('regPasswordInput').value;
        
        try {
            // Gửi dữ liệu xuống Python trên Render
            const response = await fetch('https://sunbrain.onrender.com/api/register', {
                method: 'POST',

                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    name: name, 
                    email: email, 
                    password: password 
                })
            });
            
            const result = await response.json();
            
            if (response.ok) {
                alert('Đăng ký thành công! Vui lòng đăng nhập bằng tài khoản vừa tạo.');
                
                // Xóa rỗng các ô vừa nhập
                document.getElementById('regNameInput').value = '';
                document.getElementById('regEmailInput').value = '';
                document.getElementById('regPasswordInput').value = '';
                
                // Tự động gạt sang màn hình Đăng nhập
                toggleAuthForms('login');
            } else {
                alert('Lỗi: ' + result.detail);
            }
        } catch (error) {
            console.error('Lỗi kết nối server:', error);
            alert('Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại backend!');
        }
    });
}