# Nexus Analytics Dashboard

![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54) ![Flask](https://img.shields.io/badge/flask-%23000.svg?style=for-the-badge&logo=flask&logoColor=white) ![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)

## Overview
Nexus Analytics is a dynamic web dashboard designed to provide actionable business insights through interactive visualizations. The project features a robust Python Flask backend that serves a sophisticated mock data engine, simulating realistic market trends, weekend spikes, and category-specific sales behaviors.

## Key Features
- **Real-time Data Visualization**: Interactive time-series charts using Chart.js.
- **Dynamic Data Generation**: Backend algorithms simulate sine-wave market trends and seasonal variations.
- **Filtering System**: Filter data by date range and product categories (Electronics, Clothing, Home, etc.).
- **Export Capabilities**: Download current analytical views as CSV files for external reporting.
- **Performance UI**: Features smooth number animations, responsive design, and font-awesome iconography.

## Tech Stack
- **Backend**: Flask, Flask-CORS, Gunicorn (WSGI Server).
- **Frontend**: Vanilla JavaScript (ES6), HTML5, CSS3.
- **Data Viz**: Chart.js integration.
- **Utilities**: Python Math & Datetime for trend simulation.

## Installation

### Prerequisites
- Python 3.8+
- pip

### Setup
1. **Clone the repo**
   ```bash
   git clone <repository-url>
   cd nexus-analytics
   ```

2. **Environment Setup**
   ```bash
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Launch**
   ```bash
   python app.py
   ```
   The application will be available at `http://127.0.0.1:5000`.

## API Documentation

### `GET /api/data`
Returns time-series data for the chart view.
- **Params**: `start_date` (YYYY-MM-DD), `end_date` (YYYY-MM-DD), `category` (String).
- **Response**: Array of daily records containing visits, sales, and revenue.

### `GET /api/stats`
Returns top-level aggregate metrics.
- **Response**: `{ "total_revenue": 150000, "active_users": 1200, ... }`.

### `GET /api/recent_transactions`
Returns a list of the most recent mock transactions for table population.

## Project Structure
- `app.py`: Main Flask application and mock data engine.
- `static/`: Contains the frontend logic (`script.js`), styling (`style.css`), and the main entry point (`index.html`).
- `requirements.txt`: Python dependency manifest.

## License
This project is generated for educational purposes via an Internship Platform.