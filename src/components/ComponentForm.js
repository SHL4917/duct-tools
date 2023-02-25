import React, {useEffect, useState} from 'react';
import {useForm} from 'react-hook-form';
import {components, componentDesc} from "../pipeComponents/components";
import {useSelector, useDispatch} from 'react-redux';
import {create, updateData, insertAfter, insertBefore, switchAfter, switchBefore, deleteNode} from '../redux/nodeSlice';
import {update, nodeNotClicked, nodeClicked} from '../redux/selectionSlice';
import Triangle from "./Triangle"
import ComponentDiagram from "./ComponentDiagram"

const branchMap = {
  cmhMainOut: {
    widthIn: "widthOut",
    heightIn: "heightOut",
    diameterIn: "diameterOut",
  },
  cmhSideOut: {
    widthIn: "widthOutSide",
    heightIn: "heightOutSide",
    diameterIn: "diameterOutSide",
  },
  cmhSideOut2: {
    widthIn: "widthOutSide2",
    heightIn: "heightOutSide2",
    diameterIn: "diameterOutSide2",
  },
}

const inputBranches = ["widthIn", "heightIn", "diameterIn"];

const ComponentForm = (props) => {
  const {register, handleSubmit, unregister, reset} = useForm({shouldUnregister: true,});
  const nodeState = useSelector((state) => state.node);
  const selection = useSelector((state) => state.selection);
  const dispatch = useDispatch();
  const [leftToggle, setLeftToggle] = useState(false);
  const [rightToggle, setRightToggle] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showDiagram, setShowDiagram] = useState(false);
  let selectedComponent = components[props.cardName];
  let reqInput = selectedComponent.reqInput;

  const getForm = (selection, nodeState, reqInput) => {
    let formData = (selection.update && !selection.tempNode && !nodeState.deleting)? nodeState.nodeList[selection.nodeNumber].fieldData : null;
    let formCSS = "bg-gray-100 border-gray-200 border-[1px] rounded text-black font-light text-[12px] pl-1"
    let formCSSDisabled = "border-gray-200 border-[1px] rounded bg-gray-200/[.2] text-gray-300 font-light text-[12px] pl-1"
    let newForm = {
      flowRates: [],
      dimensions: [],
      others: [],
      results: [],
    }
    for (var key of Object.keys(reqInput)) {
      let defaultValue = {defaultValue: null};
      if (!selection.tempNode) {
        defaultValue = selection.update? {defaultValue: formData[key]} : {defaultValue: null};
      }
      if (!selection.nodeSelected) {
        defaultValue = {defaultValue: null};
      }
      if ((key === 'cmhMainIn') && selection.tempNode && selection.connection.toNew) {
        let parentNode = nodeState.nodeList[selection.nodeNumber];
        let parentBranch = selection.connection.branch
        defaultValue.defaultValue = parentNode.fieldData[parentBranch];
      }
      if ((inputBranches.includes(key)) && selection.tempNode && selection.connection.toNew) {
        let parentNode = nodeState.nodeList[selection.nodeNumber];
        let parentBranch = selection.connection.branch
        let outletBranch = branchMap[parentBranch][key];
        defaultValue.defaultValue = parentNode.fieldData[outletBranch]?? parentNode.fieldData[key]?? null;
      }

      let input = reqInput[key] ? (
        <input
          type="number"
          {...defaultValue}
          key={selection.tempNode ? key + selection.tempNode + props.cardName: key + props.cardName}
          {...register(key, { valueAsNumber: true, required: true })}
          className={formCSS}
        />
      ) : (
        <input
          type="number"
          {...defaultValue}
          key={selection.tempNode ? key + selection.tempNode + props.cardName: key + props.cardName}
          disabled
          className={formCSSDisabled}
        />
      );
      for (var catKey of Object.keys(newForm)){
        if (componentDesc[catKey].hasOwnProperty(key) && componentDesc[catKey][key]) {
          newForm[catKey].push(
            <div className="flex flex-col pb-2" key={selection.tempNode ? key + selection.tempNode + "Container" : key + "Container"}>
              <div className="font-medium text-[11px] text-gray-500">{componentDesc[catKey][key]}</div>
              {input}
            </div>
            
          );
        }
      }
    }
    return newForm;
  }
  let form = getForm(selection, nodeState, reqInput);

  const onSubmit = (formData) => {
    let comp = components[props.cardName]
    for (var key of Object.keys(comp.reqInput)) {
      if (!reqInput[key]) {
        formData[key] = comp.fields[key](formData, comp.fields);
      }
    }
    let payload = {
      data: {fieldData: formData, compData: props.cardName,},
    };
    if (Object.keys(nodeState.nodeList).length == 0) {
      // Adding initial node!
      payload['newNode'] = {branch: 'cmhMainIn'}
      dispatch(create(payload));
      dispatch(update({
        nodeNumber: nodeState.nodeCount,
        update: true,
        connection: null,
      }))
      dispatch(nodeClicked());
      return;
    }

    if (!selection.update) {
      // Adding new node!
      if(selection.connection.toNew) {
        // Appending downstream
        payload['newNode'] = {branch: 'cmhMainIn'}
        payload['from'] = {nodeNum: selection.nodeNumber, branch: selection.connection.branch};        
      } else {
        // Appending upstream
        payload['newNode'] = {branch: 'cmhMainOut'}
        payload['to'] = {nodeNum: selection.nodeNumber, branch: selection.connection.branch};
      }
      dispatch(create(payload));
      dispatch(update({
        nodeNumber: nodeState.nodeCount,
        update: true,
        connection: null,
      }));
      dispatch(nodeClicked());
      return;
    }
  }

  const returnStates = () => {
    console.log("Node State:")
    console.log(nodeState);
    console.log("Selection State:")
    console.log(selection);
    console.log("Card State:")
    console.log(props.cardName);
  }

  const updateField = (formData) => {
    let comp = components[props.cardName]
    for (var key of Object.keys(comp.reqInput)) {
      if (!reqInput[key]) {
        formData[key] = comp.fields[key](formData, comp.fields);
      }
    }
    let payload = {
      data: {fieldData: formData, compData: props.cardName,},
      nodeNumber: selection.nodeNumber,
    };
    dispatch(updateData(payload));
  }
  
  const insertNodeAfter = (formData) => {
    let keys = Object.keys(nodeState.edgeList);
    let branchTo = null;
    let nodeTo = null;
    let edgeKey = null;
    for (let key in keys) {
      if(nodeState.edgeList[key].nodes[0] == selection.nodeNumber && nodeState.edgeList[key].type[0] == 'cmhMainOut') {
        branchTo = nodeState.edgeList[key].type[1];
        nodeTo = nodeState.edgeList[key].nodes[1];
        edgeKey = key;
        break;
      }
    }
    if (nodeTo === null) {
      return;
    }
    let payload = {
      data: {fieldData: formData, compData: props.cardName,}, edgeKey: edgeKey,
    };
    payload['from'] = {nodeNum: selection.nodeNumber, branch: 'cmhMainOut'};
    payload['to'] = {nodeNum: nodeTo, branch: branchTo};
    dispatch(insertAfter(payload));
    dispatch(update({
      nodeNumber: nodeState.nodeCount,
      update: true,
      connection: null,
    }));
    dispatch(nodeClicked());
  }

  const insertNodeBefore = (formData) => {
    let keys = Object.keys(nodeState.edgeList);
    let branchFrom = null;
    let nodeFrom = null;
    let edgeKey = null;
    for (let key in keys) {
      if(nodeState.edgeList[key].nodes[1] == selection.nodeNumber && nodeState.edgeList[key].type[1] == 'cmhMainIn') {
        branchFrom = nodeState.edgeList[key].type[0];
        nodeFrom = nodeState.edgeList[key].nodes[0];
        edgeKey = key;
        break;
      }
    }
    if (nodeFrom === null) {
      return;
    }
    let payload = {
      data: {fieldData: formData, compData: props.cardName,}, edgeKey: edgeKey,
    };
    payload['from'] = {nodeNum: nodeFrom, branch: branchFrom};
    payload['to'] = {nodeNum: selection.nodeNumber, branch: 'cmhMainIn'};
    dispatch(insertBefore(payload));
    dispatch(update({
      nodeNumber: nodeState.nodeCount,
      update: true,
      connection: null,
    }));
    dispatch(nodeClicked());
  }

  const switchBranchDownstream = (formData) => {
    if (components[nodeState.nodeList[selection.nodeNumber].compData].type.oneOutput) {
      return;
    }
    let payload = {
      nodeNumber: selection.nodeNumber, component: components[nodeState.nodeList[selection.nodeNumber].compData].reqInput,
    }
    dispatch(switchAfter(payload));
    dispatch(update({
      nodeNumber: selection.nodeNumber,
      update: true,
      connection: null,
    }));
    dispatch(nodeClicked());
  }

  const switchBranchUpstream = (formData) => {
    if (components[nodeState.nodeList[selection.nodeNumber].compData].type.oneInput) {
      return;
    }
    let payload = {
      nodeNumber: selection.nodeNumber, component: components[nodeState.nodeList[selection.nodeNumber].compData].reqInput,
    }
    dispatch(switchBefore(payload));
    dispatch(update( {
      nodeNumber: selection.nodeNumber,
      update: true,
      connection: null,
    }));
    dispatch(nodeClicked());
  }

  const removeNode = (formData) => {
    let comp = components[nodeState.nodeList[selection.nodeNumber].compData]
    if (!comp.oneInput) {
      if (nodeState.nodeList[selection.nodeNumber].edges.from.length > 1) return;
    }
    if (!comp.oneOutput) {
      if (nodeState.nodeList[selection.nodeNumber].edges.to.length > 1) return;
    }

    let payload = {
      nodeNumber: selection.nodeNumber
    }

    let newNodeNumber = (nodeState.nodeList[selection.nodeNumber].edges.from.length == 1)? nodeState.edgeList[nodeState.nodeList[selection.nodeNumber].edges.from[0]].nodes[0] : null;
    if (newNodeNumber === null) {
      newNodeNumber = (nodeState.nodeList[selection.nodeNumber].edges.to.length == 1) ? nodeState.edgeList[nodeState.nodeList[selection.nodeNumber].edges.to[0]].nodes[1] : null;
    }
    dispatch(update( {
      nodeNumber: newNodeNumber,
      update: !(newNodeNumber === null)? true : false,
      connection: null,
    }));
    dispatch(nodeNotClicked());
    dispatch(deleteNode(payload));
    dispatch(nodeClicked());

  }

  useEffect(() => {
    return () => {
      reset();
      for (var key of Object.keys(reqInput)) {
        unregister(key);
      }
    }
  }, [props.cardName, selection])

  useEffect(() => {
    form = getForm(selection, nodeState, reqInput);
  }, [props.cardName, selection, selection.tempNode, selection.update, nodeState])

  let typeCSS = "flex flex-col flex-wrap mr-6 basis-1/4"
  return(
    <div className="flex flex-col h-[100%]">
      <div className="border-b-[1px] border-gray-200 flex flex-row px-4 items-center grow-0 w-[100%]">
        <div className="font-medium text-gray-300 text-center border-[1px] border-gray-300 text-[12px] p-1 rounded select-none
          hover:text-gray-400 hover:border-black" onClick={() => setShowDiagram(true)}>PIC</div>
        <ComponentDiagram toggle={setShowDiagram} display={showDiagram} compName={props.cardName}/>
        <div className="border-r-[1px] border-gray-200 h-[100%] mx-2"></div>
        <div className="font-medium text-[18px] mr-4 my-2">{selectedComponent.text.title}</div>
        <div 
          className="font-medium text-gray-300 text-center leading-4 rounded-full border-[1px] border-gray-300 text-[12px] w-4 h-4 select-none
          hover:text-gray-400 hover:border-black"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          ?
        </div>
        <div style={{display: showTooltip ? 'block' : 'none' }} className="relative">
          <div className="fixed bg-gray-100 border-gray-300 border-[1px] rounded p-1.5 w-[300px] shadow-card">{selectedComponent.text.desc}</div>
        </div>
      </div>
      <div className="grow overflow-auto">
        <form onSubmit={handleSubmit(onSubmit)} disabled={selection.tempNode}>
          <div className="flex flex-row grow py-3 px-4">
            <div className={typeCSS}>
              <div className="text-left font-medium text-[14px] text-black">Flow Rates (CMH)</div>
              <div className="border-t-[1px] border-gray-200 pb-2"></div>
              {form.flowRates}
            </div>
            <div className={typeCSS}>
              <div className="text-left font-medium text-[14px] text-black">Dimensions (mm)</div>
              <div className="border-t-[1px] border-gray-200 pb-2"></div>
              {form.dimensions}
            </div>
            <div className={typeCSS}>
              <div className="text-left font-medium text-[14px] text-black">Others</div>
              <div className="border-t-[1px] border-gray-200 pb-2"></div>
              {form.others}
            </div>
            <div className={typeCSS}>
              <div className="text-left font-medium text-[14px] text-black">Results</div>
              <div className="border-t-[1px] border-gray-200 pb-2"></div>
              {form.results}
            </div>
          </div>
        </form>
      </div>
      <div className="flex flex-row border-t-[1px] border-gray-200 grow-0 w-[100%]">
        <div className="flex flex-row items-center px-3 py-1">
          <div className="flex flex-col shrink-0">
            <div className="flex flex-row items-center bg-orange-300 border-orange-200 border-[1px] rounded p-2">
              <button 
                onClick={handleSubmit(onSubmit)} 
                disabled={selection.update} 
                className="text-white disabled:text-gray-200 font-medium text-[12px] mr-8"
              >
                Add New
              </button>
              <div onClick={() => setLeftToggle(!leftToggle)} className="self-stretch flex flex-row items-center p-1">
                <Triangle up={leftToggle}/>
              </div>
            </div>
            <div style={{display: leftToggle ? 'block' : 'none' }} className="relative">
              <div className="flex flex-col fixed bg-gray-100 border-gray-300 border-[1px] rounded p-1.5 w-[144px] shadow-card">
                <button 
                  disabled={!(selection.tempNode === null)} 
                  onClick={handleSubmit(insertNodeAfter)} 
                  className="font-light text-[10px] text-left disabled:text-gray-200"
                >
                  Insert Node After
                </button>
                <div className="border-t-[1px] border-gray-200 my-1"></div>
                <button 
                  disabled={!(selection.tempNode === null)} 
                  onClick={handleSubmit(insertNodeBefore)} 
                  className="font-light text-[10px] text-left disabled:text-gray-200"
                >
                  Insert Node Before
                </button>
              </div>
            </div>
          </div>
          <button 
            disabled={!selection.update} 
            onClick={handleSubmit(updateField)} 
            className=" ml-8 font-medium text-[12px] text-white bg-orange-300 border-orange-300 border-[1px] rounded p-2 w-24
            disabled:text-gray-200 disabled:border-gray-200 disabled:bg-gray-100"
          >
            Update
          </button>
        </div>
        <div className="border-r-[1px] border-gray-200 "></div>
        <div className="self-center flex flex-row items-center expand w-[100%] p-2">
          <div className="whitespace-pre font-medium text-[13px] expand w-[100%]">
            Currently Selected: {!selection.tempNode && selection.nodeSelected? `#${selection.nodeNumber} ${selectedComponent.text.title}`: ""}
          </div>
          <div className="flex flex-col grow-0 shrink-0">
            <div className="flex flex-row items-center bg-orange-300 border-orange-200 border-[1px] rounded p-2 mr-1">
              <button 
                className="text-white disabled:text-gray-200 font-medium text-[12px] mr-4"
              >
                Actions
              </button>
              <div onClick={() => setRightToggle(!rightToggle)} className="self-stretch flex flex-row items-center p-1">
                <Triangle up={rightToggle}/>
              </div>
            </div>
            <div style={{display: rightToggle ? 'block' : 'none' }} className="relative">
              <div className="flex flex-col fixed bg-gray-100 border-gray-300 border-[1px] rounded p-1.5 w-[144px] shadow-card">
                <button 
                  disabled={(!selection.update)} 
                  onClick={handleSubmit(switchBranchDownstream)} 
                  className="font-light text-[10px] text-left disabled:text-gray-200"
                >
                  Switch Branches After
                </button>
                <div className="border-t-[1px] border-gray-200 my-1"></div>
                <button 
                  disabled={(!selection.update)} 
                  onClick={handleSubmit(switchBranchUpstream)} 
                  className="font-light text-[10px] text-left disabled:text-gray-200"
                >
                  Switch Branches Before
                </button>
                <div className="border-t-[1px] border-gray-200 my-1"></div>
                <button 
                  disabled={(!selection.update)} 
                  onClick={handleSubmit(removeNode)} 
                  className="font-light text-[10px] text-left disabled:text-gray-200"
                >
                  Delete node
                </button>
                <div className="border-t-[1px] border-gray-200 my-1"></div>
                <button 
                  disabled={false}
                  onClick={returnStates} 
                  className="font-light text-[10px] text-left"
                >
                  Get States
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ComponentForm;