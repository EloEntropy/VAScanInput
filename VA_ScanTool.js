
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.11.2/css/all.min.css">
<script src="https://code.jquery.com/jquery-3.4.1.slim.min.js"></script>
<script type="text/javascript" src="https://unpkg.com/@zxing/library@latest"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/quagga/0.12.1/quagga.min.js"></script>

<script type="text/javascript">



$(document).ready(function() {
    console.log("document is ready");
    $(".imageScan").wrap("<div></div>");
    $(".imageScan").focus(function() {
        $('#hoveringTooltip').remove();
        $(this).parent().append("<div id='hoveringTooltip' style='position: relative; z-index: 100; top: -27px; right: -200px;'></div>");
        console.log('appended div');
        $('#hoveringTooltip').html("<button id='scanUpload''><i class='fas fa-qrcode'></i></button><input id='fileid' type='file' onchange='processFile()' hidden />");
        $('#scanUpload').on( "click tap",function () {
    document.getElementById('fileid').click();
});
        $('#hoveringTooltip').css({});
//        $("#hoveringTooltip").focusout(function() {
//            $('#hoveringTooltip').remove();
//        });
    });
})


// Check for the various File API support.
if (window.File && window.FileReader && window.FileList && window.Blob) {



    function processFile() {

        var inputElement = document.getElementById('fileid');
        console.log(inputElement);
        var file = inputElement.files[0];
        
        console.log(file);
        
        var img = document.createElement("img");
        var reader = new FileReader();  



        reader.onload = function(e) {
        
        img.src = e.target.result;
        
        img.onload = () => {
        console.log('img loaded')
               
        const tmpCanvas = document.createElement('canvas');
        const ctx = tmpCanvas.getContext('2d');
                console.log(JSON.parse(JSON.stringify(img.width)));
        console.log(JSON.parse(JSON.stringify(img.height)));

        console.log(tmpCanvas);
        var MAX_WIDTH = 300;
        var MAX_HEIGHT = 300;
        var width = img.width;
        var height = img.height;
                console.log(width);
        console.log(height);

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
        getBlobFromCanvas(tmpCanvas,resizedBlob, processBlob);
        console.log('after getBlobFromCanvas: ' + resizedBlob);
        // img.remove();
        }

function processBlob(resizedBlob)
{
console.log('inside proceessBlob: ' + resizedBlob);
        resizedFile = new File([resizedBlob], "resizedImage", {
        type: "image/jpeg",
        });


            console.log(resizedFile);
            var fr = new FileReader();
            fr.onload = function () {
            const codeReader = new ZXing.BrowserMultiFormatReader()
            console.log('before decode');

            codeReader.decodeFromImage(undefined, fr.result).then((result) => {
            console.log('log result');
                console.log(result)
                
                var parentTooltip = inputElement.parentElement;
                console.log(parentTooltip);
                var parentDiv = parentTooltip.parentElement;
                var nodeList = parentDiv.childNodes;
                console.log(nodeList);
                for (i = 0; i < nodeList.length; i++) {
                    var node = nodeList[i];
                    if (node.className == 'imageScan') {
                        node.value = result.text;
                    }
                }
            }).catch((err) => {
               var input = document.getElementById('fileid');
           Quagga.decodeSingle({inputStream: {
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
        }, function(result){
               console.log('inside Quagga result function');
               console.log(result);
               if(result.codeResult) {
               
                               var parentTooltip = inputElement.parentElement;
                console.log(parentTooltip);
                var parentDiv = parentTooltip.parentElement;
                var nodeList = parentDiv.childNodes;
                console.log(nodeList);
                for (i = 0; i < nodeList.length; i++) {
                    var node = nodeList[i];
                    if (node.className == 'imageScan') {
                        node.value = result.codeResult.code;
                    }
                }
               }
               });

/*                var parentTooltip = inputElement.parentElement;
                console.log(parentTooltip);
                var parentDiv = parentTooltip.parentElement;
                var nodeList = parentDiv.childNodes;
                console.log(nodeList);
                for (i = 0; i < nodeList.length; i++) {
                    var node = nodeList[i];
                    if (node.className == 'imageScan') {
                        node.value = err;
                    }
                }*/
            })
            }
            fr.readAsDataURL(resizedFile);
}
        // tmpCanvas.remove();
        
console.log('before timeout');

        }
        console.log('after result');
        reader.readAsDataURL(file);

    }
} else {
    alert("Your browser is too old to support HTML5 File API");
}


    function getBlobFromCanvas(canvas, blob, callback) {
    console.log('getBlobFromCanvas');
		if (canvas.toBlob) { //canvas.blob() supported. Store blob.
			var blob = canvas.toBlob(function(blob){
            console.log('inside canvas.toblob: ' + blob);
            canvas.remove();
				callback(blob);
			}, 'image/jpeg');
		} else { // get Base64 dataurl from canvas, then convert it to Blob
			console.error('canvas.blob() not supported');
		}
	}

</script>
