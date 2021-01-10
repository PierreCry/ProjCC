import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

public class SaveParser {
	ArrayList<String> allLines;
	
	public SaveParser(String filePath) {
		try {
			allLines = (ArrayList<String>) Files.readAllLines(Paths.get(filePath));
		} catch (IOException e) {
			System.out.println("Erreur lors de la lecture du fichier");
		}
	}
	
	public Map Parse2Map() {
		return new Map(Parse2LabelList(), Parse2LinkList());
	}
	
	public LabelList Parse2LabelList() {
		List<String> tmp_lines = new ArrayList<>(allLines);
		ArrayList<String> tmp_comp = new ArrayList<>();
		ArrayList<Label> tmp_labels = new ArrayList<>();
		
		for(int i=0 ; i<tmp_lines.size() ; i++) {
			if(tmp_lines.get(i).length() > 0) {
				if(tmp_lines.get(i).charAt(1) == 'T' || tmp_lines.get(i).charAt(1) == 'F') {
					tmp_lines.set(i, tmp_lines.get(i).substring(9));
					tmp_lines.set(i, tmp_lines.get(i).substring(0, tmp_lines.get(i).indexOf(',')));
					if(!tmp_comp.contains(tmp_lines.get(i))) {
						tmp_comp.add(tmp_lines.get(i));
						tmp_labels.add(new Label(tmp_lines.get(i)));
					}
				}	
			}
		}
		
		return new LabelList(tmp_labels);
	}
	
	public LinkList Parse2LinkList() {
		List<String> tmp_lines = new ArrayList<>(allLines);
		ArrayList<ArrayList<String>> tmp_comp = new ArrayList<>();
		ArrayList<Link> tmp_links = new ArrayList<>();
		
		for(int i=0 ; i<(tmp_lines.size()+1)/4 ; i++) {
			String pre = tmp_lines.get(i*4);
			String post = tmp_lines.get(i*4+2);
			String verb = tmp_lines.get(i*4+1);
			
			pre = pre.substring(9);
			post =  post.substring(9);
			pre = pre.substring(0, pre.indexOf(','));
			post = post.substring(0, post.indexOf(','));
			
			verb = verb.substring(8);
			verb = verb.substring(0, verb.indexOf(')'));
			
			ArrayList<String> tmp = new ArrayList<>(tmp_lines.subList(i*4, i*4+2));
			if(!tmp_comp.contains(tmp)) {
				tmp_comp.add(tmp);
				tmp_links.add(new Link(new Label(pre), new Label(post), verb));
			}
		}
		
		return new LinkList(tmp_links);
	}
}
