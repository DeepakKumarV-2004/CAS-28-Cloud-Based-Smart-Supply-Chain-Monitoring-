const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const cors = require("cors");
const nodemailer = require("nodemailer");
require("dotenv").config();
const fs = require("fs");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

// Sample warehouse data
let warehouses = [
    { id: 1, name: "Warehouse A", location: "New York", stock: 120, temperature: 22, humidity: 45, items: generateItems() },
    { id: 2, name: "Warehouse B", location: "Los Angeles", stock: 85, temperature: 20, humidity: 50, items: generateItems() },
    { id: 3, name: "Warehouse C", location: "Chicago", stock: 200, temperature: 24, humidity: 40, items: generateItems() }
];

function generateItems() {
    const itemNames = [
        "Laptops", "Chairs", "Tables", "Monitors", "Keyboards",
        "Printers", "Cables", "Batteries", "Phones", "Headphones"
    ];
    return itemNames.map(name => ({
        name,
        quantity: Math.floor(Math.random() * 100) + 10,
        lastQuantity:0,
        history: []  // Store stock change history
    }));
}
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

function sendEmailAlert(warehouse, product, stockChange) {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: ADMIN_EMAIL,
        subject: `Stock Alert: ${product} in ${warehouse}`,
        text: `Sudden stock change detected in ${warehouse} for ${product}. Change: ${stockChange}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error("Error sending email:", error);
        } else {
            console.log("Email sent:", info.response);
        }
    });
}

// WebSocket connection for real-time updates
wss.on("connection", (ws) => {
    console.log("Client connected");

    setInterval(() => {
        let updates = [];
        let alerts = [];

        warehouses.forEach(warehouse => {
            warehouse.items.forEach(item => {
                let change = Math.floor(Math.random() * 21) - 10;
                let newQuantity = Math.max(0, item.quantity + change);

                
                // Trigger alert if stock is below 30
                if (newQuantity < 30) {
                    alerts.push({ warehouse: warehouse.name, product: item.name, stock: newQuantity });
                }
                if(Math.abs(newQuantity - item.quantity)>20){
                    alerts.push({warehouse:warehouse.name,product:item.name,stockchange:change});
                    sendEmailAlert(warehouse.name,item.name,change);
                }
                item.history.push({ change, newQuantity, timestamp: new Date().toISOString() });

                if (item.history.length > 10) {
                    item.history.shift();
                }
                item.lastQuantity = item.quantity;
                item.quantity = newQuantity;
            });

            updates.push({ warehouse: warehouse.name, products: warehouse.items });
        });

        ws.send(JSON.stringify({ warehouses, updates, alerts }));
    }, 3000);

    ws.on("close", () => console.log("Client disconnected"));
});

// Endpoint to get the available stock
app.get("/available-stock", (req, res) => {
    const stockData = warehouses.map(warehouse => ({
        warehouse: warehouse.name,
        items: warehouse.items.map(item => ({
            name: item.name,
            quantity: item.quantity
        }))
    }));
    res.json(stockData);
});

// Endpoint to download stock analysis as JSON
app.get("/download-stock", (req, res) => {
    const filePath = "./stock_analysis.json";
    fs.writeFileSync(filePath, JSON.stringify(warehouses, null, 2));
    res.download(filePath);
});

// Start server
server.listen(PORT, () => {
    console.log(`🚀 Server running on http://127.0.0.1:${PORT}`);
});