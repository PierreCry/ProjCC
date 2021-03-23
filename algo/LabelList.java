import java.text.Collator;
import java.util.ArrayList;
import java.util.Locale;

/**
 * Classe d�crivant une liste de concepts.
 */
public class LabelList {

	/**
	 * Une liste de concepts
	 */
	private ArrayList<Label> labels;

	/**
	 * La liste de tous les mots clefs correspondant � tous les concepts que
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
	 * Constructeur qui initialise l'attribut labels avec le param�tre labels et qui
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
	 * V�rifie la pr�sence ou non du String label dans la LabelList. Utilise un
	 * java.text.Collator pour faire les comparison sans tenir compte des accents.
	 * Tous les Strings sont pass�s en minuscules.
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
	 * V�rifie la pr�sence ou non d'au moins un �l�ment du param�tre labels dans
	 * LabelList. Utilise un java.text.Collator pour faire les comparaison sans
	 * tenir compte des accents. Tous les Strings sont pass�s en minuscules.
	 * 
	 * @param labels
	 * @return true si au moins un �l�ment de label est pr�sent dans
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