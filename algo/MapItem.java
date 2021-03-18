public abstract class MapItem{
   
	protected State state;
    protected double weight;
    protected int occurrence;

    enum State{
      
    	CORRECT,
        WRONG,
        DEFAULT
    }

    public MapItem(){
       
    	state = State.DEFAULT;
        weight = 1;
        occurrence = 0;
    }

    public State getState(){
        
    	return state;
    }

    public void setState(State state){
       
    	this.state = state;
    }
    
    public void IncrementOccurrence() {
    	occurrence++;
    }
}