let mapJson = `{"links":[{"from":0,"to":2,"verb":"entraîne"},{"from":1,"to":2,"verb":"entraîne"},{"from":2,"to":3,"verb":"entraîne"},{"from":2,"to":4,"verb":"entraîne"},{"from":4,"to":5,"verb":"entraîne"}],"nodes":[{"name":"Perte d'eau","x":138.22998992919986,"y":26.46000372314429},{"name":"Perte de Na","x":299.33999975585937,"y":26.42000000000001},{"name":"Baisse de la volémie","x":184.31998687744215,"y":131.85999493408235},{"name":"Réponse rénale","x":303.1199960327151,"y":237.87998651123132},{"name":"Baisse de la PSA","x":134.73000024414057,"y":239.1799876708992},{"name":"Tachycardie de compensation","x":95.55997955322391,"y":340.3799825439464}]}`

const RECT_LABEL_OFFSETX = 20
const RECT_LABEL_OFFSETY = 20
const ZOOM_SPEED = 1.05

/**
 * Calcule la position du point de départ/d'arrivée de la flèche entre les deux
 * nœuds.
 *
 * @param {GraphicalNode} startGNode - Le nœud de départ.
 * @param {GraphicalNode} endGNode - Le nœud d'arrivée.
 * @return {number[]} La position de départ/d'arrivée de la flèche.
 */
function computeArrowIntersection(startGNode, endGNode) {
    let startX = startGNode.x + startGNode.width * .5
    let startY = startGNode.y + startGNode.height * .5
    let endX = endGNode.x + endGNode.width * .5
    let endY = endGNode.y + endGNode.height * .5
    let dx = endX - startX
    let dy = endY - startY
    let tTop = (startGNode.y - startY) / dy
    let tBottom = (startGNode.y + startGNode.height - startY) / dy
    let tRight = (startGNode.x + startGNode.width - startX) / dx
    let tLeft = (startGNode.x - startX) / dx
    let tCandidates = []
    if (tTop >= 0) tCandidates.push(tTop)
    if (tBottom >= 0) tCandidates.push(tBottom)
    if (tRight >= 0) tCandidates.push(tRight)
    if (tLeft >= 0) tCandidates.push(tLeft)
    let t = Math.min(...tCandidates)

    return [startX + t * dx, startY + t * dy]
}

/**
 * Met à jour la position des liens.
 *
 * @param {GraphicalLink[]} gLinks - Les liens.
 * @param {GraphicalNode[]} gNodes - Les nœuds.
 * @param {number} nodeIndex - L'indice du nœud pour lequel on met à jour les
 *      liens (si `null`, on met à jour toutes les liens).
 */
function updateLinksPos(gLinks, gNodes, nodeIndex = null) {
    for (let gLink of gLinks) {
        if (nodeIndex === null ||
            nodeIndex !== null && (nodeIndex === gLink.from || nodeIndex === gLink.to)
        ) {
            const startNode = gNodes[gLink.from]
            const endNode = gNodes[gLink.to]
            const start = computeArrowIntersection(startNode, endNode)
            const end = computeArrowIntersection(endNode, startNode)
            gLink.points = [...start, ...end]

            // TODO: Ici, le `label` est en fait un truc de Konva, il faut
            // utiliser un label non spécifique à une bibliothèque. (ici on
            // est dans du code générique)
            const halfLabelWidth = gLink.label.width() * .5
            const halfLabelHeight = gLink.label.height() * .5
            gLink.label.x((start[0] + end[0]) * .5 - halfLabelWidth)
            gLink.label.y((start[1] + end[1]) * .5 - halfLabelHeight)
        }
    }
}

class GraphicalObject {
    constructor(obj, ...properties) {
        this._obj = obj
        this._changeCallbacks = []

        for (let property of properties) {
            const internalProperty = '_' + property
            this[internalProperty] = obj[property]

            Object.defineProperty(obj, property, {
            enumerable: true,
                get: () => this[internalProperty],
                set: value => {
                    this[internalProperty] = value
                    if (this._changeCallbacks[property]) {
                        for (let cb of this._changeCallbacks[property]) {
                            cb(value)
                        }
                    }
                }
            })

            Object.defineProperty(this, property, {
                enumerable: true,
                get: () => this._obj[property],
                set: value => this._obj[property] = value
            })
        }
    }

    onChange(property, callback) {
        if (!this._changeCallbacks[property]) {
            this._changeCallbacks[property] = []
        }
        this._changeCallbacks[property].push(callback)
    }
}

class GraphicalNode extends GraphicalObject {
    constructor(node) {
        // TODO: On n'a pas forcément envie d'ajouter `width` et `height` dans
        // le modèle, c'est seulement une caractéristique du noeud *graphique*.
        // Le problème est qu'on ne peut pas être notifié du changement de
        // `width`/`height` si on ne les ajoute pas ici.
        super(node, 'x', 'y', 'width', 'height', 'name')
    }
}

class GraphicalLink extends GraphicalObject {
    constructor(link) {
        // TODO: Pareil ici, on ne veut pas forcément sauvegarder les points
        // dans le modèle.
        super(link, 'from', 'to', 'verb', 'points')
    }
}

window.addEventListener('DOMContentLoaded', () => {
    let map = JSON.parse(mapJson)
    //
    // Création des éléments graphiques
    //
    let gNodes = []
    for (let node of map.nodes) {
        gNodes.push(new GraphicalNode(node))
    }

    let gLinks = []
    for (let link of map.links) {
        gLinks.push(new GraphicalLink(link))
    }

    //
    // À partir d'ici, le code est dépendant de la bibliothèque d'affichage.
    //
    let containerElt = document.getElementById('canvas-container')
    let stage = new Konva.Stage({
        container: 'canvas-container',
        width: containerElt.offsetWidth,
        height: containerElt.offsetHeight,
        draggable: true
    })

    let kLabels = new Konva.Group()

    // Links
    let kArrows = new Konva.Group()
    for (let gLinkIndex = 0; gLinkIndex < gLinks.length; ++gLinkIndex) {
        let gLink = gLinks[gLinkIndex]
        let arrow = new Konva.Arrow({
            fill: '#4e6ea5',
            stroke: '#4e6ea5'
        })
        let label = new Konva.Label()
        label.add(new Konva.Tag({
            fill: '#ffffffaa',
            cornerRadius: 2
        }))
        let kText = new Konva.Text({
            text: gLink.verb,
            padding: 2,
            fontFamily: 'Quicksand'
        })
        label.add(kText)

        label.on('dblclick', () => {
            konvaHandleTextInput(stage, mainLayer, kText, newValue => {
                gLink.verb = newValue
            })
        })

        gLink.onChange('points', newPoints => {
            arrow.points(newPoints)
        })

        // On ajoute directement le label à la flèche pour y accéder directement
        // plus tard.
        // TODO: Il faut ajouter un objet qui ne vient pas de Konva.
        gLink.label = label
        kLabels.add(label)
        kArrows.add(arrow)
    }

    // Nodes
    let kNodes = new Konva.Group()
    for (let gNodeIndex = 0; gNodeIndex < gNodes.length; ++gNodeIndex) {
        let gNode = gNodes[gNodeIndex]
        let kNode = new Konva.Rect({
            x: gNode.x,
            y: gNode.y,
            fill: '#d9e1f3',
            cornerRadius: 4,
            draggable: true
        })

        // On lie notre nœud graphique et le Konva.Rect
        for (let property of ['x', 'y', 'width', 'height']) {
            gNode.onChange(property, newValue => {
                kNode[property](newValue)
            })
        }

        let kText = new Konva.Text({
            text: gNode.name,
            fontFamily: 'Quicksand',
            fontStyle: 'bold',
            listening: false
        })
        gNode.onChange('name', newValue => {
            kText.text(newValue)
            gNode.width = kText.width() + RECT_LABEL_OFFSETX
        })
        gNode.width = kText.width() + RECT_LABEL_OFFSETX
        gNode.height = kText.height() + RECT_LABEL_OFFSETY
        // Placement du texte
        kText.x(kNode.x() + kNode.width() * .5 - kText.width() * .5)
        kText.y(kNode.y() + kNode.height() * .5 - kText.height() * .5)
        kLabels.add(kText)

        kNode.on('dblclick', () => {
            konvaHandleTextInput(stage, mainLayer, kText, newValue => {
                gNode.width = kText.width() + RECT_LABEL_OFFSETX
                gNode.name = newValue
            })
        })

        kNode.on('dragmove', () => {
            gNode.x = kNode.x()
            gNode.y = kNode.y()

            updateLinksPos(gLinks, gNodes, gNodeIndex)
            // Placement du texte
            kText.x(kNode.x() + kNode.width() * .5 - kText.width() * .5)
            kText.y(kNode.y() + kNode.height() * .5 - kText.height() * .5)

            mainLayer.batchDraw()
        })
        kNodes.add(kNode)
    }

    updateLinksPos(gLinks, gNodes)

    let mainLayer = new Konva.Layer()
    mainLayer.add(kNodes)
    mainLayer.add(kArrows)
    mainLayer.add(kLabels)

    stage.add(mainLayer)
    stage.scale({ x: 1.5, y: 1.5 })
    stage.draw()

    stage.on('wheel', e => {
        e.evt.preventDefault()
        let oldScale = stage.scaleX()
        let mousePos = stage.getPointerPosition()

        let mousePointTo = {
            x: (mousePos.x - stage.x()) / oldScale,
            y: (mousePos.y - stage.y()) / oldScale,
        }
        let newScale = e.evt.deltaY > 0 ? oldScale / ZOOM_SPEED : oldScale * ZOOM_SPEED

        stage.scale({ x: newScale, y: newScale })

        let newPos = {
            x: mousePos.x - mousePointTo.x * newScale,
            y: mousePos.y - mousePointTo.y * newScale,
        }
        stage.position(newPos)
        stage.batchDraw()
    })

    // Export button
    let exportBtnElt = document.getElementById('export-btn')
    let exportedElt = document.getElementById('exported')
    exportBtnElt.addEventListener('click', e => {
        let mapJson = JSON.stringify(map)
        exportedElt.textContent = mapJson
    })
})


function konvaHandleTextInput(stage, layer, kText, onDone) {
    // Inspiré de https://konvajs.org/docs/sandbox/Editable_Text.html

    kText.hide()
    layer.draw()

    // create textarea over canvas with absolute position
    // first we need to find position for textarea
    // how to find it?

    // at first lets find position of text node relative to the stage:
    let textPosition = kText.absolutePosition()

    // then lets find position of stage container on the page:
    let stageBox = stage.container().getBoundingClientRect()

    // so position of textarea will be the sum of positions above:
    let areaPosition = {
        x: stageBox.left + textPosition.x,
        y: stageBox.top + textPosition.y,
    }

    // create textarea and style it
    let textarea = document.createElement('textarea')
    document.body.appendChild(textarea)

    const scale = stage.scale().x

    // apply many styles to match text on canvas as close as possible
    // remember that text rendering on canvas and on the textarea can be different
    // and sometimes it is hard to make it 100% the same. But we will try...
    textarea.value = kText.text()
    textarea.style.position = 'absolute'
    textarea.style.top = areaPosition.y + 'px'
    textarea.style.left = areaPosition.x + 'px'
    textarea.style.width = (kText.width() - kText.padding()) * scale + 'px'
    textarea.style.height =
        (kText.height() - kText.padding()) * scale + 5 + 'px'
    textarea.style.fontSize = kText.fontSize() * scale + 'px'
    textarea.style.border = 'none'
    textarea.style.padding = '0px'
    textarea.style.margin = '0px'
    textarea.style.overflow = 'hidden'
    textarea.style.background = 'none'
    textarea.style.outline = 'none'
    textarea.style.resize = 'none'
    textarea.style.lineHeight = kText.lineHeight()
    textarea.style.fontFamily = kText.fontFamily()
    textarea.style.transformOrigin = 'left top'
    textarea.style.textAlign = kText.align()
    textarea.style.color = kText.fill()
    rotation = kText.rotation()
    let transform = ''
    if (rotation) {
        transform += 'rotateZ(' + rotation + 'deg)'
    }

    let px = 0
    // also we need to slightly move textarea on firefox
    // because it jumps a bit
    let isFirefox =
        navigator.userAgent.toLowerCase().indexOf('firefox') > -1
    if (isFirefox) {
        px += 2 + Math.round(kText.fontSize() / 20)
    }
    transform += 'translateY(-' + px + 'px)'

    textarea.style.transform = transform

    // reset height
    textarea.style.height = 'auto'
    // after browsers resized it we can set actual value
    textarea.style.height = textarea.scrollHeight + 3 + 'px'

    textarea.focus()

    function removeTextarea() {
        textarea.parentNode.removeChild(textarea)
        window.removeEventListener('click', handleOutsideClick)
        onDone(textarea.value)

        kText.show()
        layer.draw()
    }

    function setTextareaWidth(newWidth) {
        if (!newWidth) {
            // set width for placeholder
            newWidth = kText.placeholder.length * kText.fontSize()
        }
        // some extra fixes on different browsers
        let isSafari = /^((?!chrome|android).)*safari/i.test(
            navigator.userAgent
        )
        let isFirefox =
            navigator.userAgent.toLowerCase().indexOf('firefox') > -1
        if (isSafari || isFirefox) {
            newWidth = Math.ceil(newWidth)
        }

        let isEdge =
            document.documentMode || /Edge/.test(navigator.userAgent)
        if (isEdge) {
            newWidth += 1
        }
        textarea.style.width = newWidth + 'px'
    }

    textarea.addEventListener('keydown', function (e) {
        // hide on enter
        // but don't hide on shift + enter
        if (e.keyCode === 13 && !e.shiftKey) {
            kText.text(textarea.value)
            removeTextarea()
        }
        // on esc do not set value back to node
        if (e.keyCode === 27) {
            removeTextarea()
        }
    })

    textarea.addEventListener('keydown', () => {
        // TODO: Le `*5` n'est pas correct.
        setTextareaWidth(kText.width() * kText.getAbsoluteScale().x * 5)
        textarea.style.height = 'auto'
        textarea.style.height = textarea.scrollHeight + kText.fontSize() * scale + 'px'
    })

    function handleOutsideClick(e) {
        if (e.target !== textarea) {
            kText.text(textarea.value)
            removeTextarea()
        }
    }

    setTimeout(() => {
        window.addEventListener('click', handleOutsideClick)
    })
    
}
