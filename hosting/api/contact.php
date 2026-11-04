<?php
// SPL website enquiry endpoint. POST /api/contact (see README "Contact form backend").
declare(strict_types=1);

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception as MailException;

require __DIR__ . '/vendor/autoload.php';
$configFile = getenv('SPL_CONTACT_CONFIG') ?: __DIR__ . '/config.php';
if (!is_file($configFile)) { http_response_code(500); exit('Not configured'); }
$cfg = require $configFile;

// Enquiry store: every valid submission is saved (outside public_html) BEFORE any mail is attempted, so an
// enquiry is never lost if mail fails. Default /home/<user>/spl-enquiries/YYYY-MM/<timestamp>-<form>.json (0700/0600).
function spl_enquiry_save(array $cfg, string $form, array $record, array $attachments = []): ?string {
    $base = (string)($cfg['enquiry_dir'] ?? dirname(__DIR__, 2) . '/spl-enquiries');
    $now = new DateTimeImmutable('now', new DateTimeZone('Australia/Brisbane'));
    $dir = $base . '/' . $now->format('Y-m');
    if (!is_dir($dir) && !@mkdir($dir, 0700, true) && !is_dir($dir)) { error_log("SPL enquiry store: cannot create $dir"); return null; }
    @chmod($base, 0700); @chmod($dir, 0700);
    if (!is_file($base . '/.htaccess')) { @file_put_contents($base . '/.htaccess', "Require all denied\nDeny from all\n"); @chmod($base . '/.htaccess', 0600); }
    $stem = $now->format('Ymd-His') . '-' . bin2hex(random_bytes(3)) . '-' . preg_replace('/[^a-z0-9-]+/', '-', strtolower($form));
    $record = ['time' => $now->format('c'), 'form' => $form] + $record;
    if ($attachments) {
        $adir = $dir . '/' . $stem;
        if (@mkdir($adir, 0700) || is_dir($adir)) {
            $saved = [];
            foreach ($attachments as $i => $a) {
                $dest = $adir . '/' . ($i + 1) . '-' . $a['name'];
                $ok = @copy($a['path'], $dest);
                if ($ok) @chmod($dest, 0600); else error_log("SPL enquiry store: cannot copy attachment to $dest");
                $saved[] = ['name' => $a['name'], 'size' => $a['size'], 'mime' => $a['mime'], 'stored' => $ok ? $dest : null];
            }
            $record['attachments'] = $saved;
        } else {
            error_log("SPL enquiry store: cannot create $adir");
        }
    }
    $file = $dir . '/' . $stem . '.json';
    return spl_enquiry_write($file, $record) ? $file : null;
}

function spl_enquiry_write(string $file, array $record): bool {
    $tmp = $file . '.tmp';
    $json = json_encode($record, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
    if ($json === false || @file_put_contents($tmp, $json . "\n", LOCK_EX) === false) { error_log("SPL enquiry store: cannot write $file"); return false; }
    @chmod($tmp, 0600);
    if (!@rename($tmp, $file)) { @unlink($tmp); error_log("SPL enquiry store: cannot rename to $file"); return false; }
    return true;
}

/** Record the mail result on an already-saved enquiry. */
function spl_enquiry_update(?string $file, array $changes): void {
    if ($file === null || !is_file($file)) return;
    $rec = json_decode((string)file_get_contents($file), true);
    if (!is_array($rec)) return;
    spl_enquiry_write($file, array_replace_recursive($rec, $changes));
}

/** Transport from config: 'mail' = PHP mail() via local sendmail/exim, 'smtp' = authenticated SMTP. ('log' is handled before.) */
function spl_configure_mailer(PHPMailer $mail, array $cfg, string $from): void {
    if (($cfg['transport'] ?? 'smtp') === 'mail') {
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
    $mail->Sender = $from; // envelope sender (Return-Path) = From, for SPF/DMARC alignment
}

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
// 'What do you need?' options from the contact form (Oct 2026), plus the earlier values for old cached pages.
// Anything else (tampered or missing) is stored as 'General enquiry'; unknown extra fields are never read or emailed.
$services = ['General enquiry', 'Locksmiths', 'Electronic security', 'Door hardware', 'Retail & trade',
    'Locksmith', 'Emergency lockout', 'Security system', 'Access control', 'CCTV', 'Alarm', 'Intercom', 'Other'];
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

// Save a copy first (all transports), then send.
$subject = $data['form_name'] . ' - ' . $data['name'];
$transport = (string)($cfg['transport'] ?? 'smtp');
$saved = spl_enquiry_save($cfg, 'contact', [
    'ip' => $ip,
    'user_agent' => mb_substr((string)($_SERVER['HTTP_USER_AGENT'] ?? ''), 0, 300),
    'origin' => $origin,
    'fields' => $data,
    'mail' => ['transport' => $transport, 'from' => $cfg['from_email'], 'to' => $cfg['to_email'], 'reply_to' => $data['email'], 'subject' => $subject, 'status' => 'pending'],
]);

// Local testing: 'transport' => 'log' writes the message to log_file instead of sending (no email leaves the machine).
if ($transport === 'log') {
    $entry = ['time' => date('c'), 'to' => $cfg['to_email'], 'reply_to' => $data['email'], 'subject' => $subject, 'body' => $text];
    file_put_contents($cfg['log_file'], json_encode($entry) . "\n", FILE_APPEND | LOCK_EX);
    spl_enquiry_update($saved, ['mail' => ['status' => 'logged']]);
    respond(true, 200);
}

$mail = new PHPMailer(true);
try {
    spl_configure_mailer($mail, $cfg, $cfg['from_email']);
    $mail->setFrom($cfg['from_email'], $cfg['from_name']);
    $mail->addAddress($cfg['to_email']);
    $mail->addReplyTo($data['email'], $data['name']);
    $mail->Subject = $subject;
    $mail->isHTML(true);
    $mail->Body = '<table>' . $rows . '</table><p style="color:#777;font-size:12px">Sent from the SPL website form. IP ' . htmlspecialchars($ip) . '</p>';
    $mail->AltBody = $text . "\nIP: $ip\n";
    $mail->send();
    spl_enquiry_update($saved, ['mail' => ['status' => 'sent', 'message_id' => $mail->getLastMessageID(), 'sent_at' => date('c')]]);
} catch (MailException $e) {
    error_log('SPL contact form mail error: ' . $mail->ErrorInfo . ($saved ? " (enquiry saved: $saved)" : ' (ENQUIRY NOT SAVED)'));
    spl_enquiry_update($saved, ['mail' => ['status' => 'failed', 'error' => $mail->ErrorInfo, 'failed_at' => date('c')]]);
    // The enquiry is captured on disk, so the visitor still gets success; only fail if it was neither saved nor sent.
    if ($saved === null) respond(false, 502, 'Sorry, your enquiry could not be sent. Please call (07) 55 888 111.');
}
respond(true, 200);
