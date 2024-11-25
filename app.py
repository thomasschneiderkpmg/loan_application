from flask import Flask, request, jsonify
from flask_cors import CORS
from benfords_law_checker import BenfordsLawChecker

app = Flask(__name__)

# Enable CORS for all routes
CORS(app)

def filter_numeric_data(data):
    """
    Filters only numeric values from the provided dictionary.
    :param data: The input dictionary.
    :return: A new dictionary containing only numeric values.
    """
    filtered_data = {}
    for key, value in data.items():
        try:
            # Attempt to convert the value to a float or integer
            numeric_value = float(value)
            filtered_data[key] = numeric_value
        except ValueError:
            # Ignore non-numeric values
            pass
    return filtered_data

@app.route('/api/check_benfords_law', methods=['POST'])
def check_benfords_law():
    """
    Endpoint to analyze data against Benford's Law.
    Users send data in JSON format, and the API returns the compliance percentage.
    """
    try:
        # Parse input JSON data
        data = request.json
        print("Received data:", data)

        if not data or 'data' not in data:
            return jsonify({"error": "No valid data provided"}), 400

        # Filter numeric values from the 'data' field
        numeric_data = filter_numeric_data(data['data'].get('LoanApplication', {}))
        print("Filtered numeric data:", numeric_data)

        if not numeric_data:
            return jsonify({"error": "No numeric data found for analysis"}), 400

        # Initialize the Benford's Law Checker
        checker = BenfordsLawChecker(numeric_data)

        # Calculate compliance percentage
        compliance_percentage = checker.calculate_compliance_percentage()

        print("Compliance Percentage:", compliance_percentage)

        # Return the compliance percentage as a response
        return jsonify({
            "compliancePercentage": compliance_percentage,
            "message": "Benford's Law analysis completed successfully."
        }), 200

    except Exception as e:
        # Log the exception for debugging
        print("Error:", str(e))
        return jsonify({"error": str(e)}), 500

@app.route('/', methods=['GET'])
def home():
    """
    Basic home endpoint for testing the API.
    """
    return jsonify({"message": "Benford's Law API is running. Use /api/check_benfords_law to analyze data."})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
