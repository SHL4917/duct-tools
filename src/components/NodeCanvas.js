import React, {useEffect} from 'react';
import {useState} from "react";
import { useRef } from "react";
import { Stage, Layer, Circle, Line, Text} from "react-konva";
import {useSelector, useDispatch} from 'react-redux';
import {create, remove} from '../redux/nodeSlice';
import {update} from '../redux/selectionSlice';

const scaleBy = 1.05;

const initialCircles = [];

const NodeCanvas = () => {
  const stageRef = useRef(null);
  const [circles, setCircles] = useState(initialCircles);
  const nodeState = useSelector((state) => state.node);
  const selection = useSelector((state) => state.selection);
  const dispatch = useDispatch()

  function zoomStage(e) {
    e.evt.preventDefault();

    if (stageRef.current !== null) {
      const stage = stageRef.current;
      const oldScale = stage.scaleX();
      const { x: pointerX, y: pointerY } = stage.getPointerPosition();
      const mousePointTo = {
        x: (pointerX - stage.x()) / oldScale,
        y: (pointerY - stage.y()) / oldScale,
      };
      const newScale =
        e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
      stage.scale({ x: newScale, y: newScale });
      const newPos = {
        x: pointerX - mousePointTo.x * newScale,
        y: pointerY - mousePointTo.y * newScale,
      };
      stage.position(newPos);
      stage.batchDraw();
    }
  }

  const handleMouseOver = (e) => {
    let id = e.target.id();
    setCircles(
      circles.map((circle) => {
        return{
          ...circle,
          textOpacity: id === circle.id,
        }
      })
    )
  }
  const handleMouseOut = (e) => {
    setCircles(
      circles.map((circle) => {
        return{
          ...circle,
          textOpacity: false,
        }
      })
    )
  }



  function renderCircles() {
    return [...Array(nodeState.nodeCount)].map((_, i) => ({
      id: i.toString(),
      x: 50 + i * 80,
      y: 100,
      isDragging: false,
      text: nodeState.data[i].compData,
      textOpacity: false,
    }));
  }

  function renderArrows() {

  }

  useEffect(() => {
    setCircles(renderCircles());
    if (nodeState.nodeCount > 1) {
      renderArrows();
    }
    
  }, [nodeState.nodeCount]);

  return (
    <Stage
      width={window.innerWidth}
      height={window.innerHeight}
      draggable
      onWheel={zoomStage}
      ref={stageRef}
    >
      <Layer>
        {circles.map((circle) => (
          <Circle
            key={circle.id}
            id={circle.id}
            x={circle.x}
            y={circle.y}
            radius={15}
            fill="#89b717"
            fill="black"
            perfectDrawEnabled={false}
            onMouseOver={handleMouseOver}
            onMouseOut={handleMouseOut}
          />
        ))}
        {circles.map((circle) => (
          <Text
            text={circle.text}
            fontSize={10}
            key={circle.id}
            id={circle.id}
            x={circle.x - 15}
            y={circle.y + 20}
            fill="black"
            opacity={circle.textOpacity? 1 : 0}
            perfectDrawEnabled={false}
          />
        ))}
      </Layer>
    </Stage>
  );
};

export default NodeCanvas;
