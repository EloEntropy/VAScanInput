var style = document.createElement('style');
style.type = 'text/css';
style.innerHTML = '.qrIconButton { min-width: 30px;min-height: 30px;max-width: 70px;max-height: 70px;}';
document.getElementsByTagName('head')[0].appendChild(style);

var link = document.createElement('link');
link.rel = 'stylesheet';
link.type = 'text/css';
link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.11.2/css/all.min.css';
document.head.appendChild(link);

var imported = document.createElement('script');
imported.src = 'https://unpkg.com/@zxing/library@latest';
document.head.appendChild(imported);

imported = document.createElement('script');
imported.src = 'https://cdnjs.cloudflare.com/ajax/libs/quagga/0.12.1/quagga.min.js';
document.head.appendChild(imported);

$(document).mouseup(function(e) {
    if ($('#hoveringTooltip').length > 0) {
        var container = $('#hoveringTooltip').parent();

        // if the target of the click isn't the container nor a descendant of the container
        if (!container.is(e.target) && container.has(e.target).length === 0) {
            $('#hoveringTooltip').remove();
        }
    }
});

$(document).ready(function() {

    $(".imageScan").wrap("<div></div>");
    $(".imageScan").focus(function() {

        $('#hoveringTooltip').remove();
        $(this).parent().append("<div id='hoveringTooltip' style='position: absolute; z-index: 100'></div>");

        var buttonHeight = $(this).height();
        $('#hoveringTooltip').html("<button class='qrIconButton' id='scanUpload' style='padding: 0px; height: " + $(this).outerHeight() + "px; width: " + $(this).outerHeight() + "px'><i class='fas fa-qrcode'></i></button><input id='fileid' type='file' onchange='processFile()' hidden />");
        $("#hoveringTooltip").css({ top: $(this).offset().top - ($('#scanUpload').outerHeight() - $(this).outerHeight()) / 2, left: ($(this).offset().left + $(this).outerWidth() - $('#scanUpload').outerWidth()) });
        $('#scanUpload').on("click tap", function() {
            document.getElementById('fileid').click();
        });
        $('#hoveringTooltip').css({});
        //        $("#hoveringTooltip").focusout(function() {
        //            $('#hoveringTooltip').remove();
        //        });
    });

});

// Check for the various File API support.
if (window.File && window.FileReader && window.FileList && window.Blob) {



    function processFile() {

        var inputElement = document.getElementById('fileid');
        var file = inputElement.files[0];

        var img = document.createElement("img");
        var reader = new FileReader();

        reader.onload = function(e) {

            img.src = e.target.result;

            img.onload = () => {

                const tmpCanvas = document.createElement('canvas');
                const ctx = tmpCanvas.getContext('2d');

                var MAX_WIDTH = 300;
                var MAX_HEIGHT = 300;
                var width = img.width;
                var height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }
                tmpCanvas.width = width;
                tmpCanvas.height = height;

                ctx.drawImage(
                    img,
                    0,
                    0,
                    width,
                    height,
                );
                var resizedBlob;
                getBlobFromCanvas(tmpCanvas, resizedBlob, processBlob);
                // img.remove();
            }

            function processBlob(resizedBlob) {
                resizedFile = new File([resizedBlob], "resizedImage", {
                    type: "image/jpeg",
                });

                var fr = new FileReader();
                fr.onload = function() {
                    const codeReader = new ZXing.BrowserMultiFormatReader()

                    codeReader.decodeFromImage(undefined, fr.result).then((result) => {
                        var parentTooltip = inputElement.parentElement;
                        var parentDiv = parentTooltip.parentElement;
                        var nodeList = parentDiv.childNodes;
                        for (i = 0; i < nodeList.length; i++) {
                            var node = nodeList[i];
                            if (node.className == 'imageScan') {
                                $('#hoveringTooltip').remove();
                                node.value = result.text;

                            }
                        }
                    }).catch((err) => {
                        var input = document.getElementById('fileid');
                        Quagga.decodeSingle({
                            inputStream: {
                                size: 800,
                                singleChannel: false
                            },
                            locator: {
                                patchSize: "medium",
                                halfSample: true
                            },
                            decoder: {
                                readers: [{
                                    format: "code_128_reader",
                                    config: {}
                                }]
                            },
                            locate: true,
                            src: URL.createObjectURL(input.files[0])
                        }, function(result) {
                            if (result.codeResult) {

                                var parentTooltip = inputElement.parentElement;
                                var parentDiv = parentTooltip.parentElement;
                                var nodeList = parentDiv.childNodes;

                                for (i = 0; i < nodeList.length; i++) {
                                    var node = nodeList[i];
                                    if (node.className == 'imageScan') {
                                        $('#hoveringTooltip').remove();
                                        node.value = result.codeResult.code;

                                    }
                                }
                            } else {
                                alert('Barcode not found - Try Again');
                            }

                        });

                    })
                }
                fr.readAsDataURL(resizedFile);
            }

        }
        reader.readAsDataURL(file);

    }
} else {
    alert("Your browser is too old to support HTML5 File API");
}


function getBlobFromCanvas(canvas, blob, callback) {
    if (canvas.toBlob) { //canvas.blob() supported. Store blob.
        var blob = canvas.toBlob(function(blob) {
            canvas.remove();
            callback(blob);
        }, 'image/jpeg');
    } else { // get Base64 dataurl from canvas, then convert it to Blob
        console.error('canvas.blob() not supported');
    }
}
