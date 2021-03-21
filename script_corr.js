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

/*
// Add a "checked" symbol when clicking on a list item
var list = document.querySelector('ul');
list.addEventListener('click', function(ev) {
  if (ev.target.tagName === 'LI') {
    ev.target.classList.toggle('checked');
  }
}, false);
*/