import React from 'react';

export const Main = (props) => {
    let setDisplayForm = props.setDisplayForm;
    let displayForm = props.displayForm;
    let displayDocumentCards = props.displayDocumentCards;
    let displayNewDocumentForm = props.displayNewDocumentForm;

    return (
        <div>
            <section className="allDocumentsTitle">
              <h2><strong>My Documents</strong></h2>
              <button className="button" onClick={() => setDisplayForm(true)}>Create new document</button>
            </section>
            <section className="allDocuments">
              {displayDocumentCards()}
            </section>
            {displayForm ? displayNewDocumentForm() : ''}
        </div>
    );
};
