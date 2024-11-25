sap.ui.define([], function () {
    "use strict";

    return {
        processFile: function (oFile, onLoadCallback) {
            if (!oFile) {
                return;
            }
            var oReader = new FileReader();
            oReader.onload = function (e) {
                onLoadCallback(e.target.result);
            };
            oReader.readAsDataURL(oFile);
        }
    };
});
