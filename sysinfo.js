#!/usr/bin/env node
const os = require("os");
const { execSync } = require("child_process");
const https = require("https");

// Colors
const cyan = (t) => `\x1b[36m${t}\x1b[0m`;
const green = (t) => `\x1b[32m${t}\x1b[0m`;
const yellow = (t) => `\x1b[33m${t}\x1b[0m`;
const magenta = (t) => `\x1b[35m${t}\x1b[0m`;

function formatBytes(bytes) {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
}

console.log(cyan("=== System Information ==="));

// OS & Hostname
console.log(cyan("OS:"), os.type(), os.release());
console.log(cyan("Hostname:"), os.hostname());

// Logged-in user
console.log(cyan("User:"), os.userInfo().username);

// Uptime
const uptimeHours = Math.floor(os.uptime() / 3600);
const uptimeMinutes = Math.floor((os.uptime() % 3600) / 60);
console.log(cyan("Uptime:"), green(`${uptimeHours}h ${uptimeMinutes}m`));

// CPU Info
const cpus = os.cpus();
console.log(cyan("CPU Model:"), cpus[0].model);
console.log(cyan("CPU Cores:"), cpus.length);

// Load average
console.log(cyan("Load Average:"), yellow(os.loadavg().map(avg => avg.toFixed(2)).join(", ")));

// Memory Info
console.log(cyan("Total Memory:"), formatBytes(os.totalmem()));
console.log(cyan("Free Memory:"), green(formatBytes(os.freemem())));

// Disk Usage
try {
    const diskUsage = execSync("df -h /").toString();
    console.log(cyan("Disk Usage:\n") + diskUsage);
} catch {
    console.log(cyan("Disk Usage: Not available"));
}

// Network Interfaces
const nets = os.networkInterfaces();
console.log(cyan("Network Interfaces:"));
for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
        if (net.family === "IPv4") {
            console.log(`  ${magenta(name)}: ${net.address}`);
        }
    }
}

// Top 5 processes
try {
    const topProcesses = execSync("ps -eo pid,comm,%cpu --sort=-%cpu | head -n 6").toString();
    console.log(cyan("Top 5 Processes by CPU:\n") + topProcesses);
} catch {
    console.log(cyan("Process Info: Not available"));
}

// Public IP
https.get("https://api.ipify.org", (res) => {
    let ip = "";
    res.on("data", (chunk) => ip += chunk);
    res.on("end", () => {
        console.log(cyan("Public IP:"), magenta(ip));
    });
}).on("error", () => {
    console.log(cyan("Public IP: Not available"));
});
