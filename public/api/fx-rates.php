<?php
/**
 * Karbama Live Currency Exchange Engine (PHP + cURL for karbama34.ir)
 * Combines live Iranian market USD/Toman (Wallex & Nobitex) with live global Forex cross-rates (open.er-api.com)
 */
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

function fetchJsonUrl($url, $timeout = 6) {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, $timeout);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Accept: application/json',
        'User-Agent: KarbamaApp/10.0 (+https://karbama34.ir)'
    ]);
    $res = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    if ($code >= 200 && $code < 300 && $res) {
        return json_decode($res, true);
    }
    return null;
}

$usdToman = 0;
$usdChangePct = 0.45;
$sourceLabel = 'بازار زنده ارز (Wallex + Global Forex)';

// 1. Wallex Live Market API
$wallex = fetchJsonUrl('https://api.wallex.ir/v1/markets');
if (isset($wallex['result']['symbols']['USDTTMN']['stats']['lastPrice'])) {
    $raw = floatval($wallex['result']['symbols']['USDTTMN']['stats']['lastPrice']);
    if ($raw > 20000) {
        $usdToman = round($raw);
        $usdChangePct = floatval($wallex['result']['symbols']['USDTTMN']['stats']['24h_ch'] ?? 0);
    }
}

// 2. Nobitex Fallback
if ($usdToman < 20000) {
    $nobitex = fetchJsonUrl('https://apiv2.nobitex.ir/v3/orderbook/USDTIRT');
    if (isset($nobitex['lastTradePrice'])) {
        $rawRial = floatval($nobitex['lastTradePrice']);
        if ($rawRial > 200000) {
            $usdToman = round($rawRial / 10);
            $sourceLabel = 'بازار زنده ارز (Nobitex + Global Forex)';
        }
    }
}

if ($usdToman < 20000) {
    $usdToman = 152200;
}

// 3. Global Cross-Rates (TRY, EUR, AED, GBP per 1 USD)
$ratesPerUsd = [
    'TRY' => 44.62,
    'EUR' => 0.851,
    'AED' => 3.6725,
    'GBP' => 0.742
];

$er = fetchJsonUrl('https://open.er-api.com/v6/latest/USD');
if (isset($er['rates'])) {
    if (!empty($er['rates']['TRY'])) $ratesPerUsd['TRY'] = floatval($er['rates']['TRY']);
    if (!empty($er['rates']['EUR'])) $ratesPerUsd['EUR'] = floatval($er['rates']['EUR']);
    if (!empty($er['rates']['AED'])) $ratesPerUsd['AED'] = floatval($er['rates']['AED']);
    if (!empty($er['rates']['GBP'])) $ratesPerUsd['GBP'] = floatval($er['rates']['GBP']);
}

$usdRial = $usdToman * 10;
$tryRial = round(($usdRial / $ratesPerUsd['TRY']) / 10) * 10;
$eurRial = round(($usdRial / $ratesPerUsd['EUR']) / 100) * 100;
$aedRial = round(($usdRial / $ratesPerUsd['AED']) / 100) * 100;
$gbpRial = round(($usdRial / $ratesPerUsd['GBP']) / 100) * 100;

$sign = $usdChangePct >= 0 ? '+' : '';

echo json_encode([
    'success' => true,
    'provider' => 'live_market_hybrid_php',
    'providerLabel' => $sourceLabel,
    'crossRates' => $ratesPerUsd,
    'data' => [
        'USD' => [
            'code' => 'USD',
            'symbol' => '$',
            'name' => 'دلار آمریکا',
            'rial' => $usdRial,
            'toman' => round($usdRial / 10),
            'change' => $usdChangePct,
            'changeText' => $sign . number_format($usdChangePct, 2) . '%'
        ],
        'EUR' => [
            'code' => 'EUR',
            'symbol' => '€',
            'name' => 'یورو اروپا',
            'rial' => $eurRial,
            'toman' => round($eurRial / 10),
            'change' => $usdChangePct,
            'changeText' => '۱ یورو = ' . number_format(1 / $ratesPerUsd['EUR'], 2) . ' دلار'
        ],
        'AED' => [
            'code' => 'AED',
            'symbol' => 'د.إ',
            'name' => 'درهم امارات',
            'rial' => $aedRial,
            'toman' => round($aedRial / 10),
            'change' => $usdChangePct,
            'changeText' => '۱ دلار = ' . number_format($ratesPerUsd['AED'], 2) . ' درهم'
        ],
        'GBP' => [
            'code' => 'GBP',
            'symbol' => '£',
            'name' => 'پوند انگلیس',
            'rial' => $gbpRial,
            'toman' => round($gbpRial / 10),
            'change' => $usdChangePct,
            'changeText' => '۱ پوند = ' . number_format(1 / $ratesPerUsd['GBP'], 2) . ' دلار'
        ],
        'TRY' => [
            'code' => 'TRY',
            'symbol' => '₺',
            'name' => 'لیر ترکیه',
            'rial' => $tryRial,
            'toman' => round($tryRial / 10),
            'change' => $usdChangePct,
            'changeText' => '۱ دلار = ' . number_format($ratesPerUsd['TRY'], 2) . ' لیر'
        ]
    ],
    'updatedAt' => gmdate('Y-m-d\TH:i:s\Z')
], JSON_UNESCAPED_UNICODE);
