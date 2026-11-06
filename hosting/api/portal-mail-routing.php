<?php
declare(strict_types=1);

/**
 * Choose the staff notification recipient for a Customer Portal submission.
 *
 * The request type MUST be an allowlisted key (the <select> option values), never a free-text
 * label and never an email address from user input. Addresses come only from config / defaults.
 *
 * - service_call  → portal_to_email_service_call  (default service@spl.com.au)
 * - quote_request → portal_to_email_quote_request (default sales@spl.com.au)
 * - missing / unrecognised → portal_to_email (default service@spl.com.au)
 */
function portal_staff_recipient(string $requestTypeKey, array $cfg): string
{
    $fallback = (string)($cfg['portal_to_email'] ?? 'service@spl.com.au');
    if ($fallback === '' || !filter_var($fallback, FILTER_VALIDATE_EMAIL)) {
        $fallback = 'service@spl.com.au';
    }

    // Allowlist of form option values → config key (addresses never taken from user input).
    $routes = [
        'service_call'  => (string)($cfg['portal_to_email_service_call']  ?? 'service@spl.com.au'),
        'quote_request' => (string)($cfg['portal_to_email_quote_request'] ?? 'sales@spl.com.au'),
    ];

    if (!array_key_exists($requestTypeKey, $routes)) {
        return $fallback;
    }

    $addr = $routes[$requestTypeKey];
    return ($addr !== '' && filter_var($addr, FILTER_VALIDATE_EMAIL)) ? $addr : $fallback;
}
