import java.text.Collator;
import java.util.ArrayList;
import java.util.Locale;

public class Link extends MapItem {
	
	private ArrayList<String> verbs;	
	private ArrayList<String> preLabels;
	private ArrayList<String> postLabels;
	
	private ArrayList<ArrayList<String>> config;
	
	public Link(ArrayList<ArrayList<String>> config) {
		
		super();
		
		this.config = config;
		
		config.set(1, Normalizer.ToLowerCase(config.get(1)));
	}
	
	@SuppressWarnings("serial")
	public Link(ArrayList<String> preLabels, ArrayList<String> verbs, ArrayList<String> postLabels) {
		
		super();
		
		this.preLabels = preLabels;
		this.verbs = Normalizer.ToLowerCase(verbs);
		this.postLabels = postLabels;
		
		this.config = new ArrayList<ArrayList<String>>() {{
			add(preLabels);
			add(verbs);
			add(postLabels);
		}};
	}
	
	@SuppressWarnings("serial")
	public Link(Label preLabel, String verb, Label postLabel) {
		
		super();
		
		this.preLabels = new ArrayList<>(preLabel.getKeywords());
		this.postLabels = new ArrayList<>(postLabel.getKeywords());
		this.verbs = new ArrayList<String>() {{add(verb);}};
		
		this.config = new ArrayList<ArrayList<String>>() {{
			add(preLabels);
			add(verbs);
			add(postLabels);
		}};
	}
	
	public void addPreLabel(String newLabel) {
		
		this.preLabels.add(Normalizer.ToLowerCase(newLabel));
	}

	public void addPostLabel(String newLabel) {
		
		this.postLabels.add(Normalizer.ToLowerCase(newLabel));
	}
	
	public void addVerb(String newVerb) {
		
		this.verbs.add(Normalizer.ToLowerCase(newVerb));
	}
	
	public boolean contains(String preLabelTest, String verbTest, String postLabelTest) {
		
		Collator collator = Collator.getInstance(Locale.FRENCH);
		collator.setStrength(Collator.PRIMARY);
		
		boolean flagPre = false;
		boolean flagVerb = false;
		boolean flagPost = false;
		
		preLabelTest = Normalizer.ToLowerCase(preLabelTest);
		
		
		for(String s : preLabels) {
			
			if(collator.equals(s, preLabelTest))
				flagPre = true;
		}
		
		for(String s : verbs) {
			
			if(collator.equals(s, verbTest))
				flagVerb = true;
		}
		
		for(String s : postLabels) {
			
			if(collator.equals(s, postLabelTest))
				flagPost = true;
		}
		
		if(flagPre && flagVerb && flagPost) 
			return true;
		
		return false;		
	}
	
	public ArrayList<ArrayList<String>> getLink(){
		
		return config;
	}
}