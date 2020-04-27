const utils = {
    isMobile: function() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent
        );
    },

    getCookie(name) {
        var value = "; " + document.cookie;
        var parts = value.split("; " + name + "=");
        if (parts.length == 2)
            return parts
                .pop()
                .split(";")
                .shift();
    },

    setCookie(token) {
        document.cookie = "Token=" + token + ";path=/";
    },

    findKeyList(target, value, key) {
        for (const index in target) {
            if (target[index][key] === value) {
                return target[index];
            }
        }
        return {};
    },

    _removeComma(data) {
        data = "" + data;
        const strCheck = /\,/g;
        return data.replace(strCheck, "");
    },

    exportCSVFile(fileName, headers, list) {
        let contents = "";
        let headerColumn = [];

        headers.forEach(function(row) {
            if (contents != "") contents += ",";
            contents += utils._removeComma(row.text);
            headerColumn.push(row.value);
        });
        contents += "\n";

        list.forEach(function(row) {
            for (const idx in headerColumn) {
                if (row[headerColumn[idx]]) {
                    contents += utils._removeComma(row[headerColumn[idx]]);
                } else {
                    contents += "";
                }
                if (contents != "") contents += ",";
            }
            contents += "\n";
        });

        const pom = document.createElement("a");
        const blob = new Blob(["\ufeff" + contents], {
            type: "text/csv;charset=utf-8;"
        });
        const url = URL.createObjectURL(blob);
        pom.href = url;
        pom.setAttribute("download", fileName);
        pom.click();
    }
};
module.exports = utils;