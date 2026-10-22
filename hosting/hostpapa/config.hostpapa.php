<?php
// HostPapa cPanel config for /api/contact.php. Built into public_html/api/config.php (blocked from the web by api/.htaccess).
// Default transport 'mail' = PHP mail() via the server's sendmail (no password stored here).
return [
    'transport'   => 'mail',                  // 'mail' (cPanel local mail) | 'smtp' (authenticated mailbox, better deliverability) | 'log' (testing, sends nothing)
    // PLACEHOLDER: must be a real mailbox on spl.com.au (create in cPanel > Email Accounts), and spl.com.au SPF/DKIM must cover this server.
    'from_email'  => 'info@spl.com.au',
    'from_name'   => 'SPL Security website',
    'to_email'    => 'support@spl.com.au',    // TESTING. Switch to info@spl.com.au at launch.
    // Only used when transport = 'smtp' (cPanel > Email Accounts > Connect Devices shows these):
    'smtp_host'   => 'mail.spl.com.au',
    'smtp_port'   => 465,
    'smtp_secure' => 'ssl',
    'smtp_auth'   => true,
    'smtp_user'   => 'website@spl.com.au',
    'smtp_pass'   => 'CHANGE_ME',             // set on the server only; never commit
    'allowed_origins' => ['https://spl.com.au', 'https://www.spl.com.au'],  // add http://spl.com.au only if testing before SSL
    'min_fill_seconds' => 3,
    'thank_you_url'   => '/thank-you/',
    'rate_limit'      => ['max' => 5, 'window_seconds' => 600],
    // Outside the web root: public_html/api -> /home/splco501/spl-ratelimit (created automatically, 0700)
    'rate_dir'        => dirname(__DIR__, 2) . '/spl-ratelimit',
    'log_file'        => dirname(__DIR__, 2) . '/spl-ratelimit/test-mail.log',
];
