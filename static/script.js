document.addEventListener('DOMContentLoaded', () => {
    // --- Configuration ---
    const API_BASE = 'http://127.0.0.1:5000/api';
    let chartInstance = null;

    // --- Selectors ---
    const dateRangeSelect = document.getElementById('dateRange');
    const categorySelect = document.getElementById('categoryFilter');
    const refreshBtn = document.getElementById('refreshBtn');
    
    // Stats Elements
    const totalRevEl = document.getElementById('totalRevenue');
    const activeUsersEl = document.getElementById('activeUsers');
    const conversionEl = document.getElementById('conversionRate');
    const topCatEl = document.getElementById('topCategory');

    // --- Initialization ---
    initChart();
    loadDashboardData();

    // --- Event Listeners ---
    dateRangeSelect.addEventListener('change', loadDashboardData);
    categorySelect.addEventListener('change', loadDashboardData);
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
        await Promise.all([fetchStats(), fetchChartData()]);
    }

    async function fetchStats() {
        try {
            const response = await fetch(`${API_BASE}/stats`);
            const data = await response.json();
            
            // Format numbers
            totalRevEl.textContent = `$${data.total_revenue.toLocaleString()}`;
            activeUsersEl.textContent = data.active_users.toLocaleString();
            conversionEl.textContent = `${data.conversion_rate}%`;
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
        
        const url = new URL(`${API_BASE}/data`);
        url.searchParams.append('start_date', formatDate(start));
        url.searchParams.append('end_date', formatDate(end));
        if (category) url.searchParams.append('category', category);

        try {
            const response = await fetch(url);
            const data = await response.json();
            
            updateChart(data);
        } catch (error) {
            console.error('Error fetching chart data:', error);
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
});
