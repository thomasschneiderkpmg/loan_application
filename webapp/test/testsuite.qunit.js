sap.ui.define(function () {
	"use strict";

	return {
		name: "QUnit test suite for the UI5 Application: loan_application",
		defaults: {
			page: "ui5://test-resources/loan_application/Test.qunit.html?testsuite={suite}&test={name}",
			qunit: {
				version: 2
			},
			sinon: {
				version: 1
			},
			ui5: {
				language: "EN",
				theme: "sap_horizon"
			},
			coverage: {
				only: "loan_application/",
				never: "test-resources/loan_application/"
			},
			loader: {
				paths: {
					"loan_application": "../"
				}
			}
		},
		tests: {
			"unit/unitTests": {
				title: "Unit tests for loan_application"
			},
			"integration/opaTests": {
				title: "Integration tests for loan_application"
			}
		}
	};
});
