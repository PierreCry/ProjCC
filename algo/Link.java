import java.util.ArrayList;

public class Link extends MapItem{
	private Label preLabel;
	private Label postLabel;
	private String verb;
	private ArrayList<String> synonyms;
	
	public Link(Label preLabel, Label postLabel,String verb) {
		this.preLabel = preLabel;
		this.postLabel = postLabel;
		this.verb = verb;
		this.state = State.DEFAULT;
		buildSynonyms();
	}

	private void buildSynonyms() {
		// algo de génération de synonymes à implémenter
				
	}

	public Label getPreLabel() {
		return preLabel;
	}

	public void setPreLabel(Label preLabel) {
		this.preLabel = preLabel;
	}

	public Label getPostLabel() {
		return postLabel;
	}

	public void setPostLabel(Label postLabel) {
		this.postLabel = postLabel;
	}

	public String getVerb() {
		return verb;
	}

	public void setVerb(String verb) {
		this.verb = verb;
	}
}
