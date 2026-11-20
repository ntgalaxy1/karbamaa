<?php
/**
 * Karbama Central Persistent Storage API (Seekers, Partners, Jobs, Hotels, Applications, Notifications, Settings)
 * Stores all live records on the server disk so Admin Panel, Partners, and Job Seekers
 * see the exact same persistent state across refreshes (F5), devices, and browsers.
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

function defaultStore() {
    return [
        'seekers' => [],
        'partners' => [],
        'jobs' => [],
        'hotels' => [],
        'applications' => [],
        'addresses' => [],
        'notifications' => [],
        'adminNotifications' => [],
        'chats' => [],
        'paymentSettings' => null,
        'partnerPlans' => null,
        'brokerSettings' => null,
        'adminAlertSettings' => null,
        'deletedJobIds' => [],
        'deletedSeekerIds' => [],
        'deletedHotelIds' => [],
        'deletedNotificationIds' => [],
        'readNotificationIds' => [],
        'deletedAdminNotificationIds' => [],
        'readAdminNotificationIds' => [],
    ];
}

function readUsersStore($file) {
    $defaults = defaultStore();
    if (!file_exists($file)) {
        return $defaults;
    }
    $raw = @file_get_contents($file);
    if (!$raw) {
        return $defaults;
    }
    $decoded = @json_decode($raw, true);
    if (!is_array($decoded)) {
        return $defaults;
    }
    foreach ($defaults as $key => $defaultVal) {
        if (!array_key_exists($key, $decoded)) {
            $decoded[$key] = $defaultVal;
        } elseif (is_array($defaultVal) && !is_array($decoded[$key])) {
            $decoded[$key] = $defaultVal;
        }
    }
    return $decoded;
}

function writeUsersStore($file, $store) {
    @file_put_contents(
        $file,
        json_encode($store, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT),
        LOCK_EX
    );
}

function addUniqueString(&$arr, $val) {
    $str = trim((string)$val);
    if ($str !== '' && !in_array($str, $arr, true)) {
        $arr[] = $str;
    }
}

function removeStringValue(&$arr, $val) {
    $str = trim((string)$val);
    $arr = array_values(array_filter($arr, function ($item) use ($str) {
        return (string)$item !== $str;
    }));
}

function upsertArrayRecord(&$list, $record) {
    $id = (string)($record['id'] ?? '');
    if ($id === '') return;
    $found = false;
    foreach ($list as $idx => $existing) {
        if (($existing['id'] ?? '') === $id) {
            $list[$idx] = array_merge($existing, $record);
            $found = true;
            break;
        }
    }
    if (!$found) {
        array_unshift($list, $record);
    }
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $store = readUsersStore($usersFile);
    echo json_encode([
        'ok' => true,
        'seekers' => array_values($store['seekers']),
        'partners' => array_values($store['partners']),
        'jobs' => array_values($store['jobs']),
        'hotels' => array_values($store['hotels']),
        'applications' => array_values($store['applications']),
        'addresses' => array_values($store['addresses']),
        'notifications' => array_values($store['notifications']),
        'adminNotifications' => array_values($store['adminNotifications']),
        'chats' => array_values($store['chats']),
        'paymentSettings' => $store['paymentSettings'],
        'partnerPlans' => $store['partnerPlans'],
        'brokerSettings' => $store['brokerSettings'],
        'adminAlertSettings' => $store['adminAlertSettings'],
        'deletedJobIds' => array_values($store['deletedJobIds']),
        'deletedSeekerIds' => array_values($store['deletedSeekerIds']),
        'deletedHotelIds' => array_values($store['deletedHotelIds']),
        'deletedNotificationIds' => array_values($store['deletedNotificationIds']),
        'readNotificationIds' => array_values($store['readNotificationIds']),
        'deletedAdminNotificationIds' => array_values($store['deletedAdminNotificationIds']),
        'readAdminNotificationIds' => array_values($store['readAdminNotificationIds']),
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($method === 'POST') {
    $rawBody = file_get_contents('php://input');
    $payload = @json_decode($rawBody, true);
    if (!is_array($payload)) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'Invalid JSON payload']);
        exit;
    }

    $store = readUsersStore($usersFile);
    $action = $payload['action'] ?? 'upsert';

    if ($action === 'upsert') {
        $type = $payload['type'] ?? null;
        $record = $payload['record'] ?? null;

        if ($record === null) {
            if (isset($payload['seeker']) && is_array($payload['seeker'])) {
                $type = 'seeker';
                $record = $payload['seeker'];
            } elseif (isset($payload['partner']) && is_array($payload['partner'])) {
                $type = 'partner';
                $record = $payload['partner'];
            } elseif (isset($payload['job']) && is_array($payload['job'])) {
                $type = 'job';
                $record = $payload['job'];
            } elseif (isset($payload['hotel']) && is_array($payload['hotel'])) {
                $type = 'hotel';
                $record = $payload['hotel'];
            } elseif (isset($payload['application']) && is_array($payload['application'])) {
                $type = 'application';
                $record = $payload['application'];
            } elseif (isset($payload['address']) && is_array($payload['address'])) {
                $type = 'address';
                $record = $payload['address'];
            } elseif (isset($payload['notification']) && is_array($payload['notification'])) {
                $type = 'notification';
                $record = $payload['notification'];
            } elseif (isset($payload['adminNotification']) && is_array($payload['adminNotification'])) {
                $type = 'admin_notification';
                $record = $payload['adminNotification'];
            } elseif (isset($payload['chat']) && is_array($payload['chat'])) {
                $type = 'chat';
                $record = $payload['chat'];
            }
        }
        if ($type === null) {
            $type = 'seeker';
        }

        if ($type === 'payment_settings' && is_array($record)) {
            $store['paymentSettings'] = is_array($store['paymentSettings'])
                ? array_merge($store['paymentSettings'], $record)
                : $record;
            writeUsersStore($usersFile, $store);
            echo json_encode(['ok' => true]);
            exit;
        }

        if ($type === 'partner_plans' && is_array($record)) {
            $store['partnerPlans'] = array_values($record);
            writeUsersStore($usersFile, $store);
            echo json_encode(['ok' => true]);
            exit;
        }

        if ($type === 'broker_settings' && is_array($record)) {
            $store['brokerSettings'] = is_array($store['brokerSettings'])
                ? array_merge($store['brokerSettings'], $record)
                : $record;
            writeUsersStore($usersFile, $store);
            echo json_encode(['ok' => true]);
            exit;
        }

        if ($type === 'admin_alert_settings' && is_array($record)) {
            $store['adminAlertSettings'] = is_array($store['adminAlertSettings'])
                ? array_merge($store['adminAlertSettings'], $record)
                : $record;
            writeUsersStore($usersFile, $store);
            echo json_encode(['ok' => true]);
            exit;
        }

        if (!is_array($record) || empty($record['id'])) {
            http_response_code(400);
            echo json_encode(['ok' => false, 'error' => 'Missing record id']);
            exit;
        }

        $recordId = (string)$record['id'];

        if ($type === 'partner') {
            upsertArrayRecord($store['partners'], $record);
        } elseif ($type === 'job') {
            removeStringValue($store['deletedJobIds'], $recordId);
            upsertArrayRecord($store['jobs'], $record);
        } elseif ($type === 'hotel') {
            removeStringValue($store['deletedHotelIds'], $recordId);
            upsertArrayRecord($store['hotels'], $record);
        } elseif ($type === 'application') {
            upsertArrayRecord($store['applications'], $record);
        } elseif ($type === 'address') {
            upsertArrayRecord($store['addresses'], $record);
        } elseif ($type === 'chat') {
            upsertArrayRecord($store['chats'], $record);
        } elseif ($type === 'admin_notification') {
            if (!in_array($recordId, $store['deletedAdminNotificationIds'], true)) {
                if (in_array($recordId, $store['readAdminNotificationIds'], true)) {
                    $record['read'] = true;
                }
                upsertArrayRecord($store['adminNotifications'], $record);
            }
        } elseif ($type === 'notification') {
            if (!in_array($recordId, $store['deletedNotificationIds'], true)) {
                upsertArrayRecord($store['notifications'], $record);
            }
        } else {
            removeStringValue($store['deletedSeekerIds'], $recordId);
            upsertArrayRecord($store['seekers'], $record);
        }

        writeUsersStore($usersFile, $store);
        echo json_encode(['ok' => true]);
        exit;
    }

    if ($action === 'delete_seeker') {
        $id = (string)($payload['id'] ?? '');
        if ($id !== '') {
            addUniqueString($store['deletedSeekerIds'], $id);
            $store['seekers'] = array_values(array_filter($store['seekers'], function ($s) use ($id) {
                return ($s['id'] ?? '') !== $id;
            }));
            writeUsersStore($usersFile, $store);
        }
        echo json_encode(['ok' => true]);
        exit;
    }

    if ($action === 'clear_seekers') {
        foreach ($store['seekers'] as $s) {
            if (!empty($s['id'])) {
                addUniqueString($store['deletedSeekerIds'], $s['id']);
            }
        }
        $store['seekers'] = [];
        writeUsersStore($usersFile, $store);
        echo json_encode(['ok' => true]);
        exit;
    }

    if ($action === 'delete_job') {
        $id = (string)($payload['id'] ?? '');
        if ($id !== '') {
            addUniqueString($store['deletedJobIds'], $id);
            addUniqueString($store['deletedNotificationIds'], 'job-' . $id);
            addUniqueString($store['readNotificationIds'], 'job-' . $id);
            $store['jobs'] = array_values(array_filter($store['jobs'], function ($j) use ($id) {
                return ($j['id'] ?? '') !== $id;
            }));
            $store['notifications'] = array_values(array_filter($store['notifications'], function ($n) use ($id) {
                return ($n['jobId'] ?? '') !== $id && ($n['id'] ?? '') !== $id;
            }));
            writeUsersStore($usersFile, $store);
        }
        echo json_encode(['ok' => true]);
        exit;
    }

    if ($action === 'delete_hotel') {
        $id = (string)($payload['id'] ?? '');
        if ($id !== '') {
            addUniqueString($store['deletedHotelIds'], $id);
            $store['hotels'] = array_values(array_filter($store['hotels'], function ($h) use ($id) {
                return ($h['id'] ?? '') !== $id;
            }));
            writeUsersStore($usersFile, $store);
        }
        echo json_encode(['ok' => true]);
        exit;
    }

    if ($action === 'delete_address') {
        $id = (string)($payload['id'] ?? '');
        if ($id !== '') {
            $store['addresses'] = array_values(array_filter($store['addresses'], function ($a) use ($id) {
                return ($a['id'] ?? '') !== $id;
            }));
            writeUsersStore($usersFile, $store);
        }
        echo json_encode(['ok' => true]);
        exit;
    }

    if ($action === 'mark_notification_read') {
        $id = (string)($payload['id'] ?? '');
        $jobId = (string)($payload['jobId'] ?? '');
        $ids = isset($payload['ids']) && is_array($payload['ids']) ? $payload['ids'] : ($id !== '' ? [$id] : []);
        foreach ($ids as $nid) {
            addUniqueString($store['readNotificationIds'], $nid);
        }
        if ($jobId !== '') {
            addUniqueString($store['readNotificationIds'], 'job-' . $jobId);
        }
        foreach ($store['notifications'] as $idx => $n) {
            $nid = (string)($n['id'] ?? '');
            $njid = (string)($n['jobId'] ?? '');
            if (in_array($nid, $ids, true) || ($jobId !== '' && $njid === $jobId)) {
                $store['notifications'][$idx]['read'] = true;
                if ($njid !== '') {
                    addUniqueString($store['readNotificationIds'], 'job-' . $njid);
                }
            }
        }
        writeUsersStore($usersFile, $store);
        echo json_encode(['ok' => true]);
        exit;
    }

    if ($action === 'delete_notification') {
        $id = (string)($payload['id'] ?? '');
        $jobId = (string)($payload['jobId'] ?? '');
        if ($id !== '') {
            addUniqueString($store['deletedNotificationIds'], $id);
            addUniqueString($store['readNotificationIds'], $id);
        }
        if ($jobId !== '') {
            addUniqueString($store['deletedNotificationIds'], 'job-' . $jobId);
            addUniqueString($store['readNotificationIds'], 'job-' . $jobId);
        }
        $store['notifications'] = array_values(array_filter($store['notifications'], function ($n) use ($id, $jobId) {
            $nid = (string)($n['id'] ?? '');
            $njid = (string)($n['jobId'] ?? '');
            if ($id !== '' && $nid === $id) return false;
            if ($jobId !== '' && $njid === $jobId) return false;
            return true;
        }));
        writeUsersStore($usersFile, $store);
        echo json_encode(['ok' => true]);
        exit;
    }

    if ($action === 'clear_notifications') {
        $ids = isset($payload['ids']) && is_array($payload['ids']) ? $payload['ids'] : [];
        foreach ($ids as $nid) {
            addUniqueString($store['deletedNotificationIds'], $nid);
            addUniqueString($store['readNotificationIds'], $nid);
        }
        foreach ($store['notifications'] as $n) {
            if (!empty($n['id'])) {
                addUniqueString($store['deletedNotificationIds'], $n['id']);
                addUniqueString($store['readNotificationIds'], $n['id']);
            }
            if (!empty($n['jobId'])) {
                addUniqueString($store['deletedNotificationIds'], 'job-' . $n['jobId']);
                addUniqueString($store['readNotificationIds'], 'job-' . $n['jobId']);
            }
        }
        $store['notifications'] = [];
        writeUsersStore($usersFile, $store);
        echo json_encode(['ok' => true]);
        exit;
    }

    if ($action === 'mark_admin_notification_read') {
        $id = (string)($payload['id'] ?? '');
        $ids = isset($payload['ids']) && is_array($payload['ids']) ? $payload['ids'] : ($id !== '' ? [$id] : []);
        foreach ($ids as $nid) {
            addUniqueString($store['readAdminNotificationIds'], $nid);
        }
        foreach ($store['adminNotifications'] as $idx => $n) {
            $nid = (string)($n['id'] ?? '');
            if (in_array($nid, $ids, true)) {
                $store['adminNotifications'][$idx]['read'] = true;
            }
        }
        writeUsersStore($usersFile, $store);
        echo json_encode(['ok' => true]);
        exit;
    }

    if ($action === 'delete_admin_notification') {
        $id = (string)($payload['id'] ?? '');
        if ($id !== '') {
            addUniqueString($store['deletedAdminNotificationIds'], $id);
            addUniqueString($store['readAdminNotificationIds'], $id);
            $store['adminNotifications'] = array_values(array_filter($store['adminNotifications'], function ($n) use ($id) {
                return ($n['id'] ?? '') !== $id;
            }));
            writeUsersStore($usersFile, $store);
        }
        echo json_encode(['ok' => true]);
        exit;
    }

    if ($action === 'clear_admin_notifications') {
        $ids = isset($payload['ids']) && is_array($payload['ids']) ? $payload['ids'] : [];
        foreach ($ids as $nid) {
            addUniqueString($store['deletedAdminNotificationIds'], $nid);
            addUniqueString($store['readAdminNotificationIds'], $nid);
        }
        foreach ($store['adminNotifications'] as $n) {
            if (!empty($n['id'])) {
                addUniqueString($store['deletedAdminNotificationIds'], $n['id']);
                addUniqueString($store['readAdminNotificationIds'], $n['id']);
            }
        }
        $store['adminNotifications'] = [];
        writeUsersStore($usersFile, $store);
        echo json_encode(['ok' => true]);
        exit;
    }

    echo json_encode(['ok' => true]);
    exit;
}

http_response_code(405);
echo json_encode(['ok' => false, 'error' => 'Method not allowed']);

