let mapJSON = `{"links":[{"from":0,"to":2,"verb":"entraîne"},{"from":1,"to":2,"verb":"entraîne"},{"from":2,"to":3,"verb":"entraîne"},{"from":2,"to":4,"verb":"entraîne"},{"from":4,"to":5,"verb":"entraîne"}],"nodes":[{"name":"Perte d'eau","x":138.22998992919986,"y":26.46000372314429},{"name":"Perte de Na","x":299.33999975585937,"y":26.42000000000001},{"name":"Baisse de la volémie","x":184.31998687744215,"y":131.85999493408235},{"name":"Réponse rénale","x":303.1199960327151,"y":237.87998651123132},{"name":"Baisse de la PSA","x":134.73000024414057,"y":239.1799876708992},{"name":"Tachycardie de compensation","x":95.55997955322391,"y":340.3799825439464}]}`

const NODE_LABEL_OFFSETX = 20
const NODE_LABEL_OFFSETY = 20
const ZOOM_SPEED = 1.05
const LINK_HANDLE_RADIUS = 10

class Node {
    constructor(x = 0, y = 0, name = '') {
        this.x = x
        this.y = y
        this.name = name
    }
}

class Link {
    constructor(from = 0, to = 0, verb = '') {
        this.from = from
        this.to = to
        this.verb = verb
    }
}

function computeArrowIntersectionFromPoints(startGNode, endX, endY) {
    let startX = startGNode.x + startGNode.width * .5
    let startY = startGNode.y + startGNode.height * .5
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

    return {
        x: startX + t * dx,
        y: startY + t * dy
    }
}

/**
 * Calcule la position du point de départ/d'arrivée de la flèche entre les deux
 * nœuds.
 *
 * @param {GraphicalNode} startGNode - Le nœud de départ.
 * @param {GraphicalNode} endGNode - Le nœud d'arrivée.
 * @return {{x: number, y: number}} La position de départ/d'arrivée de la flèche.
 */
function computeArrowIntersection(startGNode, endGNode) {
    let endX = endGNode.x + endGNode.width * .5
    let endY = endGNode.y + endGNode.height * .5

    return computeArrowIntersectionFromPoints(startGNode, endX, endY)
}

/**
 * Met à jour la position des liens.
 *
 * @param {GraphicalLink[]} gLinks - Les liens.
 * @param {number} nodeIndex - L'indice du nœud pour lequel on met à jour les
 *      liens (si `null`, on met à jour toutes les liens).
 */
function updateLinksPos(gLinks, nodeIndex = null) {
    for (let gLink of gLinks) {
        if (nodeIndex === null ||
            nodeIndex !== null &&
            // TODO: Il faut vérifier que le gNode existe !
            (nodeIndex === gLink.handleFrom.gNode.index ||
             nodeIndex === gLink.handleTo.gNode.index)
        ) {
            updateLinkPos(gLink)
        }
    }
}

function updateLinkPos(gLink) {
    const startNode = gLink.handleFrom.gNode
    const endNode = gLink.handleTo.gNode
    if (startNode && endNode) {
        const start = computeArrowIntersection(startNode, endNode)
        const end = computeArrowIntersection(endNode, startNode)
        gLink.handleFrom.x = start.x
        gLink.handleFrom.y = start.y
        gLink.handleTo.x = end.x
        gLink.handleTo.y = end.y
    }
}

class GraphicalObject {
    constructor() {
        this._changeCallbacks = []
        this._eventsCallbacks = []
    }

    /**
     * Ajoute une propriété.
     *
     * @param {*} property - La propriété à ajouter.
     * @param {*} initialValue - La valeur initiale de la propriété.
     */
    addProperty(property, initialValue = null) {
        const internalProperty = '_' + property
        this[internalProperty] = initialValue

        Object.defineProperty(this, property, {
            get: () => this[internalProperty],
            set: value => {
                if (this[internalProperty] !== value) {
                    this[internalProperty] = value
                    if (this._changeCallbacks[property]) {
                        for (let cb of this._changeCallbacks[property]) {
                            cb(value)
                        }
                    }
                }
            }
        })
    }

    /**
     * Ajoute une fonction callback appelée lorsqu'une propriété change.
     *
     * @param {string} properties - Les propriétés à observer, séparées par des
     *      espaces.
     * @param {*} callback - La fonction callback prenant en paramètre la
     *      nouvelle valeur.
     */
    onChange(properties, callback) {
        for (const property of properties.split(' ')) {
            if (!this._changeCallbacks[property]) {
                this._changeCallbacks[property] = []
            }
            this._changeCallbacks[property].push(callback)
        }
    }

    on(event, callback) {
        if (!this._eventsCallbacks[event]) {
            this._eventsCallbacks[event] = []
        }
        this._eventsCallbacks[event].push(callback)
    }

    /**
     * Déclenche l'événement demandé. Tous les callbacks pour cet événement
     * seront notifié et recevront les infos associées.
     *
     * @param {string} event - Le nom de l'événement
     * @param {*} eventInfos - Les infos associées à l'événement
     */
    fire(event, eventInfos = {}) {
        if (!this._eventsCallbacks[event]) {
            console.error('Trying to call an unregistered event callback')
        } else {
            for (let cb of this._eventsCallbacks[event]) {
                cb(eventInfos)
            }
        }
    }
}

class Label extends GraphicalObject {
    constructor(text, x = 0, y = 0, width = 0, height = 0) {
        super()
        this.addProperty('text', text)
        this.addProperty('x', x)
        this.addProperty('y', y)
        this.addProperty('width', width)
        this.addProperty('height', height)

        this.on('input', ({ newValue, newWidth, newHeight }) => {
            this.text = newValue
            this.width = newWidth
            this.height = newHeight
        })
    }
}

class LinkHandle extends GraphicalObject {
    constructor(gNode) {
        super()
        this.addProperty('x')
        this.addProperty('y')
        this.addProperty('gNode', gNode)
        this.addProperty('radius', LINK_HANDLE_RADIUS)

        this.on('dragmove', ({ x, y }) => {
            this.x = x
            this.y = y
        })
    }
}

class GraphicalNode extends GraphicalObject {
    constructor(node, index) {
        super()
        this.index = index
        this.addProperty('x', node.x)
        this.addProperty('y', node.y)
        this.addProperty('label', new Label(node.name))
        this.addProperty('width')
        this.addProperty('height')

        this.on('dragmove', ({ x, y }) => {
            this.x = x
            this.y = y
        })

        // Mise à jour du nom quand le label change
        this.label.onChange('text', newValue => {
            node.name = newValue
        })

        // Mise à jour de la taille quand la taille du label change
        this.label.onChange('width', newWidth => {
            this.width = newWidth + NODE_LABEL_OFFSETX
            this.label.x = node.x + this.width * .5 - this.label.width * .5
        })
        this.label.onChange('height', newHeight => {
            this.height = newHeight + NODE_LABEL_OFFSETY
            this.label.y = node.y + this.height * .5 - this.label.height * .5
        })

        // Mise à jour du label quand le node bouge
        this.onChange('x', newX => {
            node.x = newX
            this.label.x = newX + this.width * .5 - this.label.width * .5
        })
        this.onChange('y', newY => {
            node.y = newY
            this.label.y = newY + this.height * .5 - this.label.height * .5
        })
    }
}

class GraphicalLink extends GraphicalObject {
    constructor(link, gNodeFrom, gNodeTo) {
        super()
        this.addProperty('handleFrom', new LinkHandle(gNodeFrom))
        this.addProperty('handleTo', new LinkHandle(gNodeTo))
        this.addProperty('label', new Label(link.verb))
        // updateLinkPos(this)

        this.handleFrom.on('dragmove', ({ x, y }) => {
            // Met à jour l'autre côté de la flèche
            const end = computeArrowIntersectionFromPoints(this.handleTo.gNode, x, y)
            this.handleTo.x = end.x
            this.handleTo.y = end.y
        })

        this.handleTo.on('dragmove', ({ x, y }) => {
            // Met à jour l'autre côté de la flèche
            const start = computeArrowIntersectionFromPoints(this.handleFrom.gNode, x, y)
            this.handleFrom.x = start.x
            this.handleFrom.y = start.y
        })

        this.handleFrom.onChange('gNode', newGNodeFrom => {
            link.from = newGNodeFrom.index
            updateLinkPos(this)
        })
        this.handleTo.onChange('gNode', newGNodeTo => {
            link.to = newGNodeTo.index
            updateLinkPos(this)
        })
        // Mise à jour du verbe quand le label change
        this.label.onChange('text', newVerb => {
            link.verb = newVerb
        })

        // Mise à jour des points quand les handles bougent (c'est-à-dire quand
        // on déplace la flèche)
        this.handleFrom.onChange('x y', this._replaceLabel.bind(this))
        this.handleTo.onChange('x y', this._replaceLabel.bind(this))

        // Mise à jour de la position du label quand le verbe change
        this.label.onChange('width height', () => this._replaceLabel())
    }

    _replaceLabel() {
        const halfLabelWidth = this.label.width * .5
        const halfLabelHeight = this.label.height * .5
        this.label.x = (this.handleFrom.x + this.handleTo.x) * .5 - halfLabelWidth
        this.label.y = (this.handleFrom.y + this.handleTo.y) * .5 - halfLabelHeight
    }
}

function findIntersectedNode(linkHandle, gNodes) {
    const x = linkHandle.x
    const y = linkHandle.y
    for (let nodeIndex = 0; nodeIndex < gNodes.length; ++nodeIndex) {
        const gNode = gNodes[nodeIndex]
        if (x >= gNode.x && x < gNode.x + gNode.width &&
            y >= gNode.y && y < gNode.y + gNode.height
        ) {
            return gNode
        }
    }

    return null
}

function createGraphicalNode(node, nodeIndex, gLinks) {
    let gNode = new GraphicalNode(node, nodeIndex)

    gNode.on('dragmove', () => {
        updateLinksPos(gLinks, nodeIndex)
    })

    return gNode
}

let state = {
    state: 'RIEN',
    draggingHandle: null,
    map: JSON.parse(mapJSON),
}

function createGraphicalLink(link, gNodeFrom, gNodeTo, gNodes) {
    let gLink = new GraphicalLink(link, gNodeFrom, gNodeTo)

    // gLink.handleFrom.on('dragend', () => {
    //     updateHandleNode(gLink, gNodes, gLink.handleFrom, gLink.handleTo)
    // })
    // gLink.handleTo.on('dragend', () => {
    //     updateHandleNode(gLink, gNodes, gLink.handleTo, gLink.handleFrom)
    // })
    gLink.handleFrom.on('dragstart', () => {
        state.state = 'DRAG_LINK'
        state.draggingHandle = gLink.handleFrom
    })
    gLink.handleTo.on('dragstart', () => {
        state.state = 'DRAG_LINK'
        state.draggingHandle = gLink.handleTo
    })

    return gLink
}

function updateHandleNode(gLink, gNodes, handleFrom, handleTo) {
    const gNode = findIntersectedNode(handleFrom, gNodes)
    if (gNode) {
        // Si on a relié le début et la fin au même nœud, on inverse les liens,
        // sinon on prend le nouveau nœud
        if (gNode === handleTo.gNode) {
            [handleFrom.gNode, handleTo.gNode] = [handleTo.gNode, handleFrom.gNode]
        } else {
            handleFrom.gNode = gNode
        }
    }
    updateLinkPos(gLink)
}

window.addEventListener('DOMContentLoaded', () => {


    //
    // Création des éléments graphiques
    //
    let gLinks = []
    let gNodes = []
    for (let nodeIndex = 0; nodeIndex < state.map.nodes.length; ++nodeIndex) {
        const node = state.map.nodes[nodeIndex]
        const gNode = createGraphicalNode(node, nodeIndex, gLinks)
        gNodes.push(gNode)
    }

    for (let link of state.map.links) {
        const gLink = createGraphicalLink(link, gNodes[link.from], gNodes[link.to], gNodes)
        gLinks.push(gLink)
    }

    //
    // À partir d'ici, le code est dépendant de la bibliothèque d'affichage.
    //
    let stageContainerElt = document.getElementById('canvas-container')
    let stage = new Konva.Stage({
        container: 'canvas-container',
        width: stageContainerElt.offsetWidth,
        height: stageContainerElt.offsetHeight,
    })

    let kLabels = new Konva.Group()

    let mainLayer = new Konva.Layer()
    let dragLayer = new Konva.Layer()

    // Links
    let kLinks = new Konva.Group()
    for (let gLinkIndex = 0; gLinkIndex < gLinks.length; ++gLinkIndex) {
        let gLink = gLinks[gLinkIndex]
        createKonvaLink(gLink, kLabels, dragLayer, kLinks)
    }

    // Nodes
    let kNodes = new Konva.Group()
    for (let gNodeIndex = 0; gNodeIndex < gNodes.length; ++gNodeIndex) {
        const gNode = gNodes[gNodeIndex]
        createKonvaNode(gNode, gNodes, gLinks, kNodes, kLabels, state, stage, kLinks)
    }

    updateLinksPos(gLinks)

    mainLayer.add(kNodes)
    mainLayer.add(kLabels)
    mainLayer.add(kLinks)

    stage.add(mainLayer)
    stage.add(dragLayer)
    // stage.add(linksLayer)
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

    //
    // Drag-and-drop des nœuds
    //
    let dragState = ''
    let nodeBtnElt = document.getElementById('node-btn')
    nodeBtnElt.addEventListener('dragstart', () => {
        dragState = 'node'
    })

    let stageContainer = stage.container()
    stageContainer.addEventListener('dragover', e => {
        e.preventDefault()
    })

    stageContainer.addEventListener('drop', e => {
        e.preventDefault()
        stage.setPointersPositions(e)

        if (dragState === 'node') {
            // Création d'un node
            let { x, y } = stage.getPointerPosition()
            let node = new Node(x, y, 'New node')
            state.map.nodes.push(node)
            const gNode = createGraphicalNode(node, state.map.nodes.length - 1, gLinks)
            gNodes.push(gNode)
            createKonvaNode(gNode, gNodes, gLinks, kNodes, kLabels, state, stage, kLinks)
            stage.draw()
        }
    })

    //
    // Flèches
    //
    let linkBtnElt = document.getElementById('link-btn')
    linkBtnElt.addEventListener('click', () => {
        if (state.state === 'CREATING_LINK') state.state = 'RIEN'
        else state.state = 'CREATING_LINK'
    })

    // Export button
    // let exportBtnElt = document.getElementById('export-btn')
    // let exportedElt = document.getElementById('exported')
    // exportBtnElt.addEventListener('click', e => {
    //     let mapJson = JSON.stringify(map)
    //     exportedElt.textContent = mapJson
    // })

    window.addEventListener('resize', () => {
        const containerWidth = stageContainerElt.offsetWidth
        const containerHeight = stageContainerElt.offsetHeight
        stage.width(containerWidth)
        stage.height(containerHeight)
        stage.batchDraw()
    })
})

function createKonvaLink(gLink, kLabels, dragLayer, kLinks) {
    let kArrow = new Konva.Arrow({
        fill: '#4e6ea5',
        stroke: '#4e6ea5',
        lineCap: 'round',
        pointerWidth: 10,
        pointerLength: 8,
        points: [
            gLink.handleFrom.x,
            gLink.handleFrom.y,
            gLink.handleTo.x,
            gLink.handleTo.y
        ]
    })
    let kLabel = new Konva.Label()
    kLabel.add(new Konva.Tag({
        fill: '#ffffffaa',
        cornerRadius: 2
    }))
    let kText = new Konva.Text({
        text: gLink.label.text,
        padding: 2,
        fontFamily: 'Quicksand'
    })
    kLabel.add(kText)

    let kStartHandle = new Konva.Circle({
        x: gLink.handleFrom.x,
        y: gLink.handleFrom.y,
        radius: gLink.handleFrom.radius,
        fill: 'red',
        draggable: true,
    })
    let kEndHandle = new Konva.Circle({
        x: gLink.handleTo.x,
        y: gLink.handleTo.y,
        radius: gLink.handleTo.radius,
        fill: 'blue',
        draggable: true,
    })
    kLinks.add(kStartHandle)
    kLinks.add(kEndHandle)

    kStartHandle.on('dragmove', () => {
        gLink.handleFrom.fire('dragmove', {
            x: kStartHandle.x(),
            y: kStartHandle.y(),
        })
    })
    kEndHandle.on('dragmove', () => {
        gLink.handleTo.fire('dragmove', {
            x: kEndHandle.x(),
            y: kEndHandle.y(),
        })
    })
    kStartHandle.on('dragstart', () => {
        kStartHandle.moveTo(dragLayer)
        dragLayer.draw()
        gLink.handleFrom.fire('dragstart')
    })
    kEndHandle.on('dragstart', () => {
        kEndHandle.moveTo(dragLayer)
        dragLayer.draw()
        gLink.handleTo.fire('dragstart')
    })

    kStartHandle.on('dragend', () => {
        kStartHandle.moveTo(kLinks)
        kLinks.draw()
    })
    kEndHandle.on('dragend', () => {
        kEndHandle.moveTo(kLinks)
        kLinks.draw()
    })

    // On met à jour la flèche de Konva quand notre flèche change
    gLink.handleFrom.onChange('x', newX => {
        kArrow.points()[0] = newX
    })
    gLink.handleFrom.onChange('y', newY => {
        kArrow.points()[1] = newY
    })
    gLink.handleTo.onChange('x', newX => {
        kArrow.points()[2] = newX
    })
    gLink.handleTo.onChange('y', newY => {
        kArrow.points()[3] = newY
    })

    // On met à jour les handles quand nos handles bougent
    for (const property of ['x', 'y']) {
        gLink.handleFrom.onChange(property, newValue => {
            kStartHandle[property](newValue)
        })
        gLink.handleTo.onChange(property, newValue => {
            kEndHandle[property](newValue)
        })
    }

    // On met à jour le label de Konva quand notre label change
    for (const property of ['x', 'y', 'width', 'height']) {
        gLink.label.onChange(property, newValue => {
            kLabel[property](newValue)
        })
    }
    gLink.label.onChange('text', newValue => {
        kText.text(newValue)
    })

    gLink.label.width = kLabel.width()
    gLink.label.height = kLabel.height()

    kLabel.on('dblclick', () => {
        konvaHandleTextInput(kText, newValue => {
            gLink.label.fire('input', {
                newValue,
                newWidth: kLabel.width(),
                newHeight: kLabel.height(),
            })
        })
    })

    kLabels.add(kLabel)
    kLinks.add(kArrow)
}

function createKonvaNode(gNode, gNodes, gLinks, kNodes, kLabels, state, stage, kLinks) {
    let kNode = new Konva.Rect({
        x: gNode.x,
        y: gNode.y,
        fill: '#d9e1f3',
        stroke: 'blue',
        strokeEnabled: false,
        cornerRadius: 4,
    })
    kNodes.add(kNode)

    // On met à jour le Konva.Rect quand notre node graphique change
    for (let property of ['x', 'y', 'width', 'height']) {
        gNode.onChange(property, newValue => {
            kNode[property](newValue)
        })
    }

    let kLabel = new Konva.Label()
    let kText = new Konva.Text({
        text: gNode.label.text,
        fontFamily: 'Quicksand',
        fontStyle: 'bold',
        listening: false
    })
    kLabel.add(kText)
    kLabels.add(kLabel)

    // On met à jour le label de Konva quand notre label change
    for (let property of ['x', 'y', 'width', 'height']) {
        gNode.label.onChange(property, newValue => {
            kLabel[property](newValue)
        })
    }
    gNode.label.onChange('text', newValue => {
        kText.text(newValue)
    })

    gNode.label.width = kLabel.width()
    gNode.label.height = kLabel.height()

    kNode.on('dblclick', () => {
        konvaHandleTextInput(kText, newValue => {
            gNode.label.fire('input', {
                newValue,
                newWidth: kLabel.width(),
                newHeight: kLabel.height(),
            })
            updateLinksPos(gLinks, gNode.index)
        }, true)
    })

    kNode.on('dragmove', () => {
        gNode.fire('dragmove', {
            x: kNode.x(),
            y: kNode.y(),
        })
    })

    kNode.on('mousedown', () => {
        if (state.state === 'CREATING_LINK') {
            let link = new Link(gNode.index, -1, 'toto')
            state.map.links.push(link)
            let gLink = createGraphicalLink(link, gNodes[link.from], null, gNodes)
            gLinks.push(gLink)
            createKonvaLink(gLink, kLabels, dragLayer, kLinks)
            // TODO: Refactor this, we want to have access to the end handle.
            kLabels.getChildren()[kLabels.getChildren().length - 2].startDrag()
            // gLink.handleFrom.fire('dragend')
            // gLink.handleTo.fire('dragend')
        } else {
            kNode.startDrag()
        }
    })
    kNode.on('mouseup', () => {
        if (state.state === 'CREATING_LINK') {
            // TODO: Il faut récupérer le lien en cours de création.
            // const gLink = gLinks[gLinks.length - 1]
            // gLink.handleTo.gNode = gNode
            // state.state = 'RIEN'
            // kLabels.getChildren()[kLabels.getChildren().length - 2].stopDrag()
            // // gLink.handleTo.fire('dragend')
            // mainLayer.draw()
        } else if (state.state === 'DRAG_LINK') {
            state.draggingHandle.gNode = gNode
            state.state = 'RIEN'
            stage.draw()
        } else {
            kNode.stopDrag()
        }
    })
}

function konvaHandleTextInput(kText, onInput, bold = false) {
    // Inspiré de https://konvajs.org/docs/sandbox/Editable_Text.html

    let stage = kText.getStage()
    let layer = kText.getLayer()

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
    const originalValue = kText.text()

    // apply many styles to match text on canvas as close as possible
    // remember that text rendering on canvas and on the textarea can be different
    // and sometimes it is hard to make it 100% the same. But we will try...
    textarea.value = originalValue
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
    textarea.style.fontWeight = bold ? 'bold' : 'normal'
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

        kText.show()
        layer.draw()
    }

    function updateText(value) {
        kText.text(value)
        onInput(value)
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
        updateText(textarea.value)
        // hide on enter
        // but don't hide on shift + enter
        if (e.keyCode === 13 && !e.shiftKey) {
            removeTextarea()
        }
        // on esc reset the original value
        if (e.keyCode === 27) {
            updateText(originalValue)
            removeTextarea()
        }

        // TODO: Le `*5` n'est pas correct.
        setTextareaWidth(kText.width() * kText.getAbsoluteScale().x * 5)
        textarea.style.height = 'auto'
        textarea.style.height = textarea.scrollHeight + kText.fontSize() * scale + 'px'
    })

    function handleOutsideClick(e) {
        if (e.target !== textarea) {
            updateText(textarea.value)
            removeTextarea()
        }
    }

    setTimeout(() => {
        window.addEventListener('click', handleOutsideClick)
    })
}