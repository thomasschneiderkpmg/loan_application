sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/PDFViewer",
    "sap/ui/model/json/JSONModel",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/CheckBox",
    "sap/m/VBox",
    "sap/m/TextArea"
], function (Controller, MessageToast, PDFViewer, JSONModel, Dialog, Button, CheckBox, VBox, TextArea) {
    "use strict";

    return Controller.extend("loan_application.controller.CreateLoan", {
        onInit: function () {
            // Initialize PDF Viewer
            this._pdfViewer = new PDFViewer();
            this.getView().addDependent(this._pdfViewer);

            // Initialize a model for UI state
            var oModel = new JSONModel({
                selectedAnalyses: {
                    benfordsLaw: false,
                    fraudPatternAnalysis: false,
                    anomalyDetection: false
                }
            });
            this.getView().setModel(oModel, "ui");
        },

        onAIButtonPress: function () {
            // Open a dialog to select AI analysis options
            if (!this._aiDialog) {
                this._aiDialog = new Dialog({
                    title: "Select AI Analyses",
                    content: new VBox({
                        items: [
                            new CheckBox({
                                text: "Analyze Using Benford's Law",
                                selected: "{ui>/selectedAnalyses/benfordsLaw}"
                            }),
                            new CheckBox({
                                text: "Run Fraud Pattern Analysis",
                                selected: "{ui>/selectedAnalyses/fraudPatternAnalysis}"
                            }),
                            new CheckBox({
                                text: "Perform Anomaly Detection",
                                selected: "{ui>/selectedAnalyses/anomalyDetection}"
                            })
                        ]
                    }),
                    beginButton: new Button({
                        text: "Run Analyses",
                        press: function () {
                            this._runAIAnalyses();
                            this._aiDialog.close();
                        }.bind(this)
                    }),
                    endButton: new Button({
                        text: "Cancel",
                        press: function () {
                            this._aiDialog.close();
                        }.bind(this)
                    })
                });

                this.getView().addDependent(this._aiDialog);
            }

            this._aiDialog.open();
        },

        _runAIAnalyses: function () {
            var oModel = this.getView().getModel("ui");
            var analyses = oModel.getProperty("/selectedAnalyses");

            // Load the data from `sebestyen.json`
            var oDataModel = new JSONModel();
            var sPath = sap.ui.require.toUrl("loan_application/model/sebestyen.json");

            oDataModel.loadData(sPath)
                .then(function () {
                    var uploadedData = oDataModel.getData();

                    if (!uploadedData || Object.keys(uploadedData).length === 0) {
                        MessageToast.show("The JSON file contains no valid data.");
                        return;
                    }

                    // Filter selected analyses
                    var selectedAnalyses = Object.keys(analyses).filter(function (key) {
                        return analyses[key];
                    });

                    if (selectedAnalyses.length === 0) {
                        MessageToast.show("Please select at least one analysis option.");
                        return;
                    }

                    // Prepare the payload
                    var payload = {
                        data: uploadedData,
                        analyses: selectedAnalyses
                    };

                    // Call the API
                    this._sendDataToAPI(payload);
                }.bind(this))
                .catch(function (error) {
                    MessageToast.show("Failed to load the JSON file. Ensure it exists and is valid.");
                    console.error("JSON Load Error:", error);
                });
        },

        _sendDataToAPI: function (payload) {
            // Replace this URL with your API endpoint
            var apiUrl = "http://127.0.0.1:5000/api/analyze";

            $.ajax({
                url: apiUrl,
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify(payload),
                success: function (response) {
                    this._showResultsPopup(response);
                }.bind(this),
                error: function (error) {
                    var errorMessage = error.responseJSON && error.responseJSON.error ? error.responseJSON.error : "An unknown error occurred.";
                    console.error("API Error:", error);
                    this._showResultsPopup({ error: errorMessage });
                }.bind(this)
            });
        },

        _showResultsPopup: function (response) {
            // Build the results text
            var resultText = "";

            if (response.error) {
                resultText = "Error: " + response.error;
            } else {
                if (response.benfordsLaw) {
                    resultText += "Benford's Law Compliance: " + response.benfordsLaw.compliancePercentage + "%\n";
                    resultText += response.benfordsLaw.message + "\n\n";
                }

                if (response.fraudPatternAnalysis) {
                    resultText += "Fraud Pattern Analysis: " + response.fraudPatternAnalysis.message + "\n\n";
                }

                if (response.anomalyDetection) {
                    resultText += "Anomaly Detection: " + response.anomalyDetection.message + "\n\n";
                }
            }

            // Create and open the results dialog
            if (!this._resultDialog) {
                this._resultDialog = new Dialog({
                    title: "Analysis Results",
                    content: new TextArea({
                        value: resultText,
                        editable: false,
                        width: "100%",
                        growing: true,
                        growingMaxLines: 10
                    }),
                    beginButton: new Button({
                        text: "Close",
                        press: function () {
                            this._resultDialog.close();
                        }.bind(this)
                    })
                });

                this.getView().addDependent(this._resultDialog);
            }

            // Update the content of the dialog
            this._resultDialog.getContent()[0].setValue(resultText);

            // Open the dialog
            this._resultDialog.open();
        },

        onPostPress: function () {
            // Show a confirmation dialog when "Post" is pressed
            if (!this._oDialog) {
                this._oDialog = new Dialog({
                    title: "Confirm Submission",
                    type: "Message",
                    content: new sap.m.Text({ text: "Are you sure you want to submit the loan application?" }),
                    beginButton: new Button({
                        text: "Yes",
                        press: function () {
                            this._submitLoanApplication();
                            this._oDialog.close();
                        }.bind(this)
                    }),
                    endButton: new Button({
                        text: "No",
                        press: function () {
                            this._oDialog.close();
                        }.bind(this)
                    })
                });

                this.getView().addDependent(this._oDialog);
            }
            this._oDialog.open();
        },

        _submitLoanApplication: function () {
            MessageToast.show("Loan application submitted successfully!");
        }
    });
});
