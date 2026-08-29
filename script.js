// ==========================================
// THÔNG TIN CẤU HÌNH (DỄ DÀNG CHỈNH SỬA TẠI ĐÂY)
// ==========================================
const CONFIG = {
    API_URL: 'https://sunbrain.onrender.com/api',
    BANK: {
        nganHang: "BIDV",
        soTaiKhoan: "6612920731",
        tenChuTaiKhoan: "LE MINH NHAT"
    },
    PDF_LINKS: {
        'Triết học': 'https://drive.google.com/',
        'Kinh tế Chính trị': 'https://drive.google.com/',
        'Chủ nghĩa Xã hội Khoa học': 'https://drive.google.com/',
        'Tư tưởng Hồ Chí Minh': 'https://drive.google.com/',
        'Lịch sử Đảng': 'https://drive.google.com/'
    }
};

// ==========================================
// 1. TÍNH NĂNG GIAO DIỆN & TÌM KIẾM
// ==========================================

// Chuẩn hóa tiếng Việt có dấu thành không dấu
function removeVietnameseAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();
}

// Xử lý tìm kiếm môn học
document.getElementById('searchInput')?.addEventListener('input', function(e) {
    const searchTerm = removeVietnameseAccents(e.target.value);
    const cards = document.querySelectorAll('.grid .card');
    
    cards.forEach(card => {
        const titleElement = card.querySelector('.card-title');
        if (titleElement) {
            const titleText = removeVietnameseAccents(titleElement.innerText);
            card.classList.toggle('hidden', !titleText.includes(searchTerm));
        }
    });
});

// Hệ thống điều hướng (Chuyển trang)
function showSection(sectionId) {
    const allSections = ['homeSection', 'socialSection', 'otherSection', 'freeSection', 'profileSection'];
    allSections.forEach(id => {
        const sec = document.getElementById(id);
        if (sec) sec.style.display = 'none';
    });
    
    const activeSec = document.getElementById(sectionId);
    if (activeSec) activeSec.style.display = 'block';
}

function showHome() { 
    showSection('homeSection'); 
}

// ==========================================
// 2. TÍNH NĂNG BANNER SLIDER
// ==========================================
let slideIndex = 0;
let slideInterval;

function showSlides(n) {
    const slides = document.getElementsByClassName("slide");
    const dots = document.getElementsByClassName("dot");
    
    if (slides.length === 0) return; 

    if (n >= slides.length) slideIndex = 0;
    if (n < 0) slideIndex = slides.length - 1;

    Array.from(slides).forEach(slide => slide.style.display = "none");
    Array.from(dots).forEach(dot => dot.className = dot.className.replace(" active", ""));

    slides[slideIndex].style.display = "block";
    dots[slideIndex].className += " active";
}

function changeSlide(n) {
    slideIndex += n;
    showSlides(slideIndex);
    resetAutoSlide(); 
}

function currentSlide(n) {
    slideIndex = n;
    showSlides(slideIndex);
    resetAutoSlide();
}

function autoSlide() {
    slideIndex++;
    showSlides(slideIndex);
}

function resetAutoSlide() {
    clearInterval(slideInterval);
    slideInterval = setInterval(autoSlide, 4000); 
}

// ==========================================
// 3. TÍNH NĂNG THANH TOÁN & MUA COMBO
// ==========================================
let currentCombo = { type: '', max: 0, price: 0 };

// Xử lý nút Mua ngay
function thanhToan(tenMon) {
    if (!localStorage.getItem('currentUser')) {
        alert("Vui lòng đăng nhập tài khoản để tiến hành mua tài liệu nhé!");
        return openLoginModal(); 
    }

    const combos = {
        'Combo 2 Môn': { name: 'Combo 2 Môn Đại Cương', count: 2, price: 79000 },
        'Combo 3 Môn': { name: 'Combo 3 Môn Đại Cương', count: 3, price: 107000 }
    };

    if (combos[tenMon]) {
        moChonCombo(combos[tenMon].name, combos[tenMon].count, combos[tenMon].price);
    } else if (tenMon === 'Combo 5 Môn') {
        const allSubjects = Object.keys(CONFIG.PDF_LINKS);
        thanhToanThucTe('Combo FULL 5 Môn', 149000, allSubjects);
    } else {
        thanhToanThucTe(tenMon, 49000, [tenMon]);
    }
}

// Hiện khung chọn môn học
function moChonCombo(loaiCombo, soLuong, giaTien) {
    currentCombo = { type: loaiCombo, max: soLuong, price: giaTien };
    
    document.querySelectorAll('input[name="subject"]').forEach(cb => cb.checked = false);
    document.getElementById('comboTitle').innerText = loaiCombo;
    document.getElementById('comboDesc').innerText = `Vui lòng tích chọn chính xác ${soLuong} môn học bạn muốn nhận:`;
    document.getElementById('comboModal').style.display = 'flex';
}

function xacNhanChonCombo() {
    const checkedBoxes = Array.from(document.querySelectorAll('input[name="subject"]:checked'));
    if (checkedBoxes.length !== currentCombo.max) {
        return alert(`Vui lòng tích chọn chính xác ${currentCombo.max} môn học! (Bạn đang chọn ${checkedBoxes.length})`);
    }
    
    closeModal('comboModal');
    thanhToanThucTe(currentCombo.type, currentCombo.price, checkedBoxes.map(cb => cb.value));
}

// Xử lý hiển thị QR và gọi API lưu đơn hàng
function thanhToanThucTe(tenGoi, giaTien, danhSachMon) {
    const { nganHang, soTaiKhoan, tenChuTaiKhoan } = CONFIG.BANK;
    const noiDungCK = `Mua ${tenGoi}`;
    const linkQR = `https://img.vietqr.io/image/${nganHang}-${soTaiKhoan}-compact2.png?amount=${giaTien}&addInfo=${encodeURIComponent(noiDungCK)}&accountName=${encodeURIComponent(tenChuTaiKhoan)}`;

    const monHocText = danhSachMon.join(', ');
    const xacNhan = confirm(`🛒 Xác nhận mua đơn hàng:\n- Gói: ${tenGoi}\n- Chi tiết: ${monHocText}\n- Số tiền: ${giaTien.toLocaleString('vi-VN')} VNĐ\n\nBấm "OK" để hiển thị mã QR thanh toán!`);
    
    if (xacNhan) {
        window.open(linkQR, "_blank");

        setTimeout(() => {
            if (confirm("Hệ thống: Bạn đã hoàn tất chuyển khoản chưa?\n(Bấm OK để xác nhận và nhận tài liệu)")) {
                xuLyLuuNhieuMon(danhSachMon);
            }
        }, 2000); 
    }
}

async function xuLyLuuNhieuMon(danhSachMon) {
    let user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) return;

    try {
        for (let mon of danhSachMon) {
            const response = await fetch(`${CONFIG.API_URL}/purchase`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: user.email, item: mon })
            });
            if (response.ok) {
                const result = await response.json();
                user.purchases = result.purchases;
            }
        }
        
        localStorage.setItem('currentUser', JSON.stringify(user));
        alert("🎉 Thanh toán thành công! Tài liệu đã được thêm vào tài khoản của bạn.");
        
        closeModal('comboModal');
        showProfile(); 

    } catch (error) {
        console.error("Lỗi lưu đơn hàng:", error);
        alert("Lỗi kết nối máy chủ. Vui lòng thử lại!");
    }
}

// ==========================================
// 4. TÍNH NĂNG TÀI KHOẢN & XÁC THỰC
// ==========================================

function toggleAuthForms(formType) {
    const isRegister = formType === 'register';
    document.getElementById('loginForm').style.display = isRegister ? 'none' : 'block';
    document.getElementById('registerForm').style.display = isRegister ? 'block' : 'none';
    
    const modalTitle = document.getElementById('modalTitle');
    if (modalTitle) modalTitle.innerText = isRegister ? 'Đăng ký tài khoản' : 'Đăng nhập hệ thống';
}

function openLoginModal() {
    document.getElementById('loginModal').style.display = 'flex';
    toggleAuthForms('login'); 
}

function openRegister() {
    openLoginModal(); 
    toggleAuthForms('register'); 
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'none';
}

// Đóng các popup khi click ra ngoài vùng nền đen
window.onclick = function(event) {
    ['loginModal', 'comboModal', 'welcomePopup'].forEach(id => {
        const modal = document.getElementById(id);
        if (event.target === modal) modal.style.display = 'none';
    });
}

function checkLoginStatus() {
    const userString = localStorage.getItem('currentUser');
    const authActions = document.getElementById('authActions');
    if (!authActions) return;

    if (userString) {
        const user = JSON.parse(userString);
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

function showProfile() {
    const userString = localStorage.getItem('currentUser');
    if (!userString) return;
    
    const user = JSON.parse(userString);
    document.getElementById('profileName').innerText = user.name;
    document.getElementById('profileEmail').innerText = user.email;

    const historyList = document.getElementById('purchaseHistory');
    historyList.innerHTML = ''; 

    if (!user.purchases || user.purchases.length === 0) {
        historyList.innerHTML = '<li style="color: gray;">Bạn chưa mua tài liệu nào.</li>';
    } else {
        user.purchases.forEach(mon => {
            const link = CONFIG.PDF_LINKS[mon] || '#';
            historyList.innerHTML += `
                <li style="margin-bottom: 12px; list-style: none;">
                    ✅ <strong>${mon}</strong> 
                    <a href="${link}" target="_blank" style="margin-left: 10px; background-color: #2e8b57; color: white; padding: 5px 10px; text-decoration: none; border-radius: 4px; font-size: 14px;">
                        ⬇️ Tải PDF
                    </a>
                </li>
            `;
        });
    }

    showSection('profileSection');
}

function logout() {
    localStorage.removeItem('currentUser'); 
    checkLoginStatus(); 
    showHome(); 
    alert("Bạn đã đăng xuất thành công!");
}

// Xử lý API Đăng Nhập
document.getElementById('loginForm')?.addEventListener('submit', async function(e) {
    e.preventDefault(); 
    try {
        const response = await fetch(`${CONFIG.API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                email: document.getElementById('emailInput').value, 
                password: document.getElementById('passwordInput').value 
            })
        });
        const result = await response.json();
        
        if (response.ok) {
            localStorage.setItem('currentUser', JSON.stringify(result.user_info));
            alert('Đăng nhập thành công! Xin chào, ' + result.user_info.name);
            closeModal('loginModal');
            checkLoginStatus();
            this.reset(); // Xóa rỗng form
        } else {
            alert('Lỗi: ' + result.detail); 
        }
    } catch (error) { 
        alert('Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại backend!'); 
    }
});

// Xử lý API Đăng Ký
document.getElementById('registerForm')?.addEventListener('submit', async function(e) {
    e.preventDefault(); 
    try {
        const response = await fetch(`${CONFIG.API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                name: document.getElementById('regNameInput').value, 
                email: document.getElementById('regEmailInput').value, 
                password: document.getElementById('regPasswordInput').value 
            })
        });
        const result = await response.json();
        
        if (response.ok) {
            alert('Đăng ký thành công! Vui lòng đăng nhập bằng tài khoản vừa tạo.');
            this.reset();
            toggleAuthForms('login');
        } else { 
            alert('Lỗi: ' + result.detail); 
        }
    } catch (error) { 
        alert('Không thể kết nối đến máy chủ backend!'); 
    }
});

// ==========================================
// 5. KHỞI ĐỘNG & POPUP
// ==========================================

function showWelcomePopup() {
    if (!sessionStorage.getItem('popupShown')) {
        document.getElementById('welcomePopup').style.display = 'flex';
        sessionStorage.setItem('popupShown', 'true');
    }
}

function goToPromo() {
    closeModal('welcomePopup'); 
    showHome(); 
    window.scrollTo({ top: 600, behavior: 'smooth' });
}

// Khởi chạy mọi thứ khi trang web vừa load xong
window.onload = function() {
    checkLoginStatus();
    showSlides(slideIndex);
    slideInterval = setInterval(autoSlide, 4000); 
    setTimeout(showWelcomePopup, 1000); 
};