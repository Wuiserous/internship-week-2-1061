document.addEventListener('DOMContentLoaded', () => {
    // --- Configuration ---
    // CRITICAL FIX: Use relative path for production compatibility
    const API_BASE = '/api'; 
    let chartInstance = null;
    let currentData = []; // Store data for export

    // --- Selectors ---
    const dateRangeSelect = document.getElementById('dateRange');
    const categorySelect = document.getElementById('categoryFilter');
    const refreshBtn = document.getElementById('refreshBtn');
    const exportBtn = document.getElementById('exportBtn');
    
    // Stats Elements
    const totalRevEl = document.getElementById('totalRevenue');
    const activeUsersEl = document.getElementById('activeUsers');
    const conversionEl = document.getElementById('conversionRate');
    const topCatEl = document.getElementById('topCategory');
    const transactionsTableBody = document.getElementById('transactionsTableBody');

    // --- Initialization ---
    initChart();
    loadDashboardData();

    // --- Event Listeners ---
    dateRangeSelect.addEventListener('change', loadDashboardData);
    categorySelect.addEventListener('change', loadDashboardData);
    if(exportBtn) exportBtn.addEventListener('click', exportData);
    
    refreshBtn.addEventListener('click', () => {
        // Add rotation animation
        refreshBtn.querySelector('i').classList.add('fa-spin');
        loadDashboardData().then(() => {
            setTimeout(() => refreshBtn.querySelector('i').classList.remove('fa-spin'), 500);
        });
    });

    // --- Functions ---

    function initChart() {
        const ctx = document.getElementById('mainChart').getContext('2d');
        
        // Gradient for line chart
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(130, 80, 223, 0.5)'); // Purple
        gradient.addColorStop(1, 'rgba(130, 80, 223, 0.0)');

        chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Sales Revenue',
                    data: [],
                    backgroundColor: gradient,
                    borderColor: '#8250df',
                    borderWidth: 2,
                    pointBackgroundColor: '#8250df',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#8250df',
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Visits',
                    data: [],
                    backgroundColor: 'transparent',
                    borderColor: '#58a6ff', // Blue
                    borderWidth: 2,
                    borderDash: [5, 5],
                    pointBackgroundColor: '#58a6ff',
                    pointBorderColor: '#fff',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: '#8b949e', font: { family: 'Outfit' } }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(22, 27, 34, 0.9)',
                        titleColor: '#f0f6fc',
                        bodyColor: '#8b949e',
                        borderColor: 'rgba(255,255,255,0.1)',
                        borderWidth: 1
                    }
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { color: '#8b949e', font: { family: 'Outfit' } }
                    },
                    y: {
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { color: '#8b949e', font: { family: 'Outfit' } }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });
    }

    async function loadDashboardData() {
        await Promise.all([fetchStats(), fetchChartData(), fetchTransactions()]);
    }

    async function fetchStats() {
        try {
            const response = await fetch(`${API_BASE}/stats`);
            const data = await response.json();
            
            // Format numbers and animate
            animateValue(totalRevEl, parseInt(totalRevEl.dataset.value || 0), data.total_revenue, 1000, true);
            animateValue(activeUsersEl, parseInt(activeUsersEl.dataset.value || 0), data.active_users, 1000);
            animateValue(conversionEl, parseFloat(conversionEl.dataset.value || 0), data.conversion_rate, 1000, false, true); // Percentage
            
            // Store real values for next animation
            totalRevEl.dataset.value = data.total_revenue;
            activeUsersEl.dataset.value = data.active_users;
            conversionEl.dataset.value = data.conversion_rate;

            topCatEl.textContent = data.top_category;
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    }

    async function fetchChartData() {
        const days = dateRangeSelect.value;
        const category = categorySelect.value;
        
        // Calculate dates
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - parseInt(days));
        
        const formatDate = (d) => d.toISOString().split('T')[0];
        
        const url = new URL(`${window.location.origin}${API_BASE}/data`);
        url.searchParams.append('start_date', formatDate(start));
        url.searchParams.append('end_date', formatDate(end));
        if (category) url.searchParams.append('category', category);

        try {
            const response = await fetch(url);
            const data = await response.json();
            currentData = data; // Save for export
            
            updateChart(data);
        } catch (error) {
            console.error('Error fetching chart data:', error);
        }
    }

    async function fetchTransactions() {
        try {
            const response = await fetch(`${API_BASE}/recent_transactions`);
            const transactions = await response.json();
            
            transactionsTableBody.innerHTML = '';
            transactions.forEach(tx => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${tx.id}</td>
                    <td>${tx.customer}</td>
                    <td>${tx.date}</td>
                    <td>$${tx.amount}</td>
                    <td><span class="status-badge status-${tx.status.toLowerCase()}">${tx.status}</span></td>
                `;
                transactionsTableBody.appendChild(tr);
            });
        } catch (error) {
            console.error('Error fetching transactions:', error);
        }
    }

    function updateChart(data) {
        if (!chartInstance) return;

        const labels = data.map(item => item.date);
        const revenue = data.map(item => item.revenue);
        const visits = data.map(item => item.visits);

        chartInstance.data.labels = labels;
        chartInstance.data.datasets[0].data = revenue;
        chartInstance.data.datasets[1].data = visits;
        
        chartInstance.update();
    }

    function exportData() {
        if (!currentData || currentData.length === 0) {
            alert("No data to export");
            return;
        }
        
        const csvContent = "data:text/csv;charset=utf-8," 
            + "Date,Visits,Sales,Revenue,Category\n"
            + currentData.map(e => `${e.date},${e.visits},${e.sales},${e.revenue},${e.category}`).join("\n");
            
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "nexus_analytics_export.csv");
        document.body.appendChild(link); // Required for FF
        link.click();
        document.body.removeChild(link);
    }
    
    // Animation Utility
    function animateValue(obj, start, end, duration, isMoney = false, isPercent = false) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            let value = Math.floor(progress * (end - start) + start);
            
            if (isPercent) {
                value = (progress * (end - start) + start).toFixed(1);
                obj.innerHTML = value + "%";
            } else {
                 if (isMoney) obj.innerHTML = "$" + value.toLocaleString();
                 else obj.innerHTML = value.toLocaleString();
            }

            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }
});
