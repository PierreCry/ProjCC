function openForm() {
    document.getElementById("myForm").style.display = "block";
    document.getElementById("titre").style.display = "none";
}

function closeForm() {
    document.getElementById("myForm").style.display = "none";
    document.getElementById("titre").style.display = "block";
}

identifiant = new Array();
hJyR6 = new Array();
identifiant = ["etudiant","prof"];
hJyR6 = ["123","123"];

//Fonctionne en cliquant
function valider() {
    var test1 = 1;
    var iOle5 = document.getElementById("iOle5").value;
    var KlOt1 = document.getElementById("KlOt1").value;
    for(i=0; i<identifiant.length; i++) {
        if(iOle5 == identifiant[i]) {
            test1 = 0;
            if (KlOt1 == hJyR6[i]) {
                if(iOle5 == "prof") {
                    document.location.href="Interface_correcteur.html";
                }
                else {
                    document.location.href="Interface_etudiant.html";
                }
            }
            else {
                alert("Mot de passe incorrect");
                break;
            }
        }  
    }
    if(test1 == 1) {
        alert("Identifiant incorrect");
    }
}

//Fonctionne en avec la touche "entrer"
$(document).ready(function() {
    $("#KlOt1").keydown(function(e) {
        var test1 = 1;
        var iOle5 = document.getElementById("iOle5").value;
        var KlOt1 = document.getElementById("KlOt1").value;
        if(e.which==13) {
            for(i=0; i<identifiant.length; i++) {
                if(iOle5 == identifiant[i]) {
                    test1 = 0;
                    if (KlOt1 == hJyR6[i]) {
                        if(iOle5 == "prof") {
                            document.location.href="Interface_correcteur.html";
                        }
                        else {
                            document.location.href="Interface_etudiant.html";
                        }
                    }
                    else {
                        alert("Mot de passe incorrect");
                        break;
                    }
                }  
            }
            if(test1 == 1) {
                alert("Identifiant incorrect");
            }
        }    
        
    }); 
});