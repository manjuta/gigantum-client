// @flow
// vendor
import React, { Component } from 'react';
import { WithContext as ReactTags } from 'react-tag-input';
// mutations
import CreateUserNoteMutation from 'Mutations/activity/CreateUserNoteMutation';
import { setErrorMessage } from 'JS/redux/actions/footer';
// assets
import './UserNote.scss';
// componetns
import MarkdownEditor from './editor/MarkdownEditor';


type Props = {
  datasetId: string,
  labbookId: string,
  name: string,
  owner: string,
  sectionType: string,
  toggleUserNote: Function,
}

class UserNote extends Component<Props> {
  state = {
    addNoteDisabled: true,
    tags: [],
    unsubmittedTag: '',
    userSummaryText: '',
  };

  /**
    @param {}
    calls CreateUserNoteMutation adds note to activity feed
  */
  _addNote = () => {
    const { state } = this;
    const self = this;
    const tags = state.tags.map(tag => (tag.text));
    const {
      name,
      owner,
      sectionType,
      labbookId,
      datasetId,
      toggleUserNote,
    } = this.props;
    const {
      markdown,
      unsubmittedTag,
      userSummaryText,
    } = this.state;

    if (unsubmittedTag.length) {
      this._handleAddition({
        id: unsubmittedTag,
        text: unsubmittedTag,
      });
    }


    this.setState({
      addNoteDisabled: true,
      unsubmittedTag: '',
    });

    CreateUserNoteMutation(
      sectionType,
      name,
      userSummaryText,
      markdown,
      owner,
      [],
      tags,
      labbookId || datasetId,
      (response, error) => {
        toggleUserNote(false);
        self.setState({
          tags: [],
          userSummaryText: '',
          addNoteDisabled: false,
        });
        if (error) {
          setErrorMessage(owner, name, 'Unable to unlink dataset', error);
        }
      },
    );
  }

  /**
    @param {number} index
    removes tag from list
  */
   _handleDelete = (index) => {
     const { tags } = this.state;

     tags.splice(index, 1);

     this.setState({ tags });
   }

   /**
     @param {String} tag
     add tag to list
   */
   _handleAddition = (tag) => {
     const { tags } = this.state;
     tags.push(tag);
     this.setState({ tags, unsubmittedTag: '' });
   }

   /**
     @param {String} tag
     @param {Number} curPos
     @param {Number} newPos
     drags tag to new position.
   */
   _handleDrag = (tag, currPos, newPos) => {
     const { tags } = this.state;

     // mutate array
     tags.splice(currPos, 1);
     tags.splice(newPos, 0, tag);

     // re-render
     this.setState({ tags });
   }


   /**
     @param {String} unsubmittedTag
     sets unsubmittedTag to state
   */
   _updateUnsubmittedTag = (unsubmittedTag) => {
     this.setState({ unsubmittedTag });
   }

   /**
     @param {Object} event
     calls updates state for summary text
     and enables addNote button if > 0
   */
   _setUserSummaryText = (evt) => {
     const summaryText = evt.target.value;
     this.setState({
       userSummaryText: summaryText,
       addNoteDisabled: (summaryText.length === 0),
     });
   }

   /**
    * Method updates markdown in state
     @param {Object} event
   */
   _updateMarkdownText = (value) => {
     if (value) {
       this.setState({ markdown: value });
     }
   }

   render() {
     const { toggleUserNote } = this.props;
     const {
       addNoteDisabled,
       markdown,
       tags,
     } = this.state;

     return (
       <div className="UserNote flex flex--column">

         <div
           role="presentation"
           className="UserNote__close close"
           onClick={() => toggleUserNote(false)}
         />

         <input
           type="text"
           placeholder="Add a summary title"
           onKeyUp={evt => this._setUserSummaryText(evt)}
           className="UserNote__title"
         />
         <div className="UserNote__summary">
           <MarkdownEditor
             {...this.props}
             markdown={markdown}
             updateMarkdownText={this._updateMarkdownText}
           />
         </div>

         <ReactTags
           id="TagsInput"
           tags={tags}
           handleInputChange={this._updateUnsubmittedTag}
           handleDelete={(index) => { this._handleDelete(index); }}
           handleAddition={(tag) => { this._handleAddition(tag); }}
           handleDrag={(tag, currPos, newPos) => { this._handleDrag(tag, currPos, newPos); }}
         />
         <div className="BtnContainer">
           <button
             type="submit"
             className="Btn Btn--flat"
             onClick={() => toggleUserNote(false)}
           >
             Cancel
           </button>
           <button
             type="submit"
             className="Btn Btn--last"
             disabled={addNoteDisabled}
             onClick={() => { this._addNote(); }}
           >
             Add Note
           </button>
         </div>
       </div>
     );
   }
}

export default UserNote;
