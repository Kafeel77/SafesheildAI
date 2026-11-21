/* ScamShield AI app logic.
   AI analysis goes through our own backend (/api/*) so the API key is never in the frontend.
   If the backend or AI is unavailable, we fall back to on-device rule checks and clearly
   label the result as an offline rule-based check (demo), never as genuine AI analysis. */

const API_BASE = ''; // same origin
let LANG = localStorage.getItem('ss_lang') || 'en';

// Languages offered in the dropdown menu
const LANGS = [
  { code: 'en', label: 'English',    speech: 'en-MY' },
  { code: 'bm', label: 'Bahasa Malaysia', speech: 'ms-MY' },
  { code: 'zh', label: '中文 (Chinese)',   speech: 'zh-CN' },
  { code: 'ta', label: 'தமிழ் (Tamil)',   speech: 'ta-IN' }
];
const speechLang = () => (LANGS.find(l => l.code === LANG) || LANGS[0]).speech;

// ---------- i18n strings ----------
const I18N = {
  en: {
    tagline: "Your Safety Matters. We Are Here to Protect You.",
    navHome: "Home", navDetect: "Check Message", navInvest: "Job / Invest", navLink: "Check Link", navAsk: "Ask AI", navEmergency: "Emergency",
    welcomeTitle: "Welcome!", welcomeMsg: "Your Safety Matters. We Are Here to Protect You.",
    homeCheckMsg: "Check Message", homeCheckMsgSub: "Paste a WhatsApp or SMS message",
    homeCheckShot: "Check Screenshot", homeCheckShotSub: "Take a photo of the message and check it",
    homeCheckLink: "Check Link", homeCheckLinkSub: "Is this website safe to open?",
    homeAskAI: "Ask AI", homeAskAISub: "Ask any question about scams",
    homeEmergency: "Emergency Help", homeEmergencySub: "I think I was scammed — what now?",
    detectTitle: "Scam Message Detector", detectSub: "Paste a WhatsApp / SMS message, or upload a screenshot. We check it for scam warning signs.",
    pasteMsg: "Paste the message here:", msgPlaceholder: "e.g. Your bank account will be blocked today. Click this link and pay RM500...",
    orShot: "📷 Or check a screenshot:", choosePhoto: "Choose photo of the message",
    checkMsgBtn: "Check this message", analyzing: "Checking for scam signs…",
    investTitle: "TikTok Job & Investment Checker", investSub: "Before putting money in an \"opportunity\" or accepting a job offer (e.g. from TikTok or WhatsApp), describe it here.",
    describeOffer: "Describe the investment or job offer:", investPlaceholder: "e.g. A WhatsApp group says: pay RM10,000, earn RM3,000 daily doing simple tasks on TikTok...",
    isScamBtn: "Is this a scam?", goldenRule: "Golden rule:",
    goldenRuleText: "Any investment promising guaranteed, high daily returns is a scam — real markets go up and down. Real jobs never ask you to pay first.",
    linkTitle: "Suspicious Link Checker", linkSub: "Paste a link to inspect it without opening it. We only look at the text of the link, never visit it.",
    pasteLink: "Paste the link:", checkLinkBtn: "Check this link",
    askTitle: "Ask AI for Help", askSub: "Type or 🎤 speak your question. Example: \"Someone is asking for my bank OTP. What should I do?\"",
    askPlaceholder: "Type your question here...", listening: "Listening... speak now", getHelpBtn: "Get Help",
    thinking: "AI is thinking…", commonQs: "Common questions:",
    emgTitle: "🚨 Emergency Safety Guide", emgSub: "If you think money or details are already compromised — act fast, in this order.",
    emg1h: "1. Money was sent or OTP shared", emg1a: "Call your bank's number printed on your card or bank statement right now.", emg1b: "Ask them to freeze / block your account and cards.", emg1c: "Ask for a complaint/reference number and write it down.",
    emg2h: "2. Report the fraud immediately", emg2a: "Call Malaysia's National Scam Response Centre (NSRC) at 997 — reporting fast gives the best chance of stopping the payment.", emg2b: "Note: official contact details can change — always verify the current NSRC number on official government websites.", emg2c: "Save screenshots of the scam messages as evidence — do not delete the chat.",
    emg3h: "3. If you shared your phone/email password", emg3a: "Change that password immediately from a safe device.", emg3b: "Sign out of all devices in your Google/Apple account settings.", emg3c: "Turn on 2-step verification (2FA).",
    emg4h: "4. Block and preserve", emg4a: "Block the scammer's phone number and WhatsApp account.", emg4b: "Do not delete chats or messages — they are evidence for the police and bank.", emg4c: "Check your bank statements for unknown transactions.",
    emg5h: "5. Tell someone", emg5a: "Scammers rely on silence. Inform a family member — it is not your fault.", emg5b: "Scamming is a crime; the police help victims of any age.",
    call997: "Call 997", call999: "Call 999",
    nsrcSmall: "National Scam Response Centre (Malaysia)", policeSmall: "Police",
    goldenHour: "Golden hour: reporting within the first hour gives the best chance of stopping the payment.",
    verifyNote: "Please verify the current official NSRC number at official Malaysian government websites.",
    footer: "Your data stays on this device. ScamShield AI is a helper — always double-check with your bank or family.",
    readAloud: "Read this result aloud", aiOffline: "AI assistant is offline — using built-in safety rules (offline check).",
    aiOnline: "AI assistant is connected.", aiChecking: "AI status: checking…",
    verdictHigh: "⚠️ HIGH RISK — LIKELY A SCAM", verdictHighSub: "Do NOT click, reply, or pay anything.",
    verdictMid: "🤔 POTENTIAL RISK", verdictMidSub: "Check carefully before trusting this.",
    verdictLow: "✅ NO OBVIOUS WARNING SIGNS", verdictLowSub: "But stay careful — new scams appear every day.",
    riskyLink: "RISKY LINK", avoidOpening: "Better to avoid opening it.",
    demoNote: "Result from built-in safety rules (offline). Not a genuine AI analysis.",
    aiNote: "Result from genuine AI analysis.",
    emptyMsg: "Please paste a message first.", emptyOffer: "Please describe the offer first.", emptyLink: "Please paste a link first.",
    errNet: "Could not reach the AI service. Showing the offline safety-rule check instead.",
    speakUnsupported: "Sorry, read-aloud is not supported in this browser.",
    whatToDo: "What to do:", noFindings: "No scam patterns detected. Still — never share OTP or PIN.",
    noFindingsInv: "No obvious red flags. Still verify before investing.",
    langSwitched: "Language switched to English. How can I help you?",
    botGreet: "Welcome! 👋 I'm your safety assistant. Ask me anything, for example: <i>\"Someone offered me RM500 daily through TikTok. Is it genuine?\"</i>",
    offlineAnswer: "Built-in answer (offline)",
    listen: "Listen",
    adviceMsg: ["Stop — don't tap links or share OTP.", "Delete or report the message.", "If you already shared details, call your bank NOW and block your account.", "Report to NSRC <b>997</b>."],
    adviceInv: ["Do not send money — you will not get it back easily.", "Leave the WhatsApp/Telegram group and report it.", "If already paid, call NSRC <b>997</b> immediately.", "Genuine investments: use Securities Commission-registered advisors only (check at sc.com.my)."],
    adviceLink: "1. Don't tap it. Don't reply to whoever sent it.<br>2. If it claims to be your bank, open the bank's official app or type the bank's real web address yourself.<br>3. Report the message; if you already opened it and entered details, call the bank and NSRC <b>997</b> now.<br><i>Note: we only inspect the link's text — we never visit it. A clean-looking link can still be new and dangerous. When in doubt, don't click.</i>"
  },
  bm: {
    tagline: "Keselamatan Anda Penting. Kami Di Sini Untuk Melindungi Anda.",
    navHome: "Utama", navDetect: "Semak Mesej", navInvest: "Kerja / Pelaburan", navLink: "Semak Pautan", navAsk: "Tanya AI", navEmergency: "Kecemasan",
    welcomeTitle: "Selamat Datang!", welcomeMsg: "Keselamatan Anda Penting. Kami Di Sini Untuk Melindungi Anda.",
    homeCheckMsg: "Semak Mesej", homeCheckMsgSub: "Tampal mesej WhatsApp atau SMS",
    homeCheckShot: "Semak Tangkapan Skrin", homeCheckShotSub: "Ambil gambar mesej dan semak ia",
    homeCheckLink: "Semak Pautan", homeCheckLinkSub: "Adakah laman web ini selamat?",
    homeAskAI: "Tanya AI", homeAskAISub: "Tanya apa-apa soalan tentang penipuan",
    homeEmergency: "Bantuan Kecemasan", homeEmergencySub: "Saya rasa saya kena tipu — apa nak buat?",
    detectTitle: "Pengesan Mesej Penipuan", detectSub: "Tampal mesej WhatsApp / SMS, atau muat naik tangkapan skrin. Kami semak untuk tanda-tanda penipuan.",
    pasteMsg: "Tampal mesej di sini:", msgPlaceholder: "cth. Akaun bank anda akan disekat hari ini. Klik pautan ini dan bayar RM500...",
    orShot: "📷 Atau semak tangkapan skrin:", choosePhoto: "Pilih gambar mesej",
    checkMsgBtn: "Semak mesej ini", analyzing: "Menyemak tanda-tanda penipuan…",
    investTitle: "Pemeriksa Kerja TikTok & Pelaburan", investSub: "Sebelum memasukkan wang dalam 'peluang' atau menerima tawaran kerja (cth. dari TikTok atau WhatsApp), huraikan di sini.",
    describeOffer: "Huraikan tawaran pelaburan atau kerja:", investPlaceholder: "cth. Kumpulan WhatsApp kata: bayar RM10,000, dapat RM3,000 sehari buat tugasan mudah di TikTok...",
    isScamBtn: "Adakah ini penipuan?", goldenRule: "Peraturan emas:",
    goldenRuleText: "Sebarang pelaburan yang menjanjikan pulangan harian tinggi yang terjamin adalah penipuan — pasaran sebenar naik dan turun. Kerja sebenar tidak pernah minta anda bayar dahulu.",
    linkTitle: "Pemeriksa Pautan Meragukan", linkSub: "Tampal pautan untuk diperiksa TANPA membukanya. Kami hanya melihat teks pautan, tidak pernah melawatinya.",
    pasteLink: "Tampal pautan:", checkLinkBtn: "Semak pautan ini",
    askTitle: "Tanya AI untuk Bantuan", askSub: "Taip atau 🎤 sebut soalan anda. Contoh: \"Seseorang meminta OTP bank saya. Apa yang perlu saya buat?\"",
    askPlaceholder: "Taip soalan anda di sini...", listening: "Mendengar... sila sebut", getHelpBtn: "Dapatkan Bantuan",
    thinking: "AI sedang berfikir…", commonQs: "Soalan biasa:",
    emgTitle: "🚨 Panduan Kecemasan", emgSub: "Jika anda rasa wang atau maklumat anda telah terjejas — bertindak pantas, mengikut urutan ini.",
    emg1h: "1. Wang telah dihantar atau OTP dikongsi", emg1a: "Hubungi nombor bank anda yang tertera pada kad atau penyata bank SEKARANG.", emg1b: "Minta mereka membekukan / menyekat akaun dan kad anda.", emg1c: "Minta nombor rujukan aduan dan catat ia.",
    emg2h: "2. Laporkan penipuan dengan segera", emg2a: "Hubungi Pusat Respons Penipuan Kebangsaan (NSRC) Malaysia di 997 — laporan pantas memberi peluang terbaik untuk menghentikan bayaran.", emg2b: "Nota: butiran hubungan rasmi boleh berubah — sentiasa sahkan nombor NSRC terkini di laman web kerajaan rasmi.", emg2c: "Simpan tangkapan skrin mesej penipuan sebagai bukti — jangan padam perbualan.",
    emg3h: "3. Jika anda kongsi kata laluan telefon/e-mel", emg3a: "Tukar kata laluan itu serta-merta dari peranti selamat.", emg3b: "Log keluar dari semua peranti dalam tetapan akaun Google/Apple anda.", emg3c: "Aktifkan pengesahan 2 langkah (2FA).",
    emg4h: "4. Sekat dan simpan bukti", emg4a: "Sekat nombor telefon dan akaun WhatsApp penipu.", emg4b: "Jangan padam perbualan atau mesej — ia adalah bukti untuk polis dan bank.", emg4c: "Semak penyata bank anda untuk transaksi tidak dikenali.",
    emg5h: "5. Beritahu seseorang", emg5a: "Penipu bergantung pada kesunyian. Beritahu ahli keluarga — itu bukan salah anda.", emg5b: "Menipu adalah jenayah; polis membantu mangsa pada semua peringkat umur.",
    call997: "Hubungi 997", call999: "Hubungi 999",
    nsrcSmall: "Pusat Respons Penipuan Kebangsaan (Malaysia)", policeSmall: "Polis",
    goldenHour: "Jam keemasan: laporan dalam jam pertama memberi peluang terbaik untuk menghentikan bayaran.",
    verifyNote: "Sila sahkan nombor NSRC rasmi terkini di laman web kerajaan Malaysia yang rasmi.",
    footer: "Data anda kekal pada peranti ini. ScamShield AI adalah pembantu — sentiasa semak semula dengan bank atau keluarga anda.",
    readAloud: "Baca keputusan ini dengan kuat", aiOffline: "Pembantu AI tidak dalam talian — menggunakan peraturan keselamatan terbina dalam (semakan luar talian).",
    aiOnline: "Pembantu AI telah disambungkan.", aiChecking: "Status AI: menyemak…",
    verdictHigh: "⚠️ RISIKO TINGGI — KEMUNGKINAN PENIPUAN", verdictHighSub: "Jangan klik, balas, atau bayar apa-apa.",
    verdictMid: "🤔 RISIKO BERPOTENSI", verdictMidSub: "Semak dengan teliti sebelum mempercayai ini.",
    verdictLow: "✅ TIADA TANDA AMARAN JELAS", verdictLowSub: "Tetapi berhati-hati — penipuan baharu muncul setiap hari.",
    riskyLink: "PAUTAN BERISIKO", avoidOpening: "Lebih baik elak membukanya.",
    demoNote: "Keputusan daripada peraturan keselamatan terbina dalam (luar talian). Bukan analisis AI sebenar.",
    aiNote: "Keputusan daripada analisis AI sebenar.",
    emptyMsg: "Sila tampal mesej dahulu.", emptyOffer: "Sila huraikan tawaran dahulu.", emptyLink: "Sila tampal pautan dahulu.",
    errNet: "Tidak dapat menghubungi perkhidmatan AI. Menunjukkan semakan peraturan keselamatan luar talian sebagai ganti.",
    speakUnsupported: "Maaf, baca-kuat tidak disokong dalam pelayar ini.",
    whatToDo: "Apa yang perlu dibuat:", noFindings: "Tiada corak penipuan dikesan. Tetap — jangan kongsi OTP atau PIN.",
    noFindingsInv: "Tiada tanda merah jelas. Tetap sahkan sebelum melabur.",
    langSwitched: "Bahasa ditukar ke Bahasa Malaysia. Apa yang boleh saya bantu?",
    botGreet: "Selamat datang! 👋 Saya pembantu keselamatan anda. Tanya apa-apa, contohnya: <i>\"Seseorang menawarkan RM500 sehari melalui TikTok. Adakah ia tulen?\"</i>",
    offlineAnswer: "Jawapan terbina dalam (luar talian)",
    listen: "Dengar",
    adviceMsg: ["Jangan tekan pautan atau kongsi OTP.", "Padam atau laporkan mesej itu.", "Jika anda telah kongsi maklumat, hubungi bank SEKARANG dan sekat akaun.", "Laporkan ke NSRC <b>997</b>."],
    adviceInv: ["Jangan hantar wang — sukar untuk mendapatkannya kembali.", "Tinggalkan kumpulan WhatsApp/Telegram dan laporkan.", "Jika sudah membayar, hubungi NSRC <b>997</b> dengan segera.", "Pelaburan sebenar: gunakan penasihat berdaftar dengan Suruhanjaya Sekuriti sahaja (semak di sc.com.my)."],
    adviceLink: "1. Jangan tekan pautan itu. Jangan balas kepada pengirim.<br>2. Jika ia mendakwa sebagai bank anda, buka aplikasi bank rasmi atau taip alamat web bank sendiri.<br>3. Laporkan mesej; jika anda sudah membukanya dan memasukkan maklumat, hubungi bank dan NSRC <b>997</b> sekarang.<br><i>Nota: kami hanya memeriksa teks pautan — kami tidak melawatinya. Apabila ragu-ragu, jangan klik.</i>"
  },
  zh: {
    tagline: "您的安全很重要。我们在这里保护您。",
    navHome: "首页", navDetect: "检查讯息", navInvest: "工作 / 投资", navLink: "检查链接", navAsk: "询问AI", navEmergency: "紧急求助",
    welcomeTitle: "欢迎！", welcomeMsg: "您的安全很重要。我们在这里保护您。",
    homeCheckMsg: "检查讯息", homeCheckMsgSub: "粘贴 WhatsApp 或短信内容",
    homeCheckShot: "检查截图", homeCheckShotSub: "拍下讯息照片并检查",
    homeCheckLink: "检查链接", homeCheckLinkSub: "这个网站安全吗？",
    homeAskAI: "询问AI", homeAskAISub: "提出任何关于骗案的疑问",
    homeEmergency: "紧急求助", homeEmergencySub: "我怀疑被骗了 — 该怎么办？",
    detectTitle: "骗案讯息检测器", detectSub: "粘贴 WhatsApp / 短讯内容，或上传截图。我们会检查是否有诈骗迹象。",
    pasteMsg: "在此粘贴讯息：", msgPlaceholder: "例如：您的银行账户今日将被冻结。点击此链接并支付 RM500...",
    orShot: "📷 或检查截图：", choosePhoto: "选择讯息照片",
    checkMsgBtn: "检查此讯息", analyzing: "正在检查诈骗迹象…",
    investTitle: "TikTok 工作与投资检查器", investSub: "在投入金钱或接受工作邀请（例如来自 TikTok 或 WhatsApp）之前，请在此描述。",
    describeOffer: "描述投资或工作邀请：", investPlaceholder: "例如：WhatsApp 群组说：支付 RM10,000，在 TikTok 做简单任务每天赚 RM3,000...",
    isScamBtn: "这是骗局吗？", goldenRule: "黄金法则：",
    goldenRuleText: "任何承诺保证高日回报的投资都是骗局 — 真实市场有涨有跌。真正的工作绝不会要求您先付款。",
    linkTitle: "可疑链接检查器", linkSub: "粘贴链接进行检查而【不打开】它。我们只查看链接文字，绝不访问该网站。",
    pasteLink: "粘贴链接：", checkLinkBtn: "检查此链接",
    askTitle: "询问AI求助", askSub: "输入或 🎤 说出您的问题。例如：\"有人要我提供银行 OTP，我该怎么办？\"",
    askPlaceholder: "在此输入您的问题...", listening: "正在聆听... 请说话", getHelpBtn: "获取帮助",
    thinking: "AI 正在思考…", commonQs: "常见问题：",
    emgTitle: "🚨 紧急安全指南", emgSub: "如果您认为金钱或资料已经外泄 — 请按以下顺序迅速行动。",
    emg1h: "1. 已汇款或已提供 OTP", emg1a: "立即拨打银行卡或银行结单上印有的银行电话。", emg1b: "要求他们冻结 / 封锁您的账户和卡。", emg1c: "索取投诉/参考编号并记录下来。",
    emg2h: "2. 立即举报骗案", emg2a: "拨打马来西亚国家诈骗应对中心 (NSRC) 997 — 尽快举报最有机会阻止付款。", emg2b: "注意：官方联络资料可能更改 — 请在官方政府网站核实最新的 NSRC 号码。", emg2c: "保存骗案讯息的截图作为证据 — 不要删除对话。",
    emg3h: "3. 如果您分享了手机/电邮密码", emg3a: "立即从安全的设备更改该密码。", emg3b: "在 Google/Apple 账户设置中登出所有设备。", emg3c: "开启双重验证 (2FA)。",
    emg4h: "4. 封锁并保存证据", emg4a: "封锁骗子的电话号码和 WhatsApp 账户。", emg4b: "不要删除对话或讯息 — 它们是给警方和银行的证据。", emg4c: "检查银行结单是否有不明交易。",
    emg5h: "5. 告诉别人", emg5a: "骗子依靠沉默。告知家人 — 这不是您的错。", emg5b: "诈骗是犯罪；警方帮助任何年龄的受害者。",
    call997: "拨打 997", call999: "拨打 999",
    nsrcSmall: "国家诈骗应对中心（马来西亚）", policeSmall: "警察",
    goldenHour: "黄金一小时：在第一个小时内举报最有机会阻止付款。",
    verifyNote: "请在马来西亚官方政府网站核实最新的官方 NSRC 号码。",
    footer: "您的资料只保留在此设备上。ScamShield AI 只是助手 — 请务必与银行或家人再次确认。",
    readAloud: "朗读此结果", aiOffline: "AI 助手离线 — 使用内置安全规则（离线检查）。",
    aiOnline: "AI 助手已连接。", aiChecking: "AI 状态：检查中…",
    verdictHigh: "⚠️ 高风险 — 很可能是骗局", verdictHighSub: "切勿点击、回复或支付任何款项。",
    verdictMid: "🤔 潜在风险", verdictMidSub: "在信任之前请仔细核实。",
    verdictLow: "✅ 无明显警告迹象", verdictLowSub: "但仍要小心 — 每天都出现新骗局。",
    riskyLink: "危险链接", avoidOpening: "最好不要打开。",
    demoNote: "结果来自内置安全规则（离线）。并非真正的 AI 分析。",
    aiNote: "结果来自真正的 AI 分析。",
    emptyMsg: "请先粘贴讯息。", emptyOffer: "请先描述该提议。", emptyLink: "请先粘贴链接。",
    errNet: "无法连接 AI 服务。改为显示离线安全规则检查结果。",
    speakUnsupported: "抱歉，此浏览器不支持朗读功能。",
    whatToDo: "该怎么做：", noFindings: "未检测到诈骗模式。不过 — 绝不分享 OTP 或 PIN。",
    noFindingsInv: "没有明显的危险信号。投资前仍须核实。",
    langSwitched: "已切换到中文。有什么可以帮您？",
    botGreet: "欢迎！👋 我是您的安全助手。请随意提问，例如：<i>\"有人在 TikTok 提供每天 RM500 的工作，是真的吗？\"</i>",
    offlineAnswer: "内置答案（离线）",
    listen: "收听",
    adviceMsg: ["停下 — 不要点击链接或分享 OTP。", "删除或举报该讯息。", "如果您已经分享资料，立即致电银行并封锁账户。", "举报至 NSRC <b>997</b>。"],
    adviceInv: ["不要汇款 — 很难取回。", "退出 WhatsApp/Telegram 群组并举报。", "如果已付款，立即致电 NSRC <b>997</b>。", "真正的投资：只使用证券委员会注册的顾问（在 sc.com.my 查证）。"],
    adviceLink: "1. 不要点击。不要回复发送者。<br>2. 如果声称是您的银行，请打开银行的官方应用或自己输入银行的正确网址。<br>3. 举报该讯息；如果您已打开并输入资料，立即致电银行和 NSRC <b>997</b>。<br><i>注意：我们只检查链接文字 — 绝不访问该网站。当有怀疑时，不要点击。</i>"
  },
  ta: {
    tagline: "உங்கள் பாதுகாப்பு முக்கியம். நாங்கள் உங்களைப் பாதுகாக்க இங்கே இருக்கிறோம்.",
    navHome: "முகப்பு", navDetect: "செய்தி சரிபார்", navInvest: "வேலை / முதலீடு", navLink: "இணைப்பு சரிபார்", navAsk: "AI-ஐ கேள்", navEmergency: "அவசரம்",
    welcomeTitle: "வரவேற்கிறோம்!", welcomeMsg: "உங்கள் பாதுகாப்பு முக்கியம். நாங்கள் உங்களைப் பாதுகாக்க இங்கே இருக்கிறோம்.",
    homeCheckMsg: "செய்தி சரிபார்", homeCheckMsgSub: "WhatsApp அல்லது SMS செய்தியை ஒட்டவும்",
    homeCheckShot: "ஸ்கிரீன்ஷாட் சரிபார்", homeCheckShotSub: "செய்தியின் புகைப்படம் எடுத்து சரிபார்க்கவும்",
    homeCheckLink: "இணைப்பு சரிபார்", homeCheckLinkSub: "இந்த இணையதளம் பாதுகாப்பானதா?",
    homeAskAI: "AI-ஐ கேள்", homeAskAISub: "மோசடி பற்றி எந்தக் கேள்வியும் கேளுங்கள்",
    homeEmergency: "அவசர உதவி", homeEmergencySub: "நான் ஏமாற்றப்பட்டதாக நினைக்கிறேன் — என்ன செய்வது?",
    detectTitle: "மோசடி செய்தி கண்டறிதல்", detectSub: "WhatsApp / SMS செய்தியை ஒட்டவும், அல்லது ஸ்கிரீன்ஷாட் பதிவேற்றவும். மோசடி அறிகுறிகளை நாங்கள் சரிபார்க்கிறோம்.",
    pasteMsg: "செய்தியை இங்கே ஒட்டவும்:", msgPlaceholder: "எ.கா. உங்கள் வங்கிக் கணக்கு இன்று முடக்கப்படும். இந்த இணைப்பை கிளிக் செய்து RM500 செலுத்துங்கள்...",
    orShot: "📷 அல்லது ஸ்கிரீன்ஷாட் சரிபார்:", choosePhoto: "செய்தியின் புகைப்படத்தைத் தேர்வு செய்க",
    checkMsgBtn: "இந்த செய்தியை சரிபார்", analyzing: "மோசடி அறிகுறிகளை சரிபார்க்கிறது…",
    investTitle: "TikTok வேலை & முதலீடு சரிபார்ப்பு", investSub: "பணம் செலவழிக்கும் முன் அல்லது வேலை அறிவிப்பை (எ.கா. TikTok அல்லது WhatsApp) ஏற்கும் முன் இங்கே விவரிக்கவும்.",
    describeOffer: "முதலீடு அல்லது வேலை அறிவிப்பை விவரிக்கவும்:", investPlaceholder: "எ.கா. WhatsApp குழு கூறுகிறது: RM10,000 செலுத்துங்கள், TikTok-இல் எளிய பணிகள் செய்து தினமும் RM3,000 சம்பாதிக்கவும்...",
    isScamBtn: "இது மோசடியா?", goldenRule: "பொற்கால விதி:",
    goldenRuleText: "உத்தரவாதமளிக்கப்பட்ட அதிக தினசரி வருவாயை உறுதிசெய்யும் எந்த முதலீடும் மோசடிதான் — உண்மையான சந்தை ஏறியும் இறங்கியும் இருக்கும். உண்மையான வேலை முதலில் பணம் கேட்காது.",
    linkTitle: "சந்தேகத்திற்குரிய இணைப்பு சரிபார்ப்பு", linkSub: "திறக்காமல் பரிசோதிக்க இணைப்பை ஒட்டவும். நாங்கள் இணைப்பின் உரையை மட்டுமே பார்க்கிறோம், அதை ஒருபோதும் பார்வையிடுவதில்லை.",
    pasteLink: "இணைப்பை ஒட்டவும்:", checkLinkBtn: "இந்த இணைப்பை சரிபார்",
    askTitle: "AI-இடம் உதவி கேள்", askSub: "உங்கள் கேள்வியை தட்டச்சு செய்யவும் அல்லது 🎤 பேசவும். எ.கா.: \"என் வங்கி OTP கேட்கிறார்கள். என்ன செய்வது?\"",
    askPlaceholder: "உங்கள் கேள்வியை இங்கே தட்டச்சு செய்க...", listening: "கேட்கிறது... இப்போது பேசுங்கள்", getHelpBtn: "உதவி பெறுங்கள்",
    thinking: "AI சிந்திக்கிறது…", commonQs: "பொதுவான கேள்விகள்:",
    emgTitle: "🚨 அவசர பாதுகாப்பு வழிகாட்டி", emgSub: "பணம் அல்லது தகவல்கள் ஏற்கனவே பாதிக்கப்பட்டதாக நினைத்தால் — இந்த வரிசையில் விரைவாக செயல்படுங்கள்.",
    emg1h: "1. பணம் அனுப்பப்பட்டது அல்லது OTP பகிரப்பட்டது", emg1a: "உங்கள் அட்டை அல்லது வங்கி அறிக்கையில் அச்சிடப்பட்ட வங்கியின் எண்ணை உடனே அழைக்கவும்.", emg1b: "உங்கள் கணக்கையும் அட்டைகளையும் உறையவைக்க / முடக்கக் கேளுங்கள்.", emg1c: "புகார்/குறிப்பு எண்ணைக் கேட்டு எழுதிக் கொள்ளுங்கள்.",
    emg2h: "2. மோசடியை உடனே புகார் அளிக்கவும்", emg2a: "மலேசியாவின் தேசிய மோசடி எதிர்வினை மையத்தை (NSRC) 997 இல் அழைக்கவும் — விரைவாக தெரிவிப்பது பணத்தை நிறுத்த சிறந்த வாய்ப்பைத் தரும்.", emg2b: "குறிப்பு: அதிகாரப்பூர்வ தொடர்பு விவரங்கள் மாறலாம் — தற்போதைய NSRC எண்ணை அரசாங்க இணையதளங்களில் சரிபார்க்கவும்.", emg2c: "மோசடி செய்திகளின் ஸ்கிரீன்ஷாட்களை சான்றாக சேமிக்கவும் — உரையாடலை நீக்க வேண்டாம்.",
    emg3h: "3. உங்கள் கடவுச்சொல்லை பகிர்ந்திருந்தால்", emg3a: "பாதுகாப்பான சாதனத்திலிருந்து உடனே அந்த கடவுச்சொல்லை மாற்றவும்.", emg3b: "Google/Apple கணக்கு அமைப்புகளில் அனைத்து சாதனங்களிலிருந்தும் வெளியேறவும்.", emg3c: "இரண்டு படிநிலை சரிபார்ப்பை (2FA) இயக்கவும்.",
    emg4h: "4. தடுத்து சான்றுகளை பாதுகாக்கவும்", emg4a: "மோசடியாளரின் தொலைபேசி எண்ணையும் WhatsApp கணக்கையும் தடுக்கவும்.", emg4b: "உரையாடல்களை நீக்க வேண்டாம் — அவை காவல்துறை மற்றும் வங்கிக்கான சான்றுகள்.", emg4c: "தெரியாத பரிவர்த்தனைகளுக்கு உங்கள் வங்கி அறிக்கைகளை சரிபார்க்கவும்.",
    emg5h: "5. யாரிடமும் சொல்லுங்கள்", emg5a: "மோசடியாளர்கள் மௌனத்தை நம்பி இருக்கிறார்கள். குடும்பத்தினரிடம் தெரிவிக்கவும் — இது உங்கள் குறை அல்ல.", emg5b: "மோசடி ஒரு குற்றம்; காவல்துறை எந்த வயதினருக்கும் உதவுகிறது.",
    call997: "997 ஐ அழை", call999: "999 ஐ அழை",
    nsrcSmall: "தேசிய மோசடி எதிர்வினை மையம் (மலேசியா)", policeSmall: "காவல்துறை",
    goldenHour: "பொற்கால மணி: முதல் மணி நேரத்தில் தெரிவித்தால் பணத்தை நிறுத்த சிறந்த வாய்ப்பு.",
    verifyNote: "தற்போதைய அதிகாரப்பூர்வ NSRC எண்ணை மலேசிய அரசாங்க இணையதளங்களில் சரிபார்க்கவும்.",
    footer: "உங்கள் தரவு இந்த சாதனத்திலேயே இருக்கும். ScamShield AI ஒரு உதவியாளர் — வங்கி அல்லது குடும்பத்தினருடன் எப்போதும் மீண்டும் சரிபார்க்கவும்.",
    readAloud: "இந்த முடிவை வாசித்துக் காட்டு", aiOffline: "AI உதவியாளர் இணையத்தில் இல்லை — உள்ளூர் பாதுகாப்பு விதிகளைப் பயன்படுத்துகிறது (ஆஃப்லைன் சரிபார்ப்பு).",
    aiOnline: "AI உதவியாளர் இணைக்கப்பட்டுள்ளார்.", aiChecking: "AI நிலை: சரிபார்க்கிறது…",
    verdictHigh: "⚠️ அதிக ஆபத்து — மோசடியாக இருக்கலாம்", verdictHighSub: "கிளிக் செய்யாதீர்கள், பதிலளிக்காதீர்கள், பணம் செலுத்தாதீர்கள்.",
    verdictMid: "🤔 சாத்தியமான ஆபத்து", verdictMidSub: "நம்புவதற்கு முன் கவனமாக சரிபார்க்கவும்.",
    verdictLow: "✅ தெளிவான எச்சரிக்கை அறிகுறிகள் இல்லை", verdictLowSub: "ஆனால் கவனமாக இருங்கள் — தினமும் புதிய மோசடிகள் வருகின்றன.",
    riskyLink: "ஆபத்தான இணைப்பு", avoidOpening: "திறப்பதைத் தவிர்ப்பது நல்லது.",
    demoNote: "உள்ளூர் பாதுகாப்பு விதிகளின் முடிவு (ஆஃப்லைன்). உண்மையான AI பகுப்பாய்வு அல்ல.",
    aiNote: "உண்மையான AI பகுப்பாய்வின் முடிவு.",
    emptyMsg: "முதலில் ஒரு செய்தியை ஒட்டவும்.", emptyOffer: "முதலில் அறிவிப்பை விவரிக்கவும்.", emptyLink: "முதலில் ஒரு இணைப்பை ஒட்டவும்.",
    errNet: "AI சேவையை அடைய முடியவில்லை. அதற்கு பதிலாக ஆஃப்லைன் பாதுகாப்பு விதி சரிபார்ப்பைக் காட்டுகிறோம்.",
    speakUnsupported: "மன்னிக்கவும், இந்த உலாவியில் வாசிப்பு வசதி ஆதரிக்கப்படவில்லை.",
    whatToDo: "என்ன செய்வது:", noFindings: "மோசடி முறைகள் எதுவும் கண்டறியப்படவில்லை. இருப்பினும் — OTP அல்லது PIN-ஐ ஒருபோதும் பகிராதீர்கள்.",
    noFindingsInv: "தெளிவான எச்சரிக்கை அறிகுறிகள் இல்லை. முதலீடு செய்வதற்கு முன் இன்னும் சரிபார்க்கவும்.",
    langSwitched: "மொழி தமிழாக மாற்றப்பட்டது. நான் எப்படி உதவ முடியும்?",
    botGreet: "வரவேற்கிறோம்! 👋 நான் உங்கள் பாதுகாப்பு உதவியாளர். எதையும் கேளுங்கள், எ.கா.: <i>\"TikTok-இல் தினமும் RM500 வழங்குகிறார்கள். இது உண்மையா?\"</i>",
    offlineAnswer: "உள்ளூர் பதில் (ஆஃப்லைன்)",
    listen: "கேள்",
    adviceMsg: ["நிறுத்துங்கள் — இணைப்புகளை தட்டாதீர்கள் அல்லது OTP பகிராதீர்கள்.", "செய்தியை நீக்கவும் அல்லது புகார் அளிக்கவும்.", "ஏற்கனவே தகவல்களை பகிர்ந்திருந்தால், இப்போதே வங்கியை அழைத்து கணக்கை முடக்கவும்.", "NSRC <b>997</b> க்கு புகார் அளிக்கவும்."],
    adviceInv: ["பணம் அனுப்பாதீர்கள் — அதை மீண்டும் பெற கடினம்.", "WhatsApp/Telegram குழுவை விட்டு வெளியேறி புகார் அளிக்கவும்.", "ஏற்கனவே செலுத்தியிருந்தால், உடனே NSRC <b>997</b> ஐ அழைக்கவும்.", "உண்மையான முதலீடுகள்: பத்திரக் கமிஷனில் பதிவு செய்யப்பட்ட ஆலோசகர்களை மட்டுமே பயன்படுத்துங்கள் (sc.com.my இல் சரிபார்க்கவும்)."],
    adviceLink: "1. தட்டாதீர்கள். அனுப்பியவருக்கு பதிலளிக்காதீர்கள்.<br>2. அது உங்கள் வங்கி என்று கூறினால், வங்கியின் அதிகாரப்பூர்வ பயன்பாட்டைத் திறக்கவும் அல்லது வங்கியின் உண்மையான முகவரியை நீங்களே தட்டச்சு செய்யவும்.<br>3. செய்தியை புகார் அளிக்கவும்; ஏற்கனவே திறந்து விவரங்களை உள்ளிட்டிருந்தால், வங்கி மற்றும் NSRC <b>997</b> ஐ இப்போதே அழைக்கவும்.<br><i>குறிப்பு: நாங்கள் இணைப்பின் உரையை மட்டுமே பரிசோதிக்கிறோம் — அதை ஒருபோதும் பார்வையிடுவதில்லை. சந்தேகம் இருந்தால் கிளிக் செய்யாதீர்கள்.</i>"
  }
};
const T = () => I18N[LANG] || I18N.en;

// ---------- Language menu ----------
const langBtn = document.getElementById('langBtn');
const langMenu = document.getElementById('langMenu');
langBtn.addEventListener('click', e => {
  e.stopPropagation();
  langMenu.classList.toggle('open');
  langBtn.setAttribute('aria-expanded', langMenu.classList.contains('open'));
});
document.addEventListener('click', () => langMenu.classList.remove('open'));
langMenu.querySelectorAll('button[data-lang]').forEach(b => {
  b.addEventListener('click', () => setLang(b.dataset.lang));
});

function setLang(code) {
  LANG = code;
  localStorage.setItem('ss_lang', code);
  langMenu.classList.remove('open');
  langBtn.setAttribute('aria-expanded', 'false');
  applyLang();
  document.getElementById('chatLog').innerHTML = '';
  addBubble(T().langSwitched, 'bot');
}

function applyLang() {
  document.documentElement.lang = LANG === 'bm' ? 'ms' : LANG === 'zh' ? 'zh' : LANG === 'ta' ? 'ta' : 'en';
  document.querySelectorAll('[data-i18n]').forEach(el => { const k = el.dataset.i18n; if (T()[k] !== undefined) el.innerHTML = T()[k]; });
  document.querySelectorAll('[data-i18n-ph]').forEach(el => { const k = el.dataset.i18nPh; if (T()[k]) el.placeholder = T()[k]; });
  const cur = LANGS.find(l => l.code === LANG) || LANGS[0];
  document.getElementById('langBtnLabel').textContent = cur.label;
  langMenu.querySelectorAll('button[data-lang]').forEach(b => b.classList.toggle('selected', b.dataset.lang === LANG));
  updateAiStatus();
}

// ---------- AI backend helpers ----------
async function checkAiHealth() {
  try {
    const r = await fetch(API_BASE + '/api/health', { signal: AbortSignal.timeout(4000) });
    const j = await r.json();
    return !!j.ai;
  } catch (e) { return false; }
}
let AI_OK = false;
async function updateAiStatus() {
  const el = document.getElementById('aiStatus');
  el.textContent = T().aiChecking;
  AI_OK = await checkAiHealth();
  el.textContent = (AI_OK ? '✅ ' : '🟡 ') + (AI_OK ? T().aiOnline : T().aiOffline);
}
updateAiStatus();
setInterval(updateAiStatus, 60000);

async function callAI(path, payload) {
  const r = await fetch(API_BASE + path, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...payload, lang: LANG }),
    signal: AbortSignal.timeout(30000)
  });
  if (!r.ok) throw new Error('AI service error ' + r.status);
  return await r.json();
}
function showError(boxId, msg) {
  const b = document.getElementById(boxId);
  b.textContent = msg; b.style.display = 'block';
}
function hideError(boxId) { const b = document.getElementById(boxId); if (b) b.style.display = 'none'; }

// ---------- Tab navigation ----------
function go(page) {
  document.querySelectorAll('[data-nav]').forEach(b => b.classList.toggle('active', b.dataset.page === page));
  document.querySelectorAll('section.page').forEach(p => p.classList.remove('visible'));
  document.getElementById(page).classList.add('visible');
  window.scrollTo(0, 0);
}
document.querySelectorAll('[data-nav]').forEach(btn => btn.addEventListener('click', () => go(btn.dataset.page)));

function setLoading(loadingId, on) { document.getElementById(loadingId).style.display = on ? 'block' : 'none'; }
function setScan(sectionId, on) {
  const sec = document.getElementById(sectionId);
  if (!sec) return;
  let bar = sec.querySelector('.scan-bar');
  if (!bar) { bar = document.createElement('div'); bar.className = 'scan-bar'; sec.appendChild(bar); }
  bar.classList.toggle('on', !!on);
}

// ---------- Verdict rendering ----------
function scoreToVerdict(level) { return level === 'high' ? 'danger' : level === 'mid' ? 'warn' : 'safe'; }
function showVerdict(elId, cls, title, sub) {
  const v = document.getElementById(elId);
  v.className = 'verdict ' + cls + ' show'; v.style.display = 'block';
  v.innerHTML = title + `<small>${sub}</small>`;
}
function showFindings(listElId, hits) {
  const f = document.getElementById(listElId);
  f.innerHTML = '';
  if (!hits || !hits.length) return;
  hits.forEach(h => {
    const li = document.createElement('li');
    if (h.high) li.className = 'high';
    const t = h.title !== undefined ? h.title : h.t;
    const e = h.explanation !== undefined ? h.explanation : h.e;
    li.innerHTML = `<b>${t}</b><br>${e}`;
    f.appendChild(li);
  });
}
function showAdvice(elId, html) {
  const a = document.getElementById(elId);
  a.innerHTML = "<b>" + T().whatToDo + "</b><br>" + html;
  a.style.display = 'block';
}
function showSourceNote(elId, fromAI) {
  const a = document.getElementById(elId);
  const note = document.createElement('p');
  note.style.cssText = 'font-size:14px;color:#666;margin-top:8px;font-style:italic;';
  note.textContent = fromAI ? '✅ ' + T().aiNote : '🟡 ' + T().demoNote;
  a.appendChild(note);
}

// ---------- Rule-engine fallback (offline) ----------
// rules.js ships EN + BM rule text; for zh/ta we show BM text and note the language
const ruleLangText = h => (LANG === 'bm' && h.t_bm) ? { t: h.t_bm, e: h.e_bm } : { t: h.t, e: h.e };
function ruleVerdict(score, hits) {
  if (score >= 5 || hits.some(h => h.high && h.w >= 3)) return 'high';
  if (score >= 2) return 'mid';
  return 'low';
}
function runRules(text, rules) {
  const hits = []; let score = 0;
  for (const r of rules) { if (r.re.test(text)) { score += r.w; hits.push(r); } }
  return { score, hits };
}
function rulesToAIFormat(hits) {
  return hits.map(h => {
    const x = ruleLangText(h);
    return { title: x.t, explanation: x.e, high: !!h.high };
  });
}
function renderAIResult(v) {
  const cls = scoreToVerdict(v.level);
  const titles = { danger: T().verdictHigh, warn: T().verdictMid, safe: T().verdictLow };
  const subs = { danger: T().verdictHighSub, warn: T().verdictMidSub, safe: T().verdictLowSub };
  const t = v.summary ? v.summary : titles[cls];
  showVerdict(v.elId, cls, t, subs[cls]);
  showFindings(v.findingsId, v.findings || []);
  const advice = (v.advice && v.advice.length) ? v.advice.join('<br>') : T().adviceMsg.join('<br>');
  showAdvice(v.adviceId, advice);
  window['lastResult_' + v.elId] = { text: [t, subs[cls], (v.findings || []).map(f => (f.title || '') + '. ' + (f.explanation || '')).join(' ')].join(' ') };
}

// ---------- 1. Scam message detector ----------
async function analyzeMessage() {
  const text = document.getElementById('msgInput').value.trim();
  if (!text) { alert(T().emptyMsg); return; }
  hideError('detectError');
  setLoading('msgLoading', true);
  setScan('detect', true);
  document.getElementById('msgBtn').disabled = true;
  ['msgVerdict', 'msgFindings', 'msgAdvice'].forEach(id => { const el = document.getElementById(id); el.style.display = ''; el.innerHTML = ''; });

  let fromAI = false, result = null;
  if (AI_OK) {
    try {
      const j = await callAI('/api/analyze-message', { text });
      result = j.result; fromAI = true;
    } catch (e) {
      AI_OK = false; updateAiStatus();
      showError('detectError', T().errNet);
    }
  }
  if (!result) {
    let { score, hits } = runRules(text, MESSAGE_RULES);
    if (/https?:\/\/|\b[a-z0-9-]+\.(com|net|my|io|xyz|top|info|link|click|online)\b/i.test(text)) score += 1;
    const level = ruleVerdict(score, hits);
    result = { level, findings: rulesToAIFormat(hits), advice: T().adviceMsg };
  }
  setLoading('msgLoading', false);
  setScan('detect', false);
  document.getElementById('msgBtn').disabled = false;
  renderAIResult({ elId: 'msgVerdict', findingsId: 'msgFindings', adviceId: 'msgAdvice', ...result });
  if (!fromAI) showSourceNote('msgAdvice', false);
  if (!(result.findings || []).length && !fromAI) {
    document.getElementById('msgFindings').innerHTML = '<li>' + T().noFindings + '</li>';
  }
}

// ---------- Screenshot OCR (Tesseract.js) ----------
const ocrInput = document.getElementById('shotInput');
const ocrPreview = document.getElementById('ocrPreview');
const ocrStatus = document.getElementById('ocrStatus');
let tesseractReady = false;

ocrInput.addEventListener('change', async () => {
  const file = ocrInput.files[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  ocrPreview.src = url;
  ocrPreview.style.display = 'block';
  ocrStatus.textContent = '…';

  try {
    if (!tesseractReady) {
      await new Promise((res, rej) => {
        const s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
        s.onload = res; s.onerror = rej;
        document.head.appendChild(s);
      });
      tesseractReady = true;
    }
    ocrStatus.textContent = '📖 ' + T().analyzing;
    const { data } = await Tesseract.recognize(url, 'eng', {
      logger: m => { if (m.status === 'recognizing text') ocrStatus.textContent = `📖 ${Math.round(m.progress * 100)}%`; }
    });
    const txt = data.text.replace(/\s+/g, ' ').trim();
    if (txt.length < 5) {
      ocrStatus.textContent = T().emptyMsg;
    } else {
      document.getElementById('msgInput').value = txt;
      ocrStatus.textContent = '✅ ' + T().checkMsgBtn;
      analyzeMessage();
    }
  } catch (err) {
    ocrStatus.textContent = T().errNet;
  }
});

// ---------- 2. Investment & job checker ----------
async function analyzeInvest() {
  const text = document.getElementById('investInput').value.trim();
  if (!text) { alert(T().emptyOffer); return; }
  hideError('investError');
  setLoading('invLoading', true);
  setScan('invest', true);
  document.getElementById('invBtn').disabled = true;

  let fromAI = false, result = null;
  if (AI_OK) {
    try {
      const j = await callAI('/api/analyze-investment', { text });
      result = j.result; fromAI = true;
    } catch (e) {
      AI_OK = false; updateAiStatus();
      showError('investError', T().errNet);
    }
  }
  if (!result) {
    const { score, hits } = runRules(text, INVEST_RULES);
    const level = ruleVerdict(score, hits);
    result = { level, findings: rulesToAIFormat(hits), advice: T().adviceInv };
  }
  setLoading('invLoading', false);
  setScan('invest', false);
  document.getElementById('invBtn').disabled = false;
  renderAIResult({ elId: 'invVerdict', findingsId: 'invFindings', adviceId: 'invAdvice', ...result });
  if (!fromAI) showSourceNote('invAdvice', false);
  if (!(result.findings || []).length && !fromAI) {
    document.getElementById('invFindings').innerHTML = '<li>' + T().noFindingsInv + '</li>';
  }
}

// ---------- 3. Link checker (on-device text inspection) ----------
function analyzeLink() {
  const raw = document.getElementById('linkInput').value.trim();
  if (!raw) { alert(T().emptyLink); return; }
  setLoading('linkLoading', true);
  setScan('link', true);
  document.getElementById('linkBtn').disabled = true;

  setTimeout(() => {
    const hits = [];
    let score = 0;
    let url;
    try { url = new URL(raw.match(/https?:\/\/[^\s]+/) ? raw.trim() : 'http://' + raw.trim()); }
    catch (e) { url = null; }

    const host = url ? url.hostname.toLowerCase() : raw.toLowerCase();
    const parts = host.split('.').filter(Boolean);
    const tld = parts.length >= 2 ? parts[parts.length - 1] : '';

    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) {
      score += 3;
      hits.push({ t: 'Link uses a raw IP address', t_bm: 'Pautan menggunakan alamat IP mentah', high: true,
        e: 'Real companies never use bare number addresses like 192.168.x.x. This is a strong scam sign.',
        e_bm: 'Syarikat sebenar tidak menggunakan alamat nombor seperti 192.168.x.x. Ini tanda penipuan yang kuat.' });
    }
    if (BAD_TLDS.includes(tld)) {
      score += 2;
      hits.push({ t: `Unusual ending ".${tld}"`, t_bm: `Akhiran luar biasa ".${tld}"`, high: false,
        e: 'Scammers prefer cheap, rarely-used endings like .xyz, .top, .click because they are easy to register.',
        e_bm: 'Penipu lebih suka akhiran murah seperti .xyz, .top, .click kerana mudah didaftarkan.' });
    }
    if (url && url.protocol === 'http:') {
      score += 1;
      hits.push({ t: 'No secure connection (http, not https)', t_bm: 'Tiada sambungan selamat (http, bukan https)', high: false,
        e: 'Legitimate login/banking pages always use https. http links can be intercepted.',
        e_bm: 'Halaman log masuk/perbankan yang sah sentiasa menggunakan https. Pautan http boleh dipintasi.' });
    }
    for (const brand of BANK_BRANDS) {
      const bre = new RegExp(`(^|[.-])${brand}([.-]|$)`, 'i');
      if (bre.test(host)) {
        const trusted = TRUSTED_DOMAINS.some(d => host === d || host.endsWith('.' + d));
        if (!trusted) {
          score += 3;
          hits.push({ t: `Pretends to be "${brand.replace(/\\/g, '').toUpperCase()}"`, t_bm: `Berlagak sebagai "${brand.replace(/\\/g, '').toUpperCase()}"`, high: true,
            e: `The name contains a famous brand but the web address is NOT the company's real site (${host}). This is fake/phishing.`,
            e_bm: `Nama itu mengandungi jenama terkenal tetapi alamat web BUKAN laman sebenar syarikat (${host}). Ini phishing/palsu.` });
        }
        break;
      }
    }
    if (/\b(login|verify|update|secure|kyc|account|wallet|refund|bonus|gift|free|log ?masuk|sahkan|kemas ?kini|akaun|dompet)\b/i.test(host + ' ' + (url ? url.pathname : ''))) {
      score += 1;
      hits.push({ t: 'Contains account/verification words', t_bm: 'Mengandungi perkataan akaun/pengesahan', high: false,
        e: 'Phishing links often include words like "verify", "update", "login" to look official.',
        e_bm: 'Pautan phishing sering mengandungi perkataan seperti "sahkan", "kemas kini", "log masuk" supaya kelihatan rasmi.' });
    }
    if (parts.length >= 4) {
      score += 1;
      hits.push({ t: 'Unusually long address', t_bm: 'Alamat tidak biasa panjang', high: false,
        e: 'Many dot-separated parts is a trick to hide the real destination site.',
        e_bm: 'Bahagian yang dipisahkan dengan banyak titik adalah helah untuk menyembunyikan laman sebenar.' });
    }
    if (raw.includes('@')) {
      score += 3;
      hits.push({ t: 'Contains "@" in the link', t_bm: 'Mengandungi "@" dalam pautan', high: true,
        e: 'The @ symbol hides the true website. Everything before @ is ignored — a classic phishing trick.',
        e_bm: 'Simbol @ menyembunyikan laman web sebenar. Semua sebelum @ diabaikan — helah phishing klasik.' });
    }

    const level = ruleVerdict(score, hits);
    const cls = scoreToVerdict(level);
    showVerdict('linkVerdict', cls,
      level === 'high' ? T().verdictHigh : level === 'mid' ? '⚠️ ' + T().riskyLink : T().verdictLow,
      level === 'high' ? T().verdictHighSub : level === 'mid' ? T().avoidOpening : T().verdictLowSub);
    showFindings('linkFindings', rulesToAIFormat(hits));
    showAdvice('linkAdvice', T().adviceLink);
    setLoading('linkLoading', false);
    setScan('link', false);
    document.getElementById('linkBtn').disabled = false;
    window['lastResult_linkVerdict'] = { text: document.getElementById('linkVerdict').innerText };
  }, 400);
}

// ---------- 4. Ask AI (chatbot) ----------
const KB = [
  { keys: /\b(otp|one[- ]?time|pin|kata laluan sekali)\b/i,
    a: "<b>Never share your OTP or PIN with anyone — no exceptions.</b><br>• Banks, police, and companies NEVER ask for OTP by phone, SMS, or WhatsApp.<br>• If you already shared it: call your bank immediately (number on your card) and block the account/cards.<br>• Then report to the National Scam Response Centre <b>997</b> (Malaysia) immediately.",
    a_bm: "<b>Jangan sesekali kongsi OTP atau PIN anda dengan sesiapa — tiada pengecualian.</b><br>• Bank, polis, dan syarikat TIDAK PERNAH meminta OTP melalui telefon, SMS, atau WhatsApp.<br>• Jika anda sudah kongsinya: hubungi bank anda serta-merta (nombor pada kad anda) dan sekat akaun/kad.<br>• Kemudian laporkan ke Pusat Respons Penipuan Kebangsaan <b>997</b> (Malaysia) dengan segera." },
  { keys: /\b(sent|transferred|paid|lost|scammed|cheated|hantar|bayar|hilang|ditipu|kena tipu)\b.{0,40}\b(money|rm|scam|wang)\b|\b(scammed|ditipu|kena tipu)\b/i,
    a: "<b>Act in the golden hour:</b><br>1. Call your bank right away — ask to freeze the account and reverse the transaction.<br>2. Call the National Scam Response Centre <b>997</b> (Malaysia).<br>3. Keep all screenshots and messages as evidence.<br>4. Inform family — it is not your fault.",
    a_bm: "<b>Bertindak dalam jam keemasan:</b><br>1. Hubungi bank anda dengan segera — minta mereka membekukan akaun dan membatalkan transaksi.<br>2. Hubungi Pusat Respons Penipuan Kebangsaan <b>997</b> (Malaysia).<br>3. Simpan semua tangkapan skrin dan mesej sebagai bukti.<br>4. Beritahu keluarga — itu bukan salah anda." },
  { keys: /\b(rm ?\d+|rm\d+).{0,40}(daily|day|sehari|harian|hari)\b|\b(tiktok).{0,60}(job|work|earn|offer|kerja|dapat|wang|tawaran)\b/i,
    a: "<b>Use the 💰 Job/Invest tab</b> to check that offer in detail.<br>Short version: 'RM500 daily doing easy TikTok tasks' is a well-known scam pattern. They pay small amounts at first to build trust, then ask you to pay 'registration fees' or bigger deposits — and disappear. Real jobs never ask you to pay.",
    a_bm: "<b>Gunakan tab 💰 Kerja/Pelaburan</b> untuk menyemak tawaran itu secara terperinci.<br>Ringkasnya: 'RM500 sehari buat tugasan TikTok mudah' adalah corak penipuan yang terkenal. Mereka membayar sedikit pada awalnya untuk membina kepercayaan, kemudian minta anda bayar 'yuran pendaftaran' atau deposit lebih besar — lalu hilang. Kerja sebenar tidak pernah minta anda bayar." },
  { keys: /\b(investment|invest|pelaburan|labur).{0,60}(link|pautan|trust|percaya)\b/i,
    a: "<b>Do not trust it.</b> Links to 'investment platforms' sent by strangers are almost always fake.<br>• Check the sender: do you know them in real life?<br>• Use the 🔗 Check Link tab to inspect the link without opening it.<br>• Genuine investments in Malaysia go through SC-registered providers (verify at sc.com.my). If returns are 'guaranteed', walk away.",
    a_bm: "<b>Jangan percayai.</b> Pautan ke 'platform pelaburan' yang dihantar oleh orang tidak dikenali hampir pasti palsu.<br>• Semak pengirim: adakah anda mengenali mereka di dunia sebenar?<br>• Gunakan tab 🔗 Semak Pautan untuk memeriksa pautan tanpa membukanya.<br>• Pelaburan sebenar di Malaysia melalui penyedia berdaftar SC (sahkan di sc.com.my). Jika pulangan 'terjamin', tinggalkan sahaja." },
  { keys: /\b(bank (details|account)|online banking|cvv|card|ic ?no|nric|maklumat bank|akaun bank|kad)\b/i,
    a: "<b>Never share online banking usernames, passwords, IC number or card details with anyone.</b><br>• Real banks never ask for these by message or call.<br>• If you already shared them: call your bank NOW to block and reissue.<br>• Report to NSRC <b>997</b> and keep the evidence.",
    a_bm: "<b>Jangan sesekali kongsi nama pengguna, kata laluan perbankan dalam talian, nombor IC atau maklumat kad dengan sesiapa.</b><br>• Bank sebenar tidak pernah meminta ini melalui mesej atau panggilan.<br>• Jika anda sudah kongsinya: hubungi bank anda SEKARANG untuk menyekat dan mengeluarkan kad baharu.<br>• Laporkan ke NSRC <b>997</b> dan simpan bukti." },
  { keys: /\b(phone|mobile|safe|secure|protect|hack|selamat|lindungi)\b.{0,40}(safe|secure|protect|hack|selamat)\b/i,
    a: "<b>Simple phone safety steps:</b><br>1. Keep your phone and apps updated.<br>2. Use a screen lock (PIN/fingerprint).<br>3. Never install apps from links or 'APK' files — use official app stores only.<br>4. Turn on 2-step verification for Google/WhatsApp/bank apps.<br>5. Never keep PINs written in your phone's notes.",
    a_bm: "<b>Langkah keselamatan telefon yang mudah:</b><br>1. Pastikan telefon dan aplikasi sentiasa dikemas kini.<br>2. Guna kunci skrin (PIN/cap jari).<br>3. Jangan pasang aplikasi dari pautan atau fail 'APK' — guna kedai aplikasi rasmi sahaja.<br>4. Aktifkan pengesahan 2 langkah untuk akaun Google/WhatsApp/bank.<br>5. Jangan simpan PIN dalam nota telefon." }
];
const DEFAULT_ANSWER = "I'm not fully sure about that one. General safety rules:<br>• <b>Never</b> share OTP, PIN, passwords, or card details.<br>• Verify any money request by calling the person/company on an official number.<br>• For money already lost, call NSRC <b>997</b> immediately.<br>Please also ask a family member — and try rephrasing your question here.";
const DEFAULT_ANSWER_BM = "Saya tidak begitu pasti tentang itu. Peraturan keselamatan umum:<br>• <b>Jangan sesekali</b> kongsi OTP, PIN, kata laluan, atau maklumat kad.<br>• Sahkan sebarang permintaan wang dengan menghubungi orang/syarikat itu di nombor rasmi.<br>• Untuk wang yang telah hilang, hubungi NSRC <b>997</b> dengan segera.<br>Sila tanya juga ahli keluarga anda — dan cuba ubah suai soalan anda di sini.";

function kbAnswer(q) {
  for (const item of KB) {
    if (item.keys.test(q)) return (LANG === 'bm' && item.a_bm) ? item.a_bm : item.a;
  }
  return LANG === 'bm' ? DEFAULT_ANSWER_BM : DEFAULT_ANSWER;
}
function addBubble(html, who, srcNote) {
  const d = document.createElement('div');
  d.className = 'bubble ' + who;
  d.innerHTML = html + (srcNote ? `<div class="src">${srcNote}</div>` : '');
  const log = document.getElementById('chatLog');
  log.appendChild(d);
  d.scrollIntoView({ behavior: 'smooth' });
  return d;
}
async function askQuestion() {
  const q = document.getElementById('askInput').value.trim();
  if (!q) return;
  addBubble(q.replace(/</g, '&lt;'), 'user');
  document.getElementById('askInput').value = '';
  setLoading('askLoading', true);
  document.getElementById('askBtn').disabled = true;

  let html = null, srcNote = null;
  if (AI_OK) {
    try {
      const j = await callAI('/api/ask', { question: q });
      html = String(j.answer).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\n/g, '<br>');
      srcNote = '✅ AI';
    } catch (e) {
      AI_OK = false; updateAiStatus();
      addBubble('🟡 ' + T().errNet, 'bot');
    }
  }
  if (!html) { html = kbAnswer(q); srcNote = '🟡 ' + T().offlineAnswer; }
  setLoading('askLoading', false);
  document.getElementById('askBtn').disabled = false;
  const bubble = addBubble(html, 'bot', srcNote);
  const sp = document.createElement('button');
  sp.textContent = '🔊 ' + T().listen;
  sp.style.cssText = 'margin-top:8px;background:#f7f1e6;border:1px solid #d9c9b2;border-radius:16px;padding:6px 12px;font-size:14px;color:#7a5c44;cursor:pointer;';
  sp.onclick = () => speakText(bubble.innerText.replace(sp.textContent, ''));
  bubble.appendChild(sp);
}
document.getElementById('askInput').addEventListener('keydown', e => { if (e.key === 'Enter') askQuestion(); });
function fillAsk(i) {
  document.getElementById('askInput').value = [
    "Someone is asking for my bank OTP. What should I do?",
    "Someone offered me RM500 daily through TikTok. Is it genuine?",
    "Someone sent me an investment link. Should I trust it?",
    "I already sent money to a scammer. What now?",
    "Someone wants my online banking details."
  ][i];
  askQuestion();
}

// ---------- Text-to-speech ----------
function speakText(text) {
  if (!('speechSynthesis' in window)) { alert(T().speakUnsupported); return; }
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = speechLang();
  u.rate = 0.92;
  window.speechSynthesis.speak(u);
}
function speakResult(page) {
  const key = { detect: 'lastResult_msgVerdict', invest: 'lastResult_invVerdict', link: 'lastResult_linkVerdict' }[page];
  const r = window[key];
  if (!r) return;
  speakText(r.text);
}

// ---------- Voice input (Web Speech API) ----------
let recog = null;
function toggleMic() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const micBtn = document.getElementById('micBtn');
  if (!SR) { alert(T().speakUnsupported); return; }
  if (recog) { recog.stop(); return; }
  recog = new SR();
  recog.lang = speechLang();
  recog.interimResults = false;
  recog.onstart = () => {
    micBtn.classList.add('listening');
    document.getElementById('listeningNote').style.display = 'block';
  };
  recog.onend = () => {
    micBtn.classList.remove('listening');
    document.getElementById('listeningNote').style.display = 'none';
    recog = null;
  };
  recog.onerror = () => {
    micBtn.classList.remove('listening');
    document.getElementById('listeningNote').style.display = 'none';
    recog = null;
    alert(T().speakUnsupported);
  };
  recog.onresult = e => {
    document.getElementById('askInput').value = e.results[0][0].transcript;
    askQuestion();
  };
  recog.start();
}

// ---------- Init ----------
applyLang();
window.addEventListener('load', () => {
  addBubble(T().botGreet, 'bot');
});
