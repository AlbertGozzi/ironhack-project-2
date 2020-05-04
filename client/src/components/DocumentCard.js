import React from 'react';
import { Link } from 'react-router-dom';

export const DocumentCard = (props) => {
    let document = props.document;
    return (
        <Link to={`/document/${document.name}/main`} className="documentCard">
            <div>
                <h3>{document.name}</h3>
                <h4><strong>Language:</strong> {document.language}</h4>
                <h4><strong>Created by:</strong> {document.createdBy}</h4>
            </div>
        </Link>
    );
};
