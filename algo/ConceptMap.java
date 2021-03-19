import java.util.ArrayList;

public class ConceptMap{
    
	private LabelList labelList;
	private LinkList linkList;
    private double score;
    private int correctLabelCount;
    private int correctLinkCount;
    
//    private ArrayList<String> labels;
//    private ArrayList<String> links;
    
//    public ConceptMap() {
//    	
//    	labels = new ArrayList<>();
//    	links = new ArrayList<>();
//    	
//    	score = 0;
//    	correctLabelCount = 0;
//    	correctLinkCount = 0;
//    }
//    
//    public ConceptMap(ArrayList<String> labels, ArrayList<String> links) {
//    	
//    	this.labels = labels;
//    	this.links = links;
//    	
//    	score = 0;
//    	correctLabelCount = 0;
//    	correctLinkCount = 0;
//    }

    public ConceptMap(){
       
    	labelList = new LabelList();
        linkList = new LinkList();
    }

    public ConceptMap(LabelList labelList, LinkList linkList){
      
    	this.labelList = labelList;
        this.linkList = linkList;
    }

    public double getScore(){
       
    	return score;
    }

    public void setScore(double score){
      
    	this.score = score;
    }
    
    
    
//    public ArrayList<String> getLabelList() {
//    	
//    	return labels;
//    }
//    
//    public ArrayList<String> getLinkList() {
//    	
//    	return links;
//    }
    
    
    public LabelList getLabelList() {
    	
    	return labelList;
    }
    
    public LinkList getLinkList() {
    	
    	return linkList;
    }
    
    public void setCorrectLabelCount(int correctLabelCount) {
    	
    	this.correctLabelCount = correctLabelCount;
    }
    
    public void setCorrectLinkCount(int correctLinkCount) {
    	
    	this.correctLinkCount = correctLinkCount;
    }
    
    public void incrementCorrectLabelCount() {
    	
    	correctLabelCount++;
    }
    
    public void incrementCorrectLinkCount() {
    	
    	correctLinkCount++;
    }
}