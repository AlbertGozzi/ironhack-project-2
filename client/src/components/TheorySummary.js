import React from 'react';

const TheorySummary = (props) => {
    let value = props.value;

    return (
        <div>
            <h4 className="theoryTitle"> Theory Summary </h4>
            <div className="theoryEditor">
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

export default TheorySummary;