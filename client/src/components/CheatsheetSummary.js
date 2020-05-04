import React from 'react';

const CheatsheetSummary = (props) => {
    let value = props.value;

    return (
        <div>
            <div className="editor yellow">
                {value.map((text,i) => {
                return <p key={i}>{text.children.map((element, j) => {
                    if (element.theory) {
                    return <span key={j}>{element.text}</span>;
                    }
                    return '';
                })}</p>
                })}
            </div>   
        </div>
    );
};

export default CheatsheetSummary;