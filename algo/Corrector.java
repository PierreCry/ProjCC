public class Corrector {
	
	// Il faut r�cup�rer les listes de mots clefs et de liens corrects et faux dans la base de donn�es
	public static LabelList correctLabels, wrongLabels;
	public static LinkList correctLinks, wrongLinks;
	
	public static void main(String[] args) {
		
//		DatabaseConnector dbc = new DatabaseConnector();
		
		
		// Ici il faut r�cup�rer une carte conceptuelle �tudiant dans la base de donn�es
		ConceptMap myMap = new ConceptMap();
		
		for(Label lab : myMap.getLabelList().getLabels()) {
			
			if(correctLabels.contains(lab.getKeywords())) {
				
				lab.setState(MapItem.State.CORRECT);
				myMap.incrementCorrectLabelCount();
			}
		}
		
		for(Label lab : myMap.getLabelList().getLabels()) {
			
			if(wrongLabels.contains(lab.getKeywords())) {
				
				lab.setState(MapItem.State.WRONG);
			}
		}
		
		for(Link link : myMap.getLinkList().getLinks()) {
			
			if(correctLinks.contains(link.getLink().get(0).get(0), link.getLink().get(1).get(0), link.getLink().get(2).get(0))) {
				
				link.setState(MapItem.State.CORRECT);
				myMap.incrementCorrectLinkCount();
			}
		}
	
		for(Link link : myMap.getLinkList().getLinks()) {
			
			if(wrongLinks.contains(link.getLink().get(0).get(0), link.getLink().get(1).get(0), link.getLink().get(2).get(0))) {
				
				link.setState(MapItem.State.WRONG);
			}
		}
	}
}