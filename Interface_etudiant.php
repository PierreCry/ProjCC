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
        error_reporting(0);

        session_start();

        // $conn = mysqli_connect('localhost:3306', 'pi', 'lmao', '');
        $conn = mysqli_connect('localhost:3307', 'root', '', '');

        if(!$conn){
            die("Connection failed: <br>". mysqli_connect_error());
        }
        
        $sql = "CREATE DATABASE IF NOT EXISTS ConceptMaps";
        if ($conn->query($sql) === TRUE) {
        //  echo "Database created successfully <br>";
        } else {
        //  echo "Error creating database: <br>" . $conn->error;
        }
        
        $conn -> select_db("ConceptMaps");
        
        // Pass StudentID from script_login.js
        if(empty($_SESSION['loggedIn']) ) {
            $_SESSION['loggedIn'] = $_POST['data'];
       }
        
        $StudentID = $_SESSION['loggedIn'];  

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
        
        $sql = "CREATE TABLE IF NOT EXISTS TableJointure (`StudentID` VARCHAR(255) NOT NULL, `ClassID` VARCHAR(255) NOT NULL, `ExamID` VARCHAR(255) NOT NULL, `JSON` TEXT(4294967295), `Note` VARCHAR(255), CONSTRAINT `uniqueAttributes` UNIQUE (StudentID, `ClassID`, `ExamID`)) CHARSET =  utf8";
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
        <li><a class="t1" href="#Exporter" onclick = "openForm3()">Exporter</a></li>
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

    <div class="form-popup2" id="myForm3">
        <form onsubmit = "return exportBDD()" class="form-container2" method = "post" name = "myForm" id = "myForm"> 
            Classe
                <select id = "classe" name = "classe">
                    <option value = "">Choisir</option>
                        <?php
                            $resultSet = $conn -> query("SELECT DISTINCT classID FROM tableJointure WHERE studentID = '" . $StudentID . "'");
                            $numResult = mysqli_num_rows($resultSet);
                            
                            for ($i = 0; $i < $numResult; $i++) {
                                $row = mysqli_fetch_array($resultSet); 
                        ?>


                        <option value = "<?php echo $row["classID"] ?> "> <?php echo $row["classID"]?></option>
                        <?php
                            }
                        ?>
                </select>
                <input placeholder = "Ajouter un nouveau" id = "newClass" type="text" name="newClass" id = "newClass"/><hr/>	   		   

                <hr/>
                Examen
                <select id = "examen" name = "examen">
                    <option value = "">Choisir</option>
                        <?php
                            $resultSet = $conn -> query("SELECT DISTINCT examID FROM tableJointure WHERE studentID = '" . $StudentID . "'");
                            $numResult = mysqli_num_rows($resultSet);
                            
                            for ($i = 0; $i < $numResult; $i++) {
                                $row = mysqli_fetch_array($resultSet); 
                        ?>

                        <option value = "<?php echo $row["examID"] ?> "> <?php echo $row["examID"]?></option>
                        <?php
                            }
                        ?>
                <input placeholder = "Ajouter un nouveau" id = "newExam" type="text" name="newExam"/><hr/>	   		   
                <input placeholder="" type = "hidden" id = "test1" name = "test1" value=""/>
                <input type="submit" id = "ExporterBDD" name="ExporterBDD" value="Exporter vers la BDD"/>

        </form>
    </div>

    <script>
        function exportBDD(){

            $JSON = canvas_to_json();
            document.getElementById("test1").value = canvas_to_json();

            var classeMenu = document.getElementById("classe");
            var classeUser = classeMenu.options[classeMenu.selectedIndex].text;

            var examenMenu = document.getElementById("examen");
            var examenUser = examenMenu.options[examenMenu.selectedIndex].text;

            if(classeUser == "Choisir"){
                var classeMenu = document.getElementById("newClass");
                if(classeMenu.placeholder){
                    var classeUser = classeMenu.value;
                }
            }

            if(examenUser == "Choisir"){
                var examenMenu = document.getElementById("newExam");
                if(examenMenu.placeholder){
                    var examenUser = examenMenu.value;
                }
            }
            return true;

        }
        var f = document.getElementById("myForm");
        f.setAttribute('method',"post");
        f.setAttribute('action', 'Interface_etudiant.php')

    </script>

    <?php            
        if($_POST['examen'] == "" and isset($_POST['newExam'])){
            $newExam = $_POST['newExam'];
        }
        else{
            $newExam = $_POST['examen'];
        }

        if($_POST['classe'] == "" and isset($_POST['newClass'])){
            $newClass = $_POST['newClass'];
        }
        else{
            $newClass = $_POST['classe'];
        }

        if($newExam && $newClass){
            $sql = "INSERT INTO Class (ClassID) VALUES ('$newClass')";
            if ($conn->query($sql) === TRUE) {
            //  echo "Informations inserted successfully <br>";
            } else {
            //  echo "Error inserting informations: <br>" . $conn->error;
            }
            
            $sql = "INSERT INTO Exam (ExamID) VALUES ('$newExam')";
            if ($conn->query($sql) === TRUE) {
            //  echo "Informations inserted successfully <br>";
            } else {
            //  echo "Error inserting informations: <br>" . $conn->error;
            }

           $JSON = $_POST['test1'];
           $JSON = mysqli_real_escape_string($conn, $JSON);

            $sql = "IF NOT EXISTS (SELECT * FROM TableJointure WHERE StudentID = '$StudentID' AND 
                                                                         ClassID = '$newClass' AND 
                                                                         ExamID = '$newExam')
                
                    THEN
                        INSERT INTO TableJointure (StudentID, ClassID, ExamID, JSON, Note) 
                        VALUES 
                        ('$StudentID', '$newClass', '$newExam', '$JSON', '');

                    ELSE
                        UPDATE TableJointure SET TableJointure.JSON = '$JSON' WHERE StudentID = '$StudentID' AND
                                                                                    ClassID = '$newClass' AND
                                                                                    ExamID = '$newExam';

                    END IF";

            if ($conn->query($sql) === TRUE) {
            //  echo "Informations inserted successfully <br>";
            } else {
                echo "Error inserting informations: <br>" . $conn->error;
            }
        }

    ?>

    <!-- Footer -->
    <footer class="t6">&copy; Copyright Université Paul Sabatier - Tout droit réservé - Version 12</footer>

    <script>
        document.getElementById("t1").click();
    </script>

</body>

</html>