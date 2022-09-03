import React from "react";
import Tabs from "./Tabs";
import NodeCanvas from "./NodeCanvas";
import NodeDrawing from './NodeDrawing';
import Results from './Results';

class Viewport extends React.Component {
  render() {
    return (
      <div className="grow flex flex-col">
        <Tabs>
          <div label="Nodes">
            <NodeDrawing />
          </div>
          <div label="Results">
            <Results />
          </div>
        </Tabs>
      </div>
    );
  }
}

export default Viewport;
