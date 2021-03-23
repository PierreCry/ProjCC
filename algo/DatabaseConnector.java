import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

/**
 * Se connecte à la base de données et récupère les informations nécessaire pour
 * lancer l'algorithme de correction automatique
 */
public class DatabaseConnector {
	// A COMPLETER
	static final String JDBC_DRIVER = "com.mysql.jdbc.Driver";
	static final String DB_URL = "jdbc:mysql://localhost/A_COMPLETER";

	static final String USER = "usr";
	static final String PASS = "pwd";

	//

	public DatabaseConnector() {

		Connection conn = null;

		try {

			Class.forName(JDBC_DRIVER);

			System.out.println("Connecting to a selected database...");
			conn = DriverManager.getConnection(DB_URL, USER, PASS);
			System.out.println("Connected to database successfully");

			/*
			 * 
			 * FAIRE DES TRUCS LA
			 * 
			 * 
			 */
		} catch (SQLException se) {

			se.printStackTrace();
		} catch (Exception e) {

			e.printStackTrace();
		} finally {

			try {

				if (conn != null)
					conn.close();
			} catch (SQLException se) {

				se.printStackTrace();
			}
		}

		System.out.println();
	}
}