<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

$action = $_GET['action'] ?? '';

// Register User -> Store in userdata.txt
if ($action === 'register') {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!empty($data['email']) && !empty($data['password'])) {
        $entry = $data['name'] . "|" . strtolower(trim($data['email'])) . "|" . trim($data['password']) . "|" . date('Y-m-d H:i:s') . "\n";
        file_put_contents('userdata.txt', $entry, FILE_APPEND | LOCK_EX);
        echo json_encode(['success' => true, 'message' => 'User saved to userdata.txt']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid data']);
    }
    exit;
}

// Submit UTR -> Move/Store in UTR.txt
if ($action === 'submit_utr') {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!empty($data['email']) && !empty($data['utr'])) {
        $entry = $data['name'] . "|" . strtolower(trim($data['email'])) . "|" . trim($data['password']) . "|" . trim($data['utr']) . "|" . date('Y-m-d H:i:s') . "\n";
        file_put_contents('UTR.txt', $entry, FILE_APPEND | LOCK_EX);
        echo json_encode(['success' => true, 'message' => 'Payment saved to UTR.txt']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid UTR data']);
    }
    exit;
}

// Universal Sync -> Fetch all registered and paid users across devices
if ($action === 'sync') {
    $registered = [];
    $paid = [];

    if (file_exists('userdata.txt')) {
        $lines = file('userdata.txt', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            $parts = explode('|', $line);
            if (count($parts) >= 3) {
                $registered[] = ['name' => $parts[0], 'email' => $parts[1], 'password' => $parts[2]];
            }
        }
    }

    if (file_exists('UTR.txt')) {
        $lines = file('UTR.txt', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            $parts = explode('|', $line);
            if (count($parts) >= 4) {
                $paid[] = ['name' => $parts[0], 'email' => $parts[1], 'password' => $parts[2], 'utr' => $parts[3]];
            }
        }
    }

    echo json_encode(['registered' => $registered, 'paid' => $paid]);
    exit;
}
?>