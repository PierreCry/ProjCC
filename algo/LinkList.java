import java.text.Collator;
import java.util.ArrayList;
import java.util.Locale;

public class LinkList {
	
	private ArrayList<Link> links;
	private ArrayList<ArrayList<String>> globalLinkNames;
	
	@SuppressWarnings("serial")
	public LinkList() {
		
		links = new ArrayList<>();
		globalLinkNames = new ArrayList<ArrayList<String>>() {{
			new ArrayList<String>();
			new ArrayList<String>();
			new ArrayList<String>();
			}};
	}
	
	public LinkList(ArrayList<Link> links) {
		
		this.links = links;
		
		for(Link l : links) {

			ArrayList<ArrayList<String>> T = l.getLink();
		
			for(int i=0 ; i<3 ; i++) {
				
				ArrayList<String> currentList = (ArrayList<String>) T.get(i);
				
				for(String s : currentList) {
				
					((ArrayList<String>) globalLinkNames.get(i)).add(s);
				}
			}
		}
	}
	
	public void addLink(Link link) {
		
		links.add(link);
		
		ArrayList<ArrayList<String>> T = link.getLink();
		
		for(int i=0 ; i<3 ; i++) {
			ArrayList<String> currentList = (ArrayList<String>) T.get(i);
			
			for(String s : currentList) {
			
				((ArrayList<String>) globalLinkNames.get(i)).add(s);
			}
		}
	}
	
	public boolean contains(String preLabelTest, String verbTest, String postLabelTest) {

		Collator collator = Collator.getInstance(Locale.FRENCH);
		collator.setStrength(Collator.PRIMARY);
		
		boolean flagPre = false;
		boolean flagVerb = false;
		boolean flagPost = false;
		
		for(String s : globalLinkNames.get(0)) {
			
			if(collator.equals(s, preLabelTest))
				flagPre = true;
		}
		
		for(String s : globalLinkNames.get(1)) {
			
			if(collator.equals(s, verbTest))
				flagVerb = true;
		}
		
		for(String s : globalLinkNames.get(2)) {
			
			if(collator.equals(s, postLabelTest))
				flagPost = true;
		}
		
		if(flagPre && flagVerb && flagPost) 
			return true;
		
		return false;		
	}
	
	public ArrayList<Link> getLinks(){
		
		return links;
	}
}
