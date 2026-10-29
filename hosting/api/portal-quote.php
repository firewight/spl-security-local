<?php
// SPL Customer Portal quote request. GET = maths challenge token; POST = multipart quote + photos.
declare(strict_types=1);

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception as MailException;

require __DIR__ . '/vendor/autoload.php';
$configFile = getenv('SPL_CONTACT_CONFIG') ?: __DIR__ . '/config.php';
if (!is_file($configFile)) { http_response_code(500); exit('Not configured'); }
$cfg = require $configFile;
// Portal can send as a different mailbox than the main contact form (e.g. service@ for live service calls).
$portalFromEmail = (string)($cfg['portal_from_email'] ?? $cfg['from_email'] ?? '');
$portalFromName  = (string)($cfg['portal_from_name']  ?? $cfg['from_name']  ?? 'SPL Security website');
$portalToEmail   = (string)($cfg['portal_to_email']   ?? $cfg['to_email']   ?? '');

$wantsJson = str_contains($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json')
    || str_contains($_SERVER['CONTENT_TYPE'] ?? '', 'application/json')
    ;

const PORTAL_MAX_FILES = 6;
const PORTAL_MAX_FILE_BYTES = 4 * 1024 * 1024;   // 4 MB each
const PORTAL_MAX_TOTAL_BYTES = 12 * 1024 * 1024; // 12 MB total
const PORTAL_CHALLENGE_TTL = 1800;               // 30 minutes

function portal_secret(array $cfg): string {
    return (string)($cfg['challenge_secret'] ?? hash('sha256', ($cfg['to_email'] ?? '') . '|spl-portal-quote|v1'));
}

function portal_respond(bool $ok, int $status, string $error = '', array $fields = [], array $extra = []): never {
    global $wantsJson, $cfg;
    http_response_code($status);
    header('Cache-Control: no-store');
    header('X-Content-Type-Options: nosniff');
    if ($wantsJson || ($_SERVER['REQUEST_METHOD'] ?? '') === 'GET') {
        header('Content-Type: application/json; charset=utf-8');
        $body = $ok ? array_merge(['ok' => true], $extra) : array_merge(['ok' => false, 'error' => $error, 'fields' => $fields], $extra);
        echo json_encode($body);
    } elseif ($ok) {
        header('Location: ' . ($cfg['thank_you_url'] ?? '/thank-you/'), true, 303);
    } else {
        header('Content-Type: text/html; charset=utf-8');
        echo '<!doctype html><meta charset="utf-8"><meta name="robots" content="noindex"><title>Quote not sent</title>'
           . '<p>' . htmlspecialchars($error) . '</p>'
           . ($fields ? '<ul>' . implode('', array_map(fn($m) => '<li>' . htmlspecialchars((string)$m) . '</li>', $fields)) . '</ul>' : '')
           . '<p>Please go back and try again, or call (07) 55 888 111.</p>';
    }
    exit;
}

function portal_clean(string $v, int $max): string {
    return trim(mb_substr(preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $v) ?? '', 0, $max));
}

function portal_h(string $s): string {
    return htmlspecialchars($s, ENT_QUOTES | ENT_HTML5, 'UTF-8');
}

/** Wrap body HTML in SPL-branded email shell (navy/black + gold). Inline CSS for client compatibility. */
function portal_email_shell(string $title, string $innerHtml, string $preheader = ''): string {
    $titleEsc = portal_h($title);
    $pre = portal_h($preheader);
    return '<!DOCTYPE html><html lang="en-AU"><head><meta charset="utf-8">'
        . '<meta name="viewport" content="width=device-width,initial-scale=1">'
        . '<meta name="color-scheme" content="light dark">'
        . '<title>' . $titleEsc . '</title></head>'
        . '<body style="margin:0;padding:0;background:#f5f5f1;color:#050505;'
        . "font-family:'DM Sans',Arial,Helvetica,sans-serif;font-size:16px;line-height:1.55;\">"
        . '<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">' . $pre . '</div>'
        . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f5f1;padding:24px 12px;">'
        . '<tr><td align="center">'
        . '<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e8e8e4;">'
        // Gold accent bar
        . '<tr><td style="height:6px;line-height:6px;font-size:0;background:#f7c600;">&nbsp;</td></tr>'
        // Navy header
        . '<tr><td style="background:#090909;padding:22px 28px;">'
        . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>'
        . '<td style="vertical-align:middle;">'
        . '<div style="font-family:Manrope,Arial,Helvetica,sans-serif;font-weight:800;font-size:20px;letter-spacing:0.02em;color:#ffffff;">SPL Security Solutions</div>'
        . '<div style="margin-top:4px;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#f7c600;">Customer Portal</div>'
        . '</td>'
        . '<td align="right" style="vertical-align:middle;font-size:12px;color:#bbbbbb;">'
        . '<a href="tel:+61755888111" style="color:#f7c600;text-decoration:none;font-weight:700;">(07) 55 888 111</a>'
        . '</td></tr></table>'
        . '</td></tr>'
        // Body card
        . '<tr><td style="padding:28px 28px 8px;background:#ffffff;">'
        . $innerHtml
        . '</td></tr>'
        // Footer
        . '<tr><td style="padding:20px 28px 28px;background:#ffffff;">'
        . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid #ecece8;">'
        . '<tr><td style="padding-top:18px;font-size:13px;color:#6b6b6b;line-height:1.5;">'
        . 'SPL Security Solutions · Gold Coast, Brisbane &amp; Northern NSW<br>'
        . '<a href="tel:+61755888111" style="color:#050505;text-decoration:none;font-weight:600;">(07) 55 888 111</a>'
        . ' · <a href="mailto:info@spl.com.au" style="color:#050505;text-decoration:none;">info@spl.com.au</a>'
        . '</td></tr></table>'
        . '</td></tr>'
        . '</table>'
        . '<p style="margin:16px 0 0;font-size:11px;color:#9a9a9a;text-align:center;">This email was sent by SPL Security Solutions.</p>'
        . '</td></tr></table></body></html>';
}


function portal_issue_challenge(array $cfg): array {
    $a = random_int(1, 9);
    $b = random_int(1, 9);
    $exp = time() + PORTAL_CHALLENGE_TTL;
    $payload = $a . '|' . $b . '|' . $exp;
    $sig = hash_hmac('sha256', $payload, portal_secret($cfg));
    return [
        'a' => $a,
        'b' => $b,
        'token' => base64_encode($payload) . '.' . $sig,
        'expires_in' => PORTAL_CHALLENGE_TTL,
    ];
}

function portal_verify_challenge(array $cfg, string $token, string $answer): ?string {
    if ($token === '' || $answer === '') return 'Please answer the security question.';
    if (!preg_match('/^[0-9]+$/', $answer)) return 'Please enter a whole number for the security question.';
    $parts = explode('.', $token, 2);
    if (count($parts) !== 2) return 'Security check expired. Please reload the page and try again.';
    [$b64, $sig] = $parts;
    $payload = base64_decode($b64, true);
    if ($payload === false || !hash_equals(hash_hmac('sha256', $payload, portal_secret($cfg)), $sig)) {
        return 'Security check failed. Please reload the page and try again.';
    }
    $bits = explode('|', $payload);
    if (count($bits) !== 3) return 'Security check failed. Please reload the page and try again.';
    [$a, $b, $exp] = $bits;
    if (!ctype_digit($a) || !ctype_digit($b) || !ctype_digit($exp)) {
        return 'Security check failed. Please reload the page and try again.';
    }
    if ((int)$exp < time()) return 'Security check expired. Please reload the page and try again.';
    if ((int)$answer !== ((int)$a + (int)$b)) return 'That answer is incorrect. Please try again.';
    return null;
}

$method = $_SERVER['REQUEST_METHOD'] ?? '';

if ($method === 'GET') {
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode(array_merge(['ok' => true], portal_issue_challenge($cfg)));
    exit;
}

if ($method !== 'POST') {
    header('Allow: GET, POST');
    portal_respond(false, 405, 'Method not allowed.');
}

// Same-origin check: Origin header, else Referer.
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin === '' && !empty($_SERVER['HTTP_REFERER'])) {
    $p = parse_url($_SERVER['HTTP_REFERER']);
    $origin = isset($p['scheme'], $p['host']) ? $p['scheme'] . '://' . $p['host'] . (isset($p['port']) ? ':' . $p['port'] : '') : '';
}
if (!in_array($origin, $cfg['allowed_origins'], true)) portal_respond(false, 403, 'Request origin not allowed.');

// Multipart fields from $_POST (file uploads in $_FILES).
$in = $_POST;
foreach ($in as $k => $v) if (!is_scalar($v)) $in[$k] = '';
$get = fn(string $k, int $max) => portal_clean((string)($in[$k] ?? ''), $max);

// Honeypot + time trap: pretend success so bots learn nothing.
if ($get('website', 200) !== '') portal_respond(true, 200);
$elapsed = $get('elapsed_ms', 12);
if ($elapsed !== '' && (!ctype_digit($elapsed) || (int)$elapsed < 1000 * (int)($cfg['min_fill_seconds'] ?? 3))) {
    portal_respond(true, 200);
}

// Rate limit per IP (shared directory with contact form).
$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$dir = $cfg['rate_dir'];
if (!is_dir($dir)) @mkdir($dir, 0700, true);
$rf = $dir . '/portal-' . hash('sha256', $ip) . '.json';
$now = time(); $win = (int)$cfg['rate_limit']['window_seconds'];
$fh = @fopen($rf, 'c+');
if ($fh) {
    flock($fh, LOCK_EX);
    $hits = array_values(array_filter(json_decode(stream_get_contents($fh) ?: '[]', true) ?: [], fn($t) => $t > $now - $win));
    if (count($hits) >= (int)$cfg['rate_limit']['max']) {
        flock($fh, LOCK_UN); fclose($fh);
        header('Retry-After: ' . $win);
        portal_respond(false, 429, 'Too many quote requests. Please try again later or call us.');
    }
    $hits[] = $now; ftruncate($fh, 0); rewind($fh); fwrite($fh, json_encode($hits)); flock($fh, LOCK_UN); fclose($fh);
}

// Maths challenge (server-issued token + answer).
$challengeErr = portal_verify_challenge($cfg, $get('challenge_token', 200), $get('challenge_answer', 8));
$errors = [];
if ($challengeErr !== null) $errors['challenge_answer'] = $challengeErr;

$data = [
    'form_name' => $get('form_name', 120) ?: 'Customer Portal quote request',
    'name'      => $get('name', 120),
    'phone'     => $get('phone', 40),
    'email'     => $get('email', 160),
    'company'   => $get('company', 160),
    'message'   => $get('message', 4000),
    'request_type' => $get('request_type', 40),
];
$requestTypes = ['service_call' => 'Service call', 'quote_request' => 'Quote request'];
if (!isset($requestTypes[$data['request_type']])) $errors['request_type'] = 'Please choose a service call or a quote request.';
else $data['request_type'] = $requestTypes[$data['request_type']];
if ($data['name'] === '') $errors['name'] = 'Please enter your name.';
elseif (preg_match('/https?:|www\./i', $data['name'])) $errors['name'] = 'Please enter your name without links.';
if ($data['phone'] !== '' && !preg_match('/^[0-9+() .-]{6,40}$/', $data['phone'])) {
    $errors['phone'] = 'Please enter a valid phone number.';
}
if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL) || preg_match('/[\r\n]/', $data['email'])) {
    $errors['email'] = 'Please enter a valid email address.';
}
if ($data['message'] === '') $errors['message'] = 'Please tell us what you need.';
elseif (preg_match('/https?:\/\/\S+/i', $data['message']) && substr_count(strtolower($data['message']), 'http') > 3) {
    $errors['message'] = 'Please keep links to a minimum in your request.';
}
$data['form_name'] = preg_replace('/[\r\n]+/', ' ', $data['form_name']) ?? $data['form_name'];
if (!str_starts_with($data['form_name'], 'Customer Portal')) $data['form_name'] = 'Customer Portal quote request';
$data['name'] = preg_replace('/[\r\n]+/', ' ', $data['name']) ?? $data['name'];
$data['company'] = preg_replace('/[\r\n]+/', ' ', $data['company']) ?? $data['company'];
// Form label follows the chosen request type so subjects/headers never say "quote request" for a service call.
if (in_array($data['request_type'], $requestTypes, true)) {
    $data['form_name'] = 'Customer Portal ' . strtolower($data['request_type']);
}

// Photos: photos[] multipart.
$allowedExt = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif'];
$allowedMime = [
    'image/jpeg' => true, 'image/png' => true, 'image/webp' => true,
    'image/heic' => true, 'image/heif' => true,
];
$attachments = [];
$totalBytes = 0;
$files = $_FILES['photos'] ?? null;
if (is_array($files) && isset($files['name'])) {
    $names = is_array($files['name']) ? $files['name'] : [$files['name']];
    $tmps = is_array($files['tmp_name']) ? $files['tmp_name'] : [$files['tmp_name']];
    $sizes = is_array($files['size']) ? $files['size'] : [$files['size']];
    $errs = is_array($files['error']) ? $files['error'] : [$files['error']];
    $count = count($names);
    if ($count > PORTAL_MAX_FILES) {
        $errors['photos'] = 'You can attach up to ' . PORTAL_MAX_FILES . ' photos.';
    } else {
        $finfo = class_exists('finfo') ? new finfo(FILEINFO_MIME_TYPE) : null;
        for ($i = 0; $i < $count; $i++) {
            if ((int)$errs[$i] === UPLOAD_ERR_NO_FILE || $names[$i] === '') continue;
            if ((int)$errs[$i] !== UPLOAD_ERR_OK) {
                $errors['photos'] = 'One of the photos failed to upload. Please try again with smaller JPG, PNG or WebP files.';
                break;
            }
            $size = (int)$sizes[$i];
            if ($size <= 0 || $size > PORTAL_MAX_FILE_BYTES) {
                $errors['photos'] = 'Each photo must be under 4 MB.';
                break;
            }
            $totalBytes += $size;
            if ($totalBytes > PORTAL_MAX_TOTAL_BYTES) {
                $errors['photos'] = 'Total photo size must be under 12 MB.';
                break;
            }
            $base = basename((string)$names[$i]);
            $ext = strtolower(pathinfo($base, PATHINFO_EXTENSION));
            if (!in_array($ext, $allowedExt, true)) {
                $errors['photos'] = 'Photos must be JPG, PNG, WebP or HEIC.';
                break;
            }
            $tmp = (string)$tmps[$i];
            if (!is_uploaded_file($tmp)) {
                $errors['photos'] = 'Invalid upload. Please try again.';
                break;
            }
            $mime = $finfo ? ($finfo->file($tmp) ?: '') : '';
            $okMime = isset($allowedMime[$mime])
                || (($ext === 'heic' || $ext === 'heif') && ($mime === '' || $mime === 'application/octet-stream'));
            if (!$okMime) {
                $errors['photos'] = 'One file does not look like an allowed image type.';
                break;
            }
            $safeName = preg_replace('/[^A-Za-z0-9._-]+/', '_', $base) ?: ('photo-' . ($i + 1) . '.' . $ext);
            $attachments[] = ['path' => $tmp, 'name' => $safeName, 'mime' => $mime ?: 'application/octet-stream', 'size' => $size];
        }
    }
}
if ($data['request_type'] === 'Service call' && !count($attachments) && !isset($errors['photos'])) {
    $errors['photos'] = 'Please attach at least one photo for a service call.';
}

if ($errors) portal_respond(false, 422, 'Please check the highlighted fields.', $errors);

$photoNote = count($attachments) ? (count($attachments) . ' photo(s) attached') : 'No photos attached';
$photoListPlain = '';
foreach ($attachments as $a) {
    $photoListPlain .= ' - ' . $a['name'] . ' (' . $a['size'] . " bytes)\n";
}

$labels = [
    'Form' => 'form_name',
    'Request type' => 'request_type',
    'Name' => 'name',
    'Phone' => 'phone',
    'Email' => 'email',
    'Company / site' => 'company',
    'What they need' => 'message',
];

$staffRows = '';
foreach ($labels as $label => $k) {
    $val = $data[$k] !== '' ? $data[$k] : '—';
    $cell = ($k === 'message')
        ? nl2br(portal_h($val))
        : portal_h($val);
    if ($k === 'email' && $data['email'] !== '') {
        $cell = '<a href="mailto:' . portal_h($data['email']) . '" style="color:#1769e0;text-decoration:none;">' . portal_h($data['email']) . '</a>';
    }
    if ($k === 'phone' && $data['phone'] !== '') {
        $tel = preg_replace('/[^0-9+]/', '', $data['phone']) ?? $data['phone'];
        $cell = '<a href="tel:' . portal_h($tel) . '" style="color:#1769e0;text-decoration:none;">' . portal_h($data['phone']) . '</a>';
    }
    $staffRows .= '<tr>'
        . '<td style="padding:10px 14px;border-bottom:1px solid #ecece8;width:38%;font-size:13px;font-weight:700;color:#6b6b6b;vertical-align:top;font-family:Manrope,Arial,Helvetica,sans-serif;">'
        . portal_h($label) . '</td>'
        . '<td style="padding:10px 14px;border-bottom:1px solid #ecece8;font-size:15px;color:#050505;vertical-align:top;">'
        . $cell . '</td></tr>';
}
$staffRows .= '<tr>'
    . '<td style="padding:10px 14px;border-bottom:1px solid #ecece8;width:38%;font-size:13px;font-weight:700;color:#6b6b6b;vertical-align:top;font-family:Manrope,Arial,Helvetica,sans-serif;">Photos</td>'
    . '<td style="padding:10px 14px;border-bottom:1px solid #ecece8;font-size:15px;color:#050505;vertical-align:top;">'
    . portal_h($photoNote);
if ($attachments) {
    $staffRows .= '<ul style="margin:8px 0 0;padding:0 0 0 18px;">';
    foreach ($attachments as $a) {
        $staffRows .= '<li style="margin:0 0 4px;">' . portal_h($a['name']) . ' <span style="color:#6b6b6b;font-size:12px;">(' . (int)$a['size'] . ' bytes)</span></li>';
    }
    $staffRows .= '</ul>';
}
$staffRows .= '</td></tr>';

$isServiceCall = ($data['request_type'] === 'Service call');
$requestLabelShort = $isServiceCall ? 'service call' : 'quote request';
$requestLabelTitle = $isServiceCall ? 'Service call' : 'Quote request';
$requestKicker = $isServiceCall ? 'Service Call Request Received' : 'Quote Request Received';
$requestThanks = $isServiceCall ? 'Thanks for requesting a service call' : 'Thanks for requesting a quote';

$staffInner = '<p style="margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#f7c600;font-family:Manrope,Arial,Helvetica,sans-serif;">New portal submission</p>'
    . '<h1 style="margin:0 0 18px;font-family:Manrope,Arial,Helvetica,sans-serif;font-weight:800;font-size:24px;line-height:1.25;color:#050505;">'
    . portal_h($requestLabelTitle) . ' from ' . portal_h($data['name']) . '</h1>'
    . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #ecece8;border-radius:12px;overflow:hidden;background:#fafaf8;">'
    . $staffRows
    . '</table>'
    . '<p style="margin:18px 0 0;font-size:12px;color:#9a9a9a;">Sent from the SPL Customer Portal. IP ' . portal_h($ip) . '</p>';

$staffHtml = portal_email_shell(
    'Customer Portal ' . $requestLabelShort . ' — ' . $data['name'],
    $staffInner,
    $data['request_type'] . ' from ' . $data['name'] . ' via Customer Portal'
);

$text = '';
foreach ($data as $k => $v) {
    $text .= ucfirst(str_replace('_', ' ', $k)) . ": $v\n";
}
$text .= "Photos: $photoNote\n" . $photoListPlain;
$text .= "IP: $ip\n";

$subject = 'Customer Portal ' . $requestLabelShort . ' - ' . $data['name'];

$customerSubject = "We've received your {$requestLabelShort} — SPL Security Solutions";
$photoBit = count($attachments) ? ' and ' . count($attachments) . ' photo(s)' : '';
$customerText = "Hi {$data['name']},\n\n"
    . "{$requestThanks} through the SPL Customer Portal.\n\n"
    . "We've received your {$requestLabelShort}{$photoBit}. Our team will contact you as soon as possible.\n\n"
    . "Your request:\n" . preg_replace('/^/m', '  ', $data['message']) . "\n\n"
    . "If you need urgent help (for example if you are locked out), call (07) 55 888 111 — available 24/7.\n\n"
    . "Kind regards,\nSPL Security Solutions\n(07) 55 888 111\ninfo@spl.com.au\n";

$customerInner = '<p style="margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#f7c600;font-family:Manrope,Arial,Helvetica,sans-serif;">'
    . portal_h($requestKicker) . '</p>'
    . '<h1 style="margin:0 0 16px;font-family:Manrope,Arial,Helvetica,sans-serif;font-weight:800;font-size:24px;line-height:1.25;color:#050505;">Thanks, ' . portal_h($data['name']) . '</h1>'
    . '<p style="margin:0 0 14px;color:#333333;">' . portal_h($requestThanks) . ' through the SPL Customer Portal.</p>'
    . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 18px;background:#111111;border-radius:12px;border-left:4px solid #f7c600;">'
    . '<tr><td style="padding:16px 18px;color:#eeeeee;font-size:15px;line-height:1.5;">'
    . "We've received your " . portal_h($requestLabelShort) . portal_h($photoBit) . '. '
    . '<strong style="color:#ffffff;">Our team will contact you as soon as possible.</strong>'
    . '</td></tr></table>'
    . '<p style="margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#6b6b6b;font-family:Manrope,Arial,Helvetica,sans-serif;">Your request</p>'
    . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 18px;background:#fafaf8;border:1px solid #ecece8;border-radius:12px;">'
    . '<tr><td style="padding:14px 16px;color:#050505;font-size:15px;line-height:1.55;">' . nl2br(portal_h($data['message'])) . '</td></tr></table>'
    . '<p style="margin:0 0 14px;color:#333333;">If you need urgent help (for example if you are locked out), call '
    . '<a href="tel:+61755888111" style="color:#050505;font-weight:700;text-decoration:none;">(07) 55 888 111</a> — available 24/7.</p>'
    . '<p style="margin:0;color:#333333;">Kind regards,<br>'
    . '<strong style="font-family:Manrope,Arial,Helvetica,sans-serif;">SPL Security Solutions</strong><br>'
    . '(07) 55 888 111<br>'
    . '<a href="mailto:info@spl.com.au" style="color:#1769e0;text-decoration:none;">info@spl.com.au</a></p>';

$customerHtml = portal_email_shell(
    $customerSubject,
    $customerInner,
    "We've received your {$requestLabelShort}. Our team will contact you as soon as possible."
);

if (($cfg['transport'] ?? 'smtp') === 'log') {
    $entry = [
        'time' => date('c'),
        'source' => 'portal-quote',
        'to' => $portalToEmail,
        'reply_to' => $data['email'],
        'subject' => $subject,
        'body' => $text,
        'body_html' => $staffHtml,
        'photos' => array_map(fn($a) => ['name' => $a['name'], 'size' => $a['size'], 'mime' => $a['mime']], $attachments),
        'customer_reply' => [
            'to' => $data['email'],
            'from' => $portalFromEmail,
            'subject' => $customerSubject,
            'body' => $customerText,
            'body_html' => $customerHtml,
        ],
    ];
    file_put_contents($cfg['log_file'], json_encode($entry) . "\n", FILE_APPEND | LOCK_EX);
    portal_respond(true, 200);
}

function portal_configure_mailer(PHPMailer $mail, array $cfg): void {
    $transport = $cfg['transport'] ?? 'smtp';
    if ($transport === 'mail') {
        $mail->isMail();
    } else {
        $mail->isSMTP();
        $mail->Host = $cfg['smtp_host']; $mail->Port = (int)$cfg['smtp_port'];
        $mail->SMTPAuth = (bool)$cfg['smtp_auth'];
        if ($mail->SMTPAuth) { $mail->Username = $cfg['smtp_user']; $mail->Password = $cfg['smtp_pass']; }
        $mail->SMTPSecure = $cfg['smtp_secure'] === 'ssl' ? PHPMailer::ENCRYPTION_SMTPS : ($cfg['smtp_secure'] === 'tls' ? PHPMailer::ENCRYPTION_STARTTLS : '');
        $mail->SMTPAutoTLS = $cfg['smtp_secure'] !== '';
    }
    $mail->CharSet = 'UTF-8';
}

// 1) Notify SPL
$mail = new PHPMailer(true);
try {
    portal_configure_mailer($mail, $cfg);
    $mail->setFrom($portalFromEmail, $portalFromName);
    $mail->addAddress($portalToEmail);
    $mail->addReplyTo($data['email'], $data['name']);
    $mail->Subject = $subject;
    $mail->isHTML(true);
    $mail->Body = $staffHtml;
    $mail->AltBody = $text;
    foreach ($attachments as $a) {
        $mail->addAttachment($a['path'], $a['name']);
    }
    $mail->send();
} catch (MailException $e) {
    error_log('SPL portal quote mail error: ' . $mail->ErrorInfo);
    portal_respond(false, 502, 'Sorry, your quote request could not be sent. Please call (07) 55 888 111.');
}

// 2) Confirmation to the customer (same From as contact form). Failure here is logged but does not undo success.
try {
    $reply = new PHPMailer(true);
    portal_configure_mailer($reply, $cfg);
    $reply->setFrom($portalFromEmail, $portalFromName);
    $reply->addAddress($data['email'], $data['name']);
    $reply->addReplyTo($portalToEmail, 'SPL Security Solutions');
    $reply->Subject = $customerSubject;
    $reply->isHTML(true);
    $reply->Body = $customerHtml;
    $reply->AltBody = $customerText;
    $reply->send();
} catch (MailException $e) {
    error_log('SPL portal quote customer reply error: ' . ($reply->ErrorInfo ?? $e->getMessage()));
}

portal_respond(true, 200);
