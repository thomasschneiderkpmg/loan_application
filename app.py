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

def perform_fraud_pattern_analysis(data):
    """
    Placeholder for Fraud Pattern Analysis logic.
    :param data: Numeric data for analysis.
    :return: Dummy result for Fraud Pattern Analysis.
    """
    # Add actual fraud pattern analysis logic here
    return {
        "suspiciousTransactions": 2,
        "message": "Fraud pattern analysis detected 2 suspicious transactions."
    }

def perform_anomaly_detection(data):
    """
    Placeholder for Anomaly Detection logic.
    :param data: Numeric data for analysis.
    :return: Dummy result for Anomaly Detection.
    """
    # Add actual anomaly detection logic here
    return {
        "anomaliesFound": 3,
        "message": "Anomaly detection found 3 anomalies in the data."
    }

@app.route('/api/analyze', methods=['POST'])
def analyze():
    """
    Endpoint to analyze data using various analyses.
    Users send data in JSON format, specifying the analyses to perform.
    """
    try:
        # Parse input JSON data
        data = request.json
        print("Received data:", data)

        if not data or 'data' not in data or 'analyses' not in data:
            return jsonify({"error": "No valid data or analyses provided"}), 400

        # Filter numeric values from the 'data' field
        numeric_data = filter_numeric_data(data['data'].get('LoanApplication', {}))
        print("Filtered numeric data:", numeric_data)

        if not numeric_data:
            return jsonify({"error": "No numeric data found for analysis"}), 400

        # Initialize results dictionary
        results = {}

        # Perform the requested analyses
        if "benfordsLaw" in data["analyses"]:
            try:
                checker = BenfordsLawChecker(numeric_data)
                compliance_percentage = checker.calculate_compliance_percentage()
                results["benfordsLaw"] = {
                    "compliancePercentage": compliance_percentage,
                    "message": "Benford's Law analysis completed successfully."
                }
            except Exception as e:
                results["benfordsLaw"] = {"error": str(e)}

        if "fraudPatternAnalysis" in data["analyses"]:
            try:
                results["fraudPatternAnalysis"] = perform_fraud_pattern_analysis(numeric_data)
            except Exception as e:
                results["fraudPatternAnalysis"] = {"error": str(e)}

        if "anomalyDetection" in data["analyses"]:
            try:
                results["anomalyDetection"] = perform_anomaly_detection(numeric_data)
            except Exception as e:
                results["anomalyDetection"] = {"error": str(e)}

        # Return the results as a response
        return jsonify(results), 200

    except Exception as e:
        # Log the exception for debugging
        print("Error:", str(e))
        return jsonify({"error": str(e)}), 500

@app.route('/', methods=['GET'])
def home():
    """
    Basic home endpoint for testing the API.
    """
    return jsonify({"message": "Analysis API is running. Use /api/analyze to perform analyses."})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
