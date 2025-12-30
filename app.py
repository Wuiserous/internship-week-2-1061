from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import random
from datetime import datetime, timedelta

app = Flask(__name__, static_folder='static')
CORS(app)

# --- Mock Data Generator ---

CATEGORIES = ['Electronics', 'Clothing', 'Home', 'Books', 'Toys']

def generate_mock_data(start_date, end_date, category=None):
    data = []
    current_date = start_date
    
    while current_date <= end_date:
        # Simulate data for the day
        daily_visits = random.randint(100, 5000)
        daily_sales = random.randint(10, 500) * (1.5 if is_weekend(current_date) else 1.0)
        
        # Filter simulation: if category is specified, scale down or randomize specific logic
        # For simplicity, we'll just return generic "trend" data but label it with the category if present
        
        record = {
            'date': current_date.strftime('%Y-%m-%d'),
            'visits': int(daily_visits),
            'sales': int(daily_sales),
            'revenue': int(daily_sales * random.uniform(20.0, 100.0)),
            'category': category if category else 'All'
        }
        data.append(record)
        current_date += timedelta(days=1)
    
    return data

def is_weekend(date_obj):
    return date_obj.weekday() >= 5

# --- Routes ---

@app.route('/')
def index():
    return send_from_directory('static', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('static', path)

@app.route('/api/data', methods=['GET'])
def get_data():
    # Parse query params
    start_date_str = request.args.get('start_date')
    end_date_str = request.args.get('end_date')
    category = request.args.get('category')

    # Defaults
    end_date = datetime.now()
    start_date = end_date - timedelta(days=30)

    if start_date_str:
        try:
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d')
        except ValueError:
            pass # Use default
    
    if end_date_str:
        try:
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d')
        except ValueError:
            pass # Use default

    if start_date > end_date:
        return jsonify({'error': 'Start date must be before end date'}), 400

    data = generate_mock_data(start_date, end_date, category)
    return jsonify(data)

@app.route('/api/stats', methods=['GET'])
def get_stats():
    # Return some aggregate dummy stats
    return jsonify({
        'total_revenue': 154320,
        'active_users': 1205,
        'conversion_rate': 3.2,
        'top_category': 'Electronics'
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
