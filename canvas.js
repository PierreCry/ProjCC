const NODE_LABEL_OFFSETX = 20
const NODE_LABEL_OFFSETY = 20
const LINK_HANDLE_RADIUS = 10
const ZOOM_SPEED = 1.05
const FONT = 'Open Sans, sans-serif'

const EVENT_MOUSE_DOWN = 'mousedown touchstart'
const EVENT_MOUSE_UP = 'mouseup touchend'
const EVENT_DOUBLE_CLICK = 'dblclick dbltap'

const STATE_DEFAULT = 1
const STATE_CREATING_LINK = 2

class GraphicalNode extends Konva.Group {
    constructor(node, index) {
        // Étant donné qu'on hérite de `Konva.Group`, il faut faire
        // attention à ce que les propriétés de `GraphicalNode` n'écrasent pas
        // celles de `Konva.Group`.
        // TODO: Est-ce viable sur le long terme ? Le problème est de pouvoir
        // récupérer un `GraphicalNode` depuis Konva lors d'un test
        // d'intersection. Il serait mieux de pouvoir directement injecter un
        // `GraphicalNode` dans un `Konva.Group` plutôt que de l'étendre.
        super({
            x: node.x,
            y: node.y,
        })
        this.node = node
        this.nodeIndex = index
        this.gLinks = []
        // Ce nom est utilisé pour savoir si on a intersecté un `GraphicalNode`
        // quand on relâche un lien.
        this.name('graphicalNode')

        let kNode = new Konva.Rect({
            fill: '#d9e1f3',
            stroke: 'blue',
            strokeEnabled: false,
            cornerRadius: 4,
        })

        let kLabel = new Konva.Label({
            listening: false,
        })
        let kText = new Konva.Text({
            text: node.name,
            fontFamily: FONT,
            fontStyle: 'bold',
        })
        kLabel.add(kText)

        this.add(kNode, kLabel);

        this.kNode = kNode
        this.kLabel = kLabel
        this.kText = kText

        this.updateName(node.name)
        this.move(node.x, node.y)
    }

    move(newX, newY) {
        this.node.x = newX
        this.node.y = newY

        this.x(newX)
        this.y(newY)

        this.updateLinks()
    }

    updateName(newName) {
        const newWidth = this.kLabel.width() + NODE_LABEL_OFFSETX
        const newHeight = this.kLabel.height() + NODE_LABEL_OFFSETY

        this.node.name = newName

        this.kNode.width(newWidth)
        this.kNode.height(newHeight)
        this.width(newWidth)
        this.height(newHeight)

        this.kLabel.x(newWidth * .5 - this.kLabel.width() * .5)
        this.kLabel.y(newHeight * .5 - this.kLabel.height() * .5)

        this.updateLinks()
    }

    updateLinks() {
        for (let gLink of this.gLinks) {
            gLink.updateHandles()
        }
    }
}

// TODO: Même remarque que ci-dessus par rapport à l'héritage de `Konva.Group`.
class GraphicalLink extends Konva.Group {
    constructor(link, gNodeFrom, gNodeTo) {
        super()
        this.link = link
        this.gNodeFrom = gNodeFrom
        this.gNodeTo = gNodeTo

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
            fontFamily: FONT
        })
        kLabel.add(kText)

        this.add(kStartHandle, kEndHandle, kArrow, kLabel)
        this.kStartHandle = kStartHandle
        this.kEndHandle = kEndHandle
        this.kArrow = kArrow
        this.kLabel = kLabel
        this.kText = kText
    }

    updateHandles() {
        // Étant donné que `moveHandle` déplace les *deux côtés* de la flèche,
        // il suffit de lui demander de déplacer un côté, et il déplacera
        // l'autre.
        if (this.gNodeFrom && this.gNodeTo) {
            const startHandlePos = computeArrowIntersection(this.gNodeFrom, this.gNodeTo)
            this.moveHandle(true, startHandlePos.x, startHandlePos.y)
        }
    }

    updateVerb(newVerb) {
        this.link.verb = newVerb
        this.updateHandles()
    }

    moveHandle(isStartHandle, newX, newY) {
        // Calcul de l'intersection avec le nœud opposé
        const gNodeOtherSide = isStartHandle ? this.gNodeTo : this.gNodeFrom
        const otherSide = computeArrowIntersectionFromPoints(gNodeOtherSide, newX, newY)

        // TODO: On peut utiliser `setAttrs` pour configurer plusieurs attributs
        // d'un coup, au lieu de le faire individuellement.

        // Mise à jour de la flèche
        // TODO: Les handles, qui permettent de déplacer la flèche, sont placés
        // exactement sur le début et la fin de la flèche, ce qui fait qu'on
        // peut prendre la flèche par erreur si on clique trop près du bord des
        // nœuds. Il faut réfléchir à un positionnement plus adapté.
        if (isStartHandle) {
            this.kStartHandle.x(newX)
            this.kStartHandle.y(newY)
            this.kArrow.points()[0] = newX
            this.kArrow.points()[1] = newY
            this.kArrow.points()[2] = otherSide.x
            this.kArrow.points()[3] = otherSide.y
            this.kEndHandle.x(otherSide.x)
            this.kEndHandle.y(otherSide.y)
        } else {
            this.kEndHandle.x(newX)
            this.kEndHandle.y(newY)
            this.kArrow.points()[0] = otherSide.x
            this.kArrow.points()[1] = otherSide.y
            this.kArrow.points()[2] = newX
            this.kArrow.points()[3] = newY
            this.kStartHandle.x(otherSide.x)
            this.kStartHandle.y(otherSide.y)
        }

        // Mise à jour du label
        const halfLabelWidth = this.kLabel.width() * .5
        const halfLabelHeight = this.kLabel.height() * .5
        this.kLabel.x((this.kStartHandle.x() + this.kEndHandle.x()) * .5 - halfLabelWidth)
        this.kLabel.y((this.kStartHandle.y() + this.kEndHandle.y()) * .5 - halfLabelHeight)
    }

    setFromNode(fromNodeIndex, gNodeFrom) {
        this.link.from = fromNodeIndex
        this.gNodeFrom = gNodeFrom
    }

    setToNode(toNodeIndex, gNodeTo) {
        this.link.to = toNodeIndex
        this.gNodeTo = gNodeTo
    }

    swapFromAndToNodes() {
        ;[this.link.from, this.link.to] = [this.link.to, this.link.from]
        ;[this.gNodeFrom, this.gNodeTo] = [this.gNodeTo, this.gNodeFrom]
    }
}

function getAbsolutePointerPosition(kStage) {
    const inverseTranform = kStage.getAbsoluteTransform().copy().invert()

    return inverseTranform.point(kStage.getPointerPosition())
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

class CanvasMap {
    constructor(container) {
        this.state = STATE_DEFAULT

        this.kStage = new Konva.Stage({
            container,
            width: container.offsetWidth,
            height: container.offsetHeight,
            draggable: true,
        })

        this.kMainLayer = new Konva.Layer()
        // On utilise le `kDragLayer` pour déplacer les éléments qui sont
        // en train d'être déplacés afin qu'ils ne "cachent" pas le nœud
        // sous-jacent qu'on veut intersecter avec le curseur.
        // TODO: Au lieu de faire ça, on pourrait peut-être simplement
        // désactiver l'écoute des événements durant le déplacement.
        this.kDragLayer = new Konva.Layer()

        this.kStage.add(this.kMainLayer)
        this.kStage.add(this.kDragLayer)

        this.gLinks = []
        this.gNodes = []

        this.kStage.scale({ x: 1.5, y: 1.5 })
        this.kStage.draw()

        this.kStage.on('wheel', e => {
            e.evt.preventDefault()
            let oldScale = this.kStage.scaleX()
            let mousePos = this.kStage.getPointerPosition()

            let mousePointTo = {
                x: (mousePos.x - this.kStage.x()) / oldScale,
                y: (mousePos.y - this.kStage.y()) / oldScale,
            }
            let newScale = e.evt.deltaY > 0 ? oldScale / ZOOM_SPEED : oldScale * ZOOM_SPEED

            this.kStage.scale({ x: newScale, y: newScale })

            let newPos = {
                x: mousePos.x - mousePointTo.x * newScale,
                y: mousePos.y - mousePointTo.y * newScale,
            }
            this.kStage.position(newPos)
            this.kStage.batchDraw()
        })

        // Configuration des boutons de l'interface
        // TODO: Il faudra passer les boutons de l'interface au constructeur au
        // lieu de les récupérer d'ici.
        let buttonsElt = document.querySelector('.icon-bar').children
        let nodeButtonElt = buttonsElt[1]
        let linkButtonElt = buttonsElt[2]

        linkButtonElt.addEventListener('click', () => {
            this.state = STATE_CREATING_LINK
        })

        nodeButtonElt.addEventListener('click', () => {
            const node = {
                x: 0,
                y: 0,
                name: 'Concept'
            }
            this.addGraphicalNode(node)
        })

        window.addEventListener('resize', () => {
            const container = this.kStage.container()
            const containerWidth = container.offsetWidth
            const containerHeight = container.offsetHeight
            this.kStage.width(containerWidth)
            this.kStage.height(containerHeight)
            this.kStage.batchDraw()
        })
    }

    addGraphicalNode(node) {
        const gNode = this._createGraphicalNode(node)

        this.gNodes.push(gNode)
        this.kMainLayer.add(gNode)
        this.kMainLayer.draw()

        return gNode
    }

    addGraphicalLink(link) {
        const gLink = this._createGraphicalLink(link)

        this.gLinks.push(gLink)
        this.kMainLayer.add(gLink)
        this.kMainLayer.draw()

        return gLink
    }

    _createGraphicalNode(node) {
        const nodeIndex = this.gNodes.length
        let gNode = new GraphicalNode(node, nodeIndex)

        gNode.on(EVENT_DOUBLE_CLICK, () => {
            konvaHandleTextInput(gNode.kText, newValue => {
                gNode.updateName(newValue)
            }, true)
        })

        gNode.on('dragmove', () => {
            gNode.move(gNode.x(), gNode.y())
        })

        gNode.on(EVENT_MOUSE_DOWN, () => {
            if (this.state === STATE_CREATING_LINK) {
                const link = {
                    from: nodeIndex,
                    to: -1,
                    verb: 'Lien',
                }
                // TODO: Il ne faudrait pas que `addGraphicalLink` mette à jour
                // le layer principal car on n'a pas encore positionné les
                // handles (on voit donc le lien apparaître à (0, 0)).
                const gLink = this.addGraphicalLink(link)
                gNode.gLinks.push(gLink)

                const pointerPos = getAbsolutePointerPosition(this.kStage)
                gLink.kEndHandle.setAttrs({
                    x: pointerPos.x,
                    y: pointerPos.y
                })
                gLink.kEndHandle.startDrag()
            } else {
                gNode.startDrag()
            }
        })

        gNode.on(EVENT_MOUSE_UP, () => {
            if (this.state !== STATE_CREATING_LINK) {
                gNode.stopDrag()
            }
        })

        return gNode
    }

    _createGraphicalLink(link) {
        const gNodeFrom = link.from !== -1 ? this.gNodes[link.from] : undefined
        const gNodeTo = link.to !== -1 ? this.gNodes[link.to] : undefined
        let gLink = new GraphicalLink(link, gNodeFrom, gNodeTo)

        // On met les handles sur leur propre layer quand on les drag pour
        // qu'ils ne gênent pas lors de la détection du nœud intersecté
        // TODO: Il faut empêcher de pouvoir drag un lien si on est dans l'état
        // `STATE_CREATING_LINK`, car sinon il se détruit si on le relâche dans
        // le vide (puisque c'est ce qu'on veut faire si on relâche un lien
        // en cours de création).
        const onHandleDragStart = e => e.target.moveTo(this.kDragLayer)
        gLink.kStartHandle.on('dragstart', onHandleDragStart)
        gLink.kEndHandle.on('dragstart', onHandleDragStart)

        gLink.kStartHandle.on('dragend', () => {
            this._onHandleDragEnd(true, gLink)
        })
        gLink.kEndHandle.on('dragend', () => {
            this._onHandleDragEnd(false, gLink)
        })

        gLink.kStartHandle.on('dragmove', () => {
            gLink.moveHandle(true, gLink.kStartHandle.x(), gLink.kStartHandle.y())
            this.kMainLayer.batchDraw()
        })
        gLink.kEndHandle.on('dragmove', () => {
            gLink.moveHandle(false, gLink.kEndHandle.x(), gLink.kEndHandle.y())
            this.kMainLayer.batchDraw()
        })

        gLink.kLabel.on(EVENT_DOUBLE_CLICK, () => {
            konvaHandleTextInput(gLink.kText, newValue => {
                gLink.updateVerb(newValue)
                this.kMainLayer.batchDraw()
            })
        })

        // Position initiale
        gLink.updateHandles()

        return gLink
    }

    _onHandleDragEnd(isStartHandle, gLink) {
        const pos = this.kStage.getPointerPosition()
        // TODO: On récupère le nœud intersecté depuis le layer principal,
        // en espérant que les `GraphicalNode` représentant les nœuds soient
        // les premiers objets à être intersectés. Cela signifie que si par
        // hasard il y a des éléments graphiques sur ce layer et qu'ils sont
        // "devant" les nœuds, on ne détectera pas l'intersection avec le
        // rectangle sous-jacent. Pour s'assurer de détecter l'intersection
        // quelque soient les éléments sur le rectangle, on pourrait
        // simplement parcourir chaque rectangle et tester si le curseur
        // se trouve à l'intérieur du rectangle, mais ce n'est pas très
        // efficace. Une autre solution serait peut-être de placer les
        // nœuds sur leur propre layer ou quelque chose comme ça.
        const intersectedKNode = this.kMainLayer.getIntersection(pos);

        // On remet le handle dans le `GraphicalLink` auquel il appartient (qui
        // est un `Konva.Group`)
        if (isStartHandle) {
            gLink.kStartHandle.moveTo(gLink)
        } else {
            gLink.kEndHandle.moveTo(gLink)
        }
        this.kDragLayer.draw()

        // On récupère l'éventuel `GraphicalNode` qu'on a potentiellement
        // intersecté
        const gNode = intersectedKNode?.findAncestor('.graphicalNode')

        if (gNode) {
            const intersectedNodeIndex = gNode.nodeIndex

            // Si on a relié le début et la fin au même nœud, on inverse les
            // liens, sinon on se connecte au nouveau nœud
            if (!isStartHandle && intersectedNodeIndex === gLink.link.from ||
                isStartHandle && intersectedNodeIndex === gLink.link.to
            ) {
                gLink.swapFromAndToNodes()
            } else {
                let oldNode
                if (isStartHandle) {
                    oldNode = this.gNodes[gLink.from]
                    gLink.setFromNode(intersectedNodeIndex, this.gNodes[intersectedNodeIndex])
                } else {
                    if (gLink.link.to !== -1) {
                        oldNode = this.gNodes[gLink.link.to]
                    }
                    gLink.setToNode(intersectedNodeIndex, this.gNodes[intersectedNodeIndex])
                }

                if (oldNode) {
                    // On supprime ce lien de l'ancien nœud...
                    for (let i = 0; i < oldNode.gLinks.length; ++i) {
                        if (oldNode.gLinks[i] === gLink) {
                            oldNode.gLinks.splice(i, 1)
                            break
                        }
                    }
                }
                // ...et on l'ajoute au nœud intersecté
                this.gNodes[intersectedNodeIndex].gLinks.push(gLink)
            }
        } else if (this.state === STATE_CREATING_LINK) {
            // On est en train de créer un lien mais on n'a pas trouvé de nœud
            // cible, on détruit donc le lien en cours de création
            gLink.destroy()

            // On le supprime du nœud
            let node = this.gNodes[gLink.link.from]
            for (let i = 0; i < node.gLinks.length; ++i) {
                if (node.gLinks[i] === gLink) {
                    node.gLinks.splice(i, 1)
                    break
                }
            }

            this.state = STATE_DEFAULT

            this.kDragLayer.draw()
            this.kMainLayer.draw()

            return
        }

        if (this.state === STATE_CREATING_LINK) {
            this.state = STATE_DEFAULT
        }

        gLink.updateHandles()

        this.kMainLayer.draw()
    }
}

function createCanvasMap(container, map = { nodes: [], links: [] }) {
    let canvasMap = new CanvasMap(container)

    // Initialisation de la map
    // TODO: `addGraphicalNode` et `addGraphicalLink` redessinent automatiquement
    // le canvas, ce qui fait qu'on va le redessiner plusieurs fois pour rien.
    // Il faudrait batcher les requêtes de dessin ou quelque chose comme ça.
    for (const node of map.nodes) {
        canvasMap.addGraphicalNode(node)
    }

    for (let link of map.links) {
        canvasMap.addGraphicalLink(link)
    }

    // Initialisation des liens connectés aux nœuds
    for (let [nodeIndex, gNode] of canvasMap.gNodes.entries()) {
        gNode.gLinks = []

        for (const gLink of canvasMap.gLinks) {
            if (gLink.link.from === nodeIndex ||
                gLink.link.to === nodeIndex
            ) {
                gNode.gLinks.push(gLink)
            }
        }
    }
}

window.addEventListener('DOMContentLoaded', () => {
    const mapJSON = `{"links":[{"from":0,"to":2,"verb":"entraîne"},{"from":1,"to":2,"verb":"entraîne"},{"from":2,"to":3,"verb":"entraîne"},{"from":2,"to":4,"verb":"entraîne"},{"from":4,"to":5,"verb":"entraîne"}],"nodes":[{"name":"Perte d'eau","x":138.22998992919986,"y":26.46000372314429},{"name":"Perte de Na","x":299.33999975585937,"y":26.42000000000001},{"name":"Baisse de la volémie","x":184.31998687744215,"y":131.85999493408235},{"name":"Réponse rénale","x":303.1199960327151,"y":237.87998651123132},{"name":"Baisse de la PSA","x":134.73000024414057,"y":239.1799876708992},{"name":"Tachycardie de compensation","x":95.55997955322391,"y":340.3799825439464}]}`
    const map = JSON.parse(mapJSON)
    const container = document.getElementById('canvas-container1')
    createCanvasMap(container, map)
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
