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

            // Parse AI results from route parameters
            if (oArgs && oArgs.aiResults) {
                try {
                    var aiResults = JSON.parse(decodeURIComponent(oArgs.aiResults));
                    var oModel = new sap.ui.model.json.JSONModel(aiResults);

                    // Set the AI results model to the view
                    this.getView().setModel(oModel, "AIResults");
                } catch (error) {
                    console.error("Error parsing AI results:", error);
                    MessageToast.show("Failed to load AI analysis results.");
                }
            } else {
                MessageToast.show("No AI analysis results available.");
            }
        },

        onNavBack: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("createLoan"); // Navigate back to the main page
        }
    });
});
