<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// 1. Load Environment Variables (Hinglish integration and fallbacks)
function loadEnv($path) {
    if (!file_exists($path)) return;
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        $parts = explode('=', $line, 2);
        if (count($parts) === 2) {
            $name = trim($parts[0]);
            $value = trim($parts[1]);
            $value = trim($value, '"\'');
            $_ENV[$name] = $value;
            putenv("$name=$value");
        }
    }
}

loadEnv(__DIR__ . '/../backend/.env');

$dbHost = $_ENV['DB_HOST'] ?? '127.0.0.1';
$dbPort = $_ENV['DB_PORT'] ?? '3306';
$dbName = $_ENV['DB_NAME'] ?? 'tatamart_db';
$dbUser = $_ENV['DB_USER'] ?? 'root';
$dbPass = $_ENV['DB_PASS'] ?? '';
$jwtSecret = $_ENV['JWT_SECRET'] ?? 'tatamart_super_secret_key_2026';

// 2. Establish MariaDB Connection and Auto-Initialize Tables
try {
    $dsn = "mysql:host=$dbHost;port=$dbPort;dbname=$dbName;charset=utf8mb4";
    $pdo = new PDO($dsn, $dbUser, $dbPass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

    // Create Tables if not exists (Self-healing schema)
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS User (
            id VARCHAR(36) PRIMARY KEY,
            email VARCHAR(191) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            role ENUM('BUYER', 'SELLER', 'ADMIN') DEFAULT 'BUYER',
            name VARCHAR(255) NOT NULL,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS Profile (
            id VARCHAR(36) PRIMARY KEY,
            userId VARCHAR(36) UNIQUE NOT NULL,
            companyName VARCHAR(255),
            gstNumber VARCHAR(255),
            phone VARCHAR(255),
            address TEXT,
            city VARCHAR(255),
            state VARCHAR(255),
            country VARCHAR(255),
            isVerified BOOLEAN DEFAULT FALSE,
            FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS Category (
            id VARCHAR(191) PRIMARY KEY,
            name VARCHAR(255) NOT NULL
        );

        CREATE TABLE IF NOT EXISTS Product (
            id VARCHAR(36) PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            price DOUBLE NOT NULL,
            moq INT DEFAULT 1,
            stock INT DEFAULT 100,
            categoryId VARCHAR(191) NOT NULL,
            sellerId VARCHAR(36) NOT NULL,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (categoryId) REFERENCES Category(id) ON DELETE CASCADE,
            FOREIGN KEY (sellerId) REFERENCES User(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS Rfq (
            id VARCHAR(36) PRIMARY KEY,
            buyerId VARCHAR(36) NOT NULL,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            quantity INT NOT NULL,
            targetPrice DOUBLE,
            categoryId VARCHAR(191) NOT NULL,
            productId VARCHAR(36),
            status ENUM('PENDING', 'RESPONDED', 'CLOSED') DEFAULT 'PENDING',
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (buyerId) REFERENCES User(id) ON DELETE CASCADE,
            FOREIGN KEY (categoryId) REFERENCES Category(id) ON DELETE CASCADE,
            FOREIGN KEY (productId) REFERENCES Product(id) ON DELETE SET NULL
        );

        CREATE TABLE IF NOT EXISTS RfqResponse (
            id VARCHAR(36) PRIMARY KEY,
            rfqId VARCHAR(36) NOT NULL,
            sellerId VARCHAR(36) NOT NULL,
            priceQuote DOUBLE NOT NULL,
            leadTimeDays INT NOT NULL,
            notes TEXT,
            status ENUM('PENDING', 'ACCEPTED', 'REJECTED') DEFAULT 'PENDING',
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (rfqId) REFERENCES Rfq(id) ON DELETE CASCADE,
            FOREIGN KEY (sellerId) REFERENCES User(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS Orders (
            id VARCHAR(36) PRIMARY KEY,
            buyerId VARCHAR(36) NOT NULL,
            total DOUBLE NOT NULL,
            status ENUM('PENDING', 'SHIPPED', 'DELIVERED', 'CANCELLED') DEFAULT 'PENDING',
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (buyerId) REFERENCES User(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS OrderItem (
            id VARCHAR(36) PRIMARY KEY,
            orderId VARCHAR(36) NOT NULL,
            productId VARCHAR(36) NOT NULL,
            quantity INT NOT NULL,
            price DOUBLE NOT NULL,
            FOREIGN KEY (orderId) REFERENCES Orders(id) ON DELETE CASCADE,
            FOREIGN KEY (productId) REFERENCES Product(id) ON DELETE CASCADE
        );
    ");

} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Database connection or table initialization failed", "error" => $e->getMessage()]);
    exit;
}

// 3. JWT Helper Functions
function base64UrlEncode($data) {
    return str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($data));
}

function base64UrlDecode($data) {
    return base64_decode(str_replace(['-', '_'], ['+', '/'], $data));
}

function generateJWT($userId, $role, $secret) {
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $payload = json_encode(['id' => $userId, 'role' => $role, 'exp' => time() + (7 * 24 * 60 * 60)]);
    $base64Header = base64UrlEncode($header);
    $base64Payload = base64UrlEncode($payload);
    $signature = hash_hmac('sha256', "$base64Header.$base64Payload", $secret, true);
    return "$base64Header.$base64Payload." . base64UrlEncode($signature);
}

function getAuthenticatedUser($secret) {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    if (empty($authHeader)) return null;
    $token = str_replace('Bearer ', '', $authHeader);
    $parts = explode('.', $token);
    if (count($parts) !== 3) return null;
    list($header, $payload, $signature) = $parts;
    $validSig = base64UrlEncode(hash_hmac('sha256', "$header.$payload", $secret, true));
    if ($signature !== $validSig) return null;
    $decoded = json_decode(base64UrlDecode($payload), true);
    if (isset($decoded['exp']) && $decoded['exp'] < time()) return null;
    return $decoded;
}

// 4. API Endpoint Router
$requestUri = $_SERVER['REQUEST_URI'];
$action = $_GET['action'] ?? '';

// Simple URL path router fallback
if (strpos($requestUri, '/api/auth/register') !== false) $action = 'register';
elseif (strpos($requestUri, '/api/auth/login') !== false) $action = 'login';
elseif (strpos($requestUri, '/api/products') !== false) $action = 'products';
elseif (strpos($requestUri, '/api/categories') !== false) $action = 'categories';
elseif (strpos($requestUri, '/api/rfqs') !== false) $action = 'rfqs';
elseif (strpos($requestUri, '/api/orders') !== false) $action = 'orders';
elseif (strpos($requestUri, '/api/analytics') !== false) $action = 'analytics';
elseif (strpos($requestUri, '/api/seed') !== false) $action = 'seed';

switch ($action) {
    case 'register':
        $input = json_decode(file_get_contents('php://input'), true);
        $email = $input['email'] ?? '';
        $password = $input['password'] ?? '';
        $role = $input['role'] ?? 'BUYER';
        $name = $input['name'] ?? 'User';

        if (empty($email) || empty($password)) {
            http_response_code(400);
            echo json_encode(["message" => "Email and password are required"]);
            break;
        }

        $stmt = $pdo->prepare("SELECT id FROM User WHERE email = ?");
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            http_response_code(400);
            echo json_encode(["message" => "User already exists"]);
            break;
        }

        $hashed = password_hash($password, PASSWORD_BCRYPT);
        $userId = bin2hex(random_bytes(16));

        $stmt = $pdo->prepare("INSERT INTO User (id, email, password, role, name) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$userId, $email, $hashed, $role, $name]);

        // Create Profile
        $profileId = bin2hex(random_bytes(16));
        $stmt = $pdo->prepare("INSERT INTO Profile (id, userId, companyName, isVerified) VALUES (?, ?, ?, TRUE)");
        $stmt->execute([$profileId, $userId, "$name Corp"]);

        $token = generateJWT($userId, $role, $jwtSecret);
        echo json_encode(["user" => ["id" => $userId, "email" => $email, "role" => $role, "name" => $name], "token" => $token]);
        break;

    case 'login':
        $input = json_decode(file_get_contents('php://input'), true);
        $email = $input['email'] ?? '';
        $password = $input['password'] ?? '';

        if (empty($email) || empty($password)) {
            http_response_code(400);
            echo json_encode(["message" => "Email and password are required"]);
            break;
        }

        $stmt = $pdo->prepare("SELECT * FROM User WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, $user['password'])) {
            http_response_code(400);
            echo json_encode(["message" => "Invalid credentials"]);
            break;
        }

        $token = generateJWT($user['id'], $user['role'], $jwtSecret);
        echo json_encode(["user" => ["id" => $user['id'], "email" => $user['email'], "role" => $user['role'], "name" => $user['name']], "token" => $token]);
        break;

    case 'products':
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            $stmt = $pdo->query("SELECT * FROM Product ORDER BY createdAt DESC");
            echo json_encode($stmt->fetchAll());
        } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $user = getAuthenticatedUser($jwtSecret);
            if (!$user || $user['role'] !== 'SELLER') {
                http_response_code(403);
                echo json_encode(["message" => "Only sellers can add products"]);
                break;
            }
            $input = json_decode(file_get_contents('php://input'), true);
            $id = bin2hex(random_bytes(16));
            $stmt = $pdo->prepare("INSERT INTO Product (id, title, description, price, moq, stock, categoryId, sellerId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$id, $input['title'], $input['description'] ?? '', $input['price'], $input['moq'] ?? 1, $input['stock'] ?? 100, $input['categoryId'], $user['id']]);
            echo json_encode(["id" => $id, "message" => "Product created"]);
        }
        break;

    case 'categories':
        $stmt = $pdo->query("SELECT * FROM Category ORDER BY name ASC");
        echo json_encode($stmt->fetchAll());
        break;

    case 'rfqs':
        $user = getAuthenticatedUser($jwtSecret);
        if (!$user) {
            http_response_code(411);
            echo json_encode(["message" => "Authentication required"]);
            break;
        }

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $input = json_decode(file_get_contents('php://input'), true);
            if (isset($input['priceQuote'])) {
                // Bid creation
                $id = bin2hex(random_bytes(16));
                $stmt = $pdo->prepare("INSERT INTO RfqResponse (id, rfqId, sellerId, priceQuote, leadTimeDays, notes) VALUES (?, ?, ?, ?, ?, ?)");
                $stmt->execute([$id, $input['rfqId'], $user['id'], $input['priceQuote'], $input['leadTimeDays'], $input['notes'] ?? '']);
                echo json_encode(["id" => $id, "message" => "Quotation submitted"]);
            } else {
                // RFQ creation
                $id = bin2hex(random_bytes(16));
                $stmt = $pdo->prepare("INSERT INTO Rfq (id, buyerId, title, description, quantity, targetPrice, categoryId) VALUES (?, ?, ?, ?, ?, ?, ?)");
                $stmt->execute([$id, $user['id'], $input['title'], $input['description'] ?? '', $input['quantity'], $input['targetPrice'] ?? null, $input['categoryId']]);
                echo json_encode(["id" => $id, "message" => "RFQ submitted successfully"]);
            }
        } elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
            if ($user['role'] === 'SELLER') {
                $stmt = $pdo->query("SELECT r.*, c.name as categoryName, u.name as buyerName FROM Rfq r JOIN Category c ON r.categoryId = c.id JOIN User u ON r.buyerId = u.id ORDER BY r.createdAt DESC");
                $rfqs = $stmt->fetchAll();
                foreach ($rfqs as &$r) {
                    $stmtBids = $pdo->prepare("SELECT * FROM RfqResponse WHERE rfqId = ? AND sellerId = ?");
                    $stmtBids->execute([$r['id'], $user['id']]);
                    $r['responses'] = $stmtBids->fetchAll();
                }
                echo json_encode($rfqs);
            } else {
                $stmt = $pdo->prepare("SELECT r.*, c.name as categoryName FROM Rfq r JOIN Category c ON r.categoryId = c.id WHERE r.buyerId = ? ORDER BY r.createdAt DESC");
                $stmt->execute([$user['id']]);
                $rfqs = $stmt->fetchAll();
                foreach ($rfqs as &$r) {
                    $stmtBids = $pdo->prepare("SELECT rr.*, s.name as sellerName FROM RfqResponse rr JOIN User s ON rr.sellerId = s.id WHERE rr.rfqId = ?");
                    $stmtBids->execute([$r['id']]);
                    $r['responses'] = $stmtBids->fetchAll();
                }
                echo json_encode($rfqs);
            }
        }
        break;

    case 'orders':
        $user = getAuthenticatedUser($jwtSecret);
        if (!$user) {
            http_response_code(411);
            echo json_encode(["message" => "Authentication required"]);
            break;
        }

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $input = json_decode(file_get_contents('php://input'), true);
            $items = $input['items'] ?? [];
            if (empty($items)) {
                http_response_code(400);
                echo json_encode(["message" => "No items in order"]);
                break;
            }

            try {
                $pdo->beginTransaction();
                $orderId = bin2hex(random_bytes(16));
                $total = 0;

                foreach ($items as $item) {
                    $prodStmt = $pdo->prepare("SELECT price, stock FROM Product WHERE id = ? FOR UPDATE");
                    $prodStmt->execute([$item['productId']]);
                    $product = $prodStmt->fetch();

                    if (!$product || $product['stock'] < $item['quantity']) {
                        throw new Exception("Insufficient stock for product");
                    }

                    $itemPrice = $product['price'];
                    $total += $itemPrice * $item['quantity'];

                    // Deduct Stock
                    $updateStmt = $pdo->prepare("UPDATE Product SET stock = stock - ? WHERE id = ?");
                    $updateStmt->execute([$item['quantity'], $item['productId']]);

                    // Insert OrderItem
                    $orderItemId = bin2hex(random_bytes(16));
                    $itemStmt = $pdo->prepare("INSERT INTO OrderItem (id, orderId, productId, quantity, price) VALUES (?, ?, ?, ?, ?)");
                    $itemStmt->execute([$orderItemId, $orderId, $item['productId'], $item['quantity'], $itemPrice]);
                }

                $orderStmt = $pdo->prepare("INSERT INTO Orders (id, buyerId, total) VALUES (?, ?, ?)");
                $orderStmt->execute([$orderId, $user['id'], $total]);

                $pdo->commit();
                echo json_encode(["status" => "success", "orderId" => $orderId, "message" => "Order placed successfully"]);
            } catch (Exception $e) {
                $pdo->rollBack();
                http_response_code(400);
                echo json_encode(["message" => $e->getMessage()]);
            }
        } else {
            $stmt = $pdo->prepare("SELECT * FROM Orders WHERE buyerId = ? ORDER BY createdAt DESC");
            $stmt->execute([$user['id']]);
            echo json_encode($stmt->fetchAll());
        }
        break;

    case 'analytics':
        $user = getAuthenticatedUser($jwtSecret);
        if (!$user) {
            http_response_code(411);
            echo json_encode(["message" => "Authentication required"]);
            break;
        }

        if ($user['role'] === 'SELLER') {
            $stmt = $pdo->prepare('SELECT COUNT(*) as total_leads FROM Rfq r JOIN Product p ON r.productId = p.id WHERE p.sellerId = ?');
            $stmt->execute([$user['id']]);
            $totalLeads = $stmt->fetch()['total_leads'] ?? 0;

            echo json_encode([
                "status" => "success",
                "data" => [
                    "totalLeads" => (int)$totalLeads,
                    "responseRate" => 100,
                    "statusCounts" => ["PENDING" => 0, "REPLIED" => 0, "CLOSED" => 0],
                    "topProducts" => [],
                    "monthlyLeads" => []
                ]
            ]);
        } else {
            $stmt = $pdo->query('SELECT role, COUNT(*) as count FROM User GROUP BY role');
            $roles = $stmt->fetchAll();
            $userCounts = ["BUYER" => 0, "SELLER" => 0, "ADMIN" => 0];
            foreach ($roles as $r) {
                $userCounts[$r['role']] = (int)$r['count'];
            }
            echo json_encode([
                "status" => "success",
                "data" => [
                    "users" => $userCounts,
                    "totalProducts" => 10,
                    "totalInquiries" => 5,
                    "activeCategories" => []
                ]
            ]);
        }
        break;

    case 'seed':
        // Seed initial categories, users, and products
        $pdo->exec("
            DELETE FROM OrderItem;
            DELETE FROM Orders;
            DELETE FROM RfqResponse;
            DELETE FROM Rfq;
            DELETE FROM Product;
            DELETE FROM Category;
            DELETE FROM Profile;
            DELETE FROM User;
        ");

        $sellerId = bin2hex(random_bytes(16));
        $buyerId = bin2hex(random_bytes(16));
        $passHash = password_hash('password123', PASSWORD_BCRYPT);

        $pdo->prepare("INSERT INTO User (id, email, password, role, name) VALUES (?, 'seller@tatamart.com', ?, 'SELLER', 'Aditya Components')")->execute([$sellerId, $passHash]);
        $pdo->prepare("INSERT INTO User (id, email, password, role, name) VALUES (?, 'buyer@tatamart.com', ?, 'BUYER', 'Reliance Procurement')")->execute([$buyerId, $passHash]);

        $pdo->prepare("INSERT INTO Profile (id, userId, companyName, isVerified) VALUES (?, ?, 'Aditya Components Corp', TRUE)")->execute([bin2hex(random_bytes(16)), $sellerId]);
        $pdo->prepare("INSERT INTO Profile (id, userId, companyName, isVerified) VALUES (?, ?, 'Reliance Retail Wholesale', TRUE)")->execute([bin2hex(random_bytes(16)), $buyerId]);

        $pdo->exec("
            INSERT INTO Category (id, name) VALUES ('computers', 'Computer and IT');
            INSERT INTO Category (id, name) VALUES ('electronics', 'Electronics');
            INSERT INTO Category (id, name) VALUES ('mechanical', 'Mechanical Parts');
        ");

        $prod1 = bin2hex(random_bytes(16));
        $prod2 = bin2hex(random_bytes(16));

        $pdo->prepare("INSERT INTO Product (id, title, description, price, moq, stock, categoryId, sellerId) VALUES (?, 'Intel Core i9 Processor', 'Enterprise grade desktop processor', 45000, 5, 100, 'electronics', ?)")->execute([$prod1, $sellerId]);
        $pdo->prepare("INSERT INTO Product (id, title, description, price, moq, stock, categoryId, sellerId) VALUES (?, 'Industrial Precision Bolts', 'Heavy duty fasteners for machining', 120, 500, 5000, 'mechanical', ?)")->execute([$prod2, $sellerId]);

        echo json_encode(["status" => "success", "message" => "MariaDB Database successfully seeded!"]);
        break;

    default:
        http_response_code(404);
        echo json_encode(["message" => "Endpoint not found"]);
        break;
}
?>
