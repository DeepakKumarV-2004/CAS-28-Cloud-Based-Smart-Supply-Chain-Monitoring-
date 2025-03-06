const ctx = document.getElementById('stockChart').getContext('2d');
let stockChart;
const socket = new WebSocket("ws://127.0.0.1:3000");
let warehouseData = {};
let warehouseNames = [];

socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    warehouseData = {};
    warehouseNames = [];
    
    data.updates.forEach(update => {
        warehouseData[update.warehouse] = update.products;
        warehouseNames.push(update.warehouse);
    });
    
    populateWarehouseDropdown();
    updateChart();
};

function populateWarehouseDropdown() {
    const select = document.getElementById("warehouseSelect");
    select.innerHTML = "";
    warehouseNames.forEach(name => {
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        select.appendChild(option);
    });
}

function updateChart() {
    const selectedWarehouse = document.getElementById("warehouseSelect").value;
    if (!warehouseData[selectedWarehouse]) return;

    let datasets = [{
        label: "Stock Quantity",
        data: warehouseData[selectedWarehouse].map(product => product.quantity),
        backgroundColor: warehouseData[selectedWarehouse].map(() => getRandomColor()),
        borderColor: "#000",
        borderWidth: 1
    }];

    if (!stockChart) {
        stockChart = new Chart(ctx, {
            type: 'bar',  // Changed from 'line' to 'bar'
            data: {
                labels: warehouseData[selectedWarehouse].map(product => product.name),
                datasets
            },
            options: {
                responsive: true,
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    } else {
        stockChart.data.labels = warehouseData[selectedWarehouse].map(product => product.name);
        stockChart.data.datasets = datasets;
        stockChart.update();
    }
}


function getRandomColor() {
    return `hsl(${Math.random() * 360}, 100%, 50%)`;
}

function fetchAvailableStock() {
    fetch("http://127.0.0.1:3000/available-stock")
        .then(response => response.json())
        .then(data => {
            const stockDiv = document.getElementById("availableStock");
            stockDiv.innerHTML = "<h3>📦 Available Stock</h3>";
            data.forEach(warehouse => {
                if (warehouse.warehouse === document.getElementById("warehouseSelect").value) {
                    const warehouseInfo = document.createElement("div");
                    warehouseInfo.innerHTML = `<strong>${warehouse.warehouse}</strong>`;
                    stockDiv.appendChild(warehouseInfo);
                    warehouse.items.forEach(item => {
                        const itemInfo = document.createElement("div");
                        itemInfo.innerHTML = `${item.name}: ${item.quantity}`;
                        stockDiv.appendChild(itemInfo);
                    });
                }
            });
        })
        .catch(error => console.error("Error fetching stock:", error));
}

function downloadStock() {
    window.location.href = "http://127.0.0.1:3000/download-stock";
}