
public class Map {
	private LabelList labelList;
	private LinkList linkList;
	private double mark;
	
	public Map() {
		labelList = new LabelList();
		linkList = new LinkList();
	}
	
	public Map(LabelList labelList, LinkList linkList) {
		this.labelList = labelList;
		this.linkList = linkList;
	}

	public LabelList getLabelList() {
		return labelList;
	}

	public void setLabelList(LabelList labelList) {
		this.labelList = labelList;
	}

	public LinkList getLinkList() {
		return linkList;
	}

	public void setLinkList(LinkList linkList) {
		this.linkList = linkList;
	}

	public double getMark() {
		return mark;
	}

	public void setMark(double mark) {
		this.mark = mark;
	}
}
