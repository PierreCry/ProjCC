import java.text.Collator;
import java.util.ArrayList;
import java.util.Locale;

/**
 * Classe décrivant un lien.
 */
public class Link extends MapItem {

	/**
	 * La liste des verbes qui peuvent correspondre au même lien.
	 */
	private ArrayList<String> verbs;

	/**
	 * La liste des mots clefs que l'on peut trouver en amont de ce lien.
	 */
	private ArrayList<String> preLabels;

	/**
	 * La liste des mots clefs que l'on peut trouver en aval de ce lien.
	 */
	private ArrayList<String> postLabels;

	/**
	 * Une liste regroupant les trois listes verbs, preLabels, postLabels.
	 */
	private ArrayList<ArrayList<String>> config;

	/**
	 * Constructeur qui prend en paramètres une ArrayList<ArrayList<String>> pour
	 * initialiser les listes verbs, preLabels, postLabels. Tous les Strings sont
	 * passés en minuscules.
	 * 
	 * @param config
	 */
	public Link(ArrayList<ArrayList<String>> config) {

		super();

		config.set(0, Normalizer.ToLowerCase(config.get(0)));
		config.set(1, Normalizer.ToLowerCase(config.get(1)));
		config.set(2, Normalizer.ToLowerCase(config.get(2)));

		verbs = config.get(1);
		preLabels = config.get(0);
		postLabels = config.get(2);

		this.config = config;
	}

	/**
	 * Constructeur qui prend en paramètres trois ArrayList<String> pour initialiser
	 * verbs, preLabels, postLabels. Tous les Strings sont passés en minuscules.
	 * 
	 * @param preLabels
	 * @param verbs
	 * @param postLabels
	 */
	@SuppressWarnings("serial")
	public Link(ArrayList<String> preLabels, ArrayList<String> verbs, ArrayList<String> postLabels) {

		super();

		this.preLabels = Normalizer.ToLowerCase(preLabels);
		this.verbs = Normalizer.ToLowerCase(verbs);
		this.postLabels = Normalizer.ToLowerCase(postLabels);

		this.config = new ArrayList<ArrayList<String>>() {
			{
				add(preLabels);
				add(verbs);
				add(postLabels);
			}
		};
	}

	/**
	 * Constructeur qui prend en paraètres deux Labels pour initialiser preLabel et
	 * postLabel et un String pour initialiser verbs. Tous les Strings sont passés
	 * en minuscules.
	 * 
	 * @param preLabel
	 * @param verb
	 * @param postLabel
	 */
	@SuppressWarnings("serial")
	public Link(Label preLabel, String verb, Label postLabel) {

		super();

		this.preLabels = new ArrayList<>(preLabel.getKeywords());
		this.postLabels = new ArrayList<>(postLabel.getKeywords());
		this.verbs = new ArrayList<String>() {
			{
				add(verb);
			}
		};

		this.config = new ArrayList<ArrayList<String>>() {
			{
				add(preLabels);
				add(verbs);
				add(postLabels);
			}
		};
	}

	/**
	 * Ajoute un nouveau mot clef à la liste preLabel. Le String est passé en
	 * minuscules.
	 * 
	 * @param newLabel
	 */
	public void addPreLabel(String newLabel) {

		this.preLabels.add(Normalizer.ToLowerCase(newLabel));
	}

	/**
	 * Ajoute un nouveau mot clef à la liste postLabel. Le String est passé en
	 * minuscules.
	 * 
	 * @param newLabel
	 */
	public void addPostLabel(String newLabel) {

		this.postLabels.add(Normalizer.ToLowerCase(newLabel));
	}

	/**
	 * Ajoute un nouveau verbe à la liste verbs Le String est passé en minuscules
	 * 
	 * @param newVerb
	 */
	public void addVerb(String newVerb) {

		this.verbs.add(Normalizer.ToLowerCase(newVerb));
	}

	/**
	 * Vérifie la présence du triplet preLabelTest, verbTest, postLabelTest dans les
	 * trois listes preLabels, verbs, postLabels. La méthode utilise un
	 * java.text.Collator pour faire les comparaisons de String sans tenir compte
	 * des accents. Tous les Strings sont passés en minuscules.
	 * 
	 * @param preLabelTest
	 * @param verbTest
	 * @param postLabelTest
	 * @return true si le triplet est contenu dans les liste, false sinon
	 */
	public boolean contains(String preLabelTest, String verbTest, String postLabelTest) {

		Collator collator = Collator.getInstance(Locale.FRENCH);
		collator.setStrength(Collator.PRIMARY);

		boolean flagPre = false;
		boolean flagVerb = false;
		boolean flagPost = false;

		preLabelTest = Normalizer.ToLowerCase(preLabelTest);
		postLabelTest = Normalizer.ToLowerCase(postLabelTest);
		verbTest = Normalizer.ToLowerCase(verbTest);

		for (String s : preLabels) {

			if (collator.equals(s, preLabelTest))
				flagPre = true;
		}

		for (String s : verbs) {

			if (collator.equals(s, verbTest))
				flagVerb = true;
		}

		for (String s : postLabels) {

			if (collator.equals(s, postLabelTest))
				flagPost = true;
		}

		if (flagPre && flagVerb && flagPost)
			return true;

		return false;
	}

	public ArrayList<ArrayList<String>> getLink() {

		return config;
	}

	public ArrayList<String> getVerbs() {

		return verbs;
	}

	public ArrayList<String> getPrelabel() {

		return preLabels;
	}

	public ArrayList<String> getPostlabel() {

		return postLabels;
	}
}