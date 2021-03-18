import java.text.Collator;
import java.util.ArrayList;
import java.util.Locale;

public class Label extends MapItem{
    private ArrayList<String> keywords;
    
    public Label(ArrayList<String> keywords) {
    	
    	super();
    	this.keywords = Normalizer.ToLowerCase(keywords);
    }
    
    public boolean contains(String keyword) {
    	
    	Collator collator = Collator.getInstance(Locale.FRENCH);
    	collator.setStrength(Collator.PRIMARY);
    	
    	for(String s : keywords) {
    		
    		if(collator.equals(s, keyword))
    			return true;
    	}
    	
    	return false;
    }

	public ArrayList<String> getKeywords() {
		
		return keywords;
	}
}