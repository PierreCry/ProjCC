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