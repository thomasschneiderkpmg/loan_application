import math
from collections import Counter

class BenfordsLawChecker:
    def __init__(self, data):
        """
        Initialize the Benford's Law Checker with data.

        :param data: A dictionary containing numerical fields to check, e.g.,
                     {"loanAmount": 10000, "monthlyPayment": 450.75}
        """
        self.data = data

    @staticmethod
    def benford_distribution():
        """
        Expected distribution of leading digits according to Benford's Law.

        :return: A dictionary of leading digits (1-9) with their expected frequencies.
        """
        return {str(d): math.log10(1 + 1 / d) for d in range(1, 10)}

    @staticmethod
    def extract_leading_digit(value):
        """
        Extract the leading digit from a numerical value.

        :param value: A numerical value.
        :return: The leading digit as a string, or None if invalid.
        """
        try:
            return str(value).lstrip('-0.')[0]
        except (IndexError, ValueError):
            return None

    def calculate_compliance_percentage(self):
        """
        Calculate how well the data conforms to Benford's Law.

        :return: A single compliance percentage (0-100).
        """
        benford_dist = self.benford_distribution()
        observed_counts = Counter()
        total_count = 0

        # Extract leading digits and count them
        for field_name, field_value in self.data.items():
            if isinstance(field_value, (int, float)) and field_value > 0:
                leading_digit = self.extract_leading_digit(field_value)
                if leading_digit in benford_dist:
                    observed_counts[leading_digit] += 1
                    total_count += 1

        if total_count == 0:
            # No valid numbers to analyze
            return 0.0

        # Calculate observed frequency distribution
        observed_frequencies = {
            digit: observed_counts.get(digit, 0) / total_count
            for digit in benford_dist.keys()
        }

        # Compare observed frequencies to expected frequencies
        deviation = sum(
            abs(observed_frequencies[digit] - benford_dist[digit])
            for digit in benford_dist.keys()
        )

        # Calculate compliance percentage (lower deviation = higher compliance)
        compliance_percentage = max(0, 100 - deviation * 100)
        return round(compliance_percentage, 2)


if __name__ == "__main__":
    # Example data from a loan application
    loan_data = {
        "loanAmount": 10000,
        "monthlyPayment": 150.75,
        "totalPayments": 24,
        "interestRate": 5.5,
        "collateralValue": 9500,
        "otherAmount": 100
    }

    checker = BenfordsLawChecker(loan_data)
    compliance_percentage = checker.calculate_compliance_percentage()

    # Print the compliance percentage
    print(f"Compliance Percentage: {compliance_percentage}%")
