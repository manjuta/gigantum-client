// @flow
// vendor
import React from 'react';

type Props = {
  buttonText: string,
  currentServer: {
    name: string,
  },
  header: string,
  isPublic: boolean,
  modalStateValue: Object,
  modifyVisibility: Function,
  setPublic: Function,
  toggleModal: Function,
  visibility: boolean,
}


const VisibilityModalContent = (props: Props) => {
  const {
    buttonText,
    currentServer,
    header,
    isPublic,
    modalStateValue,
    modifyVisibility,
    setPublic,
    toggleModal,
    visibility,
  } = props;
  const publishStatement = header === 'Publish' ? `Once published, the Project will be visible in the '${currentServer.name}' tab on the Projects listing Page.` : '';
  const message = `You are about to change the visibility of the Project. ${publishStatement}`;

  return (
    <div className="VisibilityModal">
      <div>
        <div>
          <p>{message}</p>
        </div>

        <div>
          <div className="VisibilityModal__private">
            <label
              className="Radio"
              htmlFor="publish_private"
            >
              <input
                defaultChecked={(visibility === 'private') || !isPublic}
                type="radio"
                name="publish"
                id="publish_private"
                onClick={() => { setPublic(false); }}
              />
              <span><b>Private</b></span>
            </label>

            <p className="VisibilityModal__paragraph">Private projects are only visible to collaborators. Users that are added as a collaborator will be able to view and edit.</p>

          </div>

          <div className="VisibilityModal__public">

            <label
              className="Radio"
              htmlFor="publish_public"
            >
              <input
                defaultChecked={visibility === 'public'}
                name="publish"
                type="radio"
                id="publish_public"
                onClick={() => { setPublic(true); }}
              />
              <span><b>Public</b></span>
            </label>

            <p className="VisibilityModal__paragraph">Public projects are visible to everyone. Users will be able to import a copy. Only users that are added as a collaborator will be able to edit.</p>

          </div>

        </div>
      </div>
      <div className="VisibilityModal__buttons">
        <button
          type="submit"
          className="Btn--flat"
          onClick={() => { toggleModal(modalStateValue); }}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="Btn--last"
          onClick={() => { modifyVisibility(); }}
        >
          {buttonText}
        </button>
      </div>

    </div>
  );
};

export default VisibilityModalContent;
