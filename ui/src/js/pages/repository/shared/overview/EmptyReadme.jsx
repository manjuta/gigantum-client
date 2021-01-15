import React from 'react';
import classNames from 'classnames';

type Props = {
  editingReadme: boolean,
  setEditingReadme: Function,
  sectionType: string,
};

const EmptyReadme = ({ editingReadme, setEditingReadme, sectionType }: Props) => {
  const overviewReadmeButtonCSS = classNames({
    'Btn Btn--feature Btn__edit Btn__edit--featurePosition': true,
    hidden: editingReadme,
  });
  const section = sectionType === 'labbook' ? 'Project' : 'Dataset';
  return (
    <div className="grid">
      <div className="Overview__empty column-1-span-12">
        <button
          type="button"
          className={overviewReadmeButtonCSS}
          onClick={() => setEditingReadme(true)}
        >
          <span>Edit Readme</span>
        </button>
        <div className="Overview__empty-content">
          <p>{`This ${section} Has No Readme`}</p>
          <button
            type="button"
            className="Overview__empty-action Btn Btn--flat"
            onClick={() => setEditingReadme(true)}
          >
            Create a Readme
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmptyReadme;
