# ScamShield AI — local server + secure AI backend proxy
# Serves static files AND /api/* endpoints. API key stays in an environment
# variable on this machine — it is never sent to or stored in the frontend.
#
# Configuration (set before running, all optional):
#   SCAMSHIELD_API_KEY   – AI API key. If unset, /api/health reports AI offline
#                          and the app clearly labels results as offline checks.
#   SCAMSHIELD_API_URL   – OpenAI-compatible chat completions endpoint.
#                          Default: https://api.openai.com/v1/chat/completions
#   SCAMSHIELD_MODEL     – model name. Default: gpt-4o-mini
#   SCAMSHIELD_PORT      – port. Default: 8899
#
# Run:  powershell -ExecutionPolicy Bypass -File serve.ps1

$root = "C:\Users\Kafeel\.ilmucode\workspace\default\scam-shield"
$port = if ($env:SCAMSHIELD_PORT) { $env:SCAMSHIELD_PORT } else { "8899" }
$prefix = "http://localhost:$port/"

$apiKey  = $env:SCAMSHIELD_API_KEY
$apiUrl  = if ($env:SCAMSHIELD_API_URL) { $env:SCAMSHIELD_API_URL } else { "https://api.openai.com/v1/chat/completions" }
$apiModel = if ($env:SCAMSHIELD_MODEL) { $env:SCAMSHIELD_MODEL } else { "gpt-4o-mini" }

$types = @{ ".html"="text/html"; ".js"="text/javascript"; ".json"="application/json"; ".svg"="image/svg+xml"; ".png"="image/png"; ".ico"="image/x-icon"; ".css"="text/css" }

function Send-Json($ctx, $status, $obj) {
  $bytes = [System.Text.Encoding]::UTF8.GetBytes(($obj | ConvertTo-Json -Depth 12))
  $ctx.Response.StatusCode = $status
  $ctx.Response.ContentType = "application/json; charset=utf-8"
  $ctx.Response.ContentLength64 = $bytes.Length
  $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
  $ctx.Response.OutputStream.Close()
}

function Read-Body($ctx) {
  try {
    $ms = New-Object System.IO.MemoryStream
    $ctx.Request.InputStream.CopyTo($ms)
    $ms.Position = 0
    $reader = New-Object System.IO.StreamReader($ms, [System.Text.Encoding]::UTF8)
    return $reader.ReadToEnd() | ConvertFrom-Json
  } catch { return $null }
}

# ---------- AI helper: OpenAI-compatible chat completion ----------
function Invoke-AI($systemPrompt, $userPrompt, $maxTokens) {
  if (-not $apiKey) { throw "NO_API_KEY" }
  $body = @{
    model = $apiModel
    messages = @(
      @{ role = "system"; content = $systemPrompt },
      @{ role = "user"; content = $userPrompt }
    )
    max_tokens = $maxTokens
    temperature = 0.2
  } | ConvertTo-Json -Depth 8
  $headers = @{ "Authorization" = "Bearer $apiKey"; "Content-Type" = "application/json" }
  $resp = Invoke-RestMethod -Uri $apiUrl -Method Post -Headers $headers -Body ([System.Text.Encoding]::UTF8.GetBytes($body)) -TimeoutSec 25
  return $resp.choices[0].message.content
}

$SYSTEM_ANALYZE = @"
You are ScamShield AI, a scam-protection assistant for senior citizens in Malaysia.
Analyse the user's submitted message/offer for scam indicators (OTP requests, bank account blocking threats,
lottery prizes, urgency pressure, payment requests, guaranteed returns, daily earnings promises, TikTok task jobs,
advance fees, personal bank account payments, impersonation of Malaysian banks/agencies like Maybank, CIMB, LHDN, TNB, DuitNow/TnG).

Reply with ONLY a JSON object, no markdown fences, in this exact schema:
{"level":"high"|"mid"|"low",
 "summary":"one short plain-English verdict sentence, max 20 words",
 "findings":[{"title":"short warning sign name","explanation":"1-2 simple sentences an elderly person can understand","high":true|false}],
 "advice":["short action step 1","short action step 2","short action step 3"]}

Rules: level "high" = almost certainly a scam; "mid" = several warning signs; "low" = no obvious warning signs (never call it "definitely safe").
Advice must include: never share OTP/PIN; call the bank using the number on the card; report to Malaysia NSRC 997 when money/OTP is involved.
If the user language (lang field) is "bm", write summary, explanations and advice in simple Bahasa Malaysia; otherwise simple English.
"@

$SYSTEM_ASK = @"
You are ScamShield AI, a warm, patient safety assistant for senior citizens in Malaysia.
Answer questions about scams, phishing, OTP/banking safety, TikTok job offers, investment schemes and what to do after being scammed.
Use very simple, short sentences with line breaks. Be reassuring: being scammed is not the victim's fault.
Key facts: banks NEVER ask for OTP/PIN; to RECEIVE money you never enter a PIN; guaranteed returns are always fraud;
real jobs never ask you to pay; Malaysia's National Scam Response Centre (NSRC) hotline is 997 (advise verifying current official numbers);
Securities Commission Malaysia (sc.com.my) regulates genuine investments; Bank Negara Malaysia (bnm.gov.my) regulates banks.
If the user language (lang field) is "bm", answer in simple Bahasa Malaysia; otherwise simple English.
"@

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)
$listener.Start()
Write-Host "Serving $root at $prefix"
Write-Host "AI backend: $(if ($apiKey) { $apiUrl + ' (model ' + $apiModel + ')' } else { 'OFFLINE - set SCAMSHIELD_API_KEY to enable genuine AI analysis' })"

while ($listener.IsListening) {
  $ctx = $listener.GetContext()
  try {
    $path = $ctx.Request.Url.AbsolutePath
    $method = $ctx.Request.HttpMethod

    # ---------- API endpoints ----------
    if ($path -eq "/api/health" -and $method -eq "GET") {
      Send-Json $ctx 200 @{ ok = $true; ai = [bool]$apiKey }
      continue
    }
    if ($path -in @("/api/analyze-message", "/api/analyze-investment") -and $method -eq "POST") {
      $body = Read-Body $ctx
      $text = if ($body -and $body.text) { [string]$body.text } else { "" }
      $lang = if ($body -and $body.lang) { [string]$body.lang } else { "en" }
      if (-not $text) { Send-Json $ctx 400 @{ error = "missing text" }; continue }
      if (-not $apiKey) { Send-Json $ctx 503 @{ error = "AI not configured" }; continue }
      $kind = if ($path -eq "/api/analyze-investment") { "a job/investment offer (watch especially for: guaranteed/daily returns, advance registration fees, TikTok task jobs, payment to personal bank accounts)" } else { "a WhatsApp/SMS message" }
      $prompt = "Language: $lang. Analyse the following $kind.`n`nTEXT:`n$text"
      try {
        $raw = Invoke-AI $SYSTEM_ANALYZE $prompt 800
        $raw = $raw -replace '(?s)^```(json)?\s*', '' -replace '```\s*$', ''
        $result = $raw | ConvertFrom-Json
        Send-Json $ctx 200 @{ result = $result }
      } catch {
        Send-Json $ctx 502 @{ error = "AI request failed: $($_.Exception.Message)" }
      }
      continue
    }
    if ($path -eq "/api/ask" -and $method -eq "POST") {
      $body = Read-Body $ctx
      $q = if ($body -and $body.question) { [string]$body.question } else { "" }
      $lang = if ($body -and $body.lang) { [string]$body.lang } else { "en" }
      if (-not $q) { Send-Json $ctx 400 @{ error = "missing question" }; continue }
      if (-not $apiKey) { Send-Json $ctx 503 @{ error = "AI not configured" }; continue }
      try {
        $answer = Invoke-AI $SYSTEM_ASK "Language: $lang.`n`nQuestion: $q" 500
        Send-Json $ctx 200 @{ answer = $answer }
      } catch {
        Send-Json $ctx 502 @{ error = "AI request failed: $($_.Exception.Message)" }
      }
      continue
    }

    # ---------- static files ----------
    if ($method -ne "GET") { Send-Json $ctx 405 @{ error = "method not allowed" }; continue }
    if ($path -eq "/") { $path = "/index.html" }
    $file = Join-Path $root ($path -replace "/", "\")
    if ((Test-Path $file -PathType Leaf) -and ((Resolve-Path $file).Path.StartsWith($root))) {
      $ext = [System.IO.Path]::GetExtension($file).ToLower()
      $ctype = if ($types.ContainsKey($ext)) { $types[$ext] } else { "application/octet-stream" }
      $bytes = [System.IO.File]::ReadAllBytes($file)
      $ctx.Response.ContentType = $ctype
      $ctx.Response.ContentLength64 = $bytes.Length
      $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
      $ctx.Response.StatusCode = 404
      $msg = [System.Text.Encoding]::UTF8.GetBytes("Not found")
      $ctx.Response.OutputStream.Write($msg, 0, $msg.Length)
    }
    $ctx.Response.OutputStream.Close()
  } catch {
    try { Send-Json $ctx 500 @{ error = "server error: $($_.Exception.Message)" } } catch {}
  }
}
