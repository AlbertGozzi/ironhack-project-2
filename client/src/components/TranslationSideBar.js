import React from 'react';

const TranslationSideBar = (props) => {
    let value = props.value;

    return (
        <div>
            {value.map((text,i) => {
              let textsToTranslate = text.children.filter((element) => element.translate);
              return textsToTranslate.map(element => {
                return <div className="translateCard">
                  {element.text}
                </div>
              })
            })}
        </div>
    );
};

export default TranslationSideBar;