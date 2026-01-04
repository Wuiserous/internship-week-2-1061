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
    
    # Base trend curve (sine wave)
    import math
    
    while current_date <= end_date:
        # Simulate data for the day
        day_of_year = current_date.timetuple().tm_yday
        trend = math.sin(day_of_year * 0.1) * 20 + 100 # Sine wave trend
        
        is_weekend_day = is_weekend(current_date)
        weekend_multiplier = 1.4 if is_weekend_day else 1.0
        
        daily_visits = int((trend * 5 + random.randint(50, 200)) * weekend_multiplier)
        daily_sales = int((daily_visits * 0.08) + random.randint(5, 20))
        
        # Category specific modifers
        if category and category == 'Electronics':
            daily_sales = int(daily_sales * 0.6) # Fewer sales but higher value
            
        avg_order_value = random.uniform(40.0, 150.0) if category != 'Books' else random.uniform(10.0, 40.0)
        daily_revenue = int(daily_sales * avg_order_value)

        
        record = {
            'date': current_date.strftime('%Y-%m-%d'),
            'visits': daily_visits,
            'sales': daily_sales,
            'revenue': daily_revenue,
            'category': category if category else 'All'
        }
        data.append(record)
        current_date += timedelta(days=1)
    
    return data

def is_weekend(date_obj):
    return date_obj.weekday() >= 5

def generate_transactions(count=10):
    transactions = []
    names = ["Alice Smith", "Bob Johnson", "Charlie Davis", "Diana Evans", "Ethan Hunt"]
    status_options = ["Completed", "Processing", "Shipped"]
    
    for _ in range(count):
        t = {
            "id": f"ORD-{random.randint(1000, 9999)}",
            "customer": random.choice(names),
            "amount": random.randint(20, 500),
            "status": random.choice(status_options),
            "date": (datetime.now() - timedelta(minutes=random.randint(1, 1440))).strftime('%Y-%m-%d %H:%M')
        }
        transactions.append(t)
    return transactions

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

@app.route('/api/recent_transactions', methods=['GET'])
def get_transactions():
    return jsonify(generate_transactions())

@app.route('/api/stats', methods=['GET'])
def get_stats():
    # Return some aggregate dummy stats (dynamic-ish based on 'now')
    # In a real app this would query DB
    return jsonify({
        'total_revenue': 154320 + random.randint(0, 5000),
        'active_users': 1205 + random.randint(0, 50),
        'conversion_rate': round(random.uniform(2.8, 4.5), 1),
        'top_category': 'Electronics'
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
