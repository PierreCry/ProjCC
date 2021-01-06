import java.util.ArrayList;

public class Label extends MapItem{
	private String keywords;
	private ArrayList<String> synonyms;
	
	
	public Label(String keywords) {
		this.keywords = keywords;
		this.state = State.DEFAULT;
		buildSynonyms();
	}

	private void buildSynonyms() {
		// algo de g�n�ration de synonymes
	}
	
	public String getKeywords() {
		return keywords;
	}

	public ArrayList<String> getSynonyms() {
		return synonyms;
	}
}
