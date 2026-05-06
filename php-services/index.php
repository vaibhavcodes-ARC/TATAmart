<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

$host = 'db';
$db = 'tatamart_db';
$user = 'tatamart';
$pass = 'password123';
$port = '5432';

try {
    $dsn = "pgsql:host=$host;port=$port;dbname=$db;";
    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

    $action = $_GET['action'] ?? '';

    switch ($action) {
        case 'seller-stats':
            $sellerId = $_GET['sellerId'] ?? '';
            if (empty($sellerId)) {
                echo json_encode(["status" => "error", "message" => "Missing sellerId parameter"]);
                exit;
            }

            // 1. Total leads (Inquiries) received by seller
            $stmt = $pdo->prepare('SELECT COUNT(*) as total_leads FROM "Inquiry" WHERE "sellerId" = :sellerId');
            $stmt->execute(['sellerId' => $sellerId]);
            $totalLeads = $stmt->fetch()['total_leads'] ?? 0;

            // 2. Lead status breakdown (PENDING, REPLIED, CLOSED)
            $stmt = $pdo->prepare('SELECT "status", COUNT(*) as count FROM "Inquiry" WHERE "sellerId" = :sellerId GROUP BY "status"');
            $stmt->execute(['sellerId' => $sellerId]);
            $statusBreakdown = $stmt->fetchAll();

            $statusCounts = ["PENDING" => 0, "REPLIED" => 0, "CLOSED" => 0];
            foreach ($statusBreakdown as $row) {
                $statusCounts[$row['status']] = (int)$row['count'];
            }

            // 3. Top products with most inquiries
            $stmt = $pdo->prepare('
                SELECT p.id, p.title, COUNT(i.id) as inquiries_count
                FROM "Product" p
                LEFT JOIN "Inquiry" i ON p.id = i."productId"
                WHERE p."sellerId" = :sellerId
                GROUP BY p.id, p.title
                ORDER BY inquiries_count DESC
                LIMIT 5
            ');
            $stmt->execute(['sellerId' => $sellerId]);
            $topProducts = $stmt->fetchAll();

            // 4. Monthly lead count (Inquiries over time - last 6 months)
            $stmt = $pdo->prepare('
                SELECT TO_CHAR("createdAt", \'YYYY-MM\') as month, COUNT(*) as count
                FROM "Inquiry"
                WHERE "sellerId" = :sellerId AND "createdAt" >= NOW() - INTERVAL \'6 months\'
                GROUP BY month
                ORDER BY month ASC
            ');
            $stmt->execute(['sellerId' => $sellerId]);
            $monthlyLeads = $stmt->fetchAll();

            // Calculate response rate
            $respondedCount = $statusCounts['REPLIED'] + $statusCounts['CLOSED'];
            $responseRate = $totalLeads > 0 ? round(($respondedCount / $totalLeads) * 100, 2) : 0;

            echo json_encode([
                "status" => "success",
                "data" => [
                    "sellerId" => $sellerId,
                    "totalLeads" => (int)$totalLeads,
                    "responseRate" => $responseRate,
                    "statusCounts" => $statusCounts,
                    "topProducts" => $topProducts,
                    "monthlyLeads" => $monthlyLeads
                ]
            ]);
            break;

        case 'admin-stats':
            // 1. Users breakdown by role
            $stmt = $pdo->query('SELECT "role", COUNT(*) as count FROM "User" GROUP BY "role"');
            $rolesBreakdown = $stmt->fetchAll();
            $userCounts = ["BUYER" => 0, "SELLER" => 0, "ADMIN" => 0];
            foreach ($rolesBreakdown as $row) {
                $userCounts[$row['role']] = (int)$row['count'];
            }

            // 2. Total products listed
            $stmt = $pdo->query('SELECT COUNT(*) as total_products FROM "Product"');
            $totalProducts = $stmt->fetch()['total_products'] ?? 0;

            // 3. Total inquiries across the entire platform
            $stmt = $pdo->query('SELECT COUNT(*) as total_inquiries FROM "Inquiry"');
            $totalInquiries = $stmt->fetch()['total_inquiries'] ?? 0;

            // 4. Most active categories (by product count)
            $stmt = $pdo->query('
                SELECT c.id, c.name, COUNT(p.id) as product_count
                FROM "Category" c
                LEFT JOIN "Product" p ON c.id = p."categoryId"
                GROUP BY c.id, c.name
                ORDER BY product_count DESC
                LIMIT 5
            ');
            $activeCategories = $stmt->fetchAll();

            echo json_encode([
                "status" => "success",
                "data" => [
                    "users" => $userCounts,
                    "totalProducts" => (int)$totalProducts,
                    "totalInquiries" => (int)$totalInquiries,
                    "activeCategories" => $activeCategories
                ]
            ]);
            break;

        default:
            echo json_encode(["status" => "error", "message" => "Invalid action specified."]);
            break;
    }

} catch (PDOException $e) {
    echo json_encode([
        "status" => "error",
        "message" => "Database connection failed",
        "error" => $e->getMessage()
    ]);
}
?>
