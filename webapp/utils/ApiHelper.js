sap.ui.define([], function () {
    "use strict";

    return {
        sendDataToAPI: function (apiUrl, payload) {
            return new Promise(function (resolve, reject) {
                $.ajax({
                    url: apiUrl,
                    type: "POST",
                    contentType: "application/json",
                    data: JSON.stringify(payload),
                    success: function (response) {
                        resolve(response);
                    },
                    error: function (error) {
                        reject(error);
                    }
                });
            });
        }
    };
});
