import java.text.Collator;
import java.util.ArrayList;
import java.util.Locale;

/**
 * Classe décrivatnt une liste de liens.
 */
public class LinkList {

	/**
	 * Liste contenant des Links.
	 */
	private ArrayList<Link> links;

	/**
	 * Constructeur qui initialise links avec une ArrayList<Link> vide.
	 */
	public LinkList() {

		links = new ArrayList<>();
	}

	/**
	 * Constructeur qui initialise links avec les paramètre links.
	 * 
	 * @param links
	 */
	public LinkList(ArrayList<Link> links) {

		this.links = links;
	}

	/**
	 * Ajoute un Link dans links.
	 * 
	 * @param link
	 */
	public void addLink(Link link) {

		links.add(link);
	}

	/**
	 * Vérifie la présence d'un triplet preLabelTest, verbTest, postLabelTest dans
	 * la LinkList. Utilise un java.text.Collator pour faire les comparaisons sans
	 * tenir compte des accents. Tous les Strings sont passés en minuscules
	 * 
	 * @param preLabelTest
	 * @param verbTest
	 * @param postLabelTest
	 * @return
	 */
	public boolean contains(String preLabelTest, String verbTest, String postLabelTest) {

		Collator collator = Collator.getInstance(Locale.FRENCH);
		collator.setStrength(Collator.PRIMARY);

		preLabelTest = Normalizer.ToLowerCase(preLabelTest);
		verbTest = Normalizer.ToLowerCase(verbTest);
		postLabelTest = Normalizer.ToLowerCase(postLabelTest);

		boolean flagPre = false;
		boolean flagVerb = false;
		boolean flagPost = false;

		for (Link link : links) {

			flagPre = false;
			flagVerb = false;
			flagPost = false;

			for (String verb : link.getVerbs()) {

				if (collator.equals(verb, verbTest)) {

					flagVerb = true;
					break;
				}
			}

			for (String preLabel : link.getPrelabel()) {

				if (collator.equals(preLabel, preLabelTest)) {

					flagPre = true;
					break;
				}
			}

			for (String postLabel : link.getPrelabel()) {

				if (collator.equals(postLabel, postLabelTest)) {

					flagPost = true;
					break;
				}
			}

			if (flagPre && flagVerb && flagPost)
				return true;
		}

		return false;
	}

	public ArrayList<Link> getLinks() {

		return links;
	}
}
