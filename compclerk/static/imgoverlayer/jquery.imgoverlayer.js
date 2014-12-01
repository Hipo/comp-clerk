/*
 * imgOverlayer jQuery plugin
 * version 0.1.0
 *
 * Copyright (c) 2014 Hipo (hipolabs.com)
 *
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 */

(function($) {

var abs = Math.abs,
    max = Math.max,
    min = Math.min,
    round = Math.round;

$.imgOverlayer = function (img, overlays, infoContainer, options) {

    var
        $img = $(img),
        $infoContainer = infoContainer,
        $formContainer = $('<div/>'),
        $infoLines = $('<ol/>'),
        $overlayBoxes = null,
        overlays = overlays,
        imgLoaded = false,
        editingOverlay = null,

        $box = $('<div/>'),
        $parent,
        
        $addButton = $("<button type=\"button\" class=\"btn btn-success\">Add Overlay</button>"),
        $confirmButton = $("<button type=\"button\" class=\"btn btn-success\">Save</button>"),
        $cancelButton = $("<button type=\"button\" class=\"btn btn-danger\">Cancel</button>"),
        $contentEditor = $("<textarea class=\"form-control\" rows=\"3\"></textarea>"),

        imgWidth, imgHeight,

        imgOfs = { left: 0, top: 0 },
        parOfs = { left: 0, top: 0 },
        zIndex = 0,
        visible,
        
        areaSelector = null,

        position = 'absolute',

        docElem = document.documentElement,

        ua = navigator.userAgent,

        $p;

    function viewX(x) {
        return x + imgOfs.left - parOfs.left;
    }

    function viewY(y) {
        return y + imgOfs.top - parOfs.top;
    }

    function adjust() {
        if (!imgLoaded || !$img.width())
            return;

        imgOfs = { left: round($img.offset().left), top: round($img.offset().top) };

        imgWidth = $img.innerWidth();
        imgHeight = $img.innerHeight();

        imgOfs.top += ($img.outerHeight() - imgHeight) >> 1;
        imgOfs.left += ($img.outerWidth() - imgWidth) >> 1;

        if ($().jquery == '1.3.2' && position == 'fixed' &&
            !docElem['getBoundingClientRect'])
        {
            imgOfs.top += max(document.body.scrollTop, docElem.scrollTop);
            imgOfs.left += max(document.body.scrollLeft, docElem.scrollLeft);
        }

        parOfs = /absolute|relative/.test($parent.css('position')) ?
            { left: round($parent.offset().left) - $parent.scrollLeft(),
                top: round($parent.offset().top) - $parent.scrollTop() } :
            position == 'fixed' ?
                { left: $(document).scrollLeft(), top: $(document).scrollTop() } :
                { left: 0, top: 0 };
    }

    function update() {
        if (!visible) return;

        $box.css({
            left: viewX(0), 
            top: viewY(0),
            width: imgWidth,
            height: imgHeight
        });
        
        if ($overlayBoxes != null) {
            $overlayBoxes.remove();
            $overlayBoxes = null;
        }
        
        for (var i = 0; i < overlays.length; i++) {
            var overlay = overlays[i];
            
            generateOverlay(overlay);
        }
    }

    function doUpdate() {
        adjust();
        update();
    }

    function windowResize() {
        doUpdate();
    }

    function imgLoad() {
        if (imgLoaded) {
            return;
        }
        
        imgLoaded = true;

        setOptions(options = $.extend({
            classPrefix: 'imgoverlayer',
            parent: 'body'
        }, options));

        $box.css({ visibility: '' });

        if (options.show) {
            visible = true;
            
            adjust();
            update();
        }
        
        $infoContainer.append($infoLines);
        $infoContainer.append($("<hr>"));
        $infoContainer.append($formContainer);
        
        $formContainer.append($addButton);
        $formContainer.append($contentEditor);
        $formContainer.append($confirmButton);
        $formContainer.append($cancelButton);
        
        $contentEditor.hide();
        $confirmButton.hide();
        $cancelButton.hide();
        
        $addButton.click(didClickAddButton);
        $confirmButton.click(didClickConfirmButton);
        $cancelButton.click(didClickCancelButton);
    }
    
    function generateOverlay(overlay) {
        var $overlayBox = $("<div/>");
        
        $overlayBox.css({
            left: overlay.left,
            top: overlay.top,
            width: overlay.width,
            height: overlay.height,
            position: "absolute",
            display: "block",
            "background-color": "#F0131C",
            opacity: 0.4
        });
        
        $box.append($overlayBox);
        
        $overlayBox.click(didClickOverlay);
        $overlayBox.mouseover(didMouseOverOverlay);
        $overlayBox.mouseout(didMouseOutOverlay);
        $overlayBox.css({
            "cursor": "pointer"
        })
        
        if ($overlayBoxes == null) {
            $overlayBoxes = $overlayBox;
        } else {
            $overlayBoxes = $overlayBoxes.add($overlayBox);
        }
        
        $overlayLine = $("<li/>");
        $overlayLine.css({
            "cursor": "pointer"
        })
        
        $infoLines.append($overlayLine);
        
        $overlayLine.text(overlay.description);
        $overlayLine.click(didClickInfoLine);
        $overlayLine.mouseover(didMouseOverInfoLine);
        $overlayLine.mouseout(didMouseOutInfoLine);
    }
    
    function hideForm() {
        if (areaSelector != null) {
            $img.imgAreaSelect({
                remove: true
            });

            areaSelector = null;
        }
        
        $addButton.show();
        $confirmButton.hide();
        $contentEditor.hide();
        $cancelButton.hide();
        $box.show();
    }
    
    function showForm(overlay) {
        if (areaSelector != null) {
            $img.imgAreaSelect({
                remove: true
            });

            areaSelector = null;
        }
        
        var options = {
            handles: true,
            instance: true,
            zIndex: zIndex + 1
        };
        
        if (overlay) {
            $.extend(options, {
                x1: overlay.left,
                y1: overlay.top,
                x2: overlay.left + overlay.width,
                y2: overlay.top + overlay.height
            });
            
            $contentEditor.val(overlay.description);
        } else {
            if (overlays.length == 0) {
                $.extend(options, {
                    x1: 10,
                    y1: 10,
                    x2: 60,
                    y2: 60
                });
            }
            
            $contentEditor.val("");
        }

        areaSelector = $img.imgAreaSelect(options);
        
        $box.hide();
        $addButton.hide();
        $confirmButton.show();
        $contentEditor.show();
        $cancelButton.show();
    }
    
    function editOverlay(overlayIndex) {
        editingOverlay = overlays[overlayIndex];
        
        showForm(editingOverlay);
    }
    
    function highlightOverlay(overlayIndex) {
        $infoLines.children().eq(overlayIndex).css({
            "background-color": "#ccc"
        });
        
        $overlayBoxes.eq(overlayIndex).css({
            "opacity": 0.6
        });
    }
    
    function unhighlightOverlay(overlayIndex) {
        $infoLines.children().eq(overlayIndex).css({
            "background-color": "#fff"
        });
        
        $overlayBoxes.eq(overlayIndex).css({
            "opacity": 0.4
        });
    }
    
    function didClickOverlay(evt) {
        var overlayIndex = $overlayBoxes.index($(evt.target));
        
        editOverlay(overlayIndex);
    }
    
    function didMouseOverOverlay(evt) {
        var overlayIndex = $overlayBoxes.index($(evt.target));

        highlightOverlay(overlayIndex);
    }
    
    function didMouseOutOverlay(evt) {
        var overlayIndex = $overlayBoxes.index($(evt.target));

        unhighlightOverlay(overlayIndex);
    }
    
    function didClickInfoLine(evt) {
        var overlayIndex = $infoLines.children().index($(evt.target));
        
        editOverlay(overlayIndex);
    }
    
    function didMouseOverInfoLine(evt) {
        var overlayIndex = $infoLines.children().index($(evt.target));

        highlightOverlay(overlayIndex);
    }
    
    function didMouseOutInfoLine(evt) {
        var overlayIndex = $infoLines.children().index($(evt.target));

        unhighlightOverlay(overlayIndex);
    }
    
    function didClickAddButton(evt) {
        showForm();
    }
    
    function didClickCancelButton(evt) {
        editingOverlay = null;
        
        hideForm();
    }
    
    function didClickConfirmButton(evt) {
        var selection = areaSelector.getSelection();
        var description = $contentEditor.val();
        
        if (!selection || selection.width <= 0 || selection.height <= 0) {
            alert("Select an area first!");
            return;
        }
        
        if (description == null || description.length == 0) {
            alert("Enter a description!");
            return;
        }
        
        overlay = {
            description: description,
            left: selection.x1,
            top: selection.y1,
            width: selection.width,
            height: selection.height
        };
        
        if (editingOverlay) {
            var overlayIndex = overlays.indexOf(editingOverlay);
            
            overlays[overlayIndex] = overlay;
            editingOverlay = null;
            
            $infoLines.children().eq(overlayIndex).text(overlay.description);
            $overlayBoxes.eq(overlayIndex).css({
                left: overlay.left,
                top: overlay.top,
                width: overlay.width,
                height: overlay.height
            })
        } else {
            overlays.push(overlay);

            generateOverlay(overlay);
        }
        
        hideForm();
    }

    function setOptions(newOptions) {
        if (newOptions.parent)
            ($parent = $(newOptions.parent)).append($box);

        $.extend(options, newOptions);

        adjust();

        visible = true;

        $box.fadeIn(options.fadeSpeed || 0);

        doUpdate();

        if (options.disable || options.enable === false) {
            $(window).unbind('resize', windowResize);
        } else if (options.enable || options.disable === false) {
            $(window).resize(windowResize);
        }

        options.enable = options.disable = undefined;
    }

    this.remove = function () {
        setOptions({ disable: true });

        $box.remove();
    };

    this.getOptions = function () { return options; };

    this.setOptions = setOptions;

    this.update = doUpdate;

    var msie = (/msie ([\w.]+)/i.exec(ua)||[])[1],
        opera = /opera/i.test(ua),
        safari = /webkit/i.test(ua) && !/chrome/i.test(ua);

    $p = $img;

    while ($p.length) {
        zIndex = max(zIndex,
            !isNaN($p.css('z-index')) ? $p.css('z-index') : zIndex);
        if ($p.css('position') == 'fixed')
            position = 'fixed';

        $p = $p.parent(':not(body)');
    }

    // zIndex = options.zIndex || zIndex;

    if (msie)
        $img.attr('unselectable', 'on');

    $box.css({
        visibility: 'hidden', 
        position: position,
        overflow: 'hidden', 
        zIndex: zIndex || '0' 
    });

    $box.css({ zIndex: zIndex + 2 || 2 });

    img.complete || img.readyState == 'complete' || !$img.is('img') ?
        imgLoad() : $img.one('load', imgLoad);

    if (!imgLoaded && msie && msie >= 7)
        img.src = img.src;
};

$.fn.imgOverlayer = function (overlays, infoContainer, options) {
    options = options || {};
    overlays = overlays || [];

    this.each(function () {
        $(this).data('imgOverlayer', new $.imgOverlayer(this, overlays, infoContainer, options));
    });

    return this;
};

})(jQuery);
