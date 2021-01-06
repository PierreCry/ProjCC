const State = {
    CORRECT: 'correct',
    WRONG: 'wrong',
    DEFAULT: 'default'
}

class MapItem {
    #state;

    constructor(){
        this.#state = DEFAULT;
    }

    constructor(state){
        this.#state = state;
    }

    get state(){
        return this.#state;
    }

    set state(state){
        this.#state = state;
    }
}

class Label extends MapItem {
    #keywords;
    #synonyms;

    constructor(keywords){
        super();
        this.#keywords = keywords;
        this.#synonyms = new Array();
        buildSynonyms();
    }

    buildSynonyms(){;}

    get keywords(){
        return this.#keywords;
    }

    get synonyms(){
        return this.#synonyms;
    }
}

class LabelList {
    #labels;
    #labelNames;

    constructor(){
        this.#labels = new Array();
        this.#labelNames = new Array();
    }

    constructor(labels){
        this.#labels = labels;
        this.#labelNames = new Array();
        
        this.#labels.forEach(lab => this.#labelNames.push(lab));
    }
    
    contains(label){
        if(this.#labelNames.includes(label)) return true;

        this.#labelNames.forEach(lab => {
            if(label.synonyms.includes(lab)) return true
        });

        return false;
    }

    findLabel(i){
        return this.#labels[i];
    }

    findKeywords(i){
        return this.#labelNames[i];
    }

    get labels(){
        return this.#labels;
    }

    set labels(labels){
        this.#labels = labels;
    }

    get labelNames(){
        return this.#labelNames;
    }

    set labelNames(labelNames){
        this.#labelNames = labelNames;
    }
}

class Link extends MapItem {
    #preLabel;
    #postLabel;
    #verb;
    #synonyms;

    constructor(preLabel, postLabel, verb){
        super();
        this.#preLabel = preLabel;
        this.#postLabel = postLabel;
        this.#verb = verb;
        this.#buildSynonyms();
    }

    #buildSynonyms(){;}

    get preLabel(){
        return this.#preLabel;
    }

    set preLabel(lab){
        this.#preLabel = lab;
    }

    get preLabel(){
        return this.#preLabel;
    }

    set preLabel(lab){
        this.#preLabel = lab;
    }
}

class LinkList {
    #links;
    #verbs;

    constructor(){
        this.#links = new Array();
        this.#verbs = new Array();
    }

    
}