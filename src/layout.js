EPUBJS.Layout = EPUBJS.Layout || {};

EPUBJS.Layout.Reflowable = function(){
	this.documentElement = null;
	this.pageStride = null;
    this.isVertical = false;
};

EPUBJS.Layout.Reflowable.prototype.format = function(documentElement, _width, _height, _gap){
	// Get the prefixed CSS commands
	var columnGap = EPUBJS.core.prefixed('columnGap');
	var columnWidth = EPUBJS.core.prefixed('columnWidth');
	var columnFill = EPUBJS.core.prefixed('columnFill');
    var writingMode = EPUBJS.core.prefixed('writingMode');

    this.documentElement = documentElement;
    var bodyElement = documentElement.ownerDocument.body;
    var bodyStyles = documentElement.ownerDocument.defaultView.getComputedStyle(bodyElement);
    var writingModeValue = bodyStyles[writingMode] || "";
    this.isVertical = writingModeValue.indexOf("vertical") == 0;

	var width = Math.floor(_width);
    var height = Math.floor(_height);
    var stride = this.isVertical ? height : width;
	var section = Math.floor(stride / 8);
	var gap = (_gap >= 0) ? _gap : ((section % 2 === 0) ? section : section - 1);
    this.pageStride = (stride + gap);

    documentElement.style[writingMode] = writingModeValue;
	documentElement.style.overflow = "hidden";
    documentElement.style.width = width + "px";
	documentElement.style.height = height + "px";
	documentElement.style[columnFill] = "auto";
    documentElement.style[columnWidth] = stride + "px";
	documentElement.style[columnGap] = gap + "px";

	this.colWidth = stride;
	this.gap = gap;

	return {
		pageWidth : this.isVertical ? width : this.pageStride,
		pageHeight : this.isVertical ? this.pageStride : height,
        pageStride: this.pageStride,
        isVertical : this.isVertical
	};
};

EPUBJS.Layout.Reflowable.prototype.calculatePages = function() {
    var displayedPages;
    
    if (this.isVertical) {
        var totalHeight = this.documentElement.scrollHeight;
        displayedPages = Math.ceil(totalHeight / this.pageStride);
        this.documentElement.style.height = ((displayedPages * this.pageStride) - this.gap) + "px";
    } else {
        var totalWidth = this.documentElement.scrollWidth;
        displayedPages = Math.ceil(totalWidth / this.spreadWidth);
        this.documentElement.style.width = ((displayedPages * this.pageStride) - this.gap) + "px";
    }

	return {
		displayedPages : displayedPages,
		pageCount : displayedPages
	};
};

EPUBJS.Layout.ReflowableSpreads = function(){
	this.documentElement = null;
	this.pageStride = null;
    this.isVertical = false;
};

EPUBJS.Layout.ReflowableSpreads.prototype.format = function(documentElement, _width, _height, _gap){
	var columnGap = EPUBJS.core.prefixed('columnGap');
	var columnWidth = EPUBJS.core.prefixed('columnWidth');
	var columnFill = EPUBJS.core.prefixed('columnFill');
    var writingMode = EPUBJS.core.prefixed('writingMode');

    this.documentElement = documentElement;
    var bodyElement = documentElement.ownerDocument.body;
    var bodyStyles = documentElement.ownerDocument.defaultView.getComputedStyle(bodyElement);
    var writingModeValue = bodyStyles[writingMode] || "";
    this.isVertical = writingModeValue.indexOf("vertical") == 0;

	var width = Math.floor(_width);
    var height = Math.floor(_height);
    var stride = this.isVertical ? height : width;
	var gap = (_gap >= 0) ? _gap :  Math.floor(stride / 8);

    var divisor = this.isVertical ? 1 : 2;
    var colWidth = stride;
    if (divisor > 1) {
        colWidth = Math.floor((stride - gap) / divisor);
        gap = width - colWidth * divisor;
    }
	this.pageStride = (colWidth + gap) * divisor;

    documentElement.style[writingMode] = writingModeValue;
	documentElement.style.overflow = "hidden";
    documentElement.style.width = width + "px";
	documentElement.style.height = height + "px";
	documentElement.style[columnFill] = "auto";
    documentElement.style[columnWidth] = colWidth + "px";
	documentElement.style[columnGap] = gap + "px";

	this.colWidth = width;
	this.gap = gap;

	return {
		pageWidth : this.isVertical ? width : this.pageStride,
		pageHeight : this.isVertical ? this.pageStride : height,
        pageStride : this.pageStride,
        isVertical : this.isVertical
	};
};

EPUBJS.Layout.ReflowableSpreads.prototype.calculatePages = function() {
    var displayedPages, divisor;

    if (this.isVertical) {
        var totalHeight = this.documentElement.scrollHeight;
        displayedPages = Math.ceil(totalHeight / this.pageStride);
        divisor = 1;
        this.documentElement.style.height = ((displayedPages * this.pageStride) - this.gap) + "px";
    } else {
        var totalWidth = this.documentElement.scrollWidth;
        displayedPages = Math.ceil(totalWidth / this.spreadWidth);
        divisor = 2;
        this.documentElement.style.width = ((displayedPages * this.pageStride) - this.gap) + "px";
    }

	return {
		displayedPages : displayedPages,
		pageCount : displayedPages * divisor
	};
};

EPUBJS.Layout.Fixed = function(){
	this.documentElement = null;
    this.pageStride = null;
    this.isVertical = false;
};

EPUBJS.Layout.Fixed.prototype.format = function(documentElement, _width, _height, _gap){
	var columnWidth = EPUBJS.core.prefixed('columnWidth');
	var viewport = documentElement.querySelector("[name=viewport]");
	var content;
	var contents;
	var width, height;
	this.documentElement = documentElement;
	/**
	* check for the viewport size
	* <meta name="viewport" content="width=1024,height=697" />
	*/
	if(viewport && viewport.hasAttribute("content")) {
		content = viewport.getAttribute("content");
		contents = content.split(',');
		if(contents[0]){
			width = contents[0].replace("width=", '');
		}
		if(contents[1]){
			height = contents[1].replace("height=", '');
		}
	}

	//-- Adjust width and height
	documentElement.style.width =  width + "px" || "auto";
	documentElement.style.height =  height + "px" || "auto";

	//-- Remove columns
	documentElement.style[columnWidth] = "";

	//-- Scroll
	documentElement.style.overflow = "auto";

    this.pageStride = width;
	this.colWidth = width;
	this.gap = 0;

	return {
		pageWidth : width,
		pageHeight : height,
        pageStride : width,
        isVertical : false
	};
};

EPUBJS.Layout.Fixed.prototype.calculatePages = function(){
	return {
		displayedPages : 1,
		pageCount : 1
	};
};

EPUBJS.Layout.Scroll = function(){
	this.documentElement = null;
    this.pageStride = null;
    this.isVertical = false;
};

EPUBJS.Layout.Scroll.prototype.format = function(documentElement, _width, _height, _gap){
	var columnWidth = EPUBJS.core.prefixed('columnWidth');
    var writingMode = EPUBJS.core.prefixed('writingMode');

    this.documentElement = documentElement;
    var bodyElement = documentElement.ownerDocument.body;
    var bodyStyles = documentElement.ownerDocument.defaultView.getComputedStyle(bodyElement);
    var writingModeValue = bodyStyles[writingMode] || "";
    this.isVertical = writingModeValue.indexOf("vertical") == 0;

	var width = Math.floor(_width);
    var height = Math.floor(_height);
    
    documentElement.style[writingMode] = writingModeValue;
	documentElement.style.overflow = "auto";
	documentElement.style.width = this.isVertical ? "auto" : width + "px";
	documentElement.style.height = this.isVertical ? height + "px" : "auto";
	documentElement.style[columnWidth] = "";

    width = documentElement.scrollWidth;
    height = documentElement.scrollHeight;
    this.pageStride = this.isVertical ? height : width;
	this.colWidth = this.pageStride;
	this.gap = 0;

    if (writingModeValue == "vertical-rl") {
        window.scrollBy(width, 0)
    }

	return {
		pageWidth : width,
		pageHeight : height,
        pageStride : this.pageStride,
        isVertical : this.isVertical
	};
};

EPUBJS.Layout.Scroll.prototype.calculatePages = function(){
	return {
		displayedPages : 1,
		pageCount : 1
	};
};
