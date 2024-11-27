sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
], function (Controller, MessageToast) {
    "use strict";

    return Controller.extend("loan_application.controller.Confirmation", {
        onInit: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("confirmation").attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function (oEvent) {
            var oArgs = oEvent.getParameter("arguments");

            // Parse AI Results from route parameters
            if (oArgs && oArgs.aiResults) {
                var aiResults = JSON.parse(decodeURIComponent(oArgs.aiResults));

                // Determine if the applicant is a "Good Boy" or "Bad Boy"
                var isGoodBoy = this._evaluateApplicant(aiResults);

                // Prepare data for the confirmation view
                var displayData = {
                    aiResults: aiResults,
                    verdict: isGoodBoy ? "Good Boy" : "Bad Boy"
                };

                // Set the data model for the view
                var oModel = new sap.ui.model.json.JSONModel(displayData);
                this.getView().setModel(oModel, "ConfirmationData");
            } else {
                MessageToast.show("No AI analysis results available!");
            }
        },

        _evaluateApplicant: function (aiResults) {
            // Simple evaluation logic (adjust as needed)
            if (aiResults.benfordsLaw && aiResults.benfordsLaw.compliancePercentage > 20) {
                return true; // Good Boy
            }

            // Other evaluation criteria can be added here
            return false; // Bad Boy
        },

        onNavBack: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("createLoan"); // Navigate back to the main page
        }
    });
});
