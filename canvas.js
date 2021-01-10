let mapJSON = `{"links":[{"from":0,"to":2,"verb":"entraîne"},{"from":1,"to":2,"verb":"entraîne"},{"from":2,"to":3,"verb":"entraîne"},{"from":2,"to":4,"verb":"entraîne"},{"from":4,"to":5,"verb":"entraîne"}],"nodes":[{"name":"Perte d'eau","x":138.22998992919986,"y":26.46000372314429},{"name":"Perte de Na","x":299.33999975585937,"y":26.42000000000001},{"name":"Baisse de la volémie","x":184.31998687744215,"y":131.85999493408235},{"name":"Réponse rénale","x":303.1199960327151,"y":237.87998651123132},{"name":"Baisse de la PSA","x":134.73000024414057,"y":239.1799876708992},{"name":"Tachycardie de compensation","x":95.55997955322391,"y":340.3799825439464}]}`

const NODE_LABEL_OFFSETX = 20
const NODE_LABEL_OFFSETY = 20
const LINK_HANDLE_RADIUS = 10
const ZOOM_SPEED = 1.05

class GraphicalNode {
    constructor(node, kNode) {
        this.node = node
        this.kNode = kNode
        this.inGLinks = []
        this.outGLinks = []
    }
}

class GraphicalLink {
    constructor(link, kArrow, kLabel, kStartHandle, kEndHandle) {
        this.link = link
        this.kArrow = kArrow
        this.kLabel = kLabel
        this.kStartHandle = kStartHandle
        this.kEndHandle = kEndHandle
    }

    updateHandles(gNodes) {
        const startHandlePos = computeArrowIntersection(gNodes[this.link.from].kNode, gNodes[this.link.to].kNode)
        const endHandlePos = computeArrowIntersection(gNodes[this.link.to].kNode, gNodes[this.link.from].kNode)
        // TODO: On vient de calculer le point d'intersection, mais on va le
        // recalculer dans `moveStartHandle` et `moveEndHandle` !
        this.moveStartHandle(gNodes, startHandlePos.x, startHandlePos.y)
        this.moveEndHandle(gNodes, endHandlePos.x, endHandlePos.y)
    }

    moveStartHandle(gNodes, newX, newY) {
        this.kStartHandle.x(newX)
        this.kStartHandle.y(newY)

        // Mise à jour de la flèche
        this.kArrow.points()[0] = newX
        this.kArrow.points()[1] = newY

        // Mise à jour du label
        const halfLabelWidth = this.kLabel.width() * .5
        const halfLabelHeight = this.kLabel.height() * .5
        this.kLabel.x((this.kStartHandle.x() + this.kEndHandle.x()) * .5 - halfLabelWidth)
        this.kLabel.y((this.kStartHandle.y() + this.kEndHandle.y()) * .5 - halfLabelHeight)

        // Met à jour l'autre côté de la flèche
        const end = computeArrowIntersectionFromPoints(gNodes[this.link.to].kNode, newX, newY)
        this.kEndHandle.x(end.x)
        this.kEndHandle.y(end.y)
        this.kArrow.points()[2] = end.x
        this.kArrow.points()[3] = end.y
    }

    moveEndHandle(gNodes, newX, newY) {
        this.kEndHandle.x(newX)
        this.kEndHandle.y(newY)

        // Mise à jour de la flèche
        this.kArrow.points()[2] = newX
        this.kArrow.points()[3] = newY

        // Mise à jour du label
        const halfLabelWidth = this.kLabel.width() * .5
        const halfLabelHeight = this.kLabel.height() * .5
        this.kLabel.x((this.kStartHandle.x() + this.kEndHandle.x()) * .5 - halfLabelWidth)
        this.kLabel.y((this.kStartHandle.y() + this.kEndHandle.y()) * .5 - halfLabelHeight)

        // Met à jour l'autre côté de la flèche
        const start = computeArrowIntersectionFromPoints(gNodes[this.link.from].kNode, newX, newY)
        this.kStartHandle.x(start.x)
        this.kStartHandle.y(start.y)
        this.kArrow.points()[0] = start.x
        this.kArrow.points()[1] = start.y
    }
}

function computeArrowIntersectionFromPoints(kStartNode, endX, endY) {
    let startX = kStartNode.x() + kStartNode.width() * .5
    let startY = kStartNode.y() + kStartNode.height() * .5
    let dx = endX - startX
    let dy = endY - startY
    let tTop = (kStartNode.y() - startY) / dy
    let tBottom = (kStartNode.y() + kStartNode.height() - startY) / dy
    let tRight = (kStartNode.x() + kStartNode.width() - startX) / dx
    let tLeft = (kStartNode.x() - startX) / dx
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

function computeArrowIntersection(kStartNode, kEndNode) {
    let endX = kEndNode.x() + kEndNode.width() * .5
    let endY = kEndNode.y() + kEndNode.height() * .5

    return computeArrowIntersectionFromPoints(kStartNode, endX, endY)
}

window.addEventListener('DOMContentLoaded', () => {
    let map = JSON.parse(mapJSON)

    let kMainLayer = new Konva.Layer()
    let kDragLayer = new Konva.Layer()

    let gLinks = []
    let gNodes = []

    // Les `kNodes` sont des `Konva.Rect`. On les met dans un groupe à part car
    // quand on récupère le rectangle intersecté, on a besoin de l'indice qui
    // sert à récupérer le `GraphicalNode` dans `gNodes`.
    // TODO: Faire mieux que ça ?
    let kNodes = new Konva.Group()
    kMainLayer.add(kNodes)

    let stageContainerElt = document.getElementById('canvas-container')
    let kStage = new Konva.Stage({
        container: 'canvas-container',
        width: stageContainerElt.offsetWidth,
        height: stageContainerElt.offsetHeight,
        draggable: true,
    })

    for (let [nodeIndex, node] of map.nodes.entries()) {
        let kNode = new Konva.Rect({
            x: node.x,
            y: node.y,
            fill: '#d9e1f3',
            stroke: 'blue',
            strokeEnabled: false,
            cornerRadius: 4,
        })

        let gNode = new GraphicalNode(node, kNode)

        let kLabel = new Konva.Label()
        let kText = new Konva.Text({
            text: node.name,
            fontFamily: 'Quicksand',
            fontStyle: 'bold',
            listening: false
        })
        kLabel.add(kText)

        // Mise à jour des flèches reliées à ce nœud
        const updateLinks = () => {
            for (let gLink of gNode.outGLinks) {
                gLink.updateHandles(gNodes)
            }
            for (let gLink of gNode.inGLinks) {
                gLink.updateHandles(gNodes)
            }
            kMainLayer.batchDraw()
        }

        // Taille initiale du node
        kNode.width(kLabel.width() + NODE_LABEL_OFFSETX)
        kNode.height(kLabel.height() + NODE_LABEL_OFFSETY)
        // Placement initial du label
        kLabel.x(kNode.x() + kNode.width() * .5 - kLabel.width() * .5)
        kLabel.y(kNode.y() + kNode.height() * .5 - kLabel.height() * .5)

        kNode.on('dblclick', () => {
            konvaHandleTextInput(kText, newValue => {
                node.name = newValue
                kNode.width(kLabel.width() + NODE_LABEL_OFFSETX)
                kNode.height(kLabel.height() + NODE_LABEL_OFFSETY)
                updateLinks()
            }, true)
        })

        kNode.on('dragmove', () => {
            const newX = kNode.x()
            const newY = kNode.y()
            node.x = newX
            node.y = newY

            kLabel.x(newX + kNode.width() * .5 - kLabel.width() * .5)
            kLabel.y(newY + kNode.height() * .5 - kLabel.height() * .5)
            updateLinks()
        })

        kNode.on('mousedown', () => {
            kNode.startDrag()
        })
        kNode.on('mouseup', () => {
            kNode.stopDrag()
        })

        kNodes.add(kNode)
        kMainLayer.add(kLabel)
        gNodes.push(gNode)
    }

    for (let [linkIndex, link] of map.links.entries()) {
        let kStartHandle = new Konva.Circle({
            radius: LINK_HANDLE_RADIUS,
            // fill: 'red',
            draggable: true,
        })
        let kEndHandle = new Konva.Circle({
            radius: LINK_HANDLE_RADIUS,
            // fill: 'blue',
            draggable: true,
        })

        let kArrow = new Konva.Arrow({
            fill: '#4e6ea5',
            stroke: '#4e6ea5',
            lineCap: 'round',
            pointerWidth: 10,
            pointerLength: 8,
            listening: false,
            points: [0, 0, 0, 0]
        })

        let kLabel = new Konva.Label()
        kLabel.add(new Konva.Tag({
            fill: '#ffffffaa',
            cornerRadius: 2
        }))
        let kText = new Konva.Text({
            text: link.verb,
            padding: 2,
            fontFamily: 'Quicksand'
        })
        kLabel.add(kText)

        let graphicalLink = new GraphicalLink(link, kArrow, kLabel, kStartHandle, kEndHandle)

        const dragEndHandle = (isStartHandle) => {
            const pos = kStage.getPointerPosition()
            const intersectedKNode = kMainLayer.getIntersection(pos);

            if (intersectedKNode) {
                let oldNode
                const intersectedNodeIndex = intersectedKNode.index
                if (isStartHandle) {
                    oldNode = gNodes[link.from].kNode
                    link.from = intersectedNodeIndex
                } else {
                    oldNode = gNodes[link.to].kNode
                    link.to = intersectedNodeIndex
                }
                // Si on a relié le début et la fin au même nœud, on inverse les liens,
                // sinon on prend le nouveau nœud
                // if (intersectedKNode === gNodes[link.to].kNode) {
                //     [link.from, link.to] = [link.to, link.from]
                // }

                // On met à jour les liens entrants et sortants de l'ancien
                // nœud et du nouveau nœud intersecté
                if (isStartHandle) {
                    for (let i = 0; i < gNodes[oldNode.index].outGLinks.length; ++i) {
                        if (gNodes[oldNode.index].outGLinks[i] === graphicalLink) {
                            gNodes[oldNode.index].outGLinks.splice(i, 1)
                            break
                        }
                    }
                    gNodes[intersectedNodeIndex].outGLinks.push(graphicalLink)
                } else {
                    for (let i = 0; i < gNodes[oldNode.index].inGLinks.length; ++i) {
                        if (gNodes[oldNode.index].inGLinks[i] === graphicalLink) {
                            gNodes[oldNode.index].inGLinks.splice(i, 1)
                            break
                        }
                    }
                    gNodes[intersectedNodeIndex].inGLinks.push(graphicalLink)
                }
            }

            if (isStartHandle) {
                kStartHandle.moveTo(kMainLayer)
            } else {
                kEndHandle.moveTo(kMainLayer)
            }

            graphicalLink.updateHandles(gNodes)
            kMainLayer.batchDraw()
        }

        kStartHandle.on('dragend', () => dragEndHandle(true))
        kEndHandle.on('dragend', () => dragEndHandle(false))

        kStartHandle.on('dragstart', () => {
            kStartHandle.moveTo(kDragLayer)
        })
        kEndHandle.on('dragstart', () => {
            kEndHandle.moveTo(kDragLayer)
        })

        kStartHandle.on('dragmove', () => {
            graphicalLink.moveStartHandle(gNodes, kStartHandle.x(), kStartHandle.y())
            kMainLayer.batchDraw()
        })
        kEndHandle.on('dragmove', () => {
            graphicalLink.moveEndHandle(gNodes, kEndHandle.x(), kEndHandle.y())
            kMainLayer.batchDraw()
        })

        kLabel.on('dblclick', () => {
            konvaHandleTextInput(kText, newValue => {
                link.verb = newValue
                graphicalLink.updateHandles(gNodes)
                kMainLayer.batchDraw()
            })
        })

        // Position initiale
        graphicalLink.updateHandles(gNodes)

        kMainLayer.add(kArrow)
        kMainLayer.add(kLabel)
        kMainLayer.add(kStartHandle)
        kMainLayer.add(kEndHandle)
        gLinks.push(graphicalLink)
    }

    for (let [gNodeIndex, gNode] of gNodes.entries()) {
        for (const gLink of gLinks) {
            if (gLink.link.from === gNodeIndex) {
                gNode.outGLinks.push(gLink)
            } else if (gLink.link.to === gNodeIndex) {
                gNode.inGLinks.push(gLink)
            }
        }
    }

    kStage.add(kMainLayer)
    kStage.add(kDragLayer)
    kStage.scale({ x: 1.5, y: 1.5 })
    kStage.draw()

    kStage.on('wheel', e => {
        e.evt.preventDefault()
        let oldScale = kStage.scaleX()
        let mousePos = kStage.getPointerPosition()

        let mousePointTo = {
            x: (mousePos.x - kStage.x()) / oldScale,
            y: (mousePos.y - kStage.y()) / oldScale,
        }
        let newScale = e.evt.deltaY > 0 ? oldScale / ZOOM_SPEED : oldScale * ZOOM_SPEED

        kStage.scale({ x: newScale, y: newScale })

        let newPos = {
            x: mousePos.x - mousePointTo.x * newScale,
            y: mousePos.y - mousePointTo.y * newScale,
        }
        kStage.position(newPos)
        kStage.batchDraw()
    })

    window.addEventListener('resize', () => {
        const containerWidth = stageContainerElt.offsetWidth
        const containerHeight = stageContainerElt.offsetHeight
        kStage.width(containerWidth)
        kStage.height(containerHeight)
        kStage.batchDraw()
    })
})

function konvaHandleTextInput(kText, onInput, bold = false) {
    // Inspiré de https://konvajs.org/docs/sandbox/Editable_Text.html

    let kStage = kText.getStage()
    let layer = kText.getLayer()

    kText.hide()
    layer.draw()

    // create textarea over canvas with absolute position
    // first we need to find position for textarea
    // how to find it?

    // at first lets find position of text node relative to the kStage:
    let textPosition = kText.absolutePosition()

    // then lets find position of kStage container on the page:
    let stageBox = kStage.container().getBoundingClientRect()

    // so position of textarea will be the sum of positions above:
    let areaPosition = {
        x: stageBox.left + textPosition.x,
        y: stageBox.top + textPosition.y,
    }

    // create textarea and style it
    let textarea = document.createElement('textarea')
    document.body.appendChild(textarea)

    const scale = kStage.scale().x
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
