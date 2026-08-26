<?php
header('Content-Type: application/json');

$action = $_GET['action'] ?? '';
$userDataFile = 'userdata.txt';
$utrDataFile = 'UTR.txt';

// Helper function to check if a user is premium based on UTR.txt
function isPremium($email, $utrDataFile) {
    if (!file_exists($utrDataFile)) return false;
    $lines = file($utrDataFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $parts = explode('|', $line);
        if (trim($parts[0]) === $email) {
            return true;
        }
    }
    return false;
}

if ($action === 'register') {
    $name = trim($_POST['name'] ?? '');
    $email = strtolower(trim($_POST['email'] ?? ''));
    $password = $_POST['password'] ?? '';

    // Check if user already exists
    if (file_exists($userDataFile)) {
        $lines = file($userDataFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            $parts = explode('|', $line);
            if (trim($parts[0]) === $email) {
                echo json_encode(['success' => false, 'message' => 'Email is already registered!']);
                exit;
            }
        }
    }

    // Save new user: email|password|name
    $userData = "$email|$password|$name\n";
    file_put_contents($userDataFile, $userData, FILE_APPEND | LOCK_EX);
    
    echo json_encode(['success' => true, 'name' => $name, 'email' => $email]);
    exit;
}

if ($action === 'login') {
    $email = strtolower(trim($_POST['email'] ?? ''));
    $password = $_POST['password'] ?? '';

    if (file_exists($userDataFile)) {
        $lines = file($userDataFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            $parts = explode('|', $line);
            if (trim($parts[0]) === $email && trim($parts[1]) === $password) {
                $name = trim($parts[2]);
                $premium = isPremium($email, $utrDataFile);
                echo json_encode(['success' => true, 'name' => $name, 'email' => $email, 'isPremium' => $premium]);
                exit;
            }
        }
    }
    echo json_encode(['success' => false, 'message' => 'Invalid email or password.']);
    exit;
}

if ($action === 'submit_utr') {
    $email = strtolower(trim($_POST['email'] ?? ''));
    $utr = trim($_POST['utr'] ?? '');

    if (empty($email) || empty($utr)) {
        echo json_encode(['success' => false, 'message' => 'Missing data.']);
        exit;
    }

    // Save UTR data: email|utr
    $utrData = "$email|$utr\n";
    file_put_contents($utrDataFile, $utrData, FILE_APPEND | LOCK_EX);

    echo json_encode(['success' => true]);
    exit;
}

if ($action === 'check_status') {
    $email = strtolower(trim($_GET['email'] ?? ''));
    if (empty($email)) {
        echo json_encode(['isPremium' => false]);
        exit;
    }
    $premium = isPremium($email, $utrDataFile);
    echo json_encode(['isPremium' => $premium]);
    exit;
}
?>