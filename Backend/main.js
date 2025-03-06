const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const cors = require("cors");
const nodemailer = require("nodemailer");
require("dotenv").config();
const fs = require("fs");
const PDFDocument = require("pdfkit");
const path = require("path");

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
    const subject = `⚠ Urgent Stock Alert: ${product} in ${warehouse}`;
    
    const body = `
        Dear Admin,

        A significant stock change has been detected in ${warehouse} for the product "${product}".

        📌 Stock Change Details:
        - Warehouse: ${warehouse}
        - Product: ${product}
        - Stock Change: ${stockChange}
        - Timestamp: ${new Date().toLocaleString()}

        ${stockChange < 0 ? "⚠ This might indicate high demand or potential stock misplacement." : "📦 Restocking detected."}

        Please review and take necessary action.

        Best regards,
        Smart Supply Chain Monitoring System
    `;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: ADMIN_EMAIL,
        subject,
        text: body
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
                if(newQuantity ==0){
                    alerts.push({ warehouse: warehouse.name, product: item.name, stock: newQuantity });
                    sendEmailAlert(warehouse.name,item.name,newQuantity);
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
    const doc = new PDFDocument();
    const fileName = "stock_report.pdf";
    const filePath = path.join(__dirname, fileName);

    res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
    res.setHeader("Content-Type", "application/pdf");

    doc.pipe(res); // Stream PDF directly to response

    // Load a custom font (Ensure the .ttf file exists in your project)
    const fontPath = path.join(__dirname, "fonts", "NotoSans-Regular.ttf");
    if (fs.existsSync(fontPath)) {
        doc.font(fontPath);
    } else {
        doc.font("Helvetica"); // Fallback to Helvetica
    }

    doc.fontSize(18).text(" Stock Report", { align: "center" });
    doc.moveDown();

    warehouses.forEach((warehouse) => {
        doc.fontSize(14).text(`$$ ${warehouse.name} (${warehouse.location})`);
        doc.moveDown(0.5);
        warehouse.items.forEach((item) => {
            doc.fontSize(12).text(`- ${item.name}: ${item.quantity}`);
        });
        doc.moveDown();
    });

    doc.end();
});

// Start server
server.listen(PORT, () => {
    console.log(`🚀 Server running on http://127.0.0.1:${PORT}`);
});