const NODE_LABEL_PADDINGX = 20
const NODE_LABEL_PADDINGY = 20
const LINK_HANDLE_RADIUS = 10
const ZOOM_SPEED = 1.05
const FONT = 'Open Sans, sans-serif'
const LINK_MARGIN = 2

// Permet de décaler la zone de détection de la pointe de la flèche,
// pour mieux correspondre avec son aspect visuel.
// TODO: La pointe de la flèche est bien décalée au repos mais elle se
// décale par erreur quand on la fait glisser.
const END_HANDLE_OFFSET = 5

const EVENT_MOUSE_DOWN = 'mousedown touchstart'
const EVENT_MOUSE_UP = 'mouseup touchend'
const EVENT_DOUBLE_CLICK = 'dblclick dbltap'

const STATE_DEFAULT = 1
const STATE_CREATING_LINK = 2

/**
 * Supprime l'élément du tableau.
 *
 * @param {*} array Le tableau duquel supprimer l'élément.
 * @param {*} elem L'élément à supprimer.
 */
function removeFromArray(array, elem) {
    const indexElemToDelete = array.indexOf(elem)
    if (indexElemToDelete >= 0) array.splice(indexElemToDelete, 1)
}

class GraphicalNode {
    constructor(node, index) {
        this.node = node
        this.index = index
        this.gLinks = []
        this.isSelected = false

        // On met tous les éléments graphiques constituant le nœud dans un
        // `Konva.Group`.
        this.kGroup = new Konva.Group({
            x: node.x,
            y: node.y,
            // Le nom est utilisé pour savoir si on a intersecté un `GraphicalNode`
            // quand on relâche un lien.
            name: 'graphicalNode',
        })

        // On donne au groupe notre indice, pour pouvoir le récupérer lors du
        // test d'intersection. Le nom de cet attribut doit être unique et ne
        // doit pas être utilisé en interne par Konva !
        this.kGroup.setAttr('_gNodeIndex', index)

        let kNode = new Konva.Rect({
            fill: '#d9e1f3',
            stroke: '#5585f2',
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

        this.kGroup.add(kNode, kLabel);

        this.kNode = kNode
        this.kLabel = kLabel
        this.kText = kText

        this.updateName(node.name)
        this.move(node.x, node.y)
    }

    x() {
        return this.kGroup.x()
    }

    y() {
        return this.kGroup.y()
    }

    width() {
        return this.kGroup.width()
    }

    height() {
        return this.kGroup.height()
    }

    setSelected(selected) {
        this.isSelected = selected
        this.kNode.strokeEnabled(selected)
    }

    move(newX, newY) {
        this.node.x = newX
        this.node.y = newY

        this.kGroup.setAttrs({
            x: newX,
            y: newY
        })

        this.updateLinks()
    }

    updateName(newName) {
        const newWidth = this.kLabel.width() + NODE_LABEL_PADDINGX
        const newHeight = this.kLabel.height() + NODE_LABEL_PADDINGY

        this.node.name = newName

        this.kNode.setAttrs({
            width: newWidth,
            height: newHeight,
        })
        // TODO: C'est dommage de devoir préciser la taille du `kGroup` alors
        // qu'elle pourrait se déduire des éléments qui le constituent.
        this.kGroup.setAttrs({
            width: newWidth,
            height: newHeight
        })

        this.kLabel.setAttrs({
            x: newWidth * .5 - this.kLabel.width() * .5,
            y: newHeight * .5 - this.kLabel.height() * .5,
        })

        this.updateLinks()
    }

    updateLinks() {
        for (let gLink of this.gLinks) {
            gLink.updateHandles()
        }
    }
}

class GraphicalLink {
    constructor(link, gNodeFrom, gNodeTo) {
        this.link = link
        this.gNodeFrom = gNodeFrom
        this.gNodeTo = gNodeTo

        // De même que pour les `GraphicalNode`, on stocke les éléments
        // graphiques dans un `Konva.Group`.
        this.kGroup = new Konva.Group()

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

        this.kGroup.add(kStartHandle, kEndHandle, kArrow, kLabel)
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
        const dx = newX - otherSide.x
        const dy = newY - otherSide.y
        const arrowLength = Math.sqrt(dx ** 2 + dy ** 2)

        // Mise à jour de la flèche
        if (isStartHandle) {
            this.kStartHandle.setAttrs({
                x: newX,
                y: newY,
            })
            this.kArrow.setAttr('points', [newX, newY, otherSide.x, otherSide.y])
            this.kEndHandle.setAttrs({
                x: newX - (1 - (END_HANDLE_OFFSET / arrowLength)) * dx,
                y: newY - (1 - (END_HANDLE_OFFSET / arrowLength)) * dy,
            })
        } else {
            this.kEndHandle.setAttrs({
                x: newX,
                y: newY,
            })
            this.kArrow.setAttr('points', [otherSide.x, otherSide.y, newX, newY])
            this.kStartHandle.setAttrs({
                x: otherSide.x,
                y: otherSide.y,
            })
        }

        // Mise à jour du label
        const halfLabelWidth = this.kLabel.width() * .5
        const halfLabelHeight = this.kLabel.height() * .5
        this.kLabel.setAttrs({
            x: (this.kStartHandle.x() + this.kEndHandle.x()) * .5 - halfLabelWidth,
            y: (this.kStartHandle.y() + this.kEndHandle.y()) * .5 - halfLabelHeight,
        })
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

function computeArrowIntersectionFromPoints(gNodeStart, endX, endY) {
    let startX = gNodeStart.x() + gNodeStart.width() * .5
    let startY = gNodeStart.y() + gNodeStart.height() * .5
    let dx = endX - startX
    let dy = endY - startY
    let tTop = (gNodeStart.y() - LINK_MARGIN - startY) / dy
    let tBottom = (gNodeStart.y() + gNodeStart.height() + LINK_MARGIN - startY) / dy
    let tRight = (gNodeStart.x() + gNodeStart.width() + LINK_MARGIN - startX) / dx
    let tLeft = (gNodeStart.x() - LINK_MARGIN - startX) / dx
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

function computeArrowIntersection(gNodeStart, gNodeEnd) {
    let endX = gNodeEnd.x() + gNodeEnd.width() * .5
    let endY = gNodeEnd.y() + gNodeEnd.height() * .5

    return computeArrowIntersectionFromPoints(gNodeStart, endX, endY)
}

class CanvasMap {
    constructor(container, map) {
        this.container = container
        this.map = map
        this.state = STATE_DEFAULT
        this.selectedGNode = undefined
        this.kDraggingElement = undefined

        this.kStage = new Konva.Stage({
            container,
            width: container.offsetWidth,
            height: container.offsetHeight,
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

        this.gNodes = []
        this.gLinks = []

        this.kStage.scale({ x: 1.5, y: 1.5 })
        this.kStage.draw()

        this.kStage.on(EVENT_MOUSE_DOWN, e => {
            // On active le drag du stage si on a cliqué dans le vide
            if (e.target === this.kStage) {
                this.kStage.startDrag()
            }

            // On récupère le `kGroup` d'un `GraphicalNode` qu'on a
            // potentiellement intersecté.
            const gNodeKGroupClicked = e.target.findAncestor('.graphicalNode')
            // On en extrait le `gNode` à partir de l'indice stocké dans le
            // groupe.
            const gNodeIndex = gNodeKGroupClicked ?
                gNodeKGroupClicked.getAttr('_gNodeIndex') :
                -1
            const gNodeClicked = gNodeIndex >= 0 ?
                this.gNodes[gNodeIndex] :
                undefined

            // Gestion de la sélection d'un nœud
            if (gNodeClicked !== this.selectedGNode) {
                if (this.selectedGNode) {
                    // On déselectionne le nœud précédemment sélectionné
                    this.selectedGNode.setSelected(false)
                    this.selectedGNode = undefined
                    this._hideFloatingToolbar()
                }

                if (gNodeClicked) {
                    // On sélectionne le nouveau nœud
                    gNodeClicked.setSelected(true)
                    this.selectedGNode = gNodeClicked

                    this._moveFloatingBarToNode(gNodeClicked)
                    this._showFloatingToolbar()
                }

                this.kStage.draw()
            }

            // Gestion du clic sur un nœud
            if (gNodeClicked) {
                if (this.state === STATE_CREATING_LINK) {
                    const link = {
                        from: gNodeClicked.index,
                        to: -1,
                        verb: 'Lien',
                    }
                    const gLink = this.addGraphicalLink(link, false)
                    gNodeClicked.gLinks.push(gLink)

                    const pointerPos = getAbsolutePointerPosition(this.kStage)
                    gLink.moveHandle(false, pointerPos.x, pointerPos.y)
                    gLink.kEndHandle.startDrag()
                    this.kDraggingElement = gLink.kEndHandle
                } else {
                    // On met le nœud au premier plan et on active le drag.
                    gNodeClicked.kGroup.moveToTop()
                    gNodeClicked.kGroup.startDrag()
                    this.kDraggingElement = gNodeClicked.kGroup
                }
            } else if (this.state === STATE_CREATING_LINK) {
                // On repasse en mode normal si on n'a pas cliqué sur un nœud et
                // qu'on est en mode création de lien.
                this.state = STATE_DEFAULT
            }
        })

        this.kStage.on('wheel', e => {
            e.evt.preventDefault()
            let oldScale = this.kStage.scaleX()
            let mousePos = this.kStage.getPointerPosition()

            let mousePointTo = {
                x: (mousePos.x - this.kStage.x()) / oldScale,
                y: (mousePos.y - this.kStage.y()) / oldScale,
            }
            let newScale = e.evt.deltaY > 0 ?
                oldScale / ZOOM_SPEED :
                oldScale * ZOOM_SPEED

            this.kStage.scale({ x: newScale, y: newScale })

            let newPos = {
                x: mousePos.x - mousePointTo.x * newScale,
                y: mousePos.y - mousePointTo.y * newScale,
            }
            this.kStage.position(newPos)

            if (this.selectedGNode) {
                this._moveFloatingBarToNode(this.selectedGNode)
            }

            this.kStage.batchDraw()
        })

        // Barre flottante
        this.floatingBarElt = document.getElementById('floating-toolbar')
        let deleteNodeButtonElt = this.floatingBarElt.children[0]

        deleteNodeButtonElt.addEventListener('click', () => {
            if (!this.selectedGNode) return

            // On supprime le nœud actuellement sélectionné
            // TODO: S'assurer que `destroy` supprime aussi les event
            // listeners.
            this.selectedGNode.kGroup.destroy()
            // TODO: Il faut supprimer les nœuds dans les deux tableaux mais
            // si on fait ça, il faut remettre à jour tous les indices pour
            // tous les liens. Pour l'instant, on met juste les nœuds à
            // `undefined` pour ne pas invalider les indices.
            this.gNodes[this.selectedGNode.index] = undefined
            this.map.nodes[this.selectedGNode.index] = undefined
            // removeFromArray(this.gNodes, this.selectedGNode)
            // removeFromArray(this.map.nodes, this.selectedGNode.node)

            // On supprime tous les liens connectés à ce nœud
            for (let gLinkIndex = this.selectedGNode.gLinks.length - 1;
                 gLinkIndex >= 0;
                 --gLinkIndex
            ) {
                let gLink = this.selectedGNode.gLinks[gLinkIndex]
                gLink.kGroup.destroy()
                // On supprime le lien des nœuds connectés
                if (gLink.gNodeFrom) {
                    removeFromArray(gLink.gNodeFrom.gLinks, gLink)
                }
                if (gLink.gNodeTo) {
                    removeFromArray(gLink.gNodeTo.gLinks, gLink)
                }
                removeFromArray(this.map.links, gLink.link)
            }

            this._hideFloatingToolbar()
            this.selectedGNode = undefined
            this.kStage.draw()
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

        window.addEventListener('mouseup', () => {
            this.kStage.stopDrag()

            if (this.kDraggingElement) {
                this.kDraggingElement.stopDrag()
                this.kDraggingElement = undefined
            }
        })
    }

    addGraphicalNode(node, redrawLayer = true) {
        const gNode = this._createGraphicalNode(node)

        this.gNodes.push(gNode)
        this.kMainLayer.add(gNode.kGroup)
        if (redrawLayer) this.kMainLayer.draw()

        return gNode
    }

    addGraphicalLink(link, redrawLayer = true) {
        const gLink = this._createGraphicalLink(link)

        this.gLinks.push(gLink)
        this.kMainLayer.add(gLink.kGroup)
        if (redrawLayer) this.kMainLayer.draw()

        return gLink
    }

    _createGraphicalNode(node) {
        const nodeIndex = this.gNodes.length
        let gNode = new GraphicalNode(node, nodeIndex)

        gNode.kGroup.on(EVENT_DOUBLE_CLICK, () => {
            konvaHandleTextInput(gNode.kText, newValue => {
                gNode.updateName(newValue)
                this._moveFloatingBarToNode(gNode)
            }, true)
        })

        gNode.kGroup.on('dragmove', () => {
            gNode.move(gNode.x(), gNode.y())
            this._moveFloatingBarToNode(gNode)
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
        const onHandleDragStart = e => {
            e.target.moveTo(this.kDragLayer)
            gLink.kGroup.moveToTop()
        }
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

        // On remet le handle dans le groupe du `GraphicalLink` auquel il
        // appartient
        if (isStartHandle) {
            gLink.kStartHandle.moveTo(gLink.kGroup)
        } else {
            gLink.kEndHandle.moveTo(gLink.kGroup)
        }
        this.kDragLayer.draw()

        // On récupère le `Konva.Group` du nœud qu'on a potentiellement
        // intersecté
        const kGroup = intersectedKNode ?
            intersectedKNode.findAncestor('.graphicalNode') :
            undefined

        const intersectedNodeIndex = kGroup ? kGroup.getAttr('_gNodeIndex') : -1

        if (intersectedNodeIndex >= 0 &&
            (!this.state === STATE_CREATING_LINK ||
             gLink.link.from !== intersectedNodeIndex)
        ) {
            // On a trouvé un nœud destination et dans le cas où on est en train
            // de créer un lien, ce nœud n'est pas le nœud de départ.

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
                    gLink.setFromNode(
                        intersectedNodeIndex,
                        this.gNodes[intersectedNodeIndex])
                } else {
                    if (gLink.link.to !== -1) {
                        oldNode = this.gNodes[gLink.link.to]
                    }
                    gLink.setToNode(
                        intersectedNodeIndex,
                        this.gNodes[intersectedNodeIndex])
                }

                if (oldNode) {
                    // On supprime ce lien de l'ancien nœud...
                    removeFromArray(oldNode.gLinks, gLink)
                }
                // ...et on l'ajoute au nœud intersecté
                this.gNodes[intersectedNodeIndex].gLinks.push(gLink)
            }
        } else if (this.state === STATE_CREATING_LINK) {
            // On est en train de créer un lien mais on n'a pas trouvé de nœud
            // cible, on détruit donc le lien en cours de création
            gLink.kGroup.destroy()
            // On le supprime du nœud
            // TODO: Plutôt que de supprimer le lien après coup (quand on se
            // rend compte qu'il n'a pas de destination), on pourrait
            // simplement ne pas l'ajouter en premier lieu et l'ajouter
            // seulement quand on a trouvé un nœud destination.
            removeFromArray(this.gNodes[gLink.link.from].gLinks, gLink)

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

    _showFloatingToolbar() {
        this.floatingBarElt.style.display = 'block'
    }

    _hideFloatingToolbar() {
        this.floatingBarElt.style.display = 'none'
    }

    _moveFloatingBarToNode(gNode) {
        // TODO: Récupérer la largeur dynamiquement.
        const floatingBarWidth = 40
        let pos = gNode.kGroup.absolutePosition()
        pos.x +=
            this.container.offsetLeft +
            gNode.width() * this.kStage.scaleX() / 2 -
            floatingBarWidth / 2
        pos.y += this.container.offsetTop - 50

        this.floatingBarElt.style.left = `${pos.x}px`
        this.floatingBarElt.style.top = `${pos.y}px`
    }
}

function createCanvasMap(container, map = { nodes: [], links: [] }) {
    let canvasMap = new CanvasMap(container, map)
    
    // Initialisation de la map
    for (const node of map.nodes) {
        canvasMap.addGraphicalNode(node, false)
    }

    let gLinks = []
    for (let link of map.links) {
        gLinks.push(canvasMap.addGraphicalLink(link, false))
    }

    canvasMap.kMainLayer.draw()

    // Initialisation des liens connectés aux nœuds
    for (let [nodeIndex, gNode] of canvasMap.gNodes.entries()) {
        gNode.gLinks = []

        for (const gLink of gLinks) {
            if (gLink.link.from === nodeIndex ||
                gLink.link.to === nodeIndex
            ) {
                gNode.gLinks.push(gLink)
            }
        }
    }

    return canvasMap;
}

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
