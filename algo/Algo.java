import java.util.ArrayList;

public class Algo {
	private static LabelList correctLabels, wrongLabels;
	private static LinkList correctLinks, wrongLinks;
	
	private static double deltaPointLabel;
	private static double deltaPointLink;
	
	private static int authorizedMissingThreshold;
	
	private static int wrongLabelCounter, wrongLinkCounter;
	private static int missingWordCounter;
	
	public static void main(String[] args) {
		SaveParser sp = new SaveParser("c:\\Users\\befey\\eclipse-workspace\\ProjetClasses\\src\\test.txt");
		Map mymap = sp.Parse2Map();
		
		for(String s : mymap.getLabelList().getLabelNames()) {
			System.out.println(s);
		}
		
		System.out.println();
		
		for(Link l : mymap.getLinkList().getLinks()) {
			System.out.println(l.getPreLabel().getKeywords() + " -> " + l.getVerb() + " -> " + l.getPostLabel().getKeywords());
		}
		
		
		wrongLabelCounter = 0;
		wrongLinkCounter = 0;
		missingWordCounter = 0;
		
		// ALGO
		
		// compter le nombre de mots clefs et de relations corrects
		
		ArrayList<Label> clabels = new ArrayList<>();
		ArrayList<Link> clinks = new ArrayList<>();
		ArrayList<Label> wlabels = new ArrayList<>();
		ArrayList<Link> wlinks = new ArrayList<>();
		
		
		clabels.add(new Label("Perte d'eau"));
		clabels.add(new Label("Baisse de la volémie"));
		clabels.add(new Label("Perte de Na"));
		clabels.add(new Label("Réponse rénale"));
		clabels.add(new Label("test_correct"));
		
		clinks.add(new Link(clabels.get(0), clabels.get(1), "entraîne"));
		clinks.add(new Link(clabels.get(2), clabels.get(1), "entraîne"));
		clinks.add(new Link(clabels.get(1), clabels.get(3), "entraîne"));
		
		wlabels.add(new Label("test_faux"));
		
		wlinks.add(new Link(clabels.get(0), wlabels.get(0), "entraîne"));
		
		correctLabels = new LabelList(clabels);
		correctLinks = new LinkList(clinks);
		wrongLabels = new LabelList(wlabels);
		wrongLinks = new LinkList(wlinks);
		
		
		for(Label lab : mymap.getLabelList().getLabels()) {
			if(correctLabels.containsGeneralized(lab)) {
				lab.setState(MapItem.State.CORRECT);
			}
			
			if(wrongLabels.containsGeneralized(lab)) {
				lab.setState(MapItem.State.WRONG);
				wrongLabelCounter++;
			}
		}
		
		for(Link lin : mymap.getLinkList().getLinks()) {
			if(correctLinks.containsGeneralized(lin)) {
				lin.setState(MapItem.State.CORRECT);
			}
			
			if(wrongLinks.containsGeneralized(lin)) {
				lin.setState(MapItem.State.WRONG);
				wrongLinkCounter++;
			}
		}
		
		for(Label lab : correctLabels.getLabels()) {
			if(!mymap.getLabelList().containsGeneralized(lab)) {
				missingWordCounter++;
			}
		}
		
		// FIN ALGO
		
		System.out.println(wrongLabelCounter);
		System.out.println(wrongLinkCounter);
		System.out.println(missingWordCounter);
	}

	public static LabelList getCorrectLabels() {
		return correctLabels;
	}

	public static void setCorrectLabels(LabelList correctLabels) {
		Algo.correctLabels = correctLabels;
	}

	public static LabelList getWrongLabels() {
		return wrongLabels;
	}

	public static void setWrongLabels(LabelList wrongLabels) {
		Algo.wrongLabels = wrongLabels;
	}

	public static LinkList getCorrectLinks() {
		return correctLinks;
	}
 
	public static void setCorrectLinks(LinkList correctLinks) {
		Algo.correctLinks = correctLinks;
	}

	public static LinkList getWrongLinks() {
		return wrongLinks;
	}

	public static void setWrongLinks(LinkList wrongLinks) {
		Algo.wrongLinks = wrongLinks;
	}

	public static double getDeltaPointLabel() {
		return deltaPointLabel;
	}

	public static void setDeltaPointLabel(double deltaPointLabel) {
		Algo.deltaPointLabel = deltaPointLabel;
	}

	public static double getDeltaPointLink() {
		return deltaPointLink;
	}

	public static void setDeltaPointLink(double deltaPointLink) {
		Algo.deltaPointLink = deltaPointLink;
	}

	public static int getAuthorizedMissingThreshold() {
		return authorizedMissingThreshold;
	}

	public static void setAuthorizedMissingThreshold(int authorizedMissingThreshold) {
		Algo.authorizedMissingThreshold = authorizedMissingThreshold;
	}

	public static int getWrongLabelCounter() {
		return wrongLabelCounter;
	}

	public static void setWrongLabelCounter(int wrongLabelCounter) {
		Algo.wrongLabelCounter = wrongLabelCounter;
	}

	public static int getWrongLinkCounter() {
		return wrongLinkCounter;
	}

	public static void setWrongLinkCounter(int wrongLinkCounter) {
		Algo.wrongLinkCounter = wrongLinkCounter;
	}

	public static int getMissingWordCounter() {
		return Algo.missingWordCounter;
	}

	public static void setMissingWordCounter(int missiongWordCounter) {
		Algo.missingWordCounter = missiongWordCounter;
	}
}
