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
// HỆ THỐNG CHUYỂN TRANG (MENU ĐIỀU HƯỚNG)
// ==========================================
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
// TÍNH NĂNG BANNER SLIDER (TỰ ĐỘNG CHUYỂN)
// ==========================================
let slideIndex = 0;
let slideInterval;

function showSlides(n) {
    let slides = document.getElementsByClassName("slide");
    let dots = document.getElementsByClassName("dot");
    
    if (slides.length === 0) return; // Nếu không có banner thì bỏ qua

    if (n >= slides.length) { slideIndex = 0; }
    if (n < 0) { slideIndex = slides.length - 1; }

    for (let i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    for (let i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(" active", "");
    }

    slides[slideIndex].style.display = "block";
    dots[slideIndex].className += " active";
}

// Bấm mũi tên
function changeSlide(n) {
    slideIndex += n;
    showSlides(slideIndex);
    resetAutoSlide(); // Khởi động lại bộ đếm khi người dùng tự bấm
}

// Bấm dấu chấm
function currentSlide(n) {
    slideIndex = n;
    showSlides(slideIndex);
    resetAutoSlide();
}

// Hàm tự động chuyển ảnh
function autoSlide() {
    slideIndex++;
    showSlides(slideIndex);
}

// Hàm khởi động lại thời gian 
function resetAutoSlide() {
    clearInterval(slideInterval);
    slideInterval = setInterval(autoSlide, 4000); // Cứ 4 giây tự chuyển 1 lần
}

// ==========================================
// 2. TÍNH NĂNG THANH TOÁN & LƯU LỊCH SỬ (TẠO QR CODE)
// ==========================================

function thanhToan(tenMon) {
    const userString = localStorage.getItem('currentUser');
    if (!userString) {
        alert("Vui lòng đăng nhập tài khoản để tiến hành mua tài liệu nhé!");
        openLoginModal(); 
        return; 
    }

    const NganHang = "BIDV"; 
    const SoTaiKhoan = "6612920731"; 
    const TenChuTaiKhoan = "LE MINH NHAT"; 
    
    let giaTien = 49000; 
    
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

        setTimeout(() => {
            const daChuyenKhoan = confirm("Hệ thống: Bạn đã hoàn tất chuyển khoản chưa?\n(Bấm OK để xác nhận và nhận tài liệu về máy)");
            
            if (daChuyenKhoan) {
                luuLichSuMuaHang(tenMon);
                alert("🎉 Thanh toán thành công! Tài liệu đã được thêm vào mục 'Lịch sử mua hàng' trong tài khoản của bạn.");
            }
        }, 2000); 
    }
}

async function luuLichSuMuaHang(tenMon) {
    let userString = localStorage.getItem('currentUser');
    if (!userString) return;
    let user = JSON.parse(userString);

    try {
        const response = await fetch('https://sunbrain.onrender.com/api/purchase', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                email: user.email, 
                item: tenMon 
            })
        });

        if (response.ok) {
            const result = await response.json();
            user.purchases = result.purchases;
            localStorage.setItem('currentUser', JSON.stringify(user));
            showProfile(); 
        } else {
            console.error("Lỗi từ server:", await response.text());
        }
    } catch (error) {
        console.error("Lỗi kết nối server:", error);
    }
}

// ==========================================
// 3. TÍNH NĂNG TÀI KHOẢN (ĐĂNG NHẬP / ĐĂNG KÝ)
// ==========================================

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
    toggleAuthForms('login'); 
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
        const pdfLinks = {
            'Triết học': 'https://drive.google.com/',
            'Kinh tế Chính trị': 'https://drive.google.com/',
            'Chủ nghĩa Xã hội Khoa học': 'https://drive.google.com/',
            'Tư tưởng Hồ Chí Minh': 'https://drive.google.com/',
            'Lịch sử Đảng': 'https://drive.google.com/',
            'Combo 2 Môn': 'https://drive.google.com/',
            'Combo 3 Môn': 'https://drive.google.com/'
        };

        user.purchases.forEach(mon => {
            const link = pdfLinks[mon] || '#';
            const li = document.createElement('li');
            li.style.marginBottom = '12px';
            li.style.listStyleType = 'none';
            li.innerHTML = `
                ✅ <strong>${mon}</strong> 
                <a href="${link}" target="_blank" style="margin-left: 10px; background-color: #2e8b57; color: white; padding: 5px 10px; text-decoration: none; border-radius: 4px; font-size: 14px;">
                    ⬇️ Tải PDF
                </a>
            `;
            historyList.appendChild(li);
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

const loginForm = document.getElementById('loginForm');
if(loginForm) { 
    loginForm.addEventListener('submit', async function(event) {
        event.preventDefault(); 
        
        const email = document.getElementById('emailInput').value;
        const password = document.getElementById('passwordInput').value;
        
        try {
            const response = await fetch('https://sunbrain.onrender.com/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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

const registerForm = document.getElementById('registerForm');
if(registerForm) {
    registerForm.addEventListener('submit', async function(event) {
        event.preventDefault(); 
        
        const name = document.getElementById('regNameInput').value;
        const email = document.getElementById('regEmailInput').value;
        const password = document.getElementById('regPasswordInput').value;
        
        try {
            const response = await fetch('https://sunbrain.onrender.com/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name, email: email, password: password })
            });
            
            const result = await response.json();
            
            if (response.ok) {
                alert('Đăng ký thành công! Vui lòng đăng nhập bằng tài khoản vừa tạo.');
                document.getElementById('regNameInput').value = '';
                document.getElementById('regEmailInput').value = '';
                document.getElementById('regPasswordInput').value = '';
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

// ==========================================
// TÍNH NĂNG POPUP THÔNG BÁO CHÀO MỪNG
// ==========================================

function showWelcomePopup() {
    const popup = document.getElementById('welcomePopup');
    if (!sessionStorage.getItem('popupShown') && popup) {
        popup.style.display = 'flex';
        sessionStorage.setItem('popupShown', 'true');
    }
}

function closePopup() {
    const popup = document.getElementById('welcomePopup');
    if (popup) {
        popup.style.display = 'none';
    }
}

function goToPromo() {
    closePopup(); 
    showSection('homeSection'); 
    
    window.scrollTo({
        top: 600, 
        behavior: 'smooth'
    });
}

// ==========================================
// KHỞI ĐỘNG CÁC TÍNH NĂNG KHI TẢI TRANG
// ==========================================
window.onload = function() {
    checkLoginStatus();
    
    // 1. KHỞI ĐỘNG BANNER SLIDER
    showSlides(slideIndex);
    slideInterval = setInterval(autoSlide, 4000); 
    
    // 2. BẬT POPUP SAU KHI TẢI TRANG 1 GIÂY
    setTimeout(showWelcomePopup, 1000); 
};