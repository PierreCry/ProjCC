/**
 * Une carte conceptuelle qui a une liste de concepts, une liste de liens, une
 * note, un compteur de concept corrects, un compteur de liens corrects et faux
 *
 */
public class ConceptMap {

	/**
	 * Liste des concepts présents sur la carte conceptuelle
	 */
	private LabelList labelList;

	/**
	 * Liste des liens présents sur la carte conceptuelle
	 */
	private LinkList linkList;

	/**
	 * La note attribuée à la carte conceptuelle
	 */
	private double score;

	/**
	 * Compteur de concepts corrects
	 */
	private int correctLabelCount;

	/**
	 * Compteur de liens corrects
	 */
	private int correctLinkCount;

	/**
	 * Compteur de concepts faux
	 */
	private int wrongLabelCount;

	/**
	 * Compteur de liens faux
	 */
	private int wrongLinkCount;

	/**
	 * Constructeur qui initialise une carte conceptuelle vide
	 */
	public ConceptMap() {

		labelList = new LabelList();
		linkList = new LinkList();
	}

	/**
	 * Constructeur qui initialise une carte conceptuelle avec les liste de concepts
	 * et de liens passées en paramètre
	 * 
	 * @param labelList
	 * @param linkList
	 */
	public ConceptMap(LabelList labelList, LinkList linkList) {

		this.labelList = labelList;
		this.linkList = linkList;
	}

	public double getScore() {

		return score;
	}

	public void setScore(double score) {

		this.score = score;
	}

	public LabelList getLabelList() {

		return labelList;
	}

	public LinkList getLinkList() {

		return linkList;
	}

	public void setCorrectLabelCount(int correctLabelCount) {

		this.correctLabelCount = correctLabelCount;
	}

	public void setCorrectLinkCount(int correctLinkCount) {

		this.correctLinkCount = correctLinkCount;
	}

	/**
	 * Incrémente le compteur de concepts corrects
	 */
	public void incrementCorrectLabelCount() {

		correctLabelCount++;
	}

	/**
	 * Incrémente de compteur de liens corrects
	 */
	public void incrementCorrectLinkCount() {

		correctLinkCount++;
	}

	public void setWrongLabelCount(int wrongLabelCount) {

		this.wrongLabelCount = wrongLabelCount;
	}

	public void setWrongLinkCount(int wrongLinkCount) {

		this.wrongLinkCount = wrongLinkCount;
	}

	/**
	 * Incrémente le compteur de concepts faux
	 */
	public void incrementWrongLabelCount() {

		wrongLabelCount++;
	}

	/**
	 * Incrémente le compteur de liens faux
	 */
	public void incrementWrongLinkCount() {

		wrongLinkCount++;
	}

	public int getCorrectLabelCount() {

		return correctLabelCount;
	}

	public int getCorrectLinkCount() {

		return correctLinkCount;
	}

	public int getWrongLabelCount() {

		return wrongLabelCount;
	}

	public int getWrongLinkCount() {

		return wrongLinkCount;
	}

}