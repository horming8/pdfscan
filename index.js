const pdfjsLib = require('pdfjs-dist');

let pdfList = ['bank-crawfordtech'];

pdfList.forEach(function (fn) {

    let loadingTask = pdfjsLib.getDocument(fn + ".pdf");
    
    loadingTask.promise.then(function (doc) {
        let numPages = doc.numPages;
        console.log("# Document Loaded - " + fn);
        console.log("Number of Pages: " + numPages);
        console.log();

        let lastPromise; // will be used to chain promises
        lastPromise = doc.getMetadata().then(function (data) {
            console.log("# Metadata Is Loaded");
            console.log("## Info");
            console.log(JSON.stringify(data.info, null, 2));
            console.log();
            if (data.metadata) {
                console.log("## Metadata");
                console.log(JSON.stringify(data.metadata.getAll(), null, 2));
                console.log();
            }
        });


        let loadPage = function (pageNum) {
            return doc.getPage(pageNum).then(function (page) {
                console.log("# Page " + pageNum);
                let viewport = page.getViewport({ scale: 1.0 });
                console.log("Size: " + viewport.width + "x" + viewport.height);
                console.log();

                return page
                .getTextContent()
                .then(function (content) {

                    // prints each text item with x, y coordinations
                    let strings = content.items.map(function (item) {
                        return "(" + item.transform[4] + "," + item.transform[5] + ")" + item.str.trim();
                    });
                    console.log("## Text Content - " + fn);
                    console.log(strings.join("|"));

                    // prints each text item per line align
                    let lastY, text = '';
                    for (let item of content.items) {
                        if (!lastY || Math.abs(lastY - item.transform[5]) < 2) {
                            text += " " + item.str.trim();
                        }
                        else {
                            text += "\n" + item.str.trim();
                        }
                        lastY = item.transform[5];
                    }
                    console.log("## Text Content - " + fn);
                    console.log(text);

                })
                .then(function () {
                    console.log();
                });
            });
        };

        // Loading of the first page will wait on metadata and subsequent loadings
        // will wait on the previous pages.
        for (let i = 1; i <= numPages; i++) {
            lastPromise = lastPromise.then(loadPage.bind(null, i));
        }
        return lastPromise;
    })
    .then(
        function () {
            console.log("# End of Document");
        },
        function (err) {
            console.error("Error: " + err);
        }
    );
})