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

        onFileChange: function (oEvent) {
            var oFile = oEvent.getParameter("files")[0];
        
            if (!oFile) {
                MessageToast.show("Please select a file to upload.");
                return;
            }
        
            var sFileName = oFile.name.split(".")[0].toLowerCase(); // Extract the file name without extension
            var sPath = sap.ui.require.toUrl("loan_application/model/" + sFileName + ".json");
        
            // Store the file name in the UI model
            var oModel = this.getView().getModel("ui");
            oModel.setProperty("/selectedFileName", sFileName);
        
            // Load the corresponding JSON file from the model folder
            var oDataModel = new JSONModel();
            oDataModel.loadData(sPath)
                .then(function () {
                    this.getView().setModel(oDataModel, "sampleData");
                    MessageToast.show("Data loaded successfully for: " + sFileName);
                }.bind(this))
                .catch(function () {
                    MessageToast.show("Failed to load data. Ensure the file exists in the model folder.");
                    console.error("Error loading JSON file:", sPath);
                });
        },        
        
        _runAIAnalyses: function () {
            var oModel = this.getView().getModel("ui");
            var analyses = oModel.getProperty("/selectedAnalyses");
        
            // Retrieve the selected file name
            var sFileName = oModel.getProperty("/selectedFileName");
        
            if (!sFileName) {
                MessageToast.show("No file selected. Please upload a file first.");
                return;
            }
        
            // Load the data from the JSON file
            var oDataModel = new JSONModel();
            var sPath = sap.ui.require.toUrl("loan_application/model/" + sFileName + ".json");
        
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
            var contentItems = []; // Content items for the dialog
        
            // Add Benford's Law Section
            if (response.benfordsLaw) {
                var compliance = response.benfordsLaw.compliancePercentage;
                var complianceColor = "green";
                var complianceIcon = "sap-icon://accept";
        
                if (compliance < 10) {
                    complianceColor = "red";
                    complianceIcon = "sap-icon://error";
                } else if (compliance >= 10 && compliance < 20) {
                    complianceColor = "orange";
                    complianceIcon = "sap-icon://status-critical";
                }
        
                contentItems.push(
                    new sap.m.HBox({
                        alignItems: "Center",
                        justifyContent: "Start",
                        items: [
                            new sap.ui.core.Icon({
                                src: complianceIcon,
                                color: complianceColor,
                                size: "2rem"
                            }).addStyleClass("sapUiSmallMarginBegin"),
                            new sap.m.VBox({
                                items: [
                                    new sap.m.Text({
                                        text: "Benford's Law Analysis",
                                        wrapping: true
                                    }).addStyleClass("sapUiSmallMarginBottom sapUiBoldText"),
                                    new sap.m.Text({
                                        text: `Compliance: ${compliance.toFixed(2)}%`,
                                        wrapping: true
                                    }),
                                    new sap.m.Text({
                                        text: response.benfordsLaw.message,
                                        wrapping: true
                                    })
                                ]
                            }).addStyleClass("sapUiSmallMarginBegin")
                        ]
                    }).addStyleClass("sapUiSmallMarginBottom")
                );
            }
        
            // Add Fraud Pattern Analysis Section
            if (response.fraudPatternAnalysis) {
                var suspiciousCount = response.fraudPatternAnalysis.suspiciousCount || 0;
                var fraudColor = "orange";
                var fraudIcon = "sap-icon://status-critical";
        
                if (suspiciousCount > 5) {
                    fraudColor = "red";
                    fraudIcon = "sap-icon://error";
                } else if (suspiciousCount > 0) {
                    fraudColor = "orange";
                    fraudIcon = "sap-icon://status-critical";
                }
        
                contentItems.push(
                    new sap.m.HBox({
                        alignItems: "Center",
                        justifyContent: "Start",
                        items: [
                            new sap.ui.core.Icon({
                                src: fraudIcon,
                                color: fraudColor,
                                size: "2rem"
                            }).addStyleClass("sapUiSmallMarginBegin"),
                            new sap.m.VBox({
                                items: [
                                    new sap.m.Text({
                                        text: "Fraud Pattern Analysis",
                                        wrapping: true
                                    }).addStyleClass("sapUiSmallMarginBottom sapUiBoldText"),
                                    new sap.m.Text({
                                        text: response.fraudPatternAnalysis.message,
                                        wrapping: true
                                    })
                                ]
                            }).addStyleClass("sapUiSmallMarginBegin")
                        ]
                    }).addStyleClass("sapUiSmallMarginBottom")
                );
            }
        
            // Add Anomaly Detection Section
            if (response.anomalyDetection) {
                var anomalyCount = response.anomalyDetection.anomaliesCount || 0;
                var anomalyColor = "orange";
                var anomalyIcon = "sap-icon://status-critical";
        
                if (anomalyCount > 5) {
                    anomalyColor = "red";
                    anomalyIcon = "sap-icon://error";
                } else if (anomalyCount > 0) {
                    anomalyColor = "orange";
                    anomalyIcon = "sap-icon://status-critical";
                }
        
                contentItems.push(
                    new sap.m.HBox({
                        alignItems: "Center",
                        justifyContent: "Start",
                        items: [
                            new sap.ui.core.Icon({
                                src: anomalyIcon,
                                color: anomalyColor,
                                size: "2rem"
                            }).addStyleClass("sapUiSmallMarginBegin"),
                            new sap.m.VBox({
                                items: [
                                    new sap.m.Text({
                                        text: "Anomaly Detection",
                                        wrapping: true
                                    }).addStyleClass("sapUiSmallMarginBottom sapUiBoldText"),
                                    new sap.m.Text({
                                        text: response.anomalyDetection.message,
                                        wrapping: true
                                    })
                                ]
                            }).addStyleClass("sapUiSmallMarginBegin")
                        ]
                    }).addStyleClass("sapUiSmallMarginBottom")
                );
            }
        
            // Create and open the results dialog
            if (!this._resultDialog) {
                this._resultDialog = new sap.m.Dialog({
                    title: "Analysis Results",
                    content: new sap.m.VBox({
                        items: contentItems
                    }),
                    beginButton: new sap.m.Button({
                        text: "Close",
                        press: function () {
                            this._resultDialog.close();
                        }.bind(this)
                    })
                });
        
                this.getView().addDependent(this._resultDialog);
            } else {
                // Update content of the existing dialog
                this._resultDialog.removeAllContent();
                this._resultDialog.addContent(new sap.m.VBox({ items: contentItems }));
            }
        
            // Open the dialog
            this._resultDialog.open();
        },           

        onPostPress: function () {
            // Show a confirmation dialog when "Post" is pressed
            if (!this._oDialog) {
                this._oDialog = new sap.m.Dialog({
                    title: "Confirm Submission",
                    type: "Message",
                    content: new sap.m.Text({ text: "Are you sure you want to submit the loan application?" }),
                    beginButton: new sap.m.Button({
                        text: "Yes",
                        press: function () {
                            this._submitLoanApplication();
                            this._oDialog.close();
                        }.bind(this)
                    }),
                    endButton: new sap.m.Button({
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
            // Retrieve the AI analysis results from the dialog content or internal model
            var aiResults = this._aiAnalysisResults || {}; // Assuming `_aiAnalysisResults` stores the last analysis run
        
            // Encode the data to ensure safe URL passing
            var encodedResults = encodeURIComponent(JSON.stringify(aiResults));
        
            // Navigate to the confirmation view with AI results
            sap.ui.core.UIComponent.getRouterFor(this).navTo("confirmation", {
                aiResults: encodedResults
            });
        },      
    });
});
