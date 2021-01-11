import java.util.ArrayList;

public class LinkList {
	private ArrayList<Link> links;
	private ArrayList<String> verbs;
	
	public LinkList() {
		links = new ArrayList<>();
		verbs = new ArrayList<>();
	}
	
	public LinkList(ArrayList<Link> links) {
		this.links = links;
		this.verbs = new ArrayList<>();
		
		for(Link lin : this.links) {
			verbs.add(lin.getVerb());
		}
	}

	public ArrayList<Link> getLinks() {
		return links;
	}

	public boolean containsGeneralized(Link lin) {
		for(Link link : links) {
			if(lin.getVerb().equals(link.getVerb())) {
				if(link.getPreLabel().getKeywords().equals(lin.getPreLabel().getKeywords()) &&
						link.getPostLabel().getKeywords().equals(lin.getPostLabel().getKeywords())) {
					return true;
				}
				
				/*
				if(link.getPreLabel().getSynonyms().contains(lin.getPreLabel().getKeywords()) &&
						link.getPostLabel().getSynonyms().contains(lin.getPostLabel().getKeywords())) {
					return true;
				}
				*/
			}
		}

		return false;
	}
	
	public Link getLink(int i) {
		return links.get(i);
	}
	
	public String getVerb(int i) {
		return verbs.get(i);
	}

	public ArrayList<String> getVerbs() {
		return verbs;
	}

	public void setVerbs(ArrayList<String> verbs) {
		this.verbs = verbs;
	}

	public void setLinks(ArrayList<Link> links) {
		this.links = links;
	}

	
}
 