// 구글 Apps Script 웹 앱 URL (배포 후 여기에 붙여넣기)
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz8Tesy4OmY_IkM7SNb3UR1S8_p9yJsvl3xJYuaLYeNMcNiuTqmL6thdnKcuvoD0cIKjw/exec';

// DOM 요소
const card = document.getElementById('card');
const cardContainer = document.getElementById('cardContainer');
const participationForm = document.getElementById('participationForm');

// 카드 뒤집기 상태
let isFlipped = false;

// 카드 앞면 클릭 이벤트
document.querySelector('.card-front').addEventListener('click', (e) => {
    if (!isFlipped) {
        flipCard();
    }
});

// 바깥쪽 클릭 이벤트 - 카드 외부 클릭 시 앞면으로
document.body.addEventListener('click', (e) => {
    // 카드 영역이 아닌 곳을 클릭했을 때
    if (isFlipped && !card.contains(e.target)) {
        flipCard();
    }
});

// 카드 클릭 시 이벤트 전파 중지 (바깥쪽 클릭 이벤트 방지)
card.addEventListener('click', (e) => {
    e.stopPropagation();
});

// 카드 뒤집기 함수
function flipCard() {
    isFlipped = !isFlipped;
    card.classList.toggle('flipped');
    
    // 뒤집힐 때 폼 초기화
    if (isFlipped) {
        resetForm();
    }
}

// 폼 제출 이벤트
participationForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // 폼 데이터 수집
    const formData = {
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim(),
        contact: document.getElementById('contact').value.trim(),
        confirmed: document.getElementById('confirmed').checked
    };
    
    // 유효성 검사
    const submitBtn = participationForm.querySelector('.submit-btn');
    const originalBtnText = '참여 신청하기';
    
    if (!formData.name || !formData.email || !formData.contact) {
        submitBtn.textContent = '모든 항목을 입력해주세요';
        submitBtn.style.background = 'rgba(255, 255, 255, 0.5)';
        setTimeout(() => {
            submitBtn.textContent = originalBtnText;
            submitBtn.style.background = '';
        }, 2000);
        return;
    }
    
    if (!formData.confirmed) {
        submitBtn.textContent = '확인 체크박스를 선택해주세요';
        submitBtn.style.background = 'rgba(255, 255, 255, 0.5)';
        setTimeout(() => {
            submitBtn.textContent = originalBtnText;
            submitBtn.style.background = '';
        }, 2000);
        return;
    }
    
    // 제출 버튼 상태 변경
    submitBtn.disabled = true;
    submitBtn.textContent = '제출 중...';
    
    try {
        // Google Apps Script로 데이터 전송
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', // CORS 우회
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        // no-cors 모드에서는 응답을 읽을 수 없으므로 성공으로 간주
        submitBtn.textContent = '✓ 신청해주셔서 감사합니다. 곧 확정 연락을 드리겠습니다.';
        submitBtn.style.background = 'rgba(255, 255, 255, 0.9)';
        
        // 3초 후 카드 뒤집기
        setTimeout(() => {
            flipCard();
        }, 2500);
        
    } catch (error) {
        console.error('Error:', error);
        submitBtn.textContent = '오류 발생 - 다시 시도해주세요';
        submitBtn.style.background = 'rgba(255, 255, 255, 0.5)';
        
        // 3초 후 원래 상태로 복구
        setTimeout(() => {
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
            submitBtn.style.background = '';
        }, 3000);
    }
});

// 폼 초기화 함수
function resetForm() {
    participationForm.reset();
    const submitBtn = participationForm.querySelector('.submit-btn');
    submitBtn.disabled = false;
    submitBtn.textContent = '참여 신청하기';
    submitBtn.style.background = '';
}

// ESC 키로 카드 뒤집기
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isFlipped) {
        flipCard();
    }
});

// 연락처 입력 포맷팅 (선택사항)
const contactInput = document.getElementById('contact');
contactInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/[^0-9]/g, '');
    
    if (value.length > 3 && value.length <= 7) {
        value = value.slice(0, 3) + '-' + value.slice(3);
    } else if (value.length > 7) {
        value = value.slice(0, 3) + '-' + value.slice(3, 7) + '-' + value.slice(7, 11);
    }
    
    e.target.value = value;
});

