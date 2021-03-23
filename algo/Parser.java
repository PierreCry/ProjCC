import org.json.JSONArray;
import org.json.JSONObject;

/**
 * Parser qui retourne une carte conceptuelle � partir d'un fichier JSon export�
 * de ConceptMappingToul
 */
public class Parser {

	/**
	 * @param json JSon export� du CMT
	 * @return une carte conceptuelle
	 */
	public static ConceptMap parse2map(String json) {

		JSONObject obj = new JSONObject(json);

		ConceptMap map = new ConceptMap();

		JSONArray links = obj.getJSONArray("links");
		JSONArray nodes = obj.getJSONArray("nodes");

		for (Object s : nodes) {

			String tmp = ((JSONObject) s).get("name").toString();

			map.getLabelList().addLabel(new Label(tmp));
		}

		for (Object s : links) {

			Link tmp = new Link(map.getLabelList().getLabels().get(((JSONObject) s).getInt("from")),
					((JSONObject) s).get("verb").toString(),
					map.getLabelList().getLabels().get(((JSONObject) s).getInt("to")));

			map.getLinkList().addLink(tmp);
		}

		return map;
	}
}