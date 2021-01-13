function openCity(evt,project) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace("active", "");
    }
    document.getElementById("P"+project.toString()).style.display = "block";
    evt.currentTarget.className += " active";
}

var nb_fen;
var i;
list = new Array();
for(i=0;i<15;i++){
    list[i] = 0;
}
list[0] = 1;

function New() {

    i = -1;
    do{
        i++;
        nb_fen = list[i];
    }while(nb_fen!=0 && nb_fen!=10)
    if(nb_fen==10){
        alert("Il y a trop d'onglets pour en créer un nouveau !");
    }

    else{
        nb_fen = i+1;
        list[i] = nb_fen;

        var tab = '<button class="t5 tablinks" onclick="openCity(event,'+ nb_fen + ')" id="t'+ nb_fen +'">Projet ' + nb_fen + '<close id="c'+ nb_fen +'" onClick="reply_click(this.id)">&times;</close></button>';

        $(".tab").append(
            tab
        );

        $(".content").append( 
            '<div id="P' + nb_fen + '" class="tabcontent">' +
                '<div class="row">' +
                    '<!-- Canvas menu -->' +
                    '<div class="column3">' +
                        '<div class="icon-bar">' +
                            '<a href="#"><i class="fas fa-mouse-pointer"><span>Manipuler le graphe</span></i></a>' +
                            '<a href="#"><k class="far fa-square"><span>Valider un concept</span></k></a>' +
                            '<a href="#"><j class="far fa-square"><span>Invalider un concept</span></j></a>' +
                            '<a href="#"><k class="fas fa-external-link-alt"><span>Valider un lien</span></k></a>' +
                            '<a href="#"><j class="fas fa-external-link-alt"><span>Invalider un lien</span></j></a>' +
                            '<a href="#"><i class="fas fa-compress-arrows-alt"><span>Recentre la carte</span></i></a>' +
                        '</div>' +
                    '</div>' +
                    '<!-- Canvas -->' +
                    '<div class="column1">' +
                        '<div id="canvas-container">' +
                            '<canvas id="canvas"></canvas>' +
                        '</div>' +
                    '</div>' +
                    '<!-- Marked for tags -->' +
                    '<div class="column2">' +
                        '<div id="option-container">' +
                            '<input class="t7 form-control" type="text" placeholder="Rechercher" aria-label="Rechercher" style="margin: 0px 0px 2% 0px; width: 100%;">' +
                        '</div>' +
                        '<div id="marked-container">' +
                            '<textarea id="marked"></textarea>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>'
        );

        var tabid = 't'.concat(nb_fen);
        document.getElementById(tabid).click();
    }
}

function openNav() {
    document.getElementById("myNav").style.width = "100%";
}

function closeNav() {
    document.getElementById("myNav").style.width = "0%";
}

function reply_click(clicked_id){
    var tabbuttonid = 't'.concat(clicked_id.substr(1));
    var tabid = 'P'.concat(clicked_id.substr(1));
    var tabbutton = document.getElementById(tabbuttonid);
    var tab = document.getElementById(tabid);
    tabbutton.remove(tabbutton);
    tab.remove(tab);
    var num = parseInt(clicked_id.substr(1));
    list[num-1] = 0;
}

var test = 0;

function openForm() {
    if(test == 0) {
        document.getElementById("myForm").style.display = "block";
        test = 1;
    }
    else {
        document.getElementById("myForm").style.display = "none";$
        test = 0;
    }
}
  
function closeForm() {
    document.getElementById("myForm").style.display = "none";
    test = 0;
}

function validate() { 
    document.location.href="index.html";
}