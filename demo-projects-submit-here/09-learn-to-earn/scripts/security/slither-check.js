const { execSync } = require('child_process');

console.log("Running Slither security analysis...");

try {
    const output = execSync('slither . --exclude-dependencies --filter-paths "node_modules|test"', {
        encoding: 'utf-8'
    });

    console.log("Slither analysis completed:");
    console.log(output);

    // 检测关键问题
    if (output.includes("HIGH") || output.includes("MEDIUM")) {
        console.error("⛔ Critical vulnerabilities found!");
        process.exit(1);
    }

    console.log("✅ No critical vulnerabilities found");
} catch (error) {
    console.error("Slither analysis failed:", error.message);
    process.exit(1);
}