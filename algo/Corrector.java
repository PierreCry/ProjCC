/**
 * Algorithme de correction automatique. Les listes de concept et de liens faux
 * et corrects ainsi que la carte conceptuelle corrigées sont récupérées de la
 * base de données à l'aide de DatabaseConnector.
 */
public class Corrector {

	public static LabelList correctLabels, wrongLabels;
	public static LinkList correctLinks, wrongLinks;

	public static ConceptMap myMap;

	public static void main(String[] args) {

		myMap = new ConceptMap();

		for (Label lab : myMap.getLabelList().getLabels()) {

			if (correctLabels.contains(lab.getKeywords())) {

				lab.setState(State.CORRECT);
				myMap.incrementCorrectLabelCount();
			}
		}

		for (Label lab : myMap.getLabelList().getLabels()) {

			if (wrongLabels.contains(lab.getKeywords())) {

				lab.setState(State.WRONG);
			}
		}

		for (Link link : myMap.getLinkList().getLinks()) {

			if (correctLinks.contains(link.getLink().get(0).get(0), link.getLink().get(1).get(0),
					link.getLink().get(2).get(0))) {

				link.setState(State.CORRECT);
				myMap.incrementCorrectLinkCount();
			}
		}

		for (Link link : myMap.getLinkList().getLinks()) {

			if (wrongLinks.contains(link.getLink().get(0).get(0), link.getLink().get(1).get(0),
					link.getLink().get(2).get(0))) {

				link.setState(State.WRONG);
			}
		}
	}
}