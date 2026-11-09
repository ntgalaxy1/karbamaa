<?php
/**
 * Karbama User & Partner Sync API (PHP + MySQL / JSON Fallback)
 * Path: /api/users.php
 * Ensures jobseekers & partners registered on any device can log in from any device
 * even when Firebase is unreachable on Iranian networks.
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$dataDir = __DIR__ . '/sep/data';
if (!is_dir($dataDir)) {
    @mkdir($dataDir, 0755, true);
}
$usersFile = $dataDir . '/users.json';

function readStoredUsers(string $file): array {
    if (!file_exists($file)) {
        return ['seekers' => [], 'partners' => []];
    }
    $raw = @file_get_contents($file);
    $decoded = $raw ? json_decode($raw, true) : null;
    if (!is_array($decoded)) {
        return ['seekers' => [], 'partners' => []];
    }
    return [
        'seekers' => isset($decoded['seekers']) && is_array($decoded['seekers']) ? $decoded['seekers'] : [],
        'partners' => isset($decoded['partners']) && is_array($decoded['partners']) ? $decoded['partners'] : [],
    ];
}

function writeStoredUsers(string $file, array $store): void {
    @file_put_contents($file, json_encode($store, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT), LOCK_EX);
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $store = readStoredUsers($usersFile);
    echo json_encode([
        'success' => true,
        'seekers' => array_values($store['seekers']),
        'partners' => array_values($store['partners']),
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($method === 'POST') {
    $rawBody = file_get_contents('php://input');
    $input = json_decode($rawBody, true);
    if (!is_array($input)) {
        $input = $_POST;
    }

    $action = $input['action'] ?? 'upsert';
    $store = readStoredUsers($usersFile);

    if ($action === 'delete_seeker' && !empty($input['id'])) {
        $targetId = (string)$input['id'];
        $store['seekers'] = array_values(array_filter($store['seekers'], function ($s) use ($targetId) {
            return ($s['id'] ?? '') !== $targetId;
        }));
        writeStoredUsers($usersFile, $store);
        echo json_encode(['success' => true], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if ($action === 'clear_seekers') {
        $store['seekers'] = [];
        writeStoredUsers($usersFile, $store);
        echo json_encode(['success' => true], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if (!empty($input['seeker']) && is_array($input['seeker']) && !empty($input['seeker']['id'])) {
        $seeker = $input['seeker'];
        $found = false;
        foreach ($store['seekers'] as $idx => $existing) {
            if (($existing['id'] ?? '') === $seeker['id'] ||
                (!empty($seeker['username']) && strtolower($existing['username'] ?? '') === strtolower($seeker['username']))) {
                $store['seekers'][$idx] = array_merge($existing, $seeker);
                $found = true;
                break;
            }
        }
        if (!$found) {
            array_unshift($store['seekers'], $seeker);
        }
        writeStoredUsers($usersFile, $store);
        echo json_encode(['success' => true, 'seeker' => $seeker], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if (!empty($input['partner']) && is_array($input['partner']) && !empty($input['partner']['id'])) {
        $partner = $input['partner'];
        $found = false;
        foreach ($store['partners'] as $idx => $existing) {
            if (($existing['id'] ?? '') === $partner['id'] ||
                (!empty($partner['username']) && strtolower($existing['username'] ?? '') === strtolower($partner['username']))) {
                $store['partners'][$idx] = array_merge($existing, $partner);
                $found = true;
                break;
            }
        }
        if (!$found) {
            array_unshift($store['partners'], $partner);
        }
        writeStoredUsers($usersFile, $store);
        echo json_encode(['success' => true, 'partner' => $partner], JSON_UNESCAPED_UNICODE);
        exit;
    }

    echo json_encode(['success' => false, 'error' => 'Invalid payload'], JSON_UNESCAPED_UNICODE);
    exit;
}

echo json_encode(['success' => false, 'error' => 'Method not allowed'], JSON_UNESCAPED_UNICODE);
