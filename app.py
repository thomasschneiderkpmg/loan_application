from flask import Flask, request, jsonify
from benfords_law_checker import BenfordsLawChecker

app = Flask(__name__)

@app.route('/api/check_benfords_law', methods=['POST'])
def check_benfords_law():
    """
    Endpoint to analyze data against Benford's Law.
    Users send data in JSON format, and the API returns the compliance percentage.
    """
    try:
        # Parse input JSON data
        data = request.json
        if not data:
            return jsonify({"error": "No data provided"}), 400

        # Ensure data is a dictionary with numeric values
        if not isinstance(data, dict):
            return jsonify({"error": "Invalid data format. Expected a JSON object."}), 400

        # Initialize the Benford's Law Checker
        checker = BenfordsLawChecker(data)

        # Calculate compliance percentage
        compliance_percentage = checker.calculate_compliance_percentage()

        # Return the compliance percentage as a response
        return jsonify({
            "compliancePercentage": compliance_percentage,
            "message": "Benford's Law analysis completed successfully."
        }), 200

    except Exception as e:
        # Handle unexpected errors
        return jsonify({"error": str(e)}), 500

@app.route('/', methods=['GET'])
def home():
    """
    Basic home endpoint for testing the API.
    """
    return jsonify({"message": "Benford's Law API is running. Use /api/check_benfords_law to analyze data."})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
