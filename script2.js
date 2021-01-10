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

var nb_fen = 1;

function New() {

    nb_fen++;

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
                        '<a href="#"><i class="far fa-square"><span>Créer un concept</span></i></a>' +
                        '<a href="#"><i class="fas fa-external-link-alt"><span>Créer un lien</span></i></a>' +
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
}