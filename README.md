# CAS-28-Cloud-Based-Smart-Supply-Chain-Monitoring-
Cloud-Based Smart Supply Chain Monitoring (SICS03)

## 📌 Project Overview

This is a Cloud-Based Smart Supply Chain Monitoring System (SICS03) that provides real-time tracking of warehouse stock. The system includes AI-powered anomaly detection, automated stock alerts, and PDF stock reports. It is a completely software-based solution using MySQL for data storage and WebSockets for real-time updates.

## 🚀 Features


* 📊 Real-time stock monitoring using WebSockets.

* 🔔 Automated alerts for low stock levels and sudden changes.

* 📧 Email notifications for significant stock variations.

* 📜 PDF stock report generation for download.

* 🏢 Warehouse switching for better visualization.

* 🔄 Historical stock data tracking.

## 🛠️ Tech Stack

* Backend: Node.js, Express.js, WebSockets, MySQL

* Frontend: HTML, CSS, JavaScript, Chart.js

* Email Service: Nodemailer (Gmail SMTP)

* PDF Generation: PDFKit

# 📂 Installation & Setup

## 1️⃣ Clone the Repository
```bash
git clone https://github.com/your-username/cloud-supply-chain-monitoring.git
cd cloud-supply-chain-monitoring
```
## 2️⃣ Install Dependencies
```bash
npm install
```
## 3️⃣ Create a .env File

Create a .env file in the root directory and add the following:
```bash
PORT=3000
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-email-password
ADMIN_EMAIL=admin-email@gmail.com
```
## 4️⃣ Start the Server
```bash
npm start
```
# 📢 API Endpoints

## 📌 WebSocket Connection

ws://127.0.0.1:3000 → Sends real-time stock updates.


# 📧 Email Notifications

The system automatically sends an email alert to the admin when:

A product stock drops below 30.

A stock change exceeds 20 units.

A product stock reaches zero.

# 📜 License

This project is open-source under the MIT License.

# 🤝 Contributing

Feel free to fork this repository and submit pull requests!
