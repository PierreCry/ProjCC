import java.util.ArrayList;

/**
 * Normalise les String et les ArrayList<String> pour les passer en minuscules.
 */
public final class Normalizer {

	/**
	 * Normaliseur d'ArrayList<String>.
	 * 
	 * @param list
	 * @return ArrayList<String> normalisée
	 */
	public static ArrayList<String> ToLowerCase(ArrayList<String> list) {

		for (String s : list) {

			s = s.toLowerCase();
		}

		return list;
	}

	/**
	 * Normaliseur de String.
	 * 
	 * @param string
	 * @return String normalisé
	 */
	public static String ToLowerCase(String string) {

		return string.toLowerCase();
	}
}