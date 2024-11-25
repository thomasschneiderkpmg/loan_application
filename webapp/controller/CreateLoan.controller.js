sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/PDFViewer",
    "sap/ui/model/json/JSONModel",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/CheckBox",
    "sap/m/VBox"
], function (Controller, MessageToast, PDFViewer, JSONModel, Dialog, Button, CheckBox, VBox) {
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
            var uploadedData = oModel.getProperty("/uploadedData");

            if (!uploadedData || Object.keys(uploadedData).length === 0) {
                MessageToast.show("Please upload a file with valid data before running the analysis.");
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
        },

        _sendDataToAPI: function (payload) {
            // Replace this URL with your API endpoint
            var apiUrl = "http://127.0.0.1:5000/api/check_benfords_law";

            $.ajax({
                url: apiUrl,
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify(payload),
                success: function (response) {
                    if (response.compliancePercentage !== undefined) {
                        MessageToast.show("Analysis completed successfully! Compliance: " + response.compliancePercentage + "%");
                    } else {
                        MessageToast.show("Analysis completed. No compliance data received.");
                    }
                    console.log("API Response:", response);
                },
                error: function (error) {
                    var errorMessage = error.responseJSON && error.responseJSON.error ? error.responseJSON.error : "An unknown error occurred.";
                    MessageToast.show("Error occurred during analysis: " + errorMessage);
                    console.error("API Error:", error);
                }
            });
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
        },

        onFileChange: function (oEvent) {
            // File upload handling logic here
            var oFile = oEvent.getParameter("files")[0];

            if (oFile) {
                var sFileType = oFile.type;
                var sFileName = oFile.name;
                var sFileBaseName = sFileName.split(".")[0].toLowerCase();
                var oReader = new FileReader();
                var oOpenPdfButton = this.byId("openPdfButton");

                if (sFileType.match("image.*")) {
                    oReader.onload = function (e) {
                        var sContent = e.target.result;
                        MessageToast.show("Image uploaded successfully.");
                        oOpenPdfButton.setVisible(false);
                        this._loadSampleData(sFileBaseName);
                    }.bind(this);
                    oReader.readAsDataURL(oFile);

                } else if (sFileType === "application/pdf") {
                    oReader.onload = function (e) {
                        var sContent = e.target.result;
                        oOpenPdfButton.setVisible(true);
                        this._pdfViewer.setSource(sContent);
                        this._pdfViewer.setTitle("Uploaded PDF");
                        this._loadSampleData(sFileBaseName);
                    }.bind(this);
                    oReader.readAsDataURL(oFile);

                } else {
                    MessageToast.show("Unsupported file type. Please upload an image or PDF.");
                    oOpenPdfButton.setVisible(false);
                }
            }
        },

        _loadSampleData: function (sName) {
            var oModel = new JSONModel();
            var sPath = sap.ui.require.toUrl("loan_application/model/" + sName + ".json");

            oModel.loadData(sPath)
                .then(function () {
                    this.getView().setModel(oModel, "sampleData");
                    MessageToast.show("Form data loaded for " + sName + ".");
                }.bind(this))
                .catch(function () {
                    MessageToast.show("No data found for " + sName + ". The form will remain empty.");
                });
        },

        onOpenPdf: function () {
            if (this._pdfViewer && this._pdfViewer.getSource()) {
                this._pdfViewer.open();
            } else {
                MessageToast.show("No PDF to display");
            }
        }
    });
});