import java.text.Collator;
import java.util.ArrayList;
import java.util.Locale;

/**
 * Classe décrivant une liste de concepts.
 */
public class LabelList {

	/**
	 * Une liste de concepts
	 */
	private ArrayList<Label> labels;

	/**
	 * La liste de tous les mots clefs correspondant à tous les concepts que
	 * contient la LabelList.
	 */
	private ArrayList<String> globalLabelNames;

	/**
	 * Constructeur qui initialise Labels et globalLabelNames avec des
	 * ArrayList<String> vides.
	 */
	public LabelList() {

		labels = new ArrayList<>();
		globalLabelNames = new ArrayList<>();
	}

	/**
	 * Constructeur qui initialise l'attribut labels avec le paramètre labels et qui
	 * remplit globalLabelNames en fonction de cette liste.
	 * 
	 * @param labels
	 */
	public LabelList(ArrayList<Label> labels) {

		this.labels = labels;

		globalLabelNames = new ArrayList<>();

		for (Label l : labels) {

			globalLabelNames.addAll(l.getKeywords());
		}
	}

	/**
	 * Ajoute un nouveau Label dans labels et ajoute ses mots clefs dans
	 * gloablLabelNames.
	 * 
	 * @param label
	 */
	public void addLabel(Label label) {

		labels.add(label);

		globalLabelNames.addAll(label.getKeywords());
	}

	/**
	 * Vérifie la présence ou non du String label dans la LabelList. Utilise un
	 * java.text.Collator pour faire les comparison sans tenir compte des accents.
	 * Tous les Strings sont passés en minuscules.
	 * 
	 * @param label
	 * @return true si LabelList contient label, false sinon
	 */
	public boolean contains(String label) {

		Collator collator = Collator.getInstance(Locale.FRENCH);
		collator.setStrength(Collator.PRIMARY);

		label = Normalizer.ToLowerCase(label);

		for (String s : globalLabelNames) {

			if (collator.equals(s, label))
				return true;
		}

		return false;
	}

	/**
	 * Vérifie la présence ou non d'au moins un élément du paramètre labels dans
	 * LabelList. Utilise un java.text.Collator pour faire les comparaison sans
	 * tenir compte des accents. Tous les Strings sont passés en minuscules.
	 * 
	 * @param labels
	 * @return true si au moins un élément de label est présent dans
	 *         golablLabelNames, false sinon
	 */
	public boolean contains(ArrayList<String> labels) {

		Collator collator = Collator.getInstance(Locale.FRENCH);
		collator.setStrength(Collator.PRIMARY);

		for (String label : labels) {
			label = label.toLowerCase();

			for (Label refLab : this.labels) {

				for (String s : refLab.getKeywords()) {

					if (collator.equals(s, label)) {

						refLab.IncrementOccurrence();
						return true;
					}
				}
			}
		}

		return false;
	}

	public ArrayList<Label> getLabels() {

		return labels;
	}
}