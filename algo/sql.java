package sql;

import java.sql.*;

public class sql{
		
	public static void main(String[] args) {
		// CONNECTION
		Connection conn = null;
		String url = "jdbc:mysql://localhost:3307/";
		String dbName1 = "classid";
		String dbName2 = "employees";
		String driver = "com.mysql.cj.jdbc.Driver";
		String userName = "root";
		String password = "";
		String f1, f2;
		
		try {
			Class.forName(driver);
			conn = DriverManager.getConnection(url + dbName1, userName, password);
			System.out.println("Connected to the student database");
			// CONNECTION END
			
			// RETRIEVE INFORMATION FROM DATABASE
			String query = "Select * FROM studentid";
			Statement stmt1 = conn.createStatement();
			ResultSet rs = stmt1.executeQuery(query);
			
			while (rs.next()){
				f1 = rs.getString(1);
				f2 = rs.getString(2);
				System.out.println(f1 + "  " + f2);
			} 
			// RETRIEVE INFORMATION FROM DATABASE END
			
			conn = DriverManager.getConnection(url + dbName2, userName, password);
			Statement stmt2 = conn.createStatement();

			System.out.println("Connected to the employee database");
			// ADD NEW FUNCTION ON DATABASE
		    String query2 = "CREATE FUNCTION IF NOT EXISTS getDob(emp_name VARCHAR(50)) RETURNS DATE " + 
		    			    "BEGIN " +
		    	            "DECLARE dateOfBirth DATE; " +
		    	            "SELECT DOB into dateOfBirth FROM employeedetails where Name = emp_name; " +
		    	            "RETURN dateOfBirth; " +
		    	            "END";
		      
		    stmt2.execute(query2);
		    System.out.println("Function Created");
			// ADD NEW FUNCTION ON DATABASE END

		    // CALL FUNCTION TO GET DATE DATE OF BIRTH OF THE EMPLOYEE HAVING NAME "AMIT"
		    CallableStatement cstmt = conn.prepareCall("{? = call getDob(?)}"); 
		    // Registering the out parameter of the function (return type)
		    cstmt.registerOutParameter(1, Types.DATE);
		    // Setting the input parameters of the function
		    cstmt.setString(2, "Amit");
		    // Executing the statement
		    cstmt.execute();
	
		    System.out.print("Date of birth: " + cstmt.getDate(1));
		    // CALL FUNCTION TO GET DATE DATE OF BIRTH OF THE EMPLOYEE HAVING NAME "AMIT" END
		    
			conn.close();
			System.out.println("\nDisconnected from database");
			} 
		
		catch(ClassNotFoundException e) {
			e.printStackTrace();
			}
		
		catch(SQLException e) {
			e.printStackTrace();
			}
		
		catch (Exception e) {
			e.printStackTrace();
			}
		}
	}