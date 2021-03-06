// @flow
import React, { PureComponent } from 'react';
import classNames from 'classnames';

/**
  *  @param {Number} selectedFolderCount
  *  @param {Number} selectedFileCount
  *  returns a string with folder and file select counts
  *  @return {string}
*/
const getCountText = (selectedFolderCount, selectedFileCount) => {
  const foldersSelected = selectedFolderCount > 0;
  const filesSelected = selectedFileCount > 0;
  const folderText = foldersSelected > 1 ? 'Folders' : 'Folder';
  const fileText = filesSelected > 1 ? 'Files' : 'File';
  let multiText = foldersSelected
    ? `${selectedFolderCount} ${folderText} selected`
    : '';
  multiText = filesSelected
    ? `${selectedFileCount} ${fileText} selected`
    : multiText;
  multiText = (foldersSelected && filesSelected)
    ? `${selectedFileCount} ${fileText} and ${selectedFolderCount} ${folderText} selected`
    : multiText;

  return multiText;
}


class FileBrowserToolbar extends PureComponent {
  render() {
    const { props } = this;
    const {
      downloadSelectedFiles,
      togglePopup,
      deleteSelectedFiles,
      isLocked,
      downloadList,
      downloadDisabled,
      section,
      selectedCount,
      selectedFolderCount,
      selectedFileCount,
      popupVisible,
    } = props;

    // declare css here
    const popupCSS = classNames({
      FileBrowser__popup: true,
      hidden: !popupVisible,
      Tooltip__message: true,
    });

    const multiCountText = getCountText(selectedFolderCount, selectedFileCount);

    return (
      <div className="FileBrowser__toolbar flex align-items--center justify--space-between">
        <div className="FileBrowser__toolbar-text">
          {multiCountText}
        </div>
        <div>
          { ((section === 'data') && downloadList.length > 0)
            && (
              <button
                className="Btn align-self--end Btn__download-white Btn--background-left Btn--action Btn--padding-left"
                type="button"
                disabled={downloadDisabled}
                onClick={() => downloadSelectedFiles(downloadList)}
              >
                Download
              </button>
            )
          }
          <button
            type="button"
            className="Btn align-self--end Btn__delete-white Btn--background-left Btn--action Btn--padding-left"
            onClick={() => togglePopup(true)}
          >
            Delete
          </button>

          <div className={popupCSS}>
            <div className="Tooltip__pointer" />
            <p>Are you sure?</p>
            <div className="flex justify--space-around">
              <button
                className="File__btn--round File__btn--cancel File__btn--delete"
                onClick={() => { togglePopup(false); }}
                type="button"
              />
              <button
                className="File__btn--round File__btn--add File__btn--delete-files"
                onClick={() => { deleteSelectedFiles(); }}
                type="button"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default FileBrowserToolbar;
