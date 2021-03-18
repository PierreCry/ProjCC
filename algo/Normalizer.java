import java.util.ArrayList;

public final class Normalizer {
	
	public static ArrayList<String> ToLowerCase(ArrayList<String> list) {
		
		for(String s : list) {
			
			s = s.toLowerCase();
		}
		
		return list;
	}
	
	public static String ToLowerCase(String string) {
		
		return string.toLowerCase();
	}
}