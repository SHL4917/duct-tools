import {useState, useEffect} from 'react';
import Viewport from './Viewport';
import ComponentList from './ComponentList';
import ComponentCard from './ComponentCard';
import {useSelector, useDispatch} from 'react-redux';
import {nodeNotClicked} from '../redux/selectionSlice';
// Use command 'npx gulp' after moving the script tag in the bundled html file to the end of the body!

function App() {
  const nodeState = useSelector((state) => state.node);
  const selection = useSelector((state) => state.selection);
  const [cardName, setCardName] = useState(null);
  const dispatch = useDispatch();

  let selectCard = (card) => {
    setCardName(card);
    dispatch(nodeNotClicked());
  }

  useEffect(() => {
    if (selection.nodeNumber && selection.nodeSelected && selection.update) {
      let card = nodeState.nodeList[selection.nodeNumber].compData
      setCardName(card);
    }
    
  }, [selection, nodeState.nodeList]); 

  // Probably a useEffect here watching the 'selectedNode' variable from the selectionSlice store

  return (
    <div className=" h-[100vh] overflow-hidden flex flex-col items-center">
      <div className="flex items-stretch h-[100vh] m-8 rounded-[10px] overflow-hidden shadow-card border-2 border-gray-300 bg-gray-100">
        <div className="w-[15em] max-w-[17em] grow shrink-0 flex flex-col border-r-[1px] border-gray-200">
          <div className="h-24 border-b-[1px] border-gray-200 flex flex-col py-2 px-4">
            <div className="font-light text-[28px] text-gray-400 select-none">DUCT TOOLS</div>
            <div className="font-medium">To enter name + icon</div>
          </div>
          <div className="grow py-4 px-2 overflow-auto z-20">
            <ComponentList selectCard={selectCard} />
          </div>
        </div>
        <div className="w-[60rem] grow shrink-0 flex flex-col">
          <div className="basis-1/2 my-4 mx-6 rounded-[10px] shadow-card border-2 border-gray-300 bg-gray-100 overflow-hidden">
            <ComponentCard cardName={cardName} />
          </div>
          <div className="basis-1/2 mb-4 mx-6 overflow-hidden rounded-[10px] shadow-card border-2 border-gray-300 flex flex-col bg-gray-100">
            <Viewport />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
