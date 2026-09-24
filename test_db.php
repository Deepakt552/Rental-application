<?php
echo "Step 1: Start\n";

$m = mysqli_init();
$m->options(MYSQLI_OPT_CONNECT_TIMEOUT, 2);
echo "Step 2: Connecting to 127.0.0.1...\n";
if (@$m->real_connect('127.0.0.1', 'root', '', 'triumphrent2', 3306)) {
    echo "Connected successfully to 127.0.0.1!\n";
    
    // Check if source column already exists
    $res = $m->query("SHOW COLUMNS FROM applicants LIKE 'source'");
    if ($res && $res->num_rows > 0) {
        echo "Column 'source' already exists in applicants table.\n";
    } else {
        echo "Adding source and source_other columns...\n";
        $ok = $m->query("ALTER TABLE applicants ADD COLUMN source VARCHAR(255) NULL AFTER desired_move_date, ADD COLUMN source_other VARCHAR(255) NULL AFTER source");
        if ($ok) {
            echo "Columns added successfully!\n";
        } else {
            echo "Alter error: " . $m->error . "\n";
        }
    }
    
    // Record in migrations table
    $mName = '2026_06_02_000000_add_source_to_applicants_table';
    $resMig = $m->query("SELECT id FROM migrations WHERE migration = '$mName'");
    if ($resMig && $resMig->num_rows == 0) {
        $mMax = $m->query("SELECT MAX(batch) as b FROM migrations");
        $b = 1;
        if ($mMax && $row = $mMax->fetch_assoc()) {
            $b = ($row['b'] ?? 0) + 1;
        }
        $m->query("INSERT INTO migrations (migration, batch) VALUES ('$mName', $b)");
        echo "Recorded migration in migrations table.\n";
    } else {
        echo "Migration already recorded in migrations table.\n";
    }
    
    $m->close();
} else {
    echo "Connection to 127.0.0.1 failed: " . mysqli_connect_error() . "\n";
}
echo "Step 3: Complete\n";
