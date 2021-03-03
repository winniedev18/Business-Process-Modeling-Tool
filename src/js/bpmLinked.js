function bpmLinkedInfos(root)
{
	this.linkedbuf = [];
};

bpmLinkedInfos.prototype.id = null;
bpmLinkedInfos.prototype.linkedbuf = null;

bpmLinkedInfos.prototype.add = function(item)
{
	linkedbuf = this.getLinkedBuf()
	if(!this.isExistLinkInfo(item))
	{
		linkedbuf.push(item);
	}
}

bpmLinkedInfos.prototype.getLinkedBuf = function()
{
	return this.linkedbuf;
}

bpmLinkedInfos.prototype.isExistLinkInfo = function(link)
{
	var ret = false;
	var buf = this.getLinkedBuf();

	for (var i = 0; i < buf.length; i++) {
		var item = buf[i];
		if(link.cell.source == item.cell.source && link.cell.target == item.cell.target && link.cell.style == item.cell.style)
		{
			ret = true;
			break;		 		
		}
	}
	return ret;
};
/* Link */
function bpmLink(cell, source, target, parent)
{
	this.setCell(cell);	
	this.LinkedInfos.add(this);
};

bpmLink.prototype.id = null;
bpmLink.prototype.geometry = null;
bpmLink.prototype.style = null;
bpmLink.prototype.vertex = false;
bpmLink.prototype.edge = false;
bpmLink.prototype.connectable = true;
bpmLink.prototype.visible = true;
bpmLink.prototype.collapsed = false;
bpmLink.prototype.parent = null;
bpmLink.prototype.source = null;
bpmLink.prototype.target = null;
bpmLink.prototype.children = null;
bpmLink.prototype.edges = null;
bpmLink.prototype.cell = null;
bpmLink.prototype.LinkedInfos = new bpmLinkedInfos();

bpmLink.prototype.getGeometry = function()
{
	return this.geometry;
};

bpmLink.prototype.setGeometry = function(geometry)
{
	this.geometry = geometry;
};

bpmLink.prototype.getStyle = function()
{
	return this.style;
};

bpmLink.prototype.setStyle = function(style)
{
	this.style = style;
};

bpmLink.prototype.getCell = function()
{
	return this.cell;
};

bpmLink.prototype.setCell = function(cell)
{
	this.cell = cell;
};

