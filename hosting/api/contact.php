<?php
// SPL website enquiry endpoint. POST /api/contact (see README "Contact form backend").
declare(strict_types=1);

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception as MailException;

require __DIR__ . '/vendor/autoload.php';
$configFile = getenv('SPL_CONTACT_CONFIG') ?: __DIR__ . '/config.php';
if (!is_file($configFile)) { http_response_code(500); exit('Not configured'); }
$cfg = require $configFile;

$wantsJson = str_contains($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json')
    || str_contains($_SERVER['CONTENT_TYPE'] ?? '', 'application/json');

function respond(bool $ok, int $status, string $error = '', array $fields = []): never {
    global $wantsJson, $cfg;
    http_response_code($status);
    header('Cache-Control: no-store');
    header('X-Content-Type-Options: nosniff');
    if ($wantsJson) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($ok ? ['ok' => true] : ['ok' => false, 'error' => $error, 'fields' => $fields]);
    } elseif ($ok) {
        header('Location: ' . $cfg['thank_you_url'], true, 303);
    } else {
        header('Content-Type: text/html; charset=utf-8');
        echo '<!doctype html><meta charset="utf-8"><meta name="robots" content="noindex"><title>Enquiry not sent</title>'
           . '<p>' . htmlspecialchars($error) . '</p>'
           . ($fields ? '<ul>' . implode('', array_map(fn($m) => '<li>' . htmlspecialchars((string)$m) . '</li>', $fields)) . '</ul>' : '')
           . '<p>Please go back and try again, or call (07) 55 888 111.</p>';
    }
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') { header('Allow: POST'); respond(false, 405, 'Method not allowed.'); }

// Same-origin check: Origin header, else Referer.
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin === '' && !empty($_SERVER['HTTP_REFERER'])) {
    $p = parse_url($_SERVER['HTTP_REFERER']);
    $origin = isset($p['scheme'], $p['host']) ? $p['scheme'] . '://' . $p['host'] . (isset($p['port']) ? ':' . $p['port'] : '') : '';
}
if (!in_array($origin, $cfg['allowed_origins'], true)) respond(false, 403, 'Request origin not allowed.');

// Input (JSON or form-encoded), capped size.
$raw = file_get_contents('php://input', false, null, 0, 20000) ?: '';
$in = str_contains($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') ? json_decode($raw, true) : $_POST;
if (!is_array($in)) $in = [];
foreach ($in as $k => $v) if (!is_scalar($v)) $in[$k] = ''; // arrays/objects are never valid field values
$get = fn(string $k, int $max) => trim(mb_substr(preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', (string)($in[$k] ?? '')) ?? '', 0, $max));

// Honeypot and time trap: pretend success so bots learn nothing. forms.js sends elapsed_ms (time since the
// form was shown); real people take longer than min_fill_seconds. Without JS the field is absent and only the
// honeypot applies.
if ($get('website', 200) !== '') respond(true, 200);
$elapsed = $get('elapsed_ms', 12);
if ($elapsed !== '' && (!ctype_digit($elapsed) || (int)$elapsed < 1000 * (int)($cfg['min_fill_seconds'] ?? 3))) respond(true, 200);

// Rate limit per IP (file-based, sliding window).
$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$dir = $cfg['rate_dir'];
if (!is_dir($dir)) @mkdir($dir, 0700, true);
$rf = $dir . '/' . hash('sha256', $ip) . '.json';
$now = time(); $win = (int)$cfg['rate_limit']['window_seconds'];
$fh = @fopen($rf, 'c+');
if ($fh) {
    flock($fh, LOCK_EX);
    $hits = array_values(array_filter(json_decode(stream_get_contents($fh) ?: '[]', true) ?: [], fn($t) => $t > $now - $win));
    if (count($hits) >= (int)$cfg['rate_limit']['max']) { flock($fh, LOCK_UN); fclose($fh); header('Retry-After: ' . $win); respond(false, 429, 'Too many enquiries. Please try again later or call us.'); }
    $hits[] = $now; ftruncate($fh, 0); rewind($fh); fwrite($fh, json_encode($hits)); flock($fh, LOCK_UN); fclose($fh);
}

// Validate.
$data = [
    'form_name' => $get('form_name', 120) ?: 'Website enquiry',
    'name'      => $get('name', 120),
    'phone'     => $get('phone', 40),
    'email'     => $get('email', 160),
    'service'   => $get('service', 80),
    'message'   => $get('message', 3000),
];
$services = ['General enquiry', 'Locksmiths', 'Electronic security', 'Door hardware', 'Retail & trade'];
if (!in_array($data['service'], $services, true)) $data['service'] = 'General enquiry';
$errors = [];
if ($data['name'] === '') $errors['name'] = 'Please enter your name.';
elseif (preg_match('/https?:|www\./i', $data['name'])) $errors['name'] = 'Please enter your name without links.';
if (!preg_match('/^[0-9+() .-]{6,40}$/', $data['phone'])) $errors['phone'] = 'Please enter a valid phone number.';
if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL) || preg_match('/[\r\n]/', $data['email'])) $errors['email'] = 'Please enter a valid email address.';
if ($data['message'] === '') $errors['message'] = 'Please tell us how we can help.';
if ($errors) respond(false, 422, 'Please check the highlighted fields.', $errors);
$data['form_name'] = preg_replace('/[\r\n]+/', ' ', $data['form_name']);
if (!str_starts_with($data['form_name'], 'Website enquiry')) $data['form_name'] = 'Website enquiry';
$data['name'] = preg_replace('/[\r\n]+/', ' ', $data['name']);

// Send.
$rows = '';
foreach (['Form' => 'form_name', 'Name' => 'name', 'Phone' => 'phone', 'Email' => 'email', 'Service' => 'service', 'Message' => 'message'] as $label => $k) {
    $rows .= '<tr><th align="left" valign="top" style="padding:4px 12px 4px 0">' . $label . '</th><td style="padding:4px 0">' . nl2br(htmlspecialchars($data[$k], ENT_QUOTES)) . '</td></tr>';
}
$text = '';
foreach ($data as $k => $v) $text .= ucfirst(str_replace('_', ' ', $k)) . ": $v\n";

// Local testing: 'transport' => 'log' writes the message to log_file instead of sending (no email leaves the machine).
if (($cfg['transport'] ?? 'smtp') === 'log') {
    $entry = ['time' => date('c'), 'to' => $cfg['to_email'], 'reply_to' => $data['email'], 'subject' => $data['form_name'] . ' - ' . $data['name'], 'body' => $text];
    file_put_contents($cfg['log_file'], json_encode($entry) . "\n", FILE_APPEND | LOCK_EX);
    respond(true, 200);
}

$mail = new PHPMailer(true);
try {
    $mail->isSMTP();
    $mail->Host = $cfg['smtp_host']; $mail->Port = (int)$cfg['smtp_port'];
    $mail->SMTPAuth = (bool)$cfg['smtp_auth'];
    if ($mail->SMTPAuth) { $mail->Username = $cfg['smtp_user']; $mail->Password = $cfg['smtp_pass']; }
    $mail->SMTPSecure = $cfg['smtp_secure'] === 'ssl' ? PHPMailer::ENCRYPTION_SMTPS : ($cfg['smtp_secure'] === 'tls' ? PHPMailer::ENCRYPTION_STARTTLS : '');
    $mail->SMTPAutoTLS = $cfg['smtp_secure'] !== '';
    $mail->CharSet = 'UTF-8';
    $mail->setFrom($cfg['from_email'], $cfg['from_name']);
    $mail->addAddress($cfg['to_email']);
    $mail->addReplyTo($data['email'], $data['name']);
    $mail->Subject = $data['form_name'] . ' - ' . $data['name'];
    $mail->isHTML(true);
    $mail->Body = '<table>' . $rows . '</table><p style="color:#777;font-size:12px">Sent from the SPL website form. IP ' . htmlspecialchars($ip) . '</p>';
    $mail->AltBody = $text . "\nIP: $ip\n";
    $mail->send();
} catch (MailException $e) {
    error_log('SPL contact form mail error: ' . $mail->ErrorInfo);
    respond(false, 502, 'Sorry, your enquiry could not be sent. Please call (07) 55 888 111.');
}
respond(true, 200);
