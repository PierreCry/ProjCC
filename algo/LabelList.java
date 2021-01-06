import java.util.ArrayList;

public class LabelList {
	private ArrayList<Label> labels;
	private ArrayList<String> labelNames;
	
	public LabelList() {
		labels = new ArrayList<>();
		labelNames = new ArrayList<>();
	}
	
	public LabelList(ArrayList<Label> labels) {
		this.labels = labels;
		labelNames = new ArrayList<>();
		for(Label lab : this.labels) {
			labelNames.add(lab.getKeywords());
		}
	}
	
	public boolean containsGeneralized(Label label){
		if(labelNames.contains(label.getKeywords())) return true;

		for(String lab : labelNames){
			if(label.getSynonyms().contains(lab))
				return true;
		}

		return false;
	}
	
	public Label getLabel(int i) {
		return labels.get(i);
	}
	
	public String getKeywords(int i) {
		return labelNames.get(i);
	}

	public ArrayList<Label> getLabels() {
		return labels;
	}

	public void setLabels(ArrayList<Label> labels) {
		this.labels = labels;
	}

	public ArrayList<String> getLabelNames() {
		return labelNames;
	}

	public void setLabelNames(ArrayList<String> labelNames) {
		this.labelNames = labelNames;
	}
}