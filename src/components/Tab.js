import React from "react";

class Tab extends React.Component {
  onClick = () => {
    const { label, onClick } = this.props;
    onClick(label);
  };

  render() {
    const {
      onClick,
      props: { activeTab, label },
    } = this;

    let className =
      "basis-20 grow-0 shrink-0 p-2 mr-4 text-center font-light text-base text-gray-300";

    if (activeTab === label) {
      className = className + "text-black"
    } else {
      className = className + " hover:text-gray-500"
    }

    return (
      <div >
        <button className={className} onClick={onClick}>
          {label}
        </button>
      </div>
    );
  }
}
export default Tab;
