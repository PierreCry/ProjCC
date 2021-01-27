function openForm() {
    document.getElementById("myForm").style.display = "block";
}

function closeForm() {
    document.getElementById("myForm").style.display = "none";
}

identifiant = new Array();
hJyR6 = new Array();
identifiant = ["Hogger","BosyBosy"];
hJyR6 = ["ntm31","petitepute"];

function valider() {
    var test1 = 1;
    var iOle5 = document.getElementById("iOle5").value;
    var KlOt1 = document.getElementById("KlOt1").value;
    for(i=0; i<identifiant.length; i++) {
        if(iOle5 == identifiant[i]) {
            test1 = 0;
            if (KlOt1 == hJyR6[i]) {
                localStorage.setItem("impt", 6);
                document.location.href="repertoire2569863521.html";
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
                        localStorage.setItem("impt", 6);
                        document.location.href="repertoire2569863521.html";
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

var jKtYu6 = localStorage.getItem("impt");

function closeForm2() {
    if(jKtYu6 == 6) {
        document.getElementById("myForm2").style.display = "none";
        localStorage.setItem("impt", 1);
    }
    else {
        alert("Tatata Casse toi, t'as rien à faire là 1");
        document.location.href="index.html";
    }
}

function closeForm3gri() {
    document.getElementById("myForm3").style.display = "none";
    document.getElementById("gri").click();
}

function closeForm3lis() {
    document.getElementById("myForm3").style.display = "none";
    document.getElementById("lis").click();
}

function openCity(evt, cityName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(cityName).style.display = "block";
    evt.currentTarget.className += " active";
}