var currentWindow = "t1";
var nb_fen;
var i;
list = new Array();
const canvasMapList = new Array();

for (i=0;i<15;i++) { list[i] = 0; }
list[0] = 1;

window.addEventListener('DOMContentLoaded', () => {
    const mapJSON = `{"links":[{"from":0,"to":2,"verb":"entraîne"},{"from":1,"to":2,"verb":"entraîne"},{"from":2,"to":3,"verb":"entraîne"},{"from":2,"to":4,"verb":"entraîne"},{"from":4,"to":5,"verb":"entraîne"}],"nodes":[{"name":"Perte d'eau","x":138.22998992919986,"y":26.46000372314429},{"name":"Perte de Na","x":299.33999975585937,"y":26.42000000000001},{"name":"Baisse de la volémie","x":184.31998687744215,"y":131.85999493408235},{"name":"Réponse rénale","x":303.1199960327151,"y":237.87998651123132},{"name":"Baisse de la PSA","x":134.73000024414057,"y":239.1799876708992},{"name":"Tachycardie de compensation","x":95.55997955322391,"y":340.3799825439464}]}`
    const map = JSON.parse(mapJSON)
    const container = document.getElementById('canvas-container1')
    canvasMapList.push(createCanvasMap(container,map))
})

function openTab(evt,project) {
    console.log(canvasMapList)
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
    currentWindow = project;
}

function importEtudDB(){
    let map = '<?php echo json_encode($json); ?>';
    New(map);
}

function New(map = { nodes: [], links: [] }) {

    i = -1;
    do {
        i++;
        nb_fen = list[i];
    } while (nb_fen!=0 && nb_fen!=10)

    if (nb_fen==10) {
        alert("Il y a trop d'onglets pour en créer un nouveau !");
    } else {
        nb_fen = i+1;
        list[i] = nb_fen;

        var tab = '<button class="t5 tablinks" onclick="openTab(event,'+ nb_fen + ')" id="t'+ nb_fen +'">Projet ' + nb_fen + '<close id="c'+ nb_fen +'" onClick="reply_click(this.id)">&times;</close></button>';

        $(".tab").append(
            tab
        );

        $(".content").append(
            '<div id="P' + nb_fen + '" class="tabcontent">' +
                '<div class="row">' +
                    '<!-- Canvas menu -->' +
                    '<div class="column1">' +
                        '<div id="canvas-container'+nb_fen+'" class="canvas-container"></div>' +
                        '<div class="icon-bar">' +
                            '<a href="#"><i class="fas fa-mouse-pointer"><span>Manipuler le graphe</span></i></a>' +
                            '<a href="#"><i class="far fa-square"><span>Créer un concept</span></i></a>' +
                            '<a href="#"><i class="fas fa-external-link-alt"><span>Créer un lien</span></i></a>' +
                            '<a href="#"><i class="fas fa-compress-arrows-alt"><span>Recentre la carte</span></i></a>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>'
        );

        var tabid = 't'.concat(nb_fen);
        document.getElementById(tabid).click();

        // Création d'une carte vierge dans le nouvel onglet
        var container = document.getElementById(`canvas-container${nb_fen}`);
        canvasMapList.push(createCanvasMap(container,map));
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
    num--;
    var newid = 't'.concat(num.toString());
}

//Form-popup 1 **************************

var test = 0;

function openForm() {
    if(test == 0) {
        document.getElementById("myForm").style.display = "block";
        test = 1;
    }
    else {
        document.getElementById("myForm").style.display = "none";
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

//Form-popup 2 **************************

var test2 = 0;

function openForm2() {
    if(test2 == 0) {
        document.getElementById("myForm2").style.display = "block";
        test2 = 1;
        if(test3 == 1) {
            document.getElementById("myForm3").style.display = "none";
            test3 = 0;
        }
    }
    else {
        document.getElementById("myForm2").style.display = "none";
        test2 = 0;
    }
}

function closeForm2() {
    document.getElementById("myForm2").style.display = "none";
    test2 = 0;
}

var test3 = 0;

function openForm3() {
    if(test3 == 0) {
        document.getElementById("myForm3").style.display = "block";
        test3 = 1;
        if(test2 == 1) {
            document.getElementById("myForm2").style.display = "none";
            test2 = 0;
        }
    }
    else {
        document.getElementById("myForm3").style.display = "none";
        test3 = 0;
    }
}

function closeForm3() {
    document.getElementById("myForm3").style.display = "none";
    test3 = 0;
}

//***************************************

function importEtud(input) {
    let files = input.files;
    for (var i = 0; i < files.length; i++) {
        let reader = new FileReader();
        reader.readAsText(files[i]);
        reader.onload = function() {
            let map = JSON.parse(reader.result);
            New(map);
        };
        reader.onerror = function() {
            console.log(reader.error);
        };
    }
}

function findStage(container) {
    // let gLinks = []; let gNodes = [];
    // for (var i=0; i<canvasMapList.length; i++) {
    //     if (canvasMapList[i].container == container) {
    //         gLinks = canvasMapList[i].gLinks
    //         gNodes = canvasMapList[i].gNodes
    //     }
    // }
    // return [gLinks,gNodes];

    return canvasMapList.find(e => e.container === container);
}

// function writeJSON(gAll) {

//     // link
//     let JSON = `{"links":[`
//     gAll[0].forEach(element => {
//         link = element.link;
//         JSON = JSON + `{"from":` + link.from + `,"to":` + link.to + `,"verb":"` + link.verb + `"},`;
//     });
//     JSON = JSON.slice(0,-1);

//     // node
//     JSON = JSON + `],"nodes":[`
//     gAll[1].forEach(element => {
//         node = element.node;
//         JSON = JSON + `{"name":"` + node.name + `","x":` + node.x + `,"y":` + node.y + `},`;
//     });
//     JSON = JSON.slice(0,-1);
//     JSON = JSON + `]}`

//     return JSON

// }

function canvas_to_json() {
    var container = document.getElementById('canvas-container'+currentWindow);
    let canvasMap = findStage(container);

    // let gAll = findStage(container);
    // if (gAll[0].length == 0 && gAll[1].length == 0) {
    //     window.alert("Rien à exporter")
    // } else {
    //     return writeJSON(gAll);
    // }

    if (!canvasMap) {
        window.alert("Rien à exporter");
        return '';
    }

    return canvasMap.getMapJSON();
}

function download(content, fileName, contentType) {
    const a = document.createElement("a");
    const file = new Blob([content],{type:contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}

function exportEtud() {
    var json = canvas_to_json();
    var filename = prompt("Entrez le nom de votre fichier !", "Projet "+currentWindow);
    download(json, filename+".json", "text/plain");
}

$(document).ready(function() {
    $("#mdp").keydown(function(e) {
        if(e.which==13){
            var str = document.getElementById("mdp").value;
            if (str == "123") {
                e.preventDefault();
                document.location.href="Interface_correcteur.html";
            }
            else {
                alert("Mot de passe incorrect");
            }
        }
    });
});
