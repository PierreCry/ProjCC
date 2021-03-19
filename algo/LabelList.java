import java.util.ArrayList;
import java.util.Locale;
import java.text.Collator;

public class LabelList {
	
	private ArrayList<Label> labels;
	private ArrayList<String> globalLabelNames;
	
	public LabelList() {
		
		labels = new ArrayList<>();
		globalLabelNames = new ArrayList<>();
	}
	
	public LabelList(ArrayList<Label> labels) {
		
		this.labels = labels;

		globalLabelNames = new ArrayList<>();
		
		for(Label l : labels) {
			
			globalLabelNames.addAll(l.getKeywords());
		}
	}
	
	public void addLabel(Label label) {
		
		labels.add(label);
		
		globalLabelNames.addAll(label.getKeywords());
	}
	
	public boolean contains(String label) {
		
		Collator collator = Collator.getInstance(Locale.FRENCH);
		collator.setStrength(Collator.PRIMARY);
		
		label = label.toLowerCase();
		
		for(String s : globalLabelNames) {
			
			if(collator.equals(s, label))
				return true;
		}
		
		return false;
	}
	
	public boolean contains(ArrayList<String> labels) {
		
		Collator collator = Collator.getInstance(Locale.FRENCH);
		collator.setStrength(Collator.PRIMARY);
		
		for(String label : labels) {
			label = label.toLowerCase();
			
			
			for(Label refLab : this.labels) {
				
				for(String s : refLab.getKeywords()) {
					
					if(collator.equals(s, label)) {
						
						refLab.IncrementOccurrence();
						return true;
					}
				}
			}
		}
			
		return false;
	}
	
	public ArrayList<Label> getLabels(){
		
		return labels;
	}
}