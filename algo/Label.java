import java.text.Collator;
import java.util.ArrayList;
import java.util.Locale;

/**
 * Classe d�crivant un concept.
 */
public class Label extends MapItem {
	private ArrayList<String> keywords;

	/**
	 * Ce constructeur prend en param�tre une ArrayList<String> et affecte cette
	 * ArrayList � keywords. Tous les Strings sont pass�s en minuscules
	 * 
	 * @param keywords
	 */
	public Label(ArrayList<String> keywords) {

		super();
		this.keywords = Normalizer.ToLowerCase(keywords);
	}

	/**
	 * Ce contructeur prend un String en param�tre et initialise l'ArrayList
	 * keywords avec ce String. Tous les Strings sont pass�s en minuscules.
	 * 
	 * @param keyword
	 */
	@SuppressWarnings("serial")
	public Label(String keyword) {

		super();
		this.keywords = new ArrayList<String>() {
			{
				add(Normalizer.ToLowerCase(keyword));
			}
		};
	}

	/**
	 * Verifi� la pr�sence ou non de keyword dans la liste des mots clefs. Utilise
	 * un java.text.Collator pour faire les comparaisons sans tenir compte des
	 * accents. Le String est pass� en minuscules.
	 * 
	 * @param keyword
	 * @return true si keywords contient le String keyword, false sinon
	 */
	public boolean contains(String keyword) {

		keyword = Normalizer.ToLowerCase(keyword);

		Collator collator = Collator.getInstance(Locale.FRENCH);
		collator.setStrength(Collator.PRIMARY);

		for (String s : keywords) {

			if (collator.equals(s, keyword))
				return true;
		}

		return false;
	}

	public ArrayList<String> getKeywords() {

		return keywords;
	}
}