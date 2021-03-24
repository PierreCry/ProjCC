
class Concepts {
    constructor(label,value) {
        this.label = label;
        this.value = value;
        this.synonyms = [];
    }
    get label() { return this.label; }
    get value() { return this.value; }
    get synonyms() { return this.synonyms; }
    addSynonyms(label) { this.synonyms.push(new Concepts(label,this.value)); }
}

class Liens {
    constructor(verb,preLabel,postLabel,value) {
        this.verb = verb;
        this.preLabel = preLabel;
        this.postLabel = postLabel;
        this.value = value;
        this.synonyms = [];
    }
    get verb() { return this.verb; }
    get preLabel() { return this.preLabel; }
    get postLabel() { return this.postLabel; }
    get value() { return this.value; }
    get synonyms() { return this.synonyms; }
    addSynonyms(verb,preLabel,postLabel) { this.synonyms.push(new Liens(verb,preLabel,postLabel,this.value)); }
}

var ConceptsValide = [new Concepts("CV1",1),new Concepts("CV2",1)];
var ConceptsNeutre = [new Concepts("CN1",0),new Concepts("CN2",0)];
var ConceptsInvalide = [new Concepts("CI1",2),new Concepts("CI2",2)];
var LiensValide = [new Liens("LV1verb","LV1pre","LV1post",1),new Liens("LV2verb","LV2pre","LV2post",1)];
var LiensNeutre = [new Liens("LN1verb","LN1pre","LN1post",0),new Liens("LN2verb","LN2pre","LN2post",0)];
var LiensInvalide = [new Liens("LI1verb","LI1pre","LI1post",2),new Liens("LI2verb","LI2pre","LI2post",2)];
 
function openTab(evt,project) {
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

function openTab2(evt, name) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent2");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks2");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(name).style.display = "block";
    evt.currentTarget.className += " active";
}

function openTab3(evt, name) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent3");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks3");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(name).style.display = "block";
    evt.currentTarget.className += " active";
}

function openTab4(evt, name) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent4");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks4");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(name).style.display = "block";
    evt.currentTarget.className += " active";
}

function openNav() {
    document.getElementById("myNav").style.width = "100%";
}

function closeNav() {
    document.getElementById("myNav").style.width = "0%";
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

// Create a new list item when clicking on the "Add" button
$(document).ready(function() {
    $("#myInput1").keyup(function(e) {
        if(e.which==13) {
            var li = document.createElement("li");
            var inputValue = document.getElementById("myInput1").value;
            var t = document.createTextNode(inputValue);
            li.appendChild(t);
            if (inputValue === '') {
            alert("You must write something!");
            } else {
            document.getElementById("myUL1").appendChild(li);
            }
            document.getElementById("myInput1").value = "";
        
            var span = document.createElement("SPAN");
            var txt = document.createTextNode("\u00D7");
            span.className = "close2";
            span.appendChild(txt);
            li.appendChild(span);
        
            for (i = 0; i < close.length; i++) {
                close[i].onclick = function() {
                    var div = this.parentElement;
                    div.style.display = "none";
                }
            }
        }
    });
});

$(document).ready(function() {
    $("#myInput2").keyup(function(e) {
        if(e.which==13) {
            var li = document.createElement("li");
            var inputValue = document.getElementById("myInput2").value;
            var t = document.createTextNode(inputValue);
            li.appendChild(t);
            if (inputValue === '') {
            alert("You must write something!");
            } else {
            document.getElementById("myUL2").appendChild(li);
            }
            document.getElementById("myInput2").value = "";
        
            var span = document.createElement("SPAN");
            var txt = document.createTextNode("\u00D7");
            span.className = "close2";
            span.appendChild(txt);
            li.appendChild(span);
        
            for (i = 0; i < close.length; i++) {
                close[i].onclick = function() {
                    var div = this.parentElement;
                    div.style.display = "none";
                }
            }
        }
    });
});

$(document).ready(function() {
    $("#myInput3").keyup(function(e) {
        if(e.which==13) {
            var li = document.createElement("li");
            var inputValue = document.getElementById("myInput3").value;
            var t = document.createTextNode(inputValue);
            li.appendChild(t);
            if (inputValue === '') {
            alert("You must write something!");
            } else {
            document.getElementById("myUL3").appendChild(li);
            }
            document.getElementById("myInput3").value = "";
        
            var span = document.createElement("SPAN");
            var txt = document.createTextNode("\u00D7");
            span.className = "close2";
            span.appendChild(txt);
            li.appendChild(span);
        
            for (i = 0; i < close.length; i++) {
                close[i].onclick = function() {
                    var div = this.parentElement;
                    div.style.display = "none";
                }
            }
        }
    });
});

$(document).ready(function() {
    $("#myInput4").keyup(function(e) {
        if(e.which==13) {
            var li = document.createElement("li");
            var inputValue = document.getElementById("myInput4").value;
            var t = document.createTextNode(inputValue);
            li.appendChild(t);
            if (inputValue === '') {
            alert("You must write something!");
            } else {
            document.getElementById("myUL4").appendChild(li);
            }
            document.getElementById("myInput4").value = "";
        
            var span = document.createElement("SPAN");
            var txt = document.createTextNode("\u00D7");
            span.className = "close2";
            span.appendChild(txt);
            li.appendChild(span);
        
            for (i = 0; i < close.length; i++) {
                close[i].onclick = function() {
                    var div = this.parentElement;
                    div.style.display = "none";
                }
            }
        }
    });
});

$(document).ready(function() {
    $("#myInput5").keyup(function(e) {
        if(e.which==13) {
            var li = document.createElement("li");
            var inputValue = document.getElementById("myInput5").value;
            var t = document.createTextNode(inputValue);
            li.appendChild(t);
            if (inputValue === '') {
            alert("You must write something!");
            } else {
            document.getElementById("myUL5").appendChild(li);
            }
            document.getElementById("myInput5").value = "";
        
            var span = document.createElement("SPAN");
            var txt = document.createTextNode("\u00D7");
            span.className = "close2";
            span.appendChild(txt);
            li.appendChild(span);
        
            for (i = 0; i < close.length; i++) {
                close[i].onclick = function() {
                    var div = this.parentElement;
                    div.style.display = "none";
                }
            }
        }
    });
});

$(document).ready(function() {
    $("#myInput6").keyup(function(e) {
        if(e.which==13) {
            var li = document.createElement("li");
            var inputValue = document.getElementById("myInput6").value;
            var t = document.createTextNode(inputValue);
            li.appendChild(t);
            if (inputValue === '') {
            alert("You must write something!");
            } else {
            document.getElementById("myUL6").appendChild(li);
            }
            document.getElementById("myInput6").value = "";
        
            var span = document.createElement("SPAN");
            var txt = document.createTextNode("\u00D7");
            span.className = "close2";
            span.appendChild(txt);
            li.appendChild(span);
        
            for (i = 0; i < close.length; i++) {
                close[i].onclick = function() {
                    var div = this.parentElement;
                    div.style.display = "none";
                }
            }
        }
    });
});

// Create a "close" button and append it to each list item
var myNodelist = document.getElementsByTagName("LI");
var i;
for (i = 0; i < myNodelist.length; i++) {
  var span = document.createElement("SPAN");
  var txt = document.createTextNode("\u00D7");
  span.className = "close2";
  span.appendChild(txt);
  myNodelist[i].appendChild(span);
}

// Click on a close button to hide the current list item
var close = document.getElementsByClassName("close2");
var i;
for (i = 0; i < close.length; i++) {
  close[i].onclick = function() {
    var div = this.parentElement;
    div.style.display = "none";
  }
}

function exportCorr() {

    var csv = ["filename","\n"];
    for (var i=0; i<ConceptsValide.length; i++) {csv.push(ConceptsValide[i].label,ConceptsValide[i].value)};
    for (var i=0; i<ConceptsNeutre.length; i++) {csv.push(ConceptsNeutre[i].label,ConceptsNeutre[i].value)};
    for (var i=0; i<ConceptsInvalide.length; i++) {csv.push(ConceptsInvalide[i].label,ConceptsInvalide[i].value)};
    for (var i=0; i<LiensValide.length; i++) {csv.push(LiensValide[i].verb,LiensValide[i].preLabel,LiensValide[i].postLabel,LiensValide[i].value)};
    for (var i=0; i<LiensNeutre.length; i++) {csv.push(LiensNeutre[i].verb,LiensNeutre[i].preLabel,LiensNeutre[i].postLabel,LiensNeutre[i].value)};
    for (var i=0; i<LiensInvalide.length; i++) {csv.push(LiensInvalide[i].verb,LiensInvalide[i].preLabel,LiensInvalide[i].postLabel,LiensInvalide[i].value)};

    var csvFile;
    var downloadLink;

    csvFile = new Blob([csv], {type: "text/csv"});
    downloadLink = document.createElement("a");
    downloadLink.download = "filename.csv";
    downloadLink.href = window.URL.createObjectURL(csvFile);
    downloadLink.style.display = "none";
    document.body.appendChild(downloadLink);
    downloadLink.click();

}

