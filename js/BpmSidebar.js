/**
 * Construcs a new sidebar for the given editor.
 */

function Sidebar(editorUi, container)
{
	this.editorUi = editorUi;
	this.container = container;
	this.palettes = new Object();
	this.taglist = new Object();
	this.showTooltips = true;
	this.graph = editorUi.createTemporaryGraph(this.editorUi.editor.graph.getStylesheet());
    this.graph.cellRenderer.minSvgStrokeWidth = this.minThumbStrokeWidth;
	this.graph.cellRenderer.antiAlias = this.thumbAntiAlias;
	this.graph.container.style.visibility = 'hidden';
	this.graph.foldingEnabled = false;

	document.body.appendChild(this.graph.container);
	
	this.pointerUpHandler = bpmUtils.bind(this, function()
	{
		this.showTooltips = true;
	});

	bpmEvent.addListener(document, (bpmCore.IS_POINTER) ? 'pointerup' : 'mouseup', this.pointerUpHandler);

	this.pointerDownHandler = bpmUtils.bind(this, function()
	{
		this.showTooltips = false;
		this.hideTooltip();
	});
	
	bpmEvent.addListener(document, (bpmCore.IS_POINTER) ? 'pointerdown' : 'mousedown', this.pointerDownHandler);
	
	this.pointerMoveHandler = bpmUtils.bind(this, function(evt)
	{
		var src = bpmEvent.getSource(evt);
		
		while (src != null)
		{
			if (src == this.currentElt)
			{
				return;
			}
			
			src = src.parentNode;
		}
		
		this.hideTooltip();
	});

	bpmEvent.addListener(document, (bpmCore.IS_POINTER) ? 'pointermove' : 'mousemove', this.pointerMoveHandler);

	// Handles mouse leaving the window
	this.pointerOutHandler = bpmUtils.bind(this, function(evt)
	{
		if (evt.toElement == null && evt.relatedTarget == null)
		{
			this.hideTooltip();
		}
	});
	
	bpmEvent.addListener(document, (bpmCore.IS_POINTER) ? 'pointerout' : 'mouseout', this.pointerOutHandler);

	// Enables tooltips after scroll
	bpmEvent.addListener(container, 'scroll', bpmUtils.bind(this, function()
	{
		this.showTooltips = true;
		this.hideTooltip();
	}));
	
	this.init();
};

/**
 * Adds all palettes to the sidebar.
 */
Sidebar.prototype.init = function()
{
	this.addGeneralPalette(true);

	for ( i = 0; i < sideBarJSON.length; i++ ) {

		var sidebarShapeGroup = sideBarJSON[i];

		this.addImagePaletteWithImage(sidebarShapeGroup.shapeGroupId, sidebarShapeGroup.shapeGroupName, '', '',	sidebarShapeGroup.shapeGroupMemberIds, sidebarShapeGroup.shapeGroupMemberTitles, sidebarShapeGroup.shapeGroupMemberImages, (i == 0) ? false : false);
	};
};

/**
 * Sets the default font size.
 */
Sidebar.prototype.collapsedImage = (!bpmCore.IS_SVG) ? IMAGE_PATH + '/collapsed.gif' : 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAANCAYAAABy6+R8AAABOklEQVQokZWSIUsEURSFv7Msy7IYRAxiMJgsJpvJarWJGPdNdP6AGMzCGGe2iWIx2AXdP+AfMGwQg4iIiMiyyBzDvFmHNfnghXcu59zvvvdkDEAakg7Q5u8qsyIfNwUdhNAGNoFtYM42kgAwICgN94LrrMg/iMmrQN/2jaTHGQNAS7BX8XAG0AKWgHekq6zIh1mRD4FDwUM832JfCDbSkHTrTi3bs3O04o5DqGxq7UoTQC8NyQKA7a6k5TQkYJc44kb06rZsDDuSdmPIGnCKPUYqbR/Xhl+ThOA8K/ICIO2HO6T9bFA8xefYmmWPzRpzNVKntUa9DUyAHtJiGpLXqF8C47QfehWFVrA/sb9r08jwJjiy/SWpSpXWGx3nkQZZkU9q04vgxPaqoNNEkoTtUtIz9mhKX/+9/6wfNc+DB4iTsb8AAAAASUVORK5CYII=';

/**
 * Sets the default font size.
 */
Sidebar.prototype.expandedImage = (!bpmCore.IS_SVG) ? IMAGE_PATH + '/expanded.gif' : 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAANCAYAAABy6+R8AAABFElEQVQokXWQsUoDURREz4QlRbAQsbCyyGdY2VoJdrK7kC38Dgtrf0CLDe6zEQt7v8FfsLASERGREILsWPhedoPJwONduHfuzFwZA1AV5dB2JgnbSAIAu61vw5weNMnzzNKB4AjYMhDHiXWL/YT0UIfmCyBDGgvObD9KeuE/Bkh5rG/+SLCH/Snpvg7NbA2JqigBjquivKtDMx/ETetmO9gtMIiPrNcaTYpyR12WlKsVq8fJsIlKJ4JTegS6Q1xIApt0iNQPdWiu1rmbFOUhK0pL294YSam3VIIFMJK0WxXley88nQvtA9+Gn0R6Bj6Ac+wZyXvvN2wLrqehWSTSG3CJPUYa9gmWELSC17g82mVzlk34BQZicSllJykbAAAAAElFTkSuQmCC';

/**
 * 
 */
Sidebar.prototype.searchImage = (!bpmCore.IS_SVG) ? IMAGE_PATH + '/search.png' : 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAAEaSURBVHjabNGxS5VxFIfxz71XaWuQUJCG/gCHhgTD9VpEETg4aMOlQRp0EoezObgcd220KQiXmpretTAHQRBdojlQEJyukPdt+b1ywfvAGc7wnHP4nlZd1yKijQW8xzNc4Su+ZOYfQ3T6/f4YNvEJYzjELXp4VVXVz263+7cR2niBxAFeZ2YPi3iHR/gYERPDwhpOsd6sz8x/mfkNG3iOlWFhFj8y89J9KvzGXER0GuEaD42mgwHqUtoljbcRsTBCeINpfM/MgZLKPpaxFxGbOCqDXmILN7hoJrTKH+axhxmcYRxP0MIDnOBDZv5q1XUNIuJxifJp+UNV7t7BFM6xeic0RMQ4Bpl5W/ol7GISx/eEUUTECrbx+f8A8xhiZht9zsgAAAAASUVORK5CYII=';

/**
 * 
 */
Sidebar.prototype.dragPreviewBorder = '1px dashed black';

/**
 * Specifies if tooltips should be visible. Default is true.
 */
Sidebar.prototype.enableTooltips = true;

/**
 * Specifies the delay for the tooltip. Default is 16 px.
 */
Sidebar.prototype.tooltipBorder = 16;

/**
 * Specifies the delay for the tooltip. Default is 300 ms.
 */
Sidebar.prototype.tooltipDelay = 300;

/**
 * Specifies the delay for the drop target icons. Default is 200 ms.
 */
Sidebar.prototype.dropTargetDelay = 200;

/**
 * Specifies the URL of the gear image.
 */
Sidebar.prototype.gearImage = '/clipart/Gear_128x128.png';

/**
 * Specifies the width of the thumbnails.
 */
Sidebar.prototype.thumbWidth = 42;

/**
 * Specifies the height of the thumbnails.
 */
Sidebar.prototype.thumbHeight = 42;

/**
 * Specifies the width of the thumbnails.
 */
Sidebar.prototype.minThumbStrokeWidth = 1;

/**
 * Specifies the width of the thumbnails.
 */
Sidebar.prototype.thumbAntiAlias = false;

/**
 * Specifies the padding for the thumbnails. Default is 3.
 */
Sidebar.prototype.thumbPadding = (document.documentMode >= 5) ? 2 : 3;

/**
 * Specifies the delay for the tooltip. Default is 2 px.
 */
Sidebar.prototype.thumbBorder = 2;

/*
 * Experimental smaller sidebar entries
 */
if (urlParams['sidebar-entries'] != 'large')
{
	Sidebar.prototype.thumbPadding = (document.documentMode >= 5) ? 0 : 1;
	Sidebar.prototype.thumbBorder = 1;
	Sidebar.prototype.thumbWidth = 32;
	Sidebar.prototype.thumbHeight = 30;
	Sidebar.prototype.minThumbStrokeWidth = 1.3;
	Sidebar.prototype.thumbAntiAlias = true;
}

/**
 * Specifies the size of the sidebar titles.
 */
Sidebar.prototype.sidebarTitleSize = 9;

/**
 * Specifies if titles in the sidebar should be enabled.
 */
Sidebar.prototype.sidebarTitles = false;

/**
 * Specifies if titles in the tooltips should be enabled.
 */
Sidebar.prototype.tooltipTitles = true;

/**
 * Specifies if titles in the tooltips should be enabled.
 */
Sidebar.prototype.maxTooltipWidth = 400;

/**
 * Specifies if titles in the tooltips should be enabled.
 */
Sidebar.prototype.maxTooltipHeight = 400;

/**
 * Specifies if stencil files should be loaded and added to the search index
 * when stencil palettes are added. If this is false then the stencil files
 * are lazy-loaded when the palette is shown.
 */
Sidebar.prototype.addStencilsToIndex = true;

/**
 * Specifies the width for clipart images. Default is 80.
 */
Sidebar.prototype.defaultImageWidth = 80;

/**
 * Specifies the height for clipart images. Default is 80.
 */
Sidebar.prototype.defaultImageHeight = 80;

/**
 * Adds all palettes to the sidebar.
 */
Sidebar.prototype.getTooltipOffset = function()
{
	return new bpmPoint(0, 0);
};

/**
 * Adds all palettes to the sidebar.
 */
Sidebar.prototype.showTooltip = function(elt, cells, w, h, title, showLabel)
{
	if (this.enableTooltips && this.showTooltips)
	{
		if (this.currentElt != elt)
		{
			if (this.thread != null)
			{
				window.clearTimeout(this.thread);
				this.thread = null;
			}
			
			var show = bpmUtils.bind(this, function()
			{
				// Lazy creation of the DOM nodes and graph instance
				if (this.tooltip == null)
				{
					this.tooltip = document.createElement('div');
					this.tooltip.className = 'geSidebarTooltip';
					this.tooltip.style.zIndex = bpmPopupMenu.prototype.zIndex - 1;
					document.body.appendChild(this.tooltip);
					
					this.graph2 = new Draw(this.tooltip, null, null, this.editorUi.editor.graph.getStylesheet());
					this.graph2.resetViewOnRootChange = false;
					this.graph2.foldingEnabled = false;
					this.graph2.gridEnabled = false;
					this.graph2.autoScroll = false;
					this.graph2.setTooltips(false);
					this.graph2.setConnectable(false);
					this.graph2.setEnabled(false);
					
					if (!bpmCore.IS_SVG)
					{
						this.graph2.view.canvas.style.position = 'relative';
					}
				}
				
				this.graph2.model.clear();
				this.graph2.view.setTranslate(this.tooltipBorder, this.tooltipBorder);

				if (w > this.maxTooltipWidth || h > this.maxTooltipHeight)
				{
					this.graph2.view.scale = Math.round(Math.min(this.maxTooltipWidth / w, this.maxTooltipHeight / h) * 100) / 100;
				}
				else
				{
					this.graph2.view.scale = 1;
				}
				
				this.tooltip.style.display = 'block';
				this.graph2.labelsVisible = (showLabel == null || showLabel);
				var fo = bpmCore.NO_FO;
				bpmCore.NO_FO = BpmDraw.prototype.originalNoForeignObject;
				this.graph2.addCells(cells);
				bpmCore.NO_FO = fo;
				
				var bounds = this.graph2.getGraphBounds();
				var width = bounds.width + 2 * this.tooltipBorder + 4;
				var height = bounds.height + 2 * this.tooltipBorder;
				
				if (bpmCore.IS_QUIRKS)
				{
					height += 4;
					this.tooltip.style.overflow = 'hidden';
				}
				else
				{
					this.tooltip.style.overflow = 'visible';
				}

				this.tooltip.style.width = width + 'px';
				
				// Adds title for entry
				if (this.tooltipTitles && title != null && title.length > 0)
				{
					if (this.tooltipTitle == null)
					{
						this.tooltipTitle = document.createElement('div');
						this.tooltipTitle.style.borderTop = '1px solid gray';
						this.tooltipTitle.style.textAlign = 'center';
						this.tooltipTitle.style.width = '100%';
						
						// Oversize titles are cut-off currently. Should make tooltip wider later.
						this.tooltipTitle.style.overflow = 'hidden';
						this.tooltipTitle.style.position = 'absolute';
						this.tooltipTitle.style.paddingTop = '6px';
						this.tooltipTitle.style.bottom = '6px';

						this.tooltip.appendChild(this.tooltipTitle);
					}
					else
					{
						this.tooltipTitle.innerHTML = '';
					}
					
					this.tooltipTitle.style.display = '';
					bpmUtils.write(this.tooltipTitle, title);
					
					var ddy = this.tooltipTitle.offsetHeight + 10;
					height += ddy;
					
					if (bpmCore.IS_SVG)
					{
						this.tooltipTitle.style.marginTop = (2 - ddy) + 'px';
					}
					else
					{
						height -= 6;
						this.tooltipTitle.style.top = (height - ddy) + 'px';	
					}
				}
				else if (this.tooltipTitle != null && this.tooltipTitle.parentNode != null)
				{
					this.tooltipTitle.style.display = 'none';
				}
				
				this.tooltip.style.height = height + 'px';
				var x0 = -Math.round(bounds.x - this.tooltipBorder);
				var y0 = -Math.round(bounds.y - this.tooltipBorder);
				
				var b = document.body;
				var d = document.documentElement;
				var off = this.getTooltipOffset();
				var bottom = Math.max(b.clientHeight || 0, d.clientHeight);
				var left = this.container.clientWidth + this.editorUi.splitSize + 3 + this.editorUi.container.offsetLeft + off.x;
				var top = Math.min(bottom - height - 20 /*status bar*/, Math.max(0, (this.editorUi.container.offsetTop +
					this.container.offsetTop + elt.offsetTop - this.container.scrollTop - height / 2 + 16))) + off.y;

				if (bpmCore.IS_SVG)
				{
					if (x0 != 0 || y0 != 0)
					{
						this.graph2.view.canvas.setAttribute('transform', 'translate(' + x0 + ',' + y0 + ')');
					}
					else
					{
						this.graph2.view.canvas.removeAttribute('transform');
					}
				}
				else
				{
					this.graph2.view.drawPane.style.left = x0 + 'px';
					this.graph2.view.drawPane.style.top = y0 + 'px';
				}
				
				// Workaround for ignored position CSS style in IE9
				// (changes to relative without the following line)
				this.tooltip.style.position = 'absolute';
				this.tooltip.style.left = left + 'px';
				this.tooltip.style.top = top + 'px';
			});

			if (this.tooltip != null && this.tooltip.style.display != 'none')
			{
				show();
			}
			else
			{
				this.thread = window.setTimeout(show, this.tooltipDelay);
			}

			this.currentElt = elt;
		}
	}
};

/**
 * Hides the current tooltip.
 */
Sidebar.prototype.hideTooltip = function()
{
	if (this.thread != null)
	{
		window.clearTimeout(this.thread);
		this.thread = null;
	}
	
	if (this.tooltip != null)
	{
		this.tooltip.style.display = 'none';
		this.currentElt = null;
	}
};

/**
 * Hides the current tooltip.
 */
Sidebar.prototype.addDataEntry = function(tags, width, height, title, data)
{
	return this.addEntry(tags, bpmUtils.bind(this, function()
	{
	   	return this.createVertexTemplateFromData(data, width, height, title);
	}));
};

/**
 * Hides the current tooltip.
 */
Sidebar.prototype.addEntry = function(tags, fn)
{
	if (this.taglist != null && tags != null && tags.length > 0)
	{
		// Replaces special characters
		var tmp = tags.toLowerCase().replace(/[\/\,\(\)]/g, ' ').split(' ');

		var doAddEntry = bpmUtils.bind(this, function(tag)
		{
			if (tag != null && tag.length > 1)
			{
				var entry = this.taglist[tag];
				
				if (typeof entry !== 'object')
				{
					entry = {entries: [], dict: new bpmDictionary()};
					this.taglist[tag] = entry;
				}

				// Ignores duplicates
				if (entry.dict.get(fn) == null)
				{
					entry.dict.put(fn, fn);
					entry.entries.push(fn);
				}
			}
		});
		
		for (var i = 0; i < tmp.length; i++)
		{
			doAddEntry(tmp[i]);
			
			// Adds additional entry with removed trailing numbers
			var normalized = tmp[i].replace(/\.*\d*$/, '');
			
			if (normalized != tmp[i])
			{
				doAddEntry(normalized);
			}
		}
	}
	
	return fn;
};

/**
 * Adds shape search UI.
 */
Sidebar.prototype.searchEntries = function(searchTerms, count, page, success, error)
{
	if (this.taglist != null && searchTerms != null)
	{
		var tmp = searchTerms.toLowerCase().split(' ');
		var dict = new bpmDictionary();
		var max = (page + 1) * count;
		var results = [];
		var index = 0;
		
		for (var i = 0; i < tmp.length; i++)
		{
			if (tmp[i].length > 0)
			{
				var entry = this.taglist[tmp[i]];
				var tmpDict = new bpmDictionary();
				
				if (entry != null)
				{
					var arr = entry.entries;
					results = [];

					for (var j = 0; j < arr.length; j++)
					{
						var entry = arr[j];
	
						// NOTE Array does not contain duplicates
						if ((index == 0) == (dict.get(entry) == null))
						{
							tmpDict.put(entry, entry);
							results.push(entry);
							
							if (i == tmp.length - 1 && results.length == max)
							{
								success(results.slice(page * count, max), max, true, tmp);
								
								return;
							}
						}
					}
				}
				else
				{
					results = [];
				}
				
				dict = tmpDict;
				index++;
			}
		}
		
		var len = results.length;
		success(results.slice(page * count, (page + 1) * count), len, false, tmp);
	}
	else
	{
		success([], null, null, tmp);
	}
};

/**
 * Adds shape search UI.
 */
Sidebar.prototype.filterTags = function(tags)
{
	if (tags != null)
	{
		var arr = tags.split(' ');
		var result = [];
		var hash = {};
		
		// Ignores tags with leading numbers, strips trailing numbers
		for (var i = 0; i < arr.length; i++)
		{
			// Removes duplicates
			if (hash[arr[i]] == null)
			{
				hash[arr[i]] = '1';
				result.push(arr[i]);
			}
		}
		
		return result.join(' ');
	}
	
	return null;
};

/**
 * Adds the general palette to the sidebar.
 */
 
Sidebar.prototype.cloneCell = function(cell, value)
{
	var clone = cell.clone();
	
	if (value != null)
	{
		clone.value = value;
	}
	
	return clone;
};

/**
 * Adds shape search UI.
 */
Sidebar.prototype.addSearchPalette = function(expand)
{
	var elt = document.createElement('div');
	elt.style.visibility = 'hidden';
	this.container.appendChild(elt);
		
	var div = document.createElement('div');
	div.className = 'geSidebar';
	div.style.boxSizing = 'border-box';
	div.style.overflow = 'hidden';
	div.style.width = '100%';
	div.style.padding = '8px';
	div.style.paddingTop = '14px';
	div.style.paddingBottom = '0px';

	div.style.display = 'none';  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	if (!expand)
	{
		div.style.display = 'none';
	}
	
	var inner = document.createElement('div');
	inner.style.whiteSpace = 'nowrap';
	inner.style.textOverflow = 'clip';
	inner.style.paddingBottom = '8px';
	inner.style.cursor = 'default';

	var input = document.createElement('input');
	input.setAttribute('placeholder', bpmResources.get('searchShapes'));
	input.setAttribute('type', 'text');
	input.style.fontSize = '12px';
	input.style.overflow = 'hidden';
	input.style.boxSizing = 'border-box';
	input.style.border = 'solid 1px #d5d5d5';
	input.style.borderRadius = '4px';
	input.style.width = '100%';
	input.style.outline = 'none';
	input.style.padding = '6px';

	inner.appendChild(input);

	var cross = document.createElement('img');
	cross.setAttribute('src', Sidebar.prototype.searchImage);
	cross.setAttribute('title', bpmResources.get('search'));
	cross.style.position = 'relative';
	cross.style.left = '-18px';
	
	if (bpmCore.IS_QUIRKS)
	{
		input.style.height = '28px';
		cross.style.top = '-4px';
	}
	else
	{
		cross.style.top = '1px';
	}

	// Needed to block event transparency in IE
	cross.style.background = 'url(\'' + this.editorUi.editor.transparentImage + '\')';
	
	var find;

	inner.appendChild(cross);
	div.appendChild(inner);

	var center = document.createElement('center');
	var button = bpmUtils.button(bpmResources.get('moreResults'), function()
	{
		find();
	});
	button.style.display = 'none';
	
	// Workaround for inherited line-height in quirks mode
	button.style.lineHeight = 'normal';
	button.style.marginTop = '4px';
	button.style.marginBottom = '8px';
	center.style.paddingTop = '4px';
	center.style.paddingBottom = '4px';
	
	center.appendChild(button);
	div.appendChild(center);
	
	var searchTerm = '';
	var active = false;
	var complete = false;
	var page = 0;
	var hash = new Object();

	// Count is dynamically updated below
	var count = 12;
	
	var clearDiv = bpmUtils.bind(this, function()
	{
		active = false;
		this.currentSearch = null;
		var child = div.firstChild;
		
		while (child != null)
		{
			var next = child.nextSibling;
			
			if (child != inner && child != center)
			{
				child.parentNode.removeChild(child);
			}
			
			child = next;
		}
	});
		
	bpmEvent.addListener(cross, 'click', function()
	{
		if (cross.getAttribute('src') == BpmModal.prototype.closeImage)
		{
			cross.setAttribute('src', Sidebar.prototype.searchImage);
			cross.setAttribute('title', bpmResources.get('search'));
			button.style.display = 'none';
			input.value = '';
			searchTerm = '';
			clearDiv();
		}

		input.focus();
	});

	find = bpmUtils.bind(this, function()
	{
		// Shows 4 rows (minimum 4 results)
		count = 4 * Math.max(1, Math.floor(this.container.clientWidth / (this.thumbWidth + 10)));
		this.hideTooltip();
		
		if (input.value != '')
		{
			if (center.parentNode != null)
			{
				if (searchTerm != input.value)
				{
					clearDiv();
					searchTerm = input.value;
					hash = new Object();
					complete = false;
					page = 0;
				}
				
				if (!active && !complete)
				{
					button.setAttribute('disabled', 'true');
					button.style.display = '';
					button.style.cursor = 'wait';
					button.innerHTML = bpmResources.get('loading') + '...';
					active = true;
					
					// Ignores old results
					var current = new Object();
					this.currentSearch = current;
					
					this.searchEntries(searchTerm, count, page, bpmUtils.bind(this, function(results, len, more, terms)
					{
						if (this.currentSearch == current)
						{
							results = (results != null) ? results : [];
							active = false;
							page++;
							this.insertSearchHint(div, searchTerm, count, page, results, len, more, terms);

							if (center.parentNode != null)
							{
								center.parentNode.removeChild(center);
							}
							
							for (var i = 0; i < results.length; i++)
							{
								try
								{
									var elt = results[i]();
									
									// Avoids duplicates in results
									if (hash[elt.innerHTML] == null)
									{
										hash[elt.innerHTML] = '1';
										div.appendChild(elt);
									}
								}
								catch (e)
								{
									// ignore
								}
							}
							
							if (more)
							{
								button.removeAttribute('disabled');
								button.innerHTML = bpmResources.get('moreResults');
							}
							else
							{
								button.innerHTML = bpmResources.get('reset');
								button.style.display = 'none';
								complete = true;
							}
							
							button.style.cursor = '';
							div.appendChild(center);
						}
					}), bpmUtils.bind(this, function()
					{
						// TODO: Error handling
						button.style.cursor = '';
					}));
				}
			}
		}
		else
		{
			clearDiv();
			input.value = '';
			searchTerm = '';
			hash = new Object();
			button.style.display = 'none';
			complete = false;
			input.focus();
		}
	});
	
	bpmEvent.addListener(input, 'keydown', bpmUtils.bind(this, function(evt)
	{
		if (evt.keyCode == 13 /* Enter */)
		{
			find();
			bpmEvent.consume(evt);
		}
	}));
	
	bpmEvent.addListener(input, 'focus', function()
	{
		input.style.paddingRight = '';
	});
	
	bpmEvent.addListener(input, 'blur', function()
	{
		input.style.paddingRight = '20px';
	});

	input.style.paddingRight = '20px';
	
	bpmEvent.addListener(input, 'keyup', bpmUtils.bind(this, function(evt)
	{
		if (input.value == '')
		{
			cross.setAttribute('src', Sidebar.prototype.searchImage);
			cross.setAttribute('title', bpmResources.get('search'));
		}
		else
		{
			cross.setAttribute('src', BpmModal.prototype.closeImage);
			cross.setAttribute('title', bpmResources.get('reset'));
		}
		
		if (input.value == '')
		{
			complete = true;
			button.style.display = 'none';
		}
		else if (input.value != searchTerm)
		{
			button.style.display = 'none';
			complete = false;
		}
		else if (!active)
		{
			if (complete)
			{
				button.style.display = 'none';
			}
			else
			{
				button.style.display = '';
			}
		}
	}));

    // Workaround for blocked text selection in BpmDraw
    bpmEvent.addListener(input, 'mousedown', function(evt)
    {
    	if (evt.stopPropagation)
    	{
    		evt.stopPropagation();
    	}
    	
    	evt.cancelBubble = true;
    });
    
    // Workaround for blocked text selection in BpmDraw
    bpmEvent.addListener(input, 'selectstart', function(evt)
    {
    	if (evt.stopPropagation)
    	{
    		evt.stopPropagation();
    	}
    	
    	evt.cancelBubble = true;
    });

	var outer = document.createElement('div');
    outer.appendChild(div);
    this.container.appendChild(outer);
	
    // Keeps references to the DOM nodes
	this.palettes['search'] = [elt, outer];
};

/**
 * Adds the general palette to the sidebar.
 */
Sidebar.prototype.insertSearchHint = function(div, searchTerm, count, page, results, len, more, terms)
{
	if (results.length == 0 && page == 1)
	{
		var err = document.createElement('div');
		err.className = 'mainTitle';
		err.style.cssText = 'background-color:transparent;border-color:transparent;' +
			'color:gray;padding:6px 0px 0px 0px !important;margin:4px 8px 4px 8px;' +
			'text-align:center;cursor:default !important';
		
		bpmUtils.write(err, bpmResources.get('noResultsFor', [searchTerm]));
		div.appendChild(err);
	}
};

/**
 * Adds the general palette to the sidebar.
 */
Sidebar.prototype.addGeneralPalette = function(expand)
{
	var lineTags = 'line lines connector connectors connection connections arrow arrows ';
	
	var fns = [
		this.createVertexTemplateEntry('swimlane;strokeColor=#cfae84;fillColor=#fef2df;html=1;horizontal=0;startSize=20;', 320, 240, 'Lane', 'Lane', null, null, 'bpmn pool'),
		// this.createVertexTemplateEntry('swimlane;html=1;horizontal=0;swimlaneLine=0;', 300, 120, 'Lane', 'Lane', null, null, 'bpmn lane'),

	 	this.createVertexTemplateEntry('rounded=0;whiteSpace=wrap;strokeColor=#cfae84;fillColor=#fef2df;html=1;', 120, 60, '', 'Rectangle', null, null, 'rect rectangle box'),
	 	this.createVertexTemplateEntry('rounded=1;whiteSpace=wrap;strokeColor=#cfae84;fillColor=#fef2df;html=1;', 120, 60, '', 'Rounded Rectangle', null, null, 'rounded rect rectangle box'),
	 	// Explicit strokecolor/fillcolor=none is a workaround to maintain transparent background regardless of current style
 		this.createVertexTemplateEntry('ellipse;whiteSpace=wrap;strokeColor=#cfae84;fillColor=#fef2df;html=1;', 120, 80, '', 'Ellipse', null, null, 'oval ellipse state'),
		this.createVertexTemplateEntry('whiteSpace=wrap;strokeColor=#cfae84;fillColor=#fef2df;html=1;aspect=fixed;', 80, 80, '', 'Square', null, null, 'square'),
		this.createVertexTemplateEntry('ellipse;whiteSpace=wrap;strokeColor=#cfae84;fillColor=#fef2df;html=1;aspect=fixed;', 80, 80, '', 'Circle', null, null, 'circle'),
		this.createVertexTemplateEntry('text;html=1;strokeColor=#cfae84;fillColor=#fef2df;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;',
 			40, 20, 'Text', 'Text', null, null, 'text textbox textarea label')
	];
	
	this.addPaletteFunctions('general', bpmResources.get('general'), (expand != null) ? expand : true, fns);
};

/**
 * Creates and returns the given title element.
 */
Sidebar.prototype.createTitle = function(label)
{
	var elt = document.createElement('a');
	var image = document.createElement('img');
	image.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAAB70lEQVQ4je2VsWsUURDGf9+xyHGIRQh47xFSiliIWFmksrIUtQla2KawEkkRLMTCQgMGFDGKioL/gp2VoqiIWFhbvXeEQyRICEe4z+J2YW/ZQAykc2B5zM7yezPfzLAy5iCscyDUgwQXdSeGWPfHKafxfsEKIRTAOWAJmKkCtreBN5IepJy2/hVcAKeBNeAT8AEYA0g6CtwAhsCz/YCPlxley4M8rAKhH7qSZoHLMcShbSRRncBv4FvKaXM3cKVrs9yR7c/AiqTnJYwyCSSNgJcxxJWU004bmLL0qUAe5DFwP4a4bntqeiR1gAvAY+AuE7nawbvZbo2LIX4FDgHdtngrOIZ4wvYiEMsMqWsMgJkp/dUY4h8gAQ9TTgNoLEjohyKGeBV4DyxI6pUZTT2SupK2bL+WtGO7B1wCHsUQO1MZl5mcBW4y0W0d2Ky0b551k3QYeGW7qOL15s0Dq8AX2/fyII/aZGqRrQNcAc5IWqy2tZLiCLBmewgs7xVaVnoeuG77lu231fuCyabN2j4FXEw5/dwrNIY4L3QbeCfpaX2eC2DL9rakF8D30A+9evfbNLXdkXQMuANsAMvNsVS/358Dnkg6WV4yPVYNeGO1E7CUcvrRvFzGxBDngAWgt0cVxsAv4GPKaaPtA/3/NVX2F8Aj1PKy9o6DAAAAAElFTkSuQmCC';
	elt.appendChild(image);
	elt.style.paddingLeft = "15px"
	elt.setAttribute('title', bpmResources.get('sidebarTooltip'));
	elt.className = 'mainTitle';
	var title = document.createElement('span');
	bpmUtils.write(title, label)
	title.style.verticalAlign = "5px"
	elt.appendChild(title)

	//bpmUtils.write(elt, label);

	return elt;
};

/**
 * Creates a thumbnail for the given cells.
 */
Sidebar.prototype.createThumb = function(cells, width, height, parent, title, showLabel, showTitle, realWidth, realHeight)
{
	this.graph.labelsVisible = (showLabel == null || showLabel);
	var fo = bpmCore.NO_FO;
	bpmCore.NO_FO = BpmDraw.prototype.originalNoForeignObject;
	this.graph.view.scaleAndTranslate(1, 0, 0);
	this.graph.addCells(cells);
	var bounds = this.graph.getGraphBounds();
	var s = Math.floor(Math.min((width - 2 * this.thumbBorder) / bounds.width,
			(height - 2 * this.thumbBorder) / bounds.height) * 100) / 100;
	this.graph.view.scaleAndTranslate(s, Math.floor((width - bounds.width * s) / 2 / s - bounds.x),
			Math.floor((height - bounds.height * s) / 2 / s - bounds.y));
	var node = null;
	
	// For supporting HTML labels in IE9 standards mode the container is cloned instead
	if (this.graph.dialect == bpmConstants.DIALECT_SVG && !bpmCore.NO_FO &&
		this.graph.view.getCanvas().ownerSVGElement != null)
	{
		node = this.graph.view.getCanvas().ownerSVGElement.cloneNode(true);
	}
	// LATER: Check if deep clone can be used for quirks if container in DOM
	else
	{
		node = this.graph.container.cloneNode(false);
		node.innerHTML = this.graph.container.innerHTML;
		
		// Workaround for clipping in older IE versions
		if (bpmCore.IS_QUIRKS || document.documentMode == 8)
		{
			node.firstChild.style.overflow = 'visible';
		}
	}
	
	this.graph.getModel().clear();
	bpmCore.NO_FO = fo;
	
	// Catch-all event handling
	if (bpmCore.IS_IE6)
	{
		parent.style.backgroundImage = 'url(' + this.editorUi.editor.transparentImage + ')';
	}
	
	node.style.position = 'relative';
	node.style.overflow = 'hidden';
	node.style.left = this.thumbBorder + 'px';
	node.style.top = this.thumbBorder + 'px';
	node.style.width = width + 'px';
	node.style.height = height + 'px';
	node.style.visibility = '';
	node.style.minWidth = '';
	node.style.minHeight = '';
	
	parent.appendChild(node);
	
	// Adds title for sidebar entries
	if (this.sidebarTitles && title != null && showTitle != false)
	{
		var border = (bpmCore.IS_QUIRKS) ? 2 * this.thumbPadding + 2: 0;
		parent.style.height = (this.thumbHeight + border + this.sidebarTitleSize + 8) + 'px';
		
		var div = document.createElement('div');
		div.style.fontSize = this.sidebarTitleSize + 'px';
		div.style.color = '#303030';
		div.style.textAlign = 'center';
		div.style.whiteSpace = 'nowrap';
		
		if (bpmCore.IS_IE)
		{
			div.style.height = (this.sidebarTitleSize + 12) + 'px';
		}

		div.style.paddingTop = '4px';
		bpmUtils.write(div, title);
		parent.appendChild(div);
	}

	return bounds;
};

/**
 * Creates and returns a new palette item for the given image.
 */
Sidebar.prototype.createItem = function(cells, title, showLabel, showTitle, width, height, allowCellsInserted)
{
	var elt_div = document.createElement('div');
	elt_div.style.height = '32px';
	elt_div.title = title;

	var elt = document.createElement('a');
	elt.className = 'elementItem';
	elt.title = title;
	elt.style.overflow = 'hidden';
	var border = (bpmCore.IS_QUIRKS) ? 8 + 2 * this.thumbPadding : 2 * this.thumbBorder;
	elt.style.width = (this.thumbWidth + border) + 'px';
	elt.style.height = (this.thumbHeight + border) + 'px';
	elt.style.padding = this.thumbPadding + 'px';
	
	if (bpmCore.IS_IE6)
	{
		elt.style.border = 'none';
	}
	
	// Blocks default click action
	bpmEvent.addListener(elt, 'click', function(evt)
	{
		bpmEvent.consume(evt);
	});

	this.createThumb(cells, this.thumbWidth, this.thumbHeight, elt, title, showLabel, showTitle, width, height);
	var bounds = new bpmRectangle(0, 0, width, height);
	
	if (cells.length > 1 || cells[0].vertex)
	{
		var ds = this.createDragSource(elt, this.createDropHandler(cells, true, allowCellsInserted,
			bounds), this.createDragPreview(width, height), cells, bounds);
		this.addClickHandler(elt, ds, cells);
	
		// Uses guides for vertices only if enabled in graph
		ds.isGuidesEnabled = bpmUtils.bind(this, function()
		{
			return this.editorUi.editor.graph.graphHandler.guidesEnabled;
		});
	}
	else if (cells[0] != null && cells[0].edge)
	{
		var ds = this.createDragSource(elt, this.createDropHandler(cells, false, allowCellsInserted,
			bounds), this.createDragPreview(width, height), cells, bounds);
		this.addClickHandler(elt, ds, cells);
	}
	
	// Shows a tooltip with the rendered cell
	if (!bpmCore.IS_IOS)
	{
		bpmEvent.addGestureListeners(elt, null, bpmUtils.bind(this, function(evt)
		{
			if (bpmEvent.isMouseEvent(evt))
			{
				//this.showTooltip(elt, cells, bounds.width, bounds.height, title, showLabel);
			}
		}));
	}

	elt_div.appendChild(elt);
	return elt_div;
};

/**
 * Creates a drop handler for inserting the given cells.
 */
Sidebar.prototype.updateShapes = function(source, targets)
{
	var graph = this.editorUi.editor.graph;
	var sourceCellStyle = graph.getCellStyle(source);
	var result = [];
	
	graph.model.beginUpdate();
	try
	{
		var cellStyle = graph.getModel().getStyle(source);

		// Lists the styles to carry over from the existing shape
		var styles = ['shadow', 'dashed', 'dashPattern', 'fontFamily', 'fontSize', 'fontColor', 'align', 'startFill',
		              'startSize', 'endFill', 'endSize', 'strokeColor', 'strokeWidth', 'fillColor', 'gradientColor',
		              'html', 'part', 'noEdgeStyle', 'edgeStyle', 'elbow', 'childLayout', 'recursiveResize',
		              'container', 'collapsible', 'connectable'];
		
		for (var i = 0; i < targets.length; i++)
		{
			var targetCell = targets[i];
			
			if ((graph.getModel().isVertex(targetCell) == graph.getModel().isVertex(source)) ||
				(graph.getModel().isEdge(targetCell) == graph.getModel().isEdge(source)))
			{
				var state = graph.view.getState(targetCell);
				var style = (state != null) ? state.style : graph.getCellStyle(targets[i]);
				graph.getModel().setStyle(targetCell, cellStyle);
				
				// Removes all children of composite cells
				if (state != null && bpmUtils.getValue(state.style, 'composite', '0') == '1')
				{
					var childCount = graph.model.getChildCount(targetCell);
					
					for (var j = childCount; j >= 0; j--)
					{
						graph.model.remove(graph.model.getChildAt(targetCell, j));
					}
				}

				if (style != null)
				{
					// Replaces the participant style in the lifeline shape with the target shape
					if (style[bpmConstants.STYLE_SHAPE] == 'umlLifeline' &&
						sourceCellStyle[bpmConstants.STYLE_SHAPE] != 'umlLifeline')
					{
						graph.setCellStyles(bpmConstants.STYLE_SHAPE, 'umlLifeline', [targetCell]);
						graph.setCellStyles('participant', sourceCellStyle[bpmConstants.STYLE_SHAPE], [targetCell]);
					}
					
					for (var j = 0; j < styles.length; j++)
					{
						var value = style[styles[j]];
						
						if (value != null)
						{
							graph.setCellStyles(styles[j], value, [targetCell]);
						}
					}
				}
				
				result.push(targetCell);
			}
		}
	}
	finally
	{
		graph.model.endUpdate();
	}
	
	return result;
};

/**
 * Creates a drop handler for inserting the given cells.
 */
Sidebar.prototype.createDropHandler = function(cells, allowSplit, allowCellsInserted, bounds)
{
	allowCellsInserted = (allowCellsInserted != null) ? allowCellsInserted : true;
	
	return bpmUtils.bind(this, function(graph, evt, target, x, y, force)
	{
		var elt = (force) ? null : ((bpmEvent.isTouchEvent(evt) || bpmEvent.isPenEvent(evt)) ?
			document.elementFromPoint(bpmEvent.getClientX(evt), bpmEvent.getClientY(evt)) :
			bpmEvent.getSource(evt));
		
		while (elt != null && elt != this.container)
		{
			elt = elt.parentNode;
		}
		
		if (elt == null && graph.isEnabled())
		{
			cells = graph.getImportableCells(cells);
			
			if (cells.length > 0)
			{
				graph.stopEditing();
				
				// Holding alt while mouse is released ignores drop target
				var validDropTarget = (target != null && !bpmEvent.isAltDown(evt)) ?
					graph.isValidDropTarget(target, cells, evt) : false;
				var select = null;

				if (target != null && !validDropTarget)
				{
					target = null;
				}
				
				if (!graph.isCellLocked(target || graph.getDefaultParent()))
				{
					graph.model.beginUpdate();
					try
					{
						x = Math.round(x);
						y = Math.round(y);
						
						// Splits the target edge or inserts into target group
						if (allowSplit && graph.isSplitTarget(target, cells, evt))
						{
							var clones = graph.cloneCells(cells);
							graph.splitEdge(target, clones, null,
								x - bounds.width / 2, y - bounds.height / 2);
							select = clones;
						}
						else if (cells.length > 0)
						{
							select = graph.importCells(cells, x, y, target);
						}
						
						// Executes parent layout hooks for position/order
						if (graph.layoutManager != null)
						{
							var layout = graph.layoutManager.getLayout(target);
							
							if (layout != null)
							{
								var s = graph.view.scale;
								var tr = graph.view.translate;
								var tx = (x + tr.x) * s;
								var ty = (y + tr.y) * s;
								
								for (var i = 0; i < select.length; i++)
								{
									layout.moveCell(select[i], tx, ty);
								}
							}
						}
	
						if (allowCellsInserted && (evt == null || !bpmEvent.isShiftDown(evt)))
						{
							graph.fireEvent(new bpmEventObject('cellsInserted', 'cells', select));
						}
					}
					catch (e)
					{
						this.editorUi.handleError(e);
					}
					finally
					{
						graph.model.endUpdate();
					}
	
					if (select != null && select.length > 0)
					{
						graph.scrollCellToVisible(select[0]);
						graph.setSelectionCells(select);
					}

					if (graph.editAfterInsert && evt != null && bpmEvent.isMouseEvent(evt) &&
						select != null && select.length == 1)
					{
						window.setTimeout(function()
						{
							graph.startEditing(select[0]);
						}, 0);
					}
				}
			}
			
			bpmEvent.consume(evt);
		}
	});
};

/**
 * Creates and returns a preview element for the given width and height.
 */
Sidebar.prototype.createDragPreview = function(width, height)
{
	var elt = document.createElement('div');
	elt.style.border = this.dragPreviewBorder;
	elt.style.width = width + 'px';
	elt.style.height = height + 'px';
	
	return elt;
};

/**
 * Creates a drag source for the given element.
 */
Sidebar.prototype.dropAndConnect = function(source, targets, direction, dropCellIndex, evt)
{
	var geo = this.getDropAndConnectGeometry(source, targets[dropCellIndex], direction, targets);
	
	// Targets without the new edge for selection
	var tmp = [];
	
	if (geo != null)
	{
		var graph = this.editorUi.editor.graph;
		var editingCell = null;

		graph.model.beginUpdate();
		try
		{
			var sourceGeo = graph.getCellGeometry(source);
			var geo2 = graph.getCellGeometry(targets[dropCellIndex]);

			// Handles special case where target should be ignored for stack layouts
			var targetParent = graph.model.getParent(source);
			var validLayout = true;
			
			// Ignores parent if it has a stack layout
			if (graph.layoutManager != null)
			{
				var layout = graph.layoutManager.getLayout(targetParent);
			
				// LATER: Use parent of parent if valid layout
				if (layout != null && layout.constructor == bpmStackLayout)
				{
					validLayout = false;

					var tmp = graph.view.getState(targetParent);
					
					// Offsets by parent position
					if (tmp != null)
					{
						var offset = new bpmPoint((tmp.x / graph.view.scale - graph.view.translate.x),
								(tmp.y / graph.view.scale - graph.view.translate.y));
						geo.x += offset.x;
						geo.y += offset.y;
						var pt = geo.getTerminalPoint(false);
						
						if (pt != null)
						{
							pt.x += offset.x;
							pt.y += offset.y;
						}
					}
				}
			}
			
			var dx = geo2.x;
			var dy = geo2.y;
			
			// Ignores geometry of edges
			if (graph.model.isEdge(targets[dropCellIndex]))
			{
				dx = 0;
				dy = 0;
			}
			
			var useParent = graph.model.isEdge(source) || (sourceGeo != null && !sourceGeo.relative && validLayout);
			targets = graph.importCells(targets, (geo.x - (useParent ? dx : 0)),
					(geo.y - (useParent ? dy : 0)), (useParent) ? targetParent : null);
			tmp = targets;
			
			if (graph.model.isEdge(source))
			{
				// Adds new terminal to edge
				// LATER: Push new terminal out radially from edge start point
				graph.model.setTerminal(source, targets[dropCellIndex], direction == bpmConstants.DIRECTION_NORTH);
			}
			else if (graph.model.isEdge(targets[dropCellIndex]))
			{
				// Adds new outgoing connection to vertex and clears points
				graph.model.setTerminal(targets[dropCellIndex], source, true);
				var geo3 = graph.getCellGeometry(targets[dropCellIndex]);
				geo3.points = null;
				
				if (geo3.getTerminalPoint(false) != null)
				{
					geo3.setTerminalPoint(geo.getTerminalPoint(false), false);
				}
				else if (useParent && graph.model.isVertex(targetParent))
				{
					// Adds parent offset to other nodes
					var tmpState = graph.view.getState(targetParent);
					var offset = (tmpState.cell != graph.view.currentRoot) ?
						new bpmPoint((tmpState.x / graph.view.scale - graph.view.translate.x),
						(tmpState.y / graph.view.scale - graph.view.translate.y)) : new bpmPoint(0, 0);

					graph.cellsMoved(targets, offset.x, offset.y, null, null, true);
				}
			}
			else
			{
				geo2 = graph.getCellGeometry(targets[dropCellIndex]);
				dx = geo.x - Math.round(geo2.x);
				dy = geo.y - Math.round(geo2.y);
				geo.x = Math.round(geo2.x);
				geo.y = Math.round(geo2.y);
				graph.model.setGeometry(targets[dropCellIndex], geo);
				graph.cellsMoved(targets, dx, dy, null, null, true);
				tmp = targets.slice();
				editingCell = (tmp.length == 1) ? tmp[0] : null;
				targets.push(graph.insertEdge(null, null, '', source, targets[dropCellIndex],
					graph.createCurrentEdgeStyle()));
			}
			
			if (evt == null || !bpmEvent.isShiftDown(evt))
			{
				graph.fireEvent(new bpmEventObject('cellsInserted', 'cells', targets));
			}
		}
		catch (e)
		{
			this.editorUi.handleError(e);
		}
		finally
		{
			graph.model.endUpdate();
		}
		
		if (graph.editAfterInsert && evt != null && bpmEvent.isMouseEvent(evt) &&
			editingCell != null)
		{
			window.setTimeout(function()
			{
				graph.startEditing(editingCell);
			}, 0);
		}
	}
	
	return tmp;
};

/**
 * Creates a drag source for the given element.
 */
Sidebar.prototype.getDropAndConnectGeometry = function(source, target, direction, targets)
{
	var graph = this.editorUi.editor.graph;
	var view = graph.view;
	var keepSize = targets.length > 1;
	var geo = graph.getCellGeometry(source);
	var geo2 = graph.getCellGeometry(target);
	
	if (geo != null && geo2 != null)
	{
		geo2 = geo2.clone();

		if (graph.model.isEdge(source))
		{
			var state = graph.view.getState(source);
			var pts = state.absolutePoints;
			var p0 = pts[0];
			var pe = pts[pts.length - 1];
			
			if (direction == bpmConstants.DIRECTION_NORTH)
			{
				geo2.x = p0.x / view.scale - view.translate.x - geo2.width / 2;
				geo2.y = p0.y / view.scale - view.translate.y - geo2.height / 2;
			}
			else
			{
				geo2.x = pe.x / view.scale - view.translate.x - geo2.width / 2;
				geo2.y = pe.y / view.scale - view.translate.y - geo2.height / 2;
			}
		}
		else
		{
			if (geo.relative)
			{
				var state = graph.view.getState(source);
				geo = geo.clone();
				geo.x = (state.x - view.translate.x) / view.scale;
				geo.y = (state.y - view.translate.y) / view.scale;
			}
			
			var length = graph.defaultEdgeLength;
			
			// Maintains edge length
			if (graph.model.isEdge(target) && geo2.getTerminalPoint(true) != null && geo2.getTerminalPoint(false) != null)
			{
				var p0 = geo2.getTerminalPoint(true);
				var pe = geo2.getTerminalPoint(false);
				var dx = pe.x - p0.x;
				var dy = pe.y - p0.y;
				
				length = Math.sqrt(dx * dx + dy * dy);
				
				geo2.x = geo.getCenterX();
				geo2.y = geo.getCenterY();
				geo2.width = 1;
				geo2.height = 1;
				
				if (direction == bpmConstants.DIRECTION_NORTH)
				{
					geo2.height = length
					geo2.y = geo.y - length;
					geo2.setTerminalPoint(new bpmPoint(geo2.x, geo2.y), false);
				}
				else if (direction == bpmConstants.DIRECTION_EAST)
				{
					geo2.width = length
					geo2.x = geo.x + geo.width;
					geo2.setTerminalPoint(new bpmPoint(geo2.x + geo2.width, geo2.y), false);
				}
				else if (direction == bpmConstants.DIRECTION_SOUTH)
				{
					geo2.height = length
					geo2.y = geo.y + geo.height;
					geo2.setTerminalPoint(new bpmPoint(geo2.x, geo2.y + geo2.height), false);
				}
				else if (direction == bpmConstants.DIRECTION_WEST)
				{
					geo2.width = length
					geo2.x = geo.x - length;
					geo2.setTerminalPoint(new bpmPoint(geo2.x, geo2.y), false);
				}
			}
			else
			{
				// Try match size or ignore if width or height < 45 which
				// is considered special enough to be ignored here
				if (!keepSize && geo2.width > 45 && geo2.height > 45 &&
					geo.width > 45 && geo.height > 45)
				{
					geo2.width = geo2.width * (geo.height / geo2.height);
					geo2.height = geo.height;
				}
	
				geo2.x = geo.x + geo.width / 2 - geo2.width / 2;
				geo2.y = geo.y + geo.height / 2 - geo2.height / 2;

				if (direction == bpmConstants.DIRECTION_NORTH)
				{
					geo2.y = geo2.y - geo.height / 2 - geo2.height / 2 - length;
				}
				else if (direction == bpmConstants.DIRECTION_EAST)
				{
					geo2.x = geo2.x + geo.width / 2 + geo2.width / 2 + length;
				}
				else if (direction == bpmConstants.DIRECTION_SOUTH)
				{
					geo2.y = geo2.y + geo.height / 2 + geo2.height / 2 + length;
				}
				else if (direction == bpmConstants.DIRECTION_WEST)
				{
					geo2.x = geo2.x - geo.width / 2 - geo2.width / 2 - length;
				}
				
				// Adds offset to match cells without connecting edge
				if (graph.model.isEdge(target) && geo2.getTerminalPoint(true) != null && target.getTerminal(false) != null)
				{
					var targetGeo = graph.getCellGeometry(target.getTerminal(false));
					
					if (targetGeo != null)
					{
						if (direction == bpmConstants.DIRECTION_NORTH)
						{
							geo2.x -= targetGeo.getCenterX();
							geo2.y -= targetGeo.getCenterY() + targetGeo.height / 2;
						}
						else if (direction == bpmConstants.DIRECTION_EAST)
						{
							geo2.x -= targetGeo.getCenterX() - targetGeo.width / 2;
							geo2.y -= targetGeo.getCenterY();
						}
						else if (direction == bpmConstants.DIRECTION_SOUTH)
						{
							geo2.x -= targetGeo.getCenterX();
							geo2.y -= targetGeo.getCenterY() - targetGeo.height / 2;
						}
						else if (direction == bpmConstants.DIRECTION_WEST)
						{
							geo2.x -= targetGeo.getCenterX() + targetGeo.width / 2;
							geo2.y -= targetGeo.getCenterY();
						}
					}
				}
			}
		}
	}
	
	return geo2;
};

/**
 * Creates a drag source for the given element.
 */
Sidebar.prototype.createDragSource = function(elt, dropHandler, preview, cells, bounds)
{
	// Checks if the cells contain any vertices
	var ui = this.editorUi;
	var graph = ui.editor.graph;
	var freeSourceEdge = null;
	var firstVertex = null;
	var sidebar = this;
	
	for (var i = 0; i < cells.length; i++)
	{
		if (firstVertex == null && this.editorUi.editor.graph.model.isVertex(cells[i]))
		{
			firstVertex = i;
		}
		else if (freeSourceEdge == null && this.editorUi.editor.graph.model.isEdge(cells[i]) &&
				this.editorUi.editor.graph.model.getTerminal(cells[i], true) == null)
		{
			freeSourceEdge = i;
		}
		
		if (firstVertex != null && freeSourceEdge != null)
		{
			break;
		}
	}
	
	var dragSource = bpmUtils.makeDraggable(elt, this.editorUi.editor.graph, bpmUtils.bind(this, function(graph, evt, target, x, y)
	{
		if (this.updateThread != null)
		{
			window.clearTimeout(this.updateThread);
		}
		
		if (cells != null && currentStyleTarget != null && activeArrow == styleTarget)
		{
			var tmp = graph.isCellSelected(currentStyleTarget.cell) ? graph.getSelectionCells() : [currentStyleTarget.cell];
			var updatedCells = this.updateShapes((graph.model.isEdge(currentStyleTarget.cell)) ? cells[0] : cells[firstVertex], tmp);
			graph.setSelectionCells(updatedCells);
		}
		else if (cells != null && activeArrow != null && currentTargetState != null && activeArrow != styleTarget)
		{
			var index = (graph.model.isEdge(currentTargetState.cell) || freeSourceEdge == null) ? firstVertex : freeSourceEdge;
			graph.setSelectionCells(this.dropAndConnect(currentTargetState.cell, cells, direction, index, evt));
		}
		else
		{
			dropHandler.apply(this, arguments);
		}
		
		if (this.editorUi.hoverIcons != null)
		{
			this.editorUi.hoverIcons.update(graph.view.getState(graph.getSelectionCell()));
		}
	}), preview, 0, 0, graph.autoscroll, true, true);
	
	// Stops dragging if cancel is pressed
	graph.addListener(bpmEvent.ESCAPE, function(sender, evt)
	{
		if (dragSource.isActive())
		{
			dragSource.reset();
		}
	});

	// Overrides mouseDown to ignore popup triggers
	var mouseDown = dragSource.mouseDown;
	
	dragSource.mouseDown = function(evt)
	{
		if (!bpmEvent.isPopupTrigger(evt) && !bpmEvent.isMultiTouchEvent(evt))
		{
			graph.stopEditing();
			mouseDown.apply(this, arguments);
		}
	};

	// Workaround for event redirection via image tag in quirks and IE8
	function createArrow(img, tooltip)
	{
		var arrow = null;
		
		if (bpmCore.IS_IE && !bpmCore.IS_SVG)
		{
			// Workaround for PNG images in IE6
			if (bpmCore.IS_IE6 && document.compatMode != 'CSS1Compat')
			{
				arrow = document.createElement(bpmCore.VML_PREFIX + ':image');
				arrow.setAttribute('src', img.src);
				arrow.style.borderStyle = 'none';
			}
			else
			{
				arrow = document.createElement('div');
				arrow.style.backgroundImage = 'url(' + img.src + ')';
				arrow.style.backgroundPosition = 'center';
				arrow.style.backgroundRepeat = 'no-repeat';
			}
			
			arrow.style.width = (img.width + 4) + 'px';
			arrow.style.height = (img.height + 4) + 'px';
			arrow.style.display = (bpmCore.IS_QUIRKS) ? 'inline' : 'inline-block';
		}
		else
		{
			arrow = bpmUtils.createImage(img.src);
			arrow.style.width = img.width + 'px';
			arrow.style.height = img.height + 'px';
		}
		
		if (tooltip != null)
		{
			arrow.setAttribute('title', tooltip);
		}
		
		bpmUtils.setOpacity(arrow, (img == this.refreshTarget) ? 30 : 20);
		arrow.style.position = 'absolute';
		arrow.style.cursor = 'crosshair';
		
		return arrow;
	};

	var currentTargetState = null;
	var currentStateHandle = null;
	var currentStyleTarget = null;
	var activeTarget = false;
	
	var arrowUp = createArrow(this.triangleUp, bpmResources.get('connect'));
	var arrowRight = createArrow(this.triangleRight, bpmResources.get('connect'));
	var arrowDown = createArrow(this.triangleDown, bpmResources.get('connect'));
	var arrowLeft = createArrow(this.triangleLeft, bpmResources.get('connect'));
	var styleTarget = createArrow(this.refreshTarget, bpmResources.get('replace'));
	// Workaround for actual parentNode not being updated in old IE
	var styleTargetParent = null;
	var roundSource = createArrow(this.roundDrop);
	var roundTarget = createArrow(this.roundDrop);
	var direction = bpmConstants.DIRECTION_NORTH;
	var activeArrow = null;
	
	function checkArrow(x, y, bounds, arrow)
	{
		if (arrow.parentNode != null)
		{
			if (bpmUtils.contains(bounds, x, y))
			{
				bpmUtils.setOpacity(arrow, 100);
				activeArrow = arrow;
			}
			else
			{
				bpmUtils.setOpacity(arrow, (arrow == styleTarget) ? 30 : 20);
			}
		}
		
		return bounds;
	};
	
	// Hides guides and preview if target is active
	var dsCreatePreviewElement = dragSource.createPreviewElement;
	
	// Stores initial size of preview element
	dragSource.createPreviewElement = function(graph)
	{
		var elt = dsCreatePreviewElement.apply(this, arguments);
		
		// Pass-through events required to tooltip on replace shape
		if (bpmCore.IS_SVG)
		{
			elt.style.pointerEvents = 'none';
		}
		
		this.previewElementWidth = elt.style.width;
		this.previewElementHeight = elt.style.height;
		
		return elt;
	};
	
	// Shows/hides hover icons
	var dragEnter = dragSource.dragEnter;
	dragSource.dragEnter = function(graph, evt)
	{
		if (ui.hoverIcons != null)
		{
			ui.hoverIcons.setDisplay('none');
		}
		
		dragEnter.apply(this, arguments);
	};
	
	var dragExit = dragSource.dragExit;
	dragSource.dragExit = function(graph, evt)
	{
		if (ui.hoverIcons != null)
		{
			ui.hoverIcons.setDisplay('');
		}
		
		dragExit.apply(this, arguments);
	};
	
	dragSource.dragOver = function(graph, evt)
	{
		bpmDragSource.prototype.dragOver.apply(this, arguments);

		if (this.currentGuide != null && activeArrow != null)
		{
			this.currentGuide.hide();
		}

		if (this.previewElement != null)
		{
			var view = graph.view;
			
			if (currentStyleTarget != null && activeArrow == styleTarget)
			{
				this.previewElement.style.display = (graph.model.isEdge(currentStyleTarget.cell)) ? 'none' : '';
				
				this.previewElement.style.left = currentStyleTarget.x + 'px';
				this.previewElement.style.top = currentStyleTarget.y + 'px';
				this.previewElement.style.width = currentStyleTarget.width + 'px';
				this.previewElement.style.height = currentStyleTarget.height + 'px';
			}
			else if (currentTargetState != null && activeArrow != null)
			{
				var index = (graph.model.isEdge(currentTargetState.cell) || freeSourceEdge == null) ? firstVertex : freeSourceEdge;
				var geo = sidebar.getDropAndConnectGeometry(currentTargetState.cell, cells[index], direction, cells);
				var geo2 = (!graph.model.isEdge(currentTargetState.cell)) ? graph.getCellGeometry(currentTargetState.cell) : null;
				var geo3 = graph.getCellGeometry(cells[index]);
				var parent = graph.model.getParent(currentTargetState.cell);
				var dx = view.translate.x * view.scale;
				var dy = view.translate.y * view.scale;
				
				if (geo2 != null && !geo2.relative && graph.model.isVertex(parent) && parent != view.currentRoot)
				{
					var pState = view.getState(parent);
					
					dx = pState.x;
					dy = pState.y;
				}
				
				var dx2 = geo3.x;
				var dy2 = geo3.y;

				// Ignores geometry of edges
				if (graph.model.isEdge(cells[index]))
				{
					dx2 = 0;
					dy2 = 0;
				}
				
				// Shows preview at drop location
				this.previewElement.style.left = ((geo.x - dx2) * view.scale + dx) + 'px';
				this.previewElement.style.top = ((geo.y - dy2) * view.scale + dy) + 'px';
				
				if (cells.length == 1)
				{
					this.previewElement.style.width = (geo.width * view.scale) + 'px';
					this.previewElement.style.height = (geo.height * view.scale) + 'px';
				}
				
				this.previewElement.style.display = '';
			}
			else if (dragSource.currentHighlight.state != null &&
				graph.model.isEdge(dragSource.currentHighlight.state.cell))
			{
				// Centers drop cells when splitting edges
				this.previewElement.style.left = Math.round(parseInt(this.previewElement.style.left) -
					bounds.width * view.scale / 2) + 'px';
				this.previewElement.style.top = Math.round(parseInt(this.previewElement.style.top) -
					bounds.height * view.scale / 2) + 'px';
			}
			else
			{
				this.previewElement.style.width = this.previewElementWidth;
				this.previewElement.style.height = this.previewElementHeight;
				this.previewElement.style.display = '';
			}
		}
	};
	
	var startTime = new Date().getTime();
	var timeOnTarget = 0;
	var prev = null;
	
	// Gets source cell style to compare shape below
	var sourceCellStyle = this.editorUi.editor.graph.getCellStyle(cells[0]);
	
	// Allows drop into cell only if target is a valid root
	dragSource.getDropTarget = bpmUtils.bind(this, function(graph, x, y, evt)
	{
		// Alt means no targets at all
		// LATER: Show preview where result will go
		var cell = (!bpmEvent.isAltDown(evt) && cells != null) ? graph.getCellAt(x, y) : null;
		
		// Uses connectable parent vertex if one exists
		if (cell != null && !this.graph.isCellConnectable(cell))
		{
			var parent = this.graph.getModel().getParent(cell);
			
			if (this.graph.getModel().isVertex(parent) && this.graph.isCellConnectable(parent))
			{
				cell = parent;
			}
		}
		
		// Ignores locked cells
		if (graph.isCellLocked(cell))
		{
			cell = null;
		}
		
		var state = graph.view.getState(cell);
		activeArrow = null;
		var bbox = null;

		// Time on target
		if (prev != state)
		{
			prev = state;
			startTime = new Date().getTime();
			timeOnTarget = 0;

			if (this.updateThread != null)
			{
				window.clearTimeout(this.updateThread);
			}
			
			if (state != null)
			{
				this.updateThread = window.setTimeout(function()
				{
					if (activeArrow == null)
					{
						prev = state;
						dragSource.getDropTarget(graph, x, y, evt);
					}
				}, this.dropTargetDelay + 10);
			}
		}
		else
		{
			timeOnTarget = new Date().getTime() - startTime;
		}

		// Shift means disabled, delayed on cells with children, shows after this.dropTargetDelay, hides after 2500ms
		if (timeOnTarget < 2500 && state != null && !bpmEvent.isShiftDown(evt) &&
			// If shape is equal or target has no stroke, fill and gradient then use longer delay except for images
			(((bpmUtils.getValue(state.style, bpmConstants.STYLE_SHAPE) != bpmUtils.getValue(sourceCellStyle, bpmConstants.STYLE_SHAPE) &&
			(bpmUtils.getValue(state.style, bpmConstants.STYLE_STROKECOLOR, bpmConstants.NONE) != bpmConstants.NONE ||
			bpmUtils.getValue(state.style, bpmConstants.STYLE_FILLCOLOR, bpmConstants.NONE) != bpmConstants.NONE ||
			bpmUtils.getValue(state.style, bpmConstants.STYLE_GRADIENTCOLOR, bpmConstants.NONE) != bpmConstants.NONE)) ||
			bpmUtils.getValue(sourceCellStyle, bpmConstants.STYLE_SHAPE) == 'image') ||
			timeOnTarget > 1500 || graph.model.isEdge(state.cell)) && (timeOnTarget > this.dropTargetDelay) && 
			((graph.model.isVertex(state.cell) && firstVertex != null) ||
			(graph.model.isEdge(state.cell) && graph.model.isEdge(cells[0]))))
		{
			currentStyleTarget = state;
			var tmp = (graph.model.isEdge(state.cell)) ? graph.view.getPoint(state) :
				new bpmPoint(state.getCenterX(), state.getCenterY());
			tmp = new bpmRectangle(tmp.x - this.refreshTarget.width / 2, tmp.y - this.refreshTarget.height / 2,
				this.refreshTarget.width, this.refreshTarget.height);
			
			styleTarget.style.left = Math.floor(tmp.x) + 'px';
			styleTarget.style.top = Math.floor(tmp.y) + 'px';
			
			if (styleTargetParent == null)
			{
				graph.container.appendChild(styleTarget);
				styleTargetParent = styleTarget.parentNode;
			}
			
			checkArrow(x, y, tmp, styleTarget);
		}
		// Does not reset on ignored edges
		else if (currentStyleTarget == null || !bpmUtils.contains(currentStyleTarget, x, y) ||
			(timeOnTarget > 1500 && !bpmEvent.isShiftDown(evt)))
		{
			currentStyleTarget = null;
			
			if (styleTargetParent != null)
			{
				styleTarget.parentNode.removeChild(styleTarget);
				styleTargetParent = null;
			}
		}
		else if (currentStyleTarget != null && styleTargetParent != null)
		{
			// Sets active Arrow as side effect
			var tmp = (graph.model.isEdge(currentStyleTarget.cell)) ? graph.view.getPoint(currentStyleTarget) : new bpmPoint(currentStyleTarget.getCenterX(), currentStyleTarget.getCenterY());
			tmp = new bpmRectangle(tmp.x - this.refreshTarget.width / 2, tmp.y - this.refreshTarget.height / 2,
				this.refreshTarget.width, this.refreshTarget.height);
			checkArrow(x, y, tmp, styleTarget);
		}
		
		// Checks if inside bounds
		if (activeTarget && currentTargetState != null && !bpmEvent.isAltDown(evt) && activeArrow == null)
		{
			// LATER: Use hit-detection for edges
			bbox = bpmRectangle.fromRectangle(currentTargetState);
			
			if (graph.model.isEdge(currentTargetState.cell))
			{
				var pts = currentTargetState.absolutePoints;
				
				if (roundSource.parentNode != null)
				{
					var p0 = pts[0];
					bbox.add(checkArrow(x, y, new bpmRectangle(p0.x - this.roundDrop.width / 2,
						p0.y - this.roundDrop.height / 2, this.roundDrop.width, this.roundDrop.height), roundSource));
				}
				
				if (roundTarget.parentNode != null)
				{
					var pe = pts[pts.length - 1];
					bbox.add(checkArrow(x, y, new bpmRectangle(pe.x - this.roundDrop.width / 2,
						pe.y - this.roundDrop.height / 2,
						this.roundDrop.width, this.roundDrop.height), roundTarget));
				}
			}
			else
			{
				var bds = bpmRectangle.fromRectangle(currentTargetState);
				
				// Uses outer bounding box to take rotation into account
				if (currentTargetState.shape != null && currentTargetState.shape.boundingBox != null)
				{
					bds = bpmRectangle.fromRectangle(currentTargetState.shape.boundingBox);
				}

				bds.grow(this.graph.tolerance);
				bds.grow(HoverIcons.prototype.arrowSpacing);
				
				var handler = this.graph.selectionCellsHandler.getHandler(currentTargetState.cell);
				
				if (handler != null)
				{
					bds.x -= handler.horizontalOffset / 2;
					bds.y -= handler.verticalOffset / 2;
					bds.width += handler.horizontalOffset;
					bds.height += handler.verticalOffset;
					
					// Adds bounding box of rotation handle to avoid overlap
					if (handler.rotationShape != null && handler.rotationShape.node != null &&
						handler.rotationShape.node.style.visibility != 'hidden' &&
						handler.rotationShape.node.style.display != 'none' &&
						handler.rotationShape.boundingBox != null)
					{
						bds.add(handler.rotationShape.boundingBox);
					}
				}
				
				bbox.add(checkArrow(x, y, new bpmRectangle(currentTargetState.getCenterX() - this.triangleUp.width / 2,
					bds.y - this.triangleUp.height, this.triangleUp.width, this.triangleUp.height), arrowUp));
				bbox.add(checkArrow(x, y, new bpmRectangle(bds.x + bds.width,
					currentTargetState.getCenterY() - this.triangleRight.height / 2,
					this.triangleRight.width, this.triangleRight.height), arrowRight));
				bbox.add(checkArrow(x, y, new bpmRectangle(currentTargetState.getCenterX() - this.triangleDown.width / 2,
						bds.y + bds.height, this.triangleDown.width, this.triangleDown.height), arrowDown));
				bbox.add(checkArrow(x, y, new bpmRectangle(bds.x - this.triangleLeft.width,
						currentTargetState.getCenterY() - this.triangleLeft.height / 2,
						this.triangleLeft.width, this.triangleLeft.height), arrowLeft));
			}
			
			// Adds tolerance
			if (bbox != null)
			{
				bbox.grow(10);
			}
		}
		
		direction = bpmConstants.DIRECTION_NORTH;
		
		if (activeArrow == arrowRight)
		{
			direction = bpmConstants.DIRECTION_EAST;
		}
		else if (activeArrow == arrowDown || activeArrow == roundTarget)
		{
			direction = bpmConstants.DIRECTION_SOUTH;
		}
		else if (activeArrow == arrowLeft)
		{
			direction = bpmConstants.DIRECTION_WEST;
		}
		
		if (currentStyleTarget != null && activeArrow == styleTarget)
		{
			state = currentStyleTarget;
		}

		var validTarget = (firstVertex == null || graph.isCellConnectable(cells[firstVertex])) &&
			((graph.model.isEdge(cell) && firstVertex != null) ||
			(graph.model.isVertex(cell) && graph.isCellConnectable(cell)));
		
		// Drop arrows shown after this.dropTargetDelay, hidden after 5 secs, switches arrows after 500ms
		if ((currentTargetState != null && timeOnTarget >= 5000) ||
			(currentTargetState != state &&
			(bbox == null || !bpmUtils.contains(bbox, x, y) ||
			(timeOnTarget > 500 && activeArrow == null && validTarget))))
		{
			activeTarget = false;
			currentTargetState = ((timeOnTarget < 5000 && timeOnTarget > this.dropTargetDelay) || graph.model.isEdge(cell)) ? state : null;

			if (currentTargetState != null && validTarget)
			{
				var elts = [roundSource, roundTarget, arrowUp, arrowRight, arrowDown, arrowLeft];
				
				for (var i = 0; i < elts.length; i++)
				{
					if (elts[i].parentNode != null)
					{
						elts[i].parentNode.removeChild(elts[i]);
					}
				}
				
				if (graph.model.isEdge(cell))
				{
					var pts = state.absolutePoints;
					
					if (pts != null)
					{
						var p0 = pts[0];
						var pe = pts[pts.length - 1];
						var tol = graph.tolerance;
						var box = new bpmRectangle(x - tol, y - tol, 2 * tol, 2 * tol);
						
						roundSource.style.left = Math.floor(p0.x - this.roundDrop.width / 2) + 'px';
						roundSource.style.top = Math.floor(p0.y - this.roundDrop.height / 2) + 'px';
						
						roundTarget.style.left = Math.floor(pe.x - this.roundDrop.width / 2) + 'px';
						roundTarget.style.top = Math.floor(pe.y - this.roundDrop.height / 2) + 'px';
						
						if (graph.model.getTerminal(cell, true) == null)
						{
							graph.container.appendChild(roundSource);
						}
						
						if (graph.model.getTerminal(cell, false) == null)
						{
							graph.container.appendChild(roundTarget);
						}
					}
				}
				else
				{
					var bds = bpmRectangle.fromRectangle(state);
					
					// Uses outer bounding box to take rotation into account
					if (state.shape != null && state.shape.boundingBox != null)
					{
						bds = bpmRectangle.fromRectangle(state.shape.boundingBox);
					}

					bds.grow(this.graph.tolerance);
					bds.grow(HoverIcons.prototype.arrowSpacing);
					
					var handler = this.graph.selectionCellsHandler.getHandler(state.cell);
					
					if (handler != null)
					{
						bds.x -= handler.horizontalOffset / 2;
						bds.y -= handler.verticalOffset / 2;
						bds.width += handler.horizontalOffset;
						bds.height += handler.verticalOffset;
						
						// Adds bounding box of rotation handle to avoid overlap
						if (handler.rotationShape != null && handler.rotationShape.node != null &&
							handler.rotationShape.node.style.visibility != 'hidden' &&
							handler.rotationShape.node.style.display != 'none' &&
							handler.rotationShape.boundingBox != null)
						{
							bds.add(handler.rotationShape.boundingBox);
						}
					}
					
					arrowUp.style.left = Math.floor(state.getCenterX() - this.triangleUp.width / 2) + 'px';
					arrowUp.style.top = Math.floor(bds.y - this.triangleUp.height) + 'px';
					
					arrowRight.style.left = Math.floor(bds.x + bds.width) + 'px';
					arrowRight.style.top = Math.floor(state.getCenterY() - this.triangleRight.height / 2) + 'px';
					
					arrowDown.style.left = arrowUp.style.left
					arrowDown.style.top = Math.floor(bds.y + bds.height) + 'px';
					
					arrowLeft.style.left = Math.floor(bds.x - this.triangleLeft.width) + 'px';
					arrowLeft.style.top = arrowRight.style.top;
					
					if (state.style['portConstraint'] != 'eastwest')
					{
						graph.container.appendChild(arrowUp);
						graph.container.appendChild(arrowDown);
					}

					graph.container.appendChild(arrowRight);
					graph.container.appendChild(arrowLeft);
				}
				
				// Hides handle for cell under mouse
				if (state != null)
				{
					currentStateHandle = graph.selectionCellsHandler.getHandler(state.cell);
					
					if (currentStateHandle != null && currentStateHandle.setHandlesVisible != null)
					{
						currentStateHandle.setHandlesVisible(false);
					}
				}
				
				activeTarget = true;
			}
			else
			{
				var elts = [roundSource, roundTarget, arrowUp, arrowRight, arrowDown, arrowLeft];
				
				for (var i = 0; i < elts.length; i++)
				{
					if (elts[i].parentNode != null)
					{
						elts[i].parentNode.removeChild(elts[i]);
					}
				}
			}
		}

		if (!activeTarget && currentStateHandle != null)
		{
			currentStateHandle.setHandlesVisible(true);
		}
		
		// Handles drop target
		var target = ((!bpmEvent.isAltDown(evt) || bpmEvent.isShiftDown(evt)) &&
			!(currentStyleTarget != null && activeArrow == styleTarget)) ?
			bpmDragSource.prototype.getDropTarget.apply(this, arguments) : null;
		var model = graph.getModel();
		
		if (target != null)
		{
			if (activeArrow != null || !graph.isSplitTarget(target, cells, evt))
			{
				// Selects parent group as drop target
				while (target != null && !graph.isValidDropTarget(target, cells, evt) && model.isVertex(model.getParent(target)))
				{
					target = model.getParent(target);
				}
				
				if (graph.view.currentRoot == target || (!graph.isValidRoot(target) &&
					graph.getModel().getChildCount(target) == 0) ||
					graph.isCellLocked(target) || model.isEdge(target))
				{
					target = null;
				}
			}
		}
		
		return target;
	});
	
	dragSource.stopDrag = function()
	{
		bpmDragSource.prototype.stopDrag.apply(this, arguments);
		
		var elts = [roundSource, roundTarget, styleTarget, arrowUp, arrowRight, arrowDown, arrowLeft];
		
		for (var i = 0; i < elts.length; i++)
		{
			if (elts[i].parentNode != null)
			{
				elts[i].parentNode.removeChild(elts[i]);
			}
		}
		
		if (currentTargetState != null && currentStateHandle != null)
		{
			currentStateHandle.reset();
		}
		
		currentStateHandle = null;
		currentTargetState = null;
		currentStyleTarget = null;
		styleTargetParent = null;
		activeArrow = null;
	};
	
	return dragSource;
};

/**
 * Adds a handler for inserting the cell with a single click.
 */
Sidebar.prototype.itemClicked = function(cells, ds, evt, elt)
{
	var graph = this.editorUi.editor.graph;
	graph.container.focus();
	
	// Alt+Click inserts and connects
	if (bpmEvent.isAltDown(evt) && graph.getSelectionCount() == 1 && graph.model.isVertex(graph.getSelectionCell()))
	{
		var firstVertex = null;
		
		for (var i = 0; i < cells.length && firstVertex == null; i++)
		{
			if (graph.model.isVertex(cells[i]))
			{
				firstVertex = i;
			}
		}
		
		if (firstVertex != null)
		{
			graph.setSelectionCells(this.dropAndConnect(graph.getSelectionCell(), cells, (bpmEvent.isMetaDown(evt) || bpmEvent.isControlDown(evt)) ?
				(bpmEvent.isShiftDown(evt) ? bpmConstants.DIRECTION_WEST : bpmConstants.DIRECTION_NORTH) : 
				(bpmEvent.isShiftDown(evt) ? bpmConstants.DIRECTION_EAST : bpmConstants.DIRECTION_SOUTH),
				firstVertex, evt));
			graph.scrollCellToVisible(graph.getSelectionCell());
		}
	}
	// Shift+Click updates shape
	else if (bpmEvent.isShiftDown(evt) && !graph.isSelectionEmpty())
	{
		this.updateShapes(cells[0], graph.getSelectionCells());
		graph.scrollCellToVisible(graph.getSelectionCell());
	}
	else
	{
		var pt = graph.getFreeInsertPoint();
		
		if (bpmEvent.isAltDown(evt))
		{
			var bounds = graph.getGraphBounds();
			var tr = graph.view.translate;
			var s = graph.view.scale;
			pt.x = bounds.x / s - tr.x + bounds.width / s + graph.gridSize;
			pt.y = bounds.y / s - tr.y;
		}
		
		ds.drop(graph, evt, null, pt.x, pt.y, true);
		
		if (this.editorUi.hoverIcons != null && (bpmEvent.isTouchEvent(evt) || bpmEvent.isPenEvent(evt)))
		{
			this.editorUi.hoverIcons.update(graph.view.getState(graph.getSelectionCell()));
		}
	}
};

/**
 * Adds a handler for inserting the cell with a single click.
 */
Sidebar.prototype.addClickHandler = function(elt, ds, cells)
{
	var graph = this.editorUi.editor.graph;
	var oldMouseDown = ds.mouseDown;
	var oldMouseMove = ds.mouseMove;
	var oldMouseUp = ds.mouseUp;
	var tol = graph.tolerance;
	var first = null;
	var sb = this;
	
	ds.mouseDown =function(evt)
	{
		oldMouseDown.apply(this, arguments);
		first = new bpmPoint(bpmEvent.getClientX(evt), bpmEvent.getClientY(evt));
		
		if (this.dragElement != null)
		{
			this.dragElement.style.display = 'none';
			bpmUtils.setOpacity(elt, 50);
		}
	};
	
	ds.mouseMove = function(evt)
	{
		if (this.dragElement != null && this.dragElement.style.display == 'none' &&
			first != null && (Math.abs(first.x - bpmEvent.getClientX(evt)) > tol ||
			Math.abs(first.y - bpmEvent.getClientY(evt)) > tol))
		{
			this.dragElement.style.display = '';
			bpmUtils.setOpacity(elt, 100);
		}
		
		oldMouseMove.apply(this, arguments);
	};
	
	ds.mouseUp = function(evt)
	{
		if (!bpmEvent.isPopupTrigger(evt) && this.currentGraph == null &&
			this.dragElement != null && this.dragElement.style.display == 'none')
		{
			sb.itemClicked(cells, ds, evt, elt);
		}

		oldMouseUp.apply(ds, arguments);
		bpmUtils.setOpacity(elt, 100);
		first = null;
		
		// Blocks tooltips on this element after single click
		sb.currentElt = elt;
	};
};

/**
 * Creates a drop handler for inserting the given cells.
 */
Sidebar.prototype.createVertexTemplateEntry = function(style, width, height, value, title, showLabel, showTitle, tags)
{
	tags = (tags != null && tags.length > 0) ? tags : title.toLowerCase();
	
	return this.addEntry(tags, bpmUtils.bind(this, function()
 	{
 		return this.createVertexTemplate(style, width, height, value, title, showLabel, showTitle);
 	}));
}

/**
 * Creates a drop handler for inserting the given cells.
 */
Sidebar.prototype.createVertexTemplate = function(style, width, height, value, title, showLabel, showTitle, allowCellsInserted)
{
	var cells = [new bpmCell((value != null) ? value : '', new bpmGeometry(0, 0, width, height), style)];
	cells[0].vertex = true;
	
	return this.createVertexTemplateFromCells(cells, width, height, title, showLabel, showTitle, allowCellsInserted);
};

/**
 * Creates a drop handler for inserting the given cells.
 */
Sidebar.prototype.createVertexTemplateFromData = function(data, width, height, title, showLabel, showTitle, allowCellsInserted)
{
	var doc = bpmUtils.parseXml(Draw.decompress(data));
	var codec = new bpmCodec(doc);

	var model = new bpmGraphModel();
	codec.decode(doc.documentElement, model);
	
	var cells = this.graph.cloneCells(model.root.getChildAt(0).children);

	return this.createVertexTemplateFromCells(cells, width, height, title, showLabel, showTitle, allowCellsInserted);
};

/**
 * Creates a drop handler for inserting the given cells.
 */
Sidebar.prototype.createVertexTemplateFromCells = function(cells, width, height, title, showLabel, showTitle, allowCellsInserted)
{
	// Use this line to convert calls to this function with lots of boilerplate code for creating cells
	//console.trace('xml', Draw.compress(bpmUtils.getXml(this.graph.encodeCells(cells))), cells);
	return this.createItem(cells, title, showLabel, showTitle, width, height, allowCellsInserted);
};

/**
 * 
 */
Sidebar.prototype.createEdgeTemplateEntry = function(style, width, height, value, title, showLabel, tags, allowCellsInserted)
{
	tags = (tags != null && tags.length > 0) ? tags : title.toLowerCase();
	
 	return this.addEntry(tags, bpmUtils.bind(this, function()
 	{
 		return this.createEdgeTemplate(style, width, height, value, title, showLabel, allowCellsInserted);
 	}));
};

/**
 * Creates a drop handler for inserting the given cells.
 */
Sidebar.prototype.createEdgeTemplate = function(style, width, height, value, title, showLabel, allowCellsInserted)
{
	var cell = new bpmCell((value != null) ? value : '', new bpmGeometry(0, 0, width, height), style);
	cell.geometry.setTerminalPoint(new bpmPoint(0, height), true);
	cell.geometry.setTerminalPoint(new bpmPoint(width, 0), false);
	cell.geometry.relative = true;
	cell.edge = true;
	
	return this.createEdgeTemplateFromCells([cell], width, height, title, showLabel, allowCellsInserted);
};

/**
 * Creates a drop handler for inserting the given cells.
 */
Sidebar.prototype.createEdgeTemplateFromCells = function(cells, width, height, title, showLabel, allowCellsInserted)
{	
	return this.createItem(cells, title, showLabel, true, width, height, allowCellsInserted);
};

/**
 * Adds the given palette.
 */
Sidebar.prototype.addPaletteFunctions = function(id, title, expanded, fns)
{
	this.addPalette(id, title, expanded, bpmUtils.bind(this, function(content)
	{
		for (var i = 0; i < fns.length; i++)
		{
			var item = fns[i](content);

			var br = document.createElement("br");
			var shapeTitle = document.createElement("span");
			shapeTitle.style.display = "inline-block";
			shapeTitle.style.marginTop = "8px";
			shapeTitle.style.marginLeft = "8px";
			shapeTitle.innerHTML = item.title;
			
			item.appendChild(shapeTitle);
			content.appendChild(item);
		}
	}));
};

/**
 * Adds the given palette.
 */
Sidebar.prototype.addPalette = function(id, title, expanded, onInit)
{
	var elt = this.createTitle(title);
	this.container.appendChild(elt);
	
	var div = document.createElement('div');
	div.className = 'geSidebar';
	
	// Disables built-in pan and zoom in IE10 and later
	if (bpmCore.IS_POINTER)
	{
		div.style.touchAction = 'none';
	}

	if (expanded)
	{
		onInit(div);
		onInit = null;
	}
	else
	{
		div.style.display = 'none';
	}
	
    this.addFoldingHandler(elt, div, onInit);
	
	var outer = document.createElement('div');
    outer.appendChild(div);
    this.container.appendChild(outer);
    
    // Keeps references to the DOM nodes
    if (id != null)
    {
    	this.palettes[id] = [elt, outer];
    }
    
    return div;
};

/**
 * Create the given title element.
 */
Sidebar.prototype.addFoldingHandler = function(title, content, funct)
{
	var initialized = false;

	// Avoids mixed content warning in IE6-8
	if (!bpmCore.IS_IE || document.documentMode >= 8) 
	{
		title.style.backgroundImage = (content.style.display == 'none') ?
			'url(\'' + this.collapsedImage + '\')' : 'url(\'' + this.expandedImage + '\')';
	}
	
	title.style.backgroundRepeat = 'no-repeat';
	title.style.backgroundPosition = '0% 50%';

	bpmEvent.addListener(title, 'click', bpmUtils.bind(this, function(evt)
	{
		if (content.style.display == 'none')
		{
			if (!initialized)
			{
				initialized = true;
				
				if (funct != null)
				{
					// Wait cursor does not show up on Mac
					title.style.cursor = 'wait';
					var prev = title.innerHTML;
					title.innerHTML = bpmResources.get('loading') + '...';
					
					window.setTimeout(function()
					{
						content.style.display = 'block';
						title.style.cursor = '';
						title.innerHTML = prev;

						var fo = bpmCore.NO_FO;
						bpmCore.NO_FO = BpmDraw.prototype.originalNoForeignObject;
						funct(content, title);
						bpmCore.NO_FO = fo;
					}, (bpmCore.IS_FF) ? 20 : 0);
				}
				else
				{
					content.style.display = 'block';
				}
			}
			else
			{
				content.style.display = 'block';
			}
			
			title.style.backgroundImage = 'url(\'' + this.expandedImage + '\')';
		}
		else
		{
			title.style.backgroundImage = 'url(\'' + this.collapsedImage + '\')';
			content.style.display = 'none';
		}
		
		bpmEvent.consume(evt);
	}));
	
	// Prevents focus
    bpmEvent.addListener(title, (bpmCore.IS_POINTER) ? 'pointerdown' : 'mousedown',
    	bpmUtils.bind(this, function(evt)
	{
		evt.preventDefault();
	}));
};

/**
 * Removes the palette for the given ID.
 */
Sidebar.prototype.removePalette = function(id)
{
	var elts = this.palettes[id];
	
	if (elts != null)
	{
		this.palettes[id] = null;
		
		for (var i = 0; i < elts.length; i++)
		{
			this.container.removeChild(elts[i]);
		}
		
		return true;
	}
	
	return false;
};

/**
 * Adds the given image palette.
 */
Sidebar.prototype.addImagePalette = function(id, title, prefix, postfix, items, titles, tags)
{
	var showTitles = titles != null;
	var fns = [];
	
	for (var i = 0; i < items.length; i++)
	{
		(bpmUtils.bind(this, function(item, title, tmpTags)
		{
			if (tmpTags == null)
			{
				var slash = item.lastIndexOf('/');
				var dot = item.lastIndexOf('.');
				tmpTags = item.substring((slash >= 0) ? slash + 1 : 0, (dot >= 0) ? dot : item.length).replace(/[-_]/g, ' ');
			}

			fns.push(this.createVertexTemplateEntry('image;html=1;labelBackgroundColor=#ffffff;image=' + prefix + item + postfix,
				this.defaultImageWidth, this.defaultImageHeight, '', title, title != null, null, this.filterTags(tmpTags)));
		}))(items[i], (titles != null) ? titles[i] : null, (tags != null) ? tags[items[i]] : null);
	}

	this.addPaletteFunctions(id, title, false, fns);
};


Sidebar.prototype.addImagePaletteWithImage = function(id, title, prefix, postfix, itemIds, itemTitles, itemImages, expand)
{
	var showTitles = itemTitles != null;
	var fns = [];
	
	for (var i = 0; i < itemIds.length; i++)
	{
		(bpmUtils.bind(this, function(itemImage, itemTitle, tmpTags)
		{
			if (tmpTags == null)
			{
				var slash = itemTitle.lastIndexOf('/');
				var dot = itemTitle.lastIndexOf('.');
				tmpTags = itemTitle.substring((slash >= 0) ? slash + 1 : 0, (dot >= 0) ? dot : itemTitle.length).replace(/[-_]/g, ' ');
			}

			fns.push(this.createVertexTemplateEntry('image;html=1;labelBackgroundColor=#ffffff;image=' + prefix + itemImage + postfix,
				this.defaultImageWidth, this.defaultImageHeight, '', itemTitle, itemTitle != null, null, this.filterTags(tmpTags)));
		}))(itemImages[i], (itemTitles != null) ? itemTitles[i] : null, null);
	}

	this.addPaletteFunctions(id, title, expand, fns);
};

/**
 * Creates the array of tags for the given stencil. Duplicates are allowed and will be filtered out later.
 */
Sidebar.prototype.getTagsForStencil = function(packageName, stencilName, moreTags)
{
	var tags = packageName.split('.');
	
	for (var i = 1; i < tags.length; i++)
	{
		tags[i] = tags[i].replace(/_/g, ' ')
	}
	
	tags.push(stencilName.replace(/_/g, ' '));
	
	if (moreTags != null)
	{
		tags.push(moreTags);
	}
	
	return tags.slice(1, tags.length);
};

/**
 * Adds the given stencil palette.
 */
Sidebar.prototype.addStencilPalette = function(id, title, stencilFile, style, ignore, onInit, scale, tags, customFns)
{
	scale = (scale != null) ? scale : 1;
	
	if (this.addStencilsToIndex)
	{
		// LATER: Handle asynchronous loading dependency
		var fns = [];
		
		if (customFns != null)
		{
			for (var i = 0; i < customFns.length; i++)
			{
				fns.push(customFns[i]);
			}
		}

		bpmStencilRegistry.loadStencilSet(stencilFile, bpmUtils.bind(this, function(packageName, stencilName, displayName, w, h)
		{
			if (ignore == null || bpmUtils.indexOf(ignore, stencilName) < 0)
			{
				var tmp = this.getTagsForStencil(packageName, stencilName);
				var tmpTags = (tags != null) ? tags[stencilName] : null;

				if (tmpTags != null)
				{
					tmp.push(tmpTags);
				}
				
				fns.push(this.createVertexTemplateEntry('shape=' + packageName + stencilName.toLowerCase() + style,
					Math.round(w * scale), Math.round(h * scale), '', stencilName.replace(/_/g, ' '), null, null,
					this.filterTags(tmp.join(' '))));
			}
		}), true, true);

		this.addPaletteFunctions(id, title, false, fns);
	}
	else
	{
		this.addPalette(id, title, false, bpmUtils.bind(this, function(content)
	    {
			if (style == null)
			{
				style = '';
			}
			
			if (onInit != null)
			{
				onInit.call(this, content);
			}
			
			if (customFns != null)
			{
				for (var i = 0; i < customFns.length; i++)
				{
					customFns[i](content);
				}
			}

			bpmStencilRegistry.loadStencilSet(stencilFile, bpmUtils.bind(this, function(packageName, stencilName, displayName, w, h)
			{
				if (ignore == null || bpmUtils.indexOf(ignore, stencilName) < 0)
				{
					content.appendChild(this.createVertexTemplate('shape=' + packageName + stencilName.toLowerCase() + style,
						Math.round(w * scale), Math.round(h * scale), '', stencilName.replace(/_/g, ' '), true));
				}
			}), true);
	    }));
	}
};

/**
 * Adds the given stencil palette.
 */
Sidebar.prototype.destroy = function()
{
	if (this.graph != null)
	{
		if (this.graph.container != null && this.graph.container.parentNode != null)
		{
			this.graph.container.parentNode.removeChild(this.graph.container);
		}
		
		this.graph.destroy();
		this.graph = null;
	}
	
	if (this.pointerUpHandler != null)
	{
		bpmEvent.removeListener(document, (bpmCore.IS_POINTER) ? 'pointerup' : 'mouseup', this.pointerUpHandler);
		this.pointerUpHandler = null;
	}

	if (this.pointerDownHandler != null)
	{
		bpmEvent.removeListener(document, (bpmCore.IS_POINTER) ? 'pointerdown' : 'mousedown', this.pointerDownHandler);
		this.pointerDownHandler = null;
	}
	
	if (this.pointerMoveHandler != null)
	{
		bpmEvent.removeListener(document, (bpmCore.IS_POINTER) ? 'pointermove' : 'mousemove', this.pointerMoveHandler);
		this.pointerMoveHandler = null;
	}
	
	if (this.pointerOutHandler != null)
	{
		bpmEvent.removeListener(document, (bpmCore.IS_POINTER) ? 'pointerout' : 'mouseout', this.pointerOutHandler);
		this.pointerOutHandler = null;
	}
};
