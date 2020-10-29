let mapJSONbis = `{"links":[{"from":0,"to":2,"verb":"entraîne"},{"from":1,"to":2,"verb":"entraîne"},{"from":2,"to":3,"verb":"entraîne"},{"from":2,"to":4,"verb":"entraîne"},{"from":4,"to":5,"verb":"entraîne"}],"nodes":[{"name":"Perte d'eau","x":138.22998992919986,"y":26.46000372314429},{"name":"Perte de Na","x":299.33999975585937,"y":26.42000000000001},{"name":"Baisse de la volémie","x":184.31998687744215,"y":131.85999493408235},{"name":"Réponse rénale","x":303.1199960327151,"y":237.87998651123132},{"name":"Baisse de la PSA","x":134.73000024414057,"y":239.1799876708992},{"name":"Tachycardie de compensation","x":95.55997955322391,"y":340.3799825439464}]}`

window.addEventListener('DOMContentLoaded', () => {

    let map = JSON.parse(mapJSONbis);

    for (let linkIndex = 0; linkIndex < map.links.length; ++linkIndex) {
        let from = map.nodes[map.links[linkIndex].from];
        let to = map.nodes[map.links[linkIndex].to];
        $('#marked').val(($('#marked').val()) + '<FNAME> (' + from.name + ',' + from.x + ',' + from.y + ') </FNAME>' + '\n');
        $('#marked').val(($('#marked').val()) + '<VERB> (' + map.links[linkIndex].verb + ') </VERB>' + '\n');
        $('#marked').val(($('#marked').val()) + '<TNAME> (' + to.name + ',' + to.x + ',' + to.y + ') </TNAME>' + '\n');
        $('#marked').val(($('#marked').val()) + '\n');
    }

});
