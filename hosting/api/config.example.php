<?php
// Copy to config.php on the server (same folder) and fill in. config.php is gitignored: never commit credentials.
return [
    'smtp_host'   => 'mail.example.com',      // HostPapa: your cPanel mail server; Microsoft 365: smtp.office365.com
    'smtp_port'   => 587,                     // 587 = STARTTLS, 465 = SMTPS
    'smtp_secure' => 'tls',                   // 'tls' (STARTTLS) | 'ssl' (SMTPS) | '' (none, local testing only)
    'smtp_auth'   => true,
    'smtp_user'   => 'website@spl.com.au',
    'smtp_pass'   => 'CHANGE_ME',
    'from_email'  => 'website@spl.com.au',    // must be a mailbox the SMTP account may send as
    'from_name'   => 'SPL Security website',
    'to_email'    => 'support@spl.com.au',    // testing; switch to info@spl.com.au at launch
    // Origins allowed to post (scheme + host, no trailing slash)
    'allowed_origins' => ['https://spl.com.au', 'https://www.spl.com.au'],  // launch domain; add any other live origin
    'min_fill_seconds' => 3,                  // time trap: faster JS submissions are silently dropped
    'thank_you_url'   => '/thank-you/',
    'rate_limit'      => ['max' => 5, 'window_seconds' => 600],  // per IP
    'rate_dir'        => __DIR__ . '/ratelimit',                  // must be writable; outside web root if possible
    'transport'       => 'smtp',              // 'smtp' (live) | 'log' (local testing: write to log_file, send nothing)
    'log_file'        => __DIR__ . '/ratelimit/test-mail.log',
];
