/*
    Ce fichier gère l'affichage de la carte conceptuelle dans le canvas HTML5.

    ## Représentation de la carte

    Un concept (aussi appelé « nœud ») de la carte conceptuelle est représenté
    par un objet du type `Node` ressemblant à quelque chose comme
    ```
    {
        id: number,   // ID du nœud
        x: number,    // Position x
        y: number,    // Position y
        name: string  // Nom du nœud
    }
    ```

    De même, un lien est représenté par un objet du type `Link` ressemblant à
    ```
    {
        from: number, // ID du nœud de départ
        to: number,   // ID du nœud d'arrivée
        verb: string  // Verbe associé au lien
    }
    ```

    Une carte conceptuelle est alors représentée par un objet du type
    ```
    {
        nodes: Node[],
        links: Link[]
    }
    ```

    Ces types ne sont pas définis explicitement ici, on suppose simplement que
    la carte (au format JSON) possède au moins ces informations. Si on veut
    étendre cette représentation, il n'y a pas de nouveau type à définir, il
    suffit de le prendre en compte directement dans le code.

    ## Interaction avec le canvas

    Pour visualiser graphiquement la carte et pouvoir la modifier, on utilise le
    framework [Konva](https://konvajs.org/) qui permet de gérer ces aspects plus
    facilement.

    On définit les classes `GraphicalNode` et `GraphicalLink` qui prennent en
    charge la représentation graphique des nœuds et des liens. Ces deux classes
    sont respectivement associées à un nœud et un lien qui leur est propre.
    Elles possèdent chacune une propriété `kGroup` de type `Konva.Group` qui
    permet de rassembler tous les éléments graphiques utilisés provenant de
    Konva (rectangles, cercles, flèches, etc.).

    Dans le code, tous les objets de type « graphique » sont préfixés par la
    lettre 'g' afin de ne pas les confondre avec les objets de type `Node` et
    `Link` définis plus haut (par ex. une variable `gNode` représente un nœud
    graphique et une variable `node` représente un nœud). De même, tous les
    objets provenant de Konva sont préfixés par la lettre 'k' afin de permettre
    un minimum de séparation avec ce framework (notamment dans le cas où l'on
    voudrait le remplacer).
*/

/** Police utilisée dans le canvas */
const FONT = 'Open Sans, sans-serif'

/** Padding du label des nœuds */
const NODE_LABEL_PADDINGX = 20
const NODE_LABEL_PADDINGY = 20

/** Rayon des "handles" des liens */
const LINK_HANDLE_RADIUS = 10

/** Vitesse du zoom lors du scroll */
const ZOOM_SPEED = 1.05

/** Marge autour du point de départ et d'arrivée des flèches par rapport aux nœuds */
const LINK_MARGIN = 2

/**
 * Décalage de la zone de détection de la pointe de la flèche. Permet de mieux
 * correspondre à son aspect visuel.
 */
const END_HANDLE_OFFSET = 5
// TODO(#1): La pointe de la flèche est bien décalée au repos mais elle se
// décale par erreur quand on la fait glisser.

/** Alias du nom des événements pour gérer le tactile par la même occasion */
const EVENT_MOUSE_DOWN = 'mousedown touchstart'
const EVENT_MOUSE_UP = 'mouseup touchend'
const EVENT_DOUBLE_CLICK = 'dblclick dbltap'

/** Énumération indiquant l'état actuel du canvas */
const STATE_DEFAULT = 1
const STATE_CREATING_LINK = 2

/**
 * Supprime l'élément du tableau.
 *
 * @param {*} array - Le tableau duquel supprimer l'élément.
 * @param {*} elem - L'élément à supprimer.
 */
function removeFromArray(array, elem) {
    const indexElemToDelete = array.indexOf(elem)
    if (indexElemToDelete >= 0) array.splice(indexElemToDelete, 1)
}

/**
 * Représente un nœud graphique.
 */
class GraphicalNode {
    /**
     * @param {Node} node - Le nœud associé.
     */
    constructor(node) {
        this.node = node
        this.index = node.id
        // Chaque nœud graphique stocke les liens graphiques qui sont
        // connectés à lui
        this.gLinks = []

        // On met tous les éléments graphiques représentant le nœud dans un
        // `Konva.Group`.
        this.kGroup = new Konva.Group({
            x: node.x,
            y: node.y,
            // Le nom est utilisé pour savoir si on a intersecté un
            // `GraphicalNode` quand on relâche un lien.
            name: 'graphicalNode',
        })

        // On stocke le nœud dans le groupe pour pouvoir le récupérer lors du
        // test d'intersection. Le nom de cet attribut doit être unique et ne
        // doit pas être utilisé en interne par Konva !
        this.kGroup.setAttr('_gNode', this)

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

    /**
     * Sélectionne ou désélectionne le nœud.
     *
     * @param {boolean} selected - Indique si le nœud est sélectionné.
     */
    setSelected(selected) {
        this.kNode.strokeEnabled(selected)
    }

    /**
     * Déplace le nœud graphique et met à jour le nœud associé.
     *
     * @param {number} newX - La nouvelle position x.
     * @param {number} newY - La nouvelle position y.
     */
    move(newX, newY) {
        this.node.x = newX
        this.node.y = newY

        this.kGroup.setAttrs({
            x: newX,
            y: newY
        })

        this.updateLinks()
    }

    /**
     * Renomme le nœud associé et met à jour la position des éléments graphiques.
     *
     * @param {string} newName - Le nouveau nom.
     */
    updateName(newName) {
        const newWidth = this.kLabel.width() + NODE_LABEL_PADDINGX
        const newHeight = this.kLabel.height() + NODE_LABEL_PADDINGY

        this.node.name = newName

        this.kNode.setAttrs({
            width: newWidth,
            height: newHeight,
        })
        // TODO(#2): C'est dommage de devoir préciser la taille du `kGroup`
        // alors qu'elle pourrait se déduire des éléments qui le constituent.
        // Peut-être utiliser `getClientRect` ?
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

    /**
     * Met à jour la position des liens graphiques associés.
     */
    updateLinks() {
        for (let gLink of this.gLinks) {
            gLink.updateHandles()
        }
    }
}

/**
 * Représente un lien graphique.
 */
class GraphicalLink {
    /**
     * @param {Link} link - Le lien associé.
     * @param {GraphicalNode} gNodeFrom - Le nœud graphique de départ.
     * @param {GraphicalNode} gNodeTo - Le nœud graphique d'arrivée.
     */
    constructor(link, gNodeFrom, gNodeTo) {
        this.link = link
        this.gNodeFrom = gNodeFrom
        this.gNodeTo = gNodeTo

        // De même que pour les `GraphicalNode`, on stocke les éléments
        // graphiques dans un `Konva.Group`.
        this.kGroup = new Konva.Group()

        // Les "handles" sont les éléments qui permettent de déplacer les deux
        // côtés de la flèche.
        this.kStartHandle = new Konva.Circle({
            radius: LINK_HANDLE_RADIUS,
            // fill: 'red',
            draggable: true,
        })
        this.kEndHandle = new Konva.Circle({
            radius: LINK_HANDLE_RADIUS,
            // fill: 'blue',
            draggable: true,
        })

        this.kArrow = new Konva.Arrow({
            fill: '#4e6ea5',
            stroke: '#4e6ea5',
            lineCap: 'round',
            pointerWidth: 10,
            pointerLength: 8,
            listening: false,
            points: [0, 0, 0, 0]
        })

        this.kLabel = new Konva.Label()
        this.kLabel.add(new Konva.Tag({
            fill: '#ffffffaa',
            cornerRadius: 2,
            stroke: '#5585f2',
            strokeWidth: 1,
            strokeEnabled: false,
        }))
        let kText = new Konva.Text({
            text: link.verb,
            padding: 3,
            fontFamily: FONT
        })
        this.kLabel.add(kText)

        this.kGroup.add(this.kStartHandle, this.kEndHandle, this.kArrow, this.kLabel)
    }

    /**
     * Sélectionne ou désélectionne le lien.
     *
     * @param {boolean} selected - Indique si le lien est sélectionné.
     */
    setSelected(selected) {
        this.kLabel.getTag().strokeEnabled(selected)
    }

    /**
     * Met à jour le verbe du lien associé et met à jour la position de la
     * flèche.
     *
     * @param {string} newVerb - Le nouveau verbe.
     */
    updateVerb(newVerb) {
        this.link.verb = newVerb
        this.updateHandles()
    }

    /**
     * Met à jour la position du lien en fonction des nœuds auxquels elle est
     * connectée.
     */
     updateHandles() {
        // Étant donné que `moveHandle` déplace les *deux côtés* de la flèche,
        // il suffit de lui demander de déplacer un côté, et il déplacera
        // l'autre.
        if (this.gNodeFrom && this.gNodeTo) {
            const startHandlePos = computeArrowIntersection(this.gNodeFrom, this.gNodeTo)
            this.moveHandle(true, startHandlePos.x, startHandlePos.y)
        }
    }

    /**
     * Déplace un "handle" et met à jour la position des éléments constituant
     * la flèche. À noter que l'autre "handle" sera aussi déplacé au passage.
     *
     * @param {boolean} isStartHandle - `true` si on déplace le "handle" de
     *      départ, `false` si on déplace le "handle" d'arrivée.
     * @param {number} newX - La nouvelle position x du "handle".
     * @param {number} newY - La nouvelle position y du "handle".
     */
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

    /**
     * Met à jour le nœud de départ.
     *
     * @param {GraphicalNode} gNodeFrom - Le nouveau nœud de départ.
     */
    setFromNode(gNodeFrom) {
        this.gNodeFrom = gNodeFrom
        this.link.from = gNodeFrom.index
    }

    /**
     * Met à jour le nœud d'arrivée.
     *
     * @param {GraphicalNode} gNodeTo - Le nouveau de d'arrivée.
     */
    setToNode(gNodeTo) {
        this.gNodeTo = gNodeTo
        this.link.to = gNodeTo.index
    }

    /**
     * Échange les nœuds de départ et d'arrivée.
     */
    swapFromAndToNodes() {
        ;[this.link.from, this.link.to] = [this.link.to, this.link.from]
        ;[this.gNodeFrom, this.gNodeTo] = [this.gNodeTo, this.gNodeFrom]
    }
}

/**
 * Récupère la position absolue du curseur sur le canvas.
 *
 * @param {Konva.Stage} kStage - Le stage.
 * @returns {{x: number, y: number}} - La position absolue du curseur.
 */
function getAbsolutePointerPosition(kStage) {
    const inverseTranform = kStage.getAbsoluteTransform().copy().invert()

    return inverseTranform.point(kStage.getPointerPosition())
}

/**
 * Ajuste les coordonnées d'un bout de la flèche de manière à s'arrêter avant
 * de rentrer dans le nœud. On peut utiliser cette fonction pour ajuster les
 * deux côtés de la flèche, il suffit de lui passer le nœud de *fin* et les
 * coordonnées (x, y) du *départ* de la flèche.
 *
 * @param {GraphicalNode} gNodeStart - Le nœud de départ de la flèche.
 * @param {Number} endX - La coordonnée x courante de la fin de la flèche.
 * @param {Number} endY - La coordonnée y courante de la fin de la flèche.
 * @returns Les coordonnées ajustées de la fin de la flèche.
 */
function computeArrowIntersectionFromPoints(gNodeStart, endX, endY) {
    let startX = gNodeStart.x() + gNodeStart.width() * .5
    let startY = gNodeStart.y() + gNodeStart.height() * .5
    let dx = endX - startX
    let dy = endY - startY
    // C'est ici qu'on a un problème avec le TODO(#1), il ne faudrait pas
    // décaler les coordonnées en incluant `LINK_MARGIN` dans le calcul. En fait
    // on veut décaler les coordonnées quand la flèche bouge toute seule
    // (par ex. quand on déplace un nœud) mais il ne faut rien décaler du tout
    // quand c'est l'utilisateur qui est en train de déplacer le bout de la
    // flèche.
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

/**
 * Calcule les coordonnées de fin de la flèche pour ne pas qu'elle rentre dans
 * le nœud.
 *
 * @param {GraphicalNode} gNodeStart - Le nœud de départ.
 * @param {GraphicalNode} gNodeEnd - Le nœud d'arrivée.
 * @returns Les coordonnées de fin de la flèche ajustées.
 */
function computeArrowIntersection(gNodeStart, gNodeEnd) {
    let endX = gNodeEnd.x() + gNodeEnd.width() * .5
    let endY = gNodeEnd.y() + gNodeEnd.height() * .5

    return computeArrowIntersectionFromPoints(gNodeStart, endX, endY)
}

/**
 * Gère l'affichage et la modification d'une carte conceptuelle dans un canvas.
 */
class CanvasMap {
    /**
     * @param {HTMLElement} container - L'élément dans lequel injecter le canvas.
     * @param {{nodes: Node[], links: Link[]}} map - La map à importer.
     */
    constructor(container, map) {
        this.container = container
        this.map = map

        /**
         * L'état actuel (utilisé pour l'instant uniquement pour savoir si on
         * est en train de créer un lien).
         */
        this.state = STATE_DEFAULT

        /**
         * L'objet graphique actuellement sélectionné.
         * @type {GraphicalNode | GraphicalLink}
         */
        this.selectedGObject = undefined

        /**
         * L'élément Konva en train d'être déplacé (permet d'arrêter le drag
         * dès qu'on relâche le clic souris).
         * @type {Konva.Node}
         */
        this.kDraggingElement = undefined

        /**
         * Le prochain ID à attribuer à un nœud.
         * @type {number}
         */
        this.nextNodeId = 0

        /**
         * Map stockant pour chaque ID le nœud graphique associé.
         * @type {Map<number, GraphicalNode>}
         */
        this.gNodes = new Map()

        // Création du stage
        this.kStage = new Konva.Stage({
            container,
            width: container.offsetWidth,
            height: container.offsetHeight,
        })

        // Création du layer principal dans lequel on met tous les éléments
        this.kMainLayer = new Konva.Layer()
        // On utilise le `kDragLayer` pour déplacer les éléments qui sont
        // en train d'être déplacés afin qu'ils ne "cachent" pas le nœud
        // sous-jacent qu'on veut intersecter avec le curseur.
        // TODO(#3): Au lieu de faire ça, on pourrait peut-être simplement
        // désactiver l'écoute des événements durant le déplacement.
        this.kDragLayer = new Konva.Layer()

        this.kStage.add(this.kMainLayer)
        this.kStage.add(this.kDragLayer)

        this.kStage.scale({ x: 1.5, y: 1.5 })
        this.kStage.draw()

        this.kStage.on(EVENT_MOUSE_DOWN, e => {
            // Ce callback est appelé quand un clic est détecté sur le kStage.
            // La gestion des clics sur les différents objets se fait dans leurs
            // callbacks respectifs. Si un objet veut "court-circuiter" la
            // gestion par défaut d'un clic qui est faite ici, il lui suffit
            // d'annuler la propagation de l'événement. On considère donc que si
            // on arrive ici, c'est qu'aucun objet n'a géré le clic.

            this._unselectObject()

            // On active le drag du stage si on a cliqué dans le vide
            if (e.target === this.kStage) {
                this.kStage.startDrag()
            }

            if (this.state === STATE_CREATING_LINK) {
                this.state = STATE_DEFAULT
            }
        })

        this.kStage.on('wheel', e => {
            // Callback appelé lors d'un scroll souris, permet de gérer le zoom.
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

            if (this.selectedGObject) {
                this._moveFloatingBarTo(this.selectedGObject)
            }

            this.kStage.batchDraw()
        })

        // Barre flottante
        this.floatingBarElt = document.getElementById('floating-toolbar')
        let deleteNodeButtonElt = this.floatingBarElt.children[0]

        deleteNodeButtonElt.addEventListener('click', () => {
            // Callback appelé quand on clique sur le bouton de suppression
            // de la barre flottante. Permet de supprimer un nœud ou un lien
            // en fonction de l'objet actuellement sélectionné.
            if (!this.selectedGObject) return

            let gObjectToDelete = this.selectedGObject
            this._unselectObject()

            if (gObjectToDelete instanceof GraphicalNode) {
                // On supprime le nœud actuellement sélectionné
                gObjectToDelete.kGroup.destroy()
                this.gNodes.delete(gObjectToDelete.index)
                removeFromArray(this.map.nodes, gObjectToDelete.node)

                // On supprime tous les liens connectés à ce nœud
                for (let gLinkIndex = gObjectToDelete.gLinks.length - 1;
                     gLinkIndex >= 0;
                     --gLinkIndex
                ) {
                    let gLink = gObjectToDelete.gLinks[gLinkIndex]
                    this._deleteGLink(gLink)
                    removeFromArray(this.map.links, gLink.link)
                }
            } else if (gObjectToDelete instanceof GraphicalLink) {
                // On supprime le lien actuellement sélectionné
                this._deleteGLink(gObjectToDelete)
                removeFromArray(this.map.links, gObjectToDelete.link)
            }

            this.kMainLayer.draw()
        })

        // Configuration des boutons de l'interface
        // TODO(#4): Il faudra passer les boutons de l'interface au constructeur
        // au lieu de les récupérer d'ici (ici on suppose que le parent du
        // container possède la barre d'icône ce qui n'est pas forcément le cas
        // si on change la structure de la page HTML).
        let buttonsElt = container.parentElement.querySelector('.icon-bar').children
        let nodeButtonElt = buttonsElt[1]
        let linkButtonElt = buttonsElt[2]
        let recenterButtonElt = buttonsElt[3]

        linkButtonElt.addEventListener('click', () => {
            // Callback appelé lors d'un clic sur le bouton de création d'un
            // lien.
            this.state = STATE_CREATING_LINK
        })

        nodeButtonElt.addEventListener('click', () => {
            // Callback appelé lors d'un clic sur le bouton de création d'un
            // nœud.
            // On crée un nouveau nœud...
            const node = {
                id: this.nextNodeId,
                x: 0,
                y: 0,
                name: 'Concept'
            }
            // ...et on l'ajoute dans la map et on crée le nœud graphique
            // associé
            this.map.nodes.push(node)
            this.addGraphicalNode(node)
        })

        recenterButtonElt.addEventListener('click', () => {
            // Callback appelé lors d'un clic sur le bouton de recentrage de la
            // map.
            this.recenterMap();
        })

        window.addEventListener('resize', () => {
            // Callback appelé lors d'un redimensionnement de la fenêtre. Permet
            // de mettre à jour la taille du canvas.
            const container = this.kStage.container()
            const containerWidth = container.offsetWidth
            const containerHeight = container.offsetHeight
            this.kStage.width(containerWidth)
            this.kStage.height(containerHeight)
            this.kStage.batchDraw()
        })

        window.addEventListener('mouseup', () => {
            // Callback appelé lors du relâchement d'un clic souris. Permet
            // de s'assurer qu'on relâche effectivement l'élément en train
            // d'être déplacé, pour ne pas qu'il reste "collé" au curseur.
            this.kStage.stopDrag()

            if (this.kDraggingElement) {
                this.kDraggingElement.stopDrag()
                this.kDraggingElement = undefined
            }
        })
    }

    /**
     * @returns {string} - La map au format JSON.
     */
    getMapJSON() {
        return JSON.stringify(this.map)
    }

    /**
     * Ajoute un nœud graphique sur le canvas à partir d'un nœud.
     *
     * @param {Node} node - Le nœud à ajouter.
     * @param {boolean} redrawLayer - Indique si on redessine le layer principal
     *      (permet de ne pas redessiner à chaque insertion si on a plusieurs
     *      nœuds à ajouter à la suite par exemple).
     * @returns {GraphicalNode} Le nœud graphique associé au nœud.
     */
    addGraphicalNode(node, redrawLayer = true) {
        const gNode = this._createGraphicalNode(node)

        this.gNodes.set(gNode.index, gNode)
        this.kMainLayer.add(gNode.kGroup)
        if (redrawLayer) this.kMainLayer.draw()

        return gNode
    }

    /**
     * Ajoute un lien graphique sur le canvas à partir d'un lien.
     *
     * @param {Link} link - Le lien à ajouter.
     * @param {boolean} redrawLayer - Indique si on redessine le layer principal.
     * @returns {GraphicalLink} Le lien graphique associé au lien.
     */
    addGraphicalLink(link, redrawLayer = true) {
        const gLink = this._createGraphicalLink(link)

        this.kMainLayer.add(gLink.kGroup)
        if (redrawLayer) this.kMainLayer.draw()

        return gLink
    }

    /**
     * Recentre la map.
     */
    recenterMap() {
        this._unselectObject()

        if (this.gNodes.size === 0) return

        let xMin = Number.MAX_VALUE
        let yMin = Number.MAX_VALUE
        let xMax = Number.MIN_VALUE
        let yMax = Number.MIN_VALUE

        for (const gNode of this.gNodes.values()) {
            xMin = Math.min(xMin, gNode.x())
            yMin = Math.min(yMin, gNode.y())
            xMax = Math.max(xMax, gNode.x() + gNode.width())
            yMax = Math.max(yMax, gNode.y() + gNode.height())
        }

        this.kStage.position({
            x: -(xMin + xMax) * this.kStage.scale().x / 2 + this.kStage.width() / 2,
            y: -(yMin + yMax) * this.kStage.scale().y / 2 + this.kStage.height() / 2,
        })
        this.kStage.draw()
    }

    /**
     * Crée un nœud graphique associé à un nœud.
     *
     * @param {Node} node - Le nœud associé au nœud graphique.
     * @returns {GraphicalNode} Le nœud graphique.
     */
    _createGraphicalNode(node) {
        if (node.id === undefined) {
            node.id = this.nextNodeId
        }
        let gNode = new GraphicalNode(node)
        this.nextNodeId++

        // On ajoute les event listeners au `kGroup` puisqu'un `GraphicalNode`
        // n'est pas un objet que peut manipuler Konva.

        gNode.kGroup.on(EVENT_DOUBLE_CLICK, () => {
            // Callback appelé lors du double-clic sur un nœud graphique.
            konvaHandleTextInput(gNode.kText, newValue => {
                gNode.updateName(newValue)
                this._moveFloatingBarTo(gNode)
            }, true)
        })

        gNode.kGroup.on(EVENT_MOUSE_DOWN, e => {
            // Callback appelé lors d'un appui sur la souris.
            // On désélectionne l'objet précédemment sélectionné
            this._unselectObject()

            if (this.state === STATE_CREATING_LINK) {
                // On crée un nouveau lien...
                const link = {
                    from: gNode.index,
                    to: -1,
                    verb: 'Lien',
                }
                // ...on l'ajoute à la map...
                this.map.links.push(link)
                // ...on crée le lien graphique associé...
                const gLink = this.addGraphicalLink(link, false)
                // ...et on ajoute le nouveau lien graphique au nœud graphique
                // sur lequel on a cliqué.
                gNode.gLinks.push(gLink)

                // On place le bout de la flèche qu'on est en train de créer
                // à la position du curseur et on démarre le drag.
                const pointerPos = getAbsolutePointerPosition(this.kStage)
                gLink.moveHandle(false, pointerPos.x, pointerPos.y)
                gLink.kEndHandle.startDrag()
                this.kDraggingElement = gLink.kEndHandle
            } else {
                // On sélectionne le nouveau nœud
                this._selectObject(gNode)

                this.kMainLayer.draw()

                // On met le nœud au premier plan et on démarre le drag.
                gNode.kGroup.moveToTop()
                gNode.kGroup.startDrag()
                this.kDraggingElement = gNode.kGroup

                // Il ne faut pas appeler `this.kMainLayer.draw` après ce point
                // car sinon le drag-and-drop ne fonctionne pas correctement
                // dans le cas où on clique sur un nœud et qu'on relâche la
                // souris *sans avoir bougé*. De même, le double-clic ne serait
                // pas détecté pour une raison inconnue.
            }

            // On a géré le clic sur le nœud, on ne veut donc pas que le clic
            // remonte jusqu'au kStage.
            e.cancelBubble = true
        })

        gNode.kGroup.on('dragmove', () => {
            // Callback appelé quand le `kGroup` du nœud est en train de se
            // faire déplacer. On informe simplement notre nœud graphique et on
            // bouge la barre flottante.
            gNode.move(gNode.x(), gNode.y())
            this._moveFloatingBarTo(gNode)
        })

        return gNode
    }

    /**
     * Crée un lien graphique associé à un lien.
     *
     * @param {Lien} node - Le lien associé au lien graphique.
     * @returns {GraphicalLink} Le lien graphique.
     */
    _createGraphicalLink(link) {
        // On récupère les nœuds graphiques de début et de fin à partir des IDs
        // stockés dans le lien.
        const gNodeFrom = link.from >= 0 ? this.gNodes.get(link.from) : undefined
        const gNodeTo = link.to >= 0 ? this.gNodes.get(link.to) : undefined

        let gLink = new GraphicalLink(link, gNodeFrom, gNodeTo)

        // Gestion du début du drag
        const onHandleDragStart = e => {
            // On met les handles sur leur propre layer quand on les drag pour
            // qu'ils ne gênent pas lors de la détection du nœud intersecté
            e.target.moveTo(this.kDragLayer)
            // On met le lien tout en haut pour ne pas qu'il soit masqué par
            // les autres éléments le temps de le déplacer.
            gLink.kGroup.moveToTop()
        }
        gLink.kStartHandle.on('dragstart', onHandleDragStart)
        gLink.kEndHandle.on('dragstart', onHandleDragStart)
        //

        // Gestion de la fin du drag
        gLink.kStartHandle.on('dragend', () => {
            this._onHandleDragEnd(true, gLink)
        })
        gLink.kEndHandle.on('dragend', () => {
            this._onHandleDragEnd(false, gLink)
        })
        //

        // Quand un "handle" se déplace, on informe notre lien graphique
        gLink.kStartHandle.on('dragmove', () => {
            gLink.moveHandle(true, gLink.kStartHandle.x(), gLink.kStartHandle.y())
            this.kMainLayer.batchDraw()
        })
        gLink.kEndHandle.on('dragmove', () => {
            gLink.moveHandle(false, gLink.kEndHandle.x(), gLink.kEndHandle.y())
            this.kMainLayer.batchDraw()
        })
        //

        gLink.kLabel.on(EVENT_DOUBLE_CLICK, () => {
            // Callback appelé lors d'un double-clic sur le label d'un lien.
            konvaHandleTextInput(gLink.kLabel.getText(), newValue => {
                gLink.updateVerb(newValue)
                this.kMainLayer.batchDraw()
            })
        })

        gLink.kLabel.on(EVENT_MOUSE_DOWN, e => {
            // Callback appelé lors d'un appui souris le label d'un lien.
            this._unselectObject()
            this._selectObject(gLink)

            this.kMainLayer.draw()

            // On a géré l'événement, on ne veut pas qu'il remonte jusqu'au
            // `kStage`.
            e.cancelBubble = true
        })

        // Positionnement initial des liens
        gLink.updateHandles()

        return gLink
    }

    /**
     * Callback appelé lors de la fin du drag d'un "handle" de flèche. Permet
     * de mettre à jour les liaisons dans le cas où on a relâché le clic sur un
     * nœud.
     *
     * @param {boolean} isStartHandle - Indique si l'événement concerne un
     *      "handle" de début ou de fin.
     * @param {GraphicalLink} gLink - Le lien concerné.
     */
    _onHandleDragEnd(isStartHandle, gLink) {
        const pos = this.kStage.getPointerPosition()
        // TODO(#5): On récupère le nœud intersecté depuis le layer principal,
        // en espérant que les `GraphicalNode` représentant les nœuds soient
        // les premiers objets à être intersectés. Cela signifie que si par
        // hasard il y a des éléments graphiques sur ce layer et qu'ils sont
        // "devant" les nœuds, on ne détectera pas l'intersection avec le
        // nœud sous-jacent. Par exemple, il est actuellement difficile de
        // prendre un côté de la flèche et de le relâcher sur le nœud de l'autre
        // côté, puisque le label du lien se met en plein milieu ! Pour
        // s'assurer de détecter l'intersection quelque soient les éléments sur
        // le nœud, on pourrait simplement parcourir chaque nœud et
        // tester si le curseur se trouve à l'intérieur du nœud, mais ce
        // n'est pas très efficace. Une autre solution serait peut-être de
        // placer les nœuds sur leur propre layer ou quelque chose comme ça.
        const intersectedKNode = this.kMainLayer.getIntersection(pos);

        // On remet le handle dans le groupe du `GraphicalLink` auquel il
        // appartient (car on l'avait déplacé sur le `kDragLayer` le temps du
        // drag).
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

        // On récupère le nœud graphique qu'on a associé à cet éventuel `kGroup`
        // intersecté
        const intersectedGNode = kGroup ? kGroup.getAttr('_gNode') : undefined

        if (intersectedGNode &&
            (!this.state === STATE_CREATING_LINK ||
             gLink.link.from !== intersectedGNode)
        ) {
            // On a trouvé un nœud destination et dans le cas où on est en train
            // de créer un lien, ce nœud n'est pas le nœud de départ.

            // Si on a relié le début et la fin au même nœud, on inverse les
            // liens, sinon on se connecte au nouveau nœud
            if (!isStartHandle && intersectedGNode.index === gLink.link.from ||
                isStartHandle && intersectedGNode.index === gLink.link.to
            ) {
                gLink.swapFromAndToNodes()
            } else {
                let oldNode
                if (isStartHandle) {
                    oldNode = gLink.gNodeFrom
                    gLink.setFromNode(intersectedGNode)
                } else {
                    oldNode = gLink.gNodeTo
                    gLink.setToNode(intersectedGNode)
                }

                if (oldNode) {
                    // On supprime ce lien de l'ancien nœud...
                    removeFromArray(oldNode.gLinks, gLink)
                }
                // ...et on l'ajoute au nœud intersecté
                intersectedGNode.gLinks.push(gLink)
            }
        } else if (this.state === STATE_CREATING_LINK) {
            // On est en train de créer un lien mais on n'a pas trouvé de nœud
            // cible, on détruit donc le lien en cours de création
            // TODO(#6): Plutôt que de supprimer le lien après coup (quand on se
            // rend compte qu'il n'a pas de destination), on pourrait
            // simplement ne pas l'ajouter en premier lieu et l'ajouter
            // seulement quand on a trouvé un nœud destination.
            this._deleteGLink(gLink)

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

    /**
     * Supprime un lien graphique du canvas.
     *
     * @param {GraphicalLink} gLink - Le lien à supprimer.
     */
    _deleteGLink(gLink) {
        gLink.kGroup.destroy()

        // On supprime le lien du nœud de départ et d'arrivée s'ils existent
        if (gLink.gNodeFrom) removeFromArray(gLink.gNodeFrom.gLinks, gLink)
        if (gLink.gNodeTo) removeFromArray(gLink.gNodeTo.gLinks, gLink)
    }

    /**
     * Sélectionne l'objet demandé et déplace la barre flottante à sa position.
     *
     * @param {GraphicalNode|GraphicalLink} gObject - L'objet à sélectionner.
     */
    _selectObject(gObject) {
        gObject.setSelected(true)
        this.selectedGObject = gObject
        this._moveFloatingBarTo(gObject)
        this._showFloatingToolbar()
    }

    /**
     * Désélectionne l'objet actuellement sélectionné et masque la barre
     * flottante.
     */
    _unselectObject() {
        if (this.selectedGObject) this.selectedGObject.setSelected(false)
        this.selectedGObject = undefined
        this._hideFloatingToolbar()
    }

    /**
     * Affiche la barre flottante.
     */
    _showFloatingToolbar() {
        this.floatingBarElt.style.display = 'block'
    }

    /**
     * Masque la barre flottante.
     */
    _hideFloatingToolbar() {
        this.floatingBarElt.style.display = 'none'
    }

    /**
     * Déplace la barre flottante vers l'objet graphique demandé.
     *
     * @param {GraphicalNode | GraphicalLink} gObject - L'objet vers lequel se
     *      déplacer.
     */
    _moveFloatingBarTo(gObject) {
        // TODO(#7): Récupérer la largeur de la barre dynamiquement (pour
        // l'instant il n'y a qu'un bouton dedans donc la largeur est fixe).
        const floatingBarWidth = 40
        let pos
        let objectWidth

        // On récupère la position et la taille de l'objet en fonction de son
        // type. On ne crée pas de méthode abstraite car une méthode `width` sur
        // un `GraphicalLink` renverrait probablement la largeur de la *flèche*,
        // mais ici on a besoin de la largeur du *texte*. Ça n'a donc pas de
        // sens de créer une telle méthode car les éventuels autres utilisateurs
        // de la classe s'attendraient à ce qu'une méthode `width` renvoie la
        // largeur de la flèche, mais dans ce cas précis, ce n'est pas cette
        // largeur là qu'on veut. On doit donc aller chercher manuellement
        // l'info dont on a besoin en fonction du type de l'objet.
        if (gObject instanceof GraphicalNode) {
            pos = gObject.kGroup.absolutePosition()
            objectWidth = gObject.width()
        } else if (gObject instanceof GraphicalLink) {
            pos = gObject.kLabel.absolutePosition()
            objectWidth = gObject.kLabel.width()
        }

        pos.x +=
            this.container.offsetLeft +
            objectWidth * this.kStage.scaleX() / 2 -
            floatingBarWidth / 2
        pos.y += this.container.offsetTop - 50

        this.floatingBarElt.style.left = `${pos.x}px`
        this.floatingBarElt.style.top = `${pos.y}px`
    }
}

/**
 * Crée une `CanvasMap`.
 *
 * @param {HTMLElement} container - L'élément qui va contenir le canvas.
 * @param {{nodes: Node[], links: Link[]}} map - La map à partir de laquelle
 *      initialiser la `CanvasMap`.
 * @returns {CanvasMap} La `CanvasMap` pré-remplie avec la map donnée.
 */
function createCanvasMap(container, map = { nodes: [], links: [] }) {
    let canvasMap = new CanvasMap(container, map)

    // TODO(#8): Peut-être qu'on pourrait faire tout ça dans le constructeur de
    // `CanvasMap`.
    // Création des nœuds graphiques correspondant aux nœuds de la map.
    for (const node of map.nodes) {
        canvasMap.addGraphicalNode(node, false)
    }

    // Création des liens graphiques correspondant aux liens de la map.
    let gLinks = []
    for (let link of map.links) {
        gLinks.push(canvasMap.addGraphicalLink(link, false))
    }

    canvasMap.recenterMap()
    canvasMap.kMainLayer.draw()

    // Ajout dans les nœuds graphiques des liens connectés
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

/**
 * Gère l'entrée textuelle dans un `Konva.Text`.
 *
 * @param {Konva.Text} kText - Le texte à modifier.
 * @param {*} onInput - Callback appelé lors d'une frappe clavier.
 * @param {boolean} bold - Indique si le texte doit s'afficher en gras.
 */
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

        // TODO(#9): Ce calcul n'est pas correct.
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
