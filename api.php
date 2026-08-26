<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

$action = $_GET['action'] ?? '';
$data = json_decode(file_get_contents('php://input'), true);

// 1. Register User -> Store in userdata.txt
if ($action === 'register') {
    if (!empty($data['email']) && !empty($data['password'])) {
        $email = strtolower(trim($data['email']));
        
        // Check if user already exists
        $exists = false;
        if (file_exists('userdata.txt')) {
            $lines = file('userdata.txt', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            foreach ($lines as $line) {
                $parts = explode('|', $line);
                if (count($parts) >= 2 && $parts[1] === $email) {
                    $exists = true;
                    break;
                }
            }
        }
        
        if ($exists) {
            echo json_encode(['success' => false, 'message' => 'Email already registered.']);
            exit;
        }

        $entry = trim($data['name']) . "|" . $email . "|" . trim($data['password']) . "|" . date('Y-m-d H:i:s') . "\n";
        file_put_contents('userdata.txt', $entry, FILE_APPEND | LOCK_EX);
        echo json_encode(['success' => true, 'message' => 'Registration successful.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid data.']);
    }
    exit;
}

// 2. Login -> Check UTR.txt (Paid) then userdata.txt (Registered)
if ($action === 'login') {
    if (!empty($data['email']) && !empty($data['password'])) {
        $email = strtolower(trim($data['email']));
        $password = trim($data['password']);
        
        $isPaid = false;
        $isRegistered = false;
        $userName = "";

        // Check if Paid User (UTR.txt)
        if (file_exists('UTR.txt')) {
            $lines = file('UTR.txt', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            foreach ($lines as $line) {
                $parts = explode('|', $line);
                if (count($parts) >= 3 && $parts[1] === $email && $parts[2] === $password) {
                    $isPaid = true;
                    $isRegistered = true;
                    $userName = $parts[0];
                    break;
                }
            }
        }

        // Check if Normal User (userdata.txt)
        if (!$isRegistered && file_exists('userdata.txt')) {
            $lines = file('userdata.txt', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            foreach ($lines as $line) {
                $parts = explode('|', $line);
                if (count($parts) >= 3 && $parts[1] === $email && $parts[2] === $password) {
                    $isRegistered = true;
                    $userName = $parts[0];
                    break;
                }
            }
        }

        if ($isRegistered) {
            echo json_encode([
                'success' => true, 
                'user' => ['name' => $userName, 'email' => $email],
                'isPaid' => $isPaid
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Invalid Email or Password.']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Missing credentials.']);
    }
    exit;
}

// 3. Submit UTR -> Store in UTR.txt
if ($action === 'submit_utr') {
    if (!empty($data['email']) && !empty($data['utr'])) {
        // Fetch password from userdata.txt to keep records consistent
        $password = "unknown";
        $name = "User";
        if (file_exists('userdata.txt')) {
            $lines = file('userdata.txt', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            foreach ($lines as $line) {
                $parts = explode('|', $line);
                if (count($parts) >= 3 && $parts[1] === strtolower(trim($data['email']))) {
                    $name = $parts[0];
                    $password = $parts[2];
                    break;
                }
            }
        }

        $entry = $name . "|" . strtolower(trim($data['email'])) . "|" . $password . "|" . trim($data['utr']) . "|" . date('Y-m-d H:i:s') . "\n";
        file_put_contents('UTR.txt', $entry, FILE_APPEND | LOCK_EX);
        echo json_encode(['success' => true, 'message' => 'Payment verified.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid UTR data.']);
    }
    exit;
}
?>