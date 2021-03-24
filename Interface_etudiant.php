<!DOCTYPE html>
<html>

<head>
    <title>ConceptMappingToul</title>

    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <link rel="stylesheet" href="Style_etud.css" />
    <link href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300;0,400;0,600;0,700;0,800;1,300;1,400;1,600;1,700;1,800&display=swap" rel="stylesheet">

    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
    <script src="https://unpkg.com/konva@7.0.3/konva.min.js"></script>
    <script src="https://kit.fontawesome.com/5cfb8f8806.js" crossorigin="anonymous"></script>
    <script src="script_etud.js" type="text/javascript"></script>
    <script src="canvas.js" type="text/javascript"></script>
</head>

<body>
    <?php
        $ClassID = "Estimation";
        $ExamID = "SecondeSession";
        $JSON = '{"links":[{"from":0,"to":2,"verb":"entraîne"},{"from":1,"to":2,"verb":"entraîne"},{"from":2,"to":3,"verb":"entraîne"},{"from":2,    "to":4,"verb":"entraîne"},{"from":4,"to":5,"verb":"entraîne"}],"nodes":[{"name":"Perte d\'eau","x":138.22998992919986,"y":26.                46000372314429},{"name":"Perte de Na","x":299.33999975585937,"y":26.42000000000001},{"name":"Baisse de la volémie","x":184.31998687744215,   "y":131.85999493408235},{"name":"Réponse rénale","x":303.1199960327151,"y":237.87998651123132},{"name":"Baisse de la PSA","x":134.           73000024414057,"y":239.1799876708992},{"name":"Tachycardie de compensation","x":95.55997955322391,"y":340.3799825439464}]}';

        $conn = mysqli_connect('localhost:3306', 'pi', 'lmao', '');
        // $conn = mysqli_connect('localhost:3307', 'root', '', '');

        $JSON = mysqli_real_escape_string($conn, $JSON);

        if(!$conn){
            die("Connection failed: <br>". mysqli_connect_error());
        }
        
        $sql = "CREATE DATABASE IF NOT EXISTS ConceptMaps1";
        if ($conn->query($sql) === TRUE) {
        //  echo "Database created successfully <br>";
        } else {
        //  echo "Error creating database: <br>" . $conn->error;
        }
        
        $conn -> select_db("ConceptMaps1");
        
        // Pass StudentID from script_login.js
        $StudentID = $_POST['data'];
        
        $sql = "CREATE TABLE IF NOT EXISTS Student (StudentID VARCHAR(255) NOT NULL UNIQUE) CHARSET = utf8";
        if ($conn->query($sql) === TRUE) {
        //  echo "Table created successfully <br>";
        } else {
        //  echo "Error creating table: <br>" . $conn->error;
        }
        
        $sql = "CREATE TABLE IF NOT EXISTS Class (ClassID VARCHAR(255) NOT NULL UNIQUE) CHARSET = utf8";
        if ($conn->query($sql) === TRUE) {
        //  echo "Table created successfully <br>";
        } else {
        //  echo "Error creating table: <br>" . $conn->error;
        }
        
        $sql = "CREATE TABLE IF NOT EXISTS Exam (ExamID VARCHAR(255) NOT NULL UNIQUE) CHARSET = utf8";
        if ($conn->query($sql) === TRUE) {
        //  echo "Table created successfully <br>";
        } else {
        //  echo "Error creating table: <br>" . $conn->error;
        }
        
        $sql = "CREATE TABLE IF NOT EXISTS TableJointure (`StudentID` VARCHAR(255) NOT NULL, `ClassID` VARCHAR(255) NOT NULL, `ExamID` VARCHAR(255) NOT NULL, `JSON` TEXT(4294967295), `Note` VARCHAR(255), CONSTRAINT `uniqueAttributes` UNIQUE (StudentID, `ClassID`, `ExamID`, JSON(255))) CHARSET =  utf8";
        if ($conn->query($sql) === TRUE) {
        //  echo "Table created successfully <br>";
        } else {
        // echo "Error creating table: <br>" . $conn->error;
        }
        
        $sql = "INSERT INTO Student (StudentID) VALUES ('$StudentID')";
        if ($conn->query($sql) === TRUE) {
        //  echo "Informations inserted successfully <br>";
        } else {
        //  echo "Error inserting informations: <br>" . $conn->error;
        }
        
        $sql = "INSERT INTO Class (ClassID) VALUES ('$ClassID')";
        if ($conn->query($sql) === TRUE) {
        //  echo "Informations inserted successfully <br>";
        } else {
        //  echo "Error inserting informations: <br>" . $conn->error;
        }
        
        $sql = "INSERT INTO Exam (ExamID) VALUES ('$ExamID')";
        if ($conn->query($sql) === TRUE) {
        //  echo "Informations inserted successfully <br>";
        } else {
        //  echo "Error inserting informations: <br>" . $conn->error;
        }
        
        $sql = "INSERT INTO TableJointure (StudentID, ClassID, ExamID, JSON, Note) VALUES ('$StudentID', '$ClassID', '$ExamID', '$JSON', '')";
        if ($conn->query($sql) === TRUE) {
        //  echo "Informations inserted successfully <br>";
        } else {
        //  echo "Error inserting informations: <br>" . $conn->error;
        }

        $sql = "SELECT * FROM TableJointure";
        $result = $conn->query($sql);
        if ($result->num_rows > 0) {
            while($row = $result->fetch_assoc()) {
        //    echo "Json: " . $row["JSON"]. "<br>";
            }
        } else {
        //  echo "0 results <br>";
        }
        
    ?>
    
    <!-- Menu flottant pour le canvas -->
    <div id="floating-toolbar" class="floating-toolbar" style="display: none;">
        <span title="Supprimer ce concept"
           class="floating-toolbar__button floating-toolbar__button--delete fas fa-times">
        </span>
    </div>

    <!-- Nav Header -->
    <ul>
        <li><a class="t1 active" href="#Aide" onclick="openNav()">Aide</a></li>
        <li><a class="t1" href="#Nouveau" onclick="New()">Nouveau</a></li>
        <li><a class="t1" href="#Exporter">Exporter</a></li>
        <li><a class="t1" href="#Importer" onclick="openForm2()">Importer</a>
            <!--
            <ul style="display: none;">
                <li><input class="t1" type="file" onchange="importEtud(this)" accept=".json" multiple></li>
            </ul>
            -->
        </li>
        <li><a class="t1" href="#Télécharger" onclick="exportEtud()">Télécharger</a></li>
        
        <li style="float:right"><b class="t4 fas fa-sign-out-alt" onclick="openForm()"></b></li>
        <li style="float:right"><b class="t2 fas fa-redo" href="#redo_black"></b></li>
        <li style="float:right"><b class="t2 fas fa-undo" href="#undo_black"></b></li>
    </ul>

    <div id="myNav" class="overlay">
        <a href="javascript:void(0)" class="closebtn" onclick="closeNav()">&times;</a>
        <div class="overlay-content">
          <a class="t1">En cours de construction</a>
        </div>
    </div>

    <!-- Tabs -->
    <div class="tab" id="theTab">
        <button class="t5 tablinks" onclick="openTab(event,'1')" id="t1">Projet 1
            <close id="c1" onClick="reply_click(this.id)">&times;</close>
        </button>
    </div>

    <div class="content"></div>
        <div id="P1" class="tabcontent">
            <div class="row">
                <!-- Canvas -->
                <div class="column1">
                    <div id="canvas-container1" class="canvas-container">
                        <canvas id="canvas"></canvas>
                    </div>
                    <div class="icon-bar">
                        <a href="#"><i class="fas fa-mouse-pointer"><span>Manipuler le graphe</span></i></a> 
                        <a href="#"><i class="far fa-square"><span>Créer un concept</span></i></a> 
                        <a href="#"><i class="fas fa-external-link-alt"><span>Créer un lien</span></i></a> 
                        <a href="#"><i class="fas fa-compress-arrows-alt"><span>Recentre la carte</span></i></a>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="form-popup centrer" id="myForm">
        <form class="form-container">
            <label for="psw"><a class="t9">Voulez-vous vous déconnecter ?</a></label>
        
            <button type="button" class="btn" onclick="validate()">Oui</button>
            <button type="button" class="btn cancel" onclick="closeForm()">Non</button>
        </form>
    </div>

    <div class="form-popup2" id="myForm2">
        <form class="form-container2">
            <ul style="padding-top: 5px; padding-bottom: 5px;">
                <li style="float:right" class="t10">Importer depuis la base de donnée<button class="button button1" href="#run"><span class="t8">BDD</span></button></li>
                <li style="float:right" class="t10">Importer depuis l'ordinateur<input class="button button1" type="file" onchange="importEtud(this)" accept=".json" multiple></li>
            </ul>
        </form>
    </div>

    <!-- Footer -->
    <footer class="t6">&copy; Copyright Université Paul Sabatier - Tout droit réservé - Version 12</footer>

    <script>
        document.getElementById("t1").click();
    </script>

</body>

</html>