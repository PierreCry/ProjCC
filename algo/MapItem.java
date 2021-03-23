/**
 * Classe abstraite de laquelle h�rite les classes Label et Link.
 */
public abstract class MapItem {

	/**
	 * L'�tat (corect, faux ou neutre) du mot clef ou du lien.
	 */
	protected State state;

	/**
	 * Le poids du mot clef ou du lien qui sera utilis� lors du calcul de la note.
	 */
	protected double weight;

	/**
	 * Le nombre de fois que l'on rencontre le mot clef ou le lien dans l'ensemble
	 * des cartes conceptuelles corrig�es.
	 */
	protected int occurrence;

	/**
	 * Contructeur qui initialise l'�tat � neutre, le poids � un et l'occurrence �
	 * 0.
	 */
	public MapItem() {

		state = State.DEFAULT;
		weight = 1;
		occurrence = 0;
	}

	public State getState() {

		return state;
	}

	public void setState(State state) {

		this.state = state;
	}

	/**
	 * Incr�mente l'occurrence.
	 */
	public void IncrementOccurrence() {
		occurrence++;
	}

	public double getWeight() {

		return weight;
	}

	public void setWeight(double weight) {

		this.weight = weight;
	}

	public int getOccurence() {

		return occurrence;
	}
}