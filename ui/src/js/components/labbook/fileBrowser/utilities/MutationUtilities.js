// mutations
import DeleteLabbookFileMutation from 'Mutations/fileBrowser/DeleteLabbookFileMutation';
import MakeLabbookDirectoryMutation from 'Mutations/fileBrowser/MakeLabbookDirectoryMutation';
import MoveLabbookFileMutation from 'Mutations/fileBrowser/MoveLabbookFileMutation';
import AddFavoriteMutation from 'Mutations/fileBrowser/AddFavoriteMutation';
import RemoveFavoriteMutation from 'Mutations/fileBrowser/RemoveFavoriteMutation';
import CompleteBatchUploadTransactionMutation from 'Mutations/fileBrowser/CompleteBatchUploadTransactionMutation';
// store
import store from 'JS/redux/store';

class FileBrowserMutations {
   /**
    * @param {props = {owner, labbookName, section, connection, favoriteConnection, parentId}}
    * pass above props to state
    */
   constructor(props) {
    this.state = {
      ...props,
    };
   }

   /**
   *  @param {object, function}
   *  creates a dirctory using MakeLabbookDirectoryMutation
   */
   makeLabbookDirectory(data, callback) {
     const {
       key,
       section,
     } = data;

     const {
       connection,
       owner,
       labbookName,
       parentId,
     } = this.state;

     MakeLabbookDirectoryMutation(
       connection,
       owner,
       labbookName,
       parentId,
       key,
       section,
       (response, error) => {
         if (error) {
           console.error(error);
           setErrorMessage(`ERROR: could not create ${key}`, error);
         }
       },
     );
   }
   /**
   *  @param {object, function}
   *  moves file from old folder to a new folder
   */
   moveLabbookFile(data, callback) {
      const {
        edge,
        newKeyComputed,
      } = data;

      const {
        connection,
        owner,
        labbookName,
        section,
        parentId,
      } = this.state;

      const { key } = edge.node;

      MoveLabbookFileMutation(
        connection,
        owner,
        labbookName,
        parentId,
        edge,
        key,
        newKeyComputed,
        section,
        (response, error) => {
          callback(response, error);
        },
      );
  }
  /**
  *  @param {object, function}
  *  add file favorite to appear in favorite section
  */
  addFavorite(data, callback) {
    const {
      connection,
      newKey,
      edge,
    } = data;

    const {
      favoriteConnection,
      owner,
      labbookName,
      section,
      parentId,
    } = this.state;

    AddFavoriteMutation(
      favoriteConnection,
      connection,
      parentId,
      owner,
      labbookName,
      newKey,
      '',
      false,
      edge,
      section,
      (response, error) => {
        if (error) {
          console.error(error);
          setErrorMessage(`ERROR: could not add favorite ${newKey}`, error);
        }
      },
    );
  }

  /**
  *  @param {object, function}
  *  remove file from favorite section
  */
  removeFavorite(data, callback) {
    const {
        oldKey,
        edge,
        favorites,
      } = data,
      edgeId = edge.node.id;

   const {
        favoriteConnection,
        owner,
        labbookName,
        section,
        parentId,
      } = this.state;

    let { newKey } = data;

    RemoveFavoriteMutation(
      favoriteConnection,
      parentId,
      owner,
      labbookName,
      section,
      oldKey,
      edgeId,
      edge,
      favorites,
      (response, error) => {
        if (error) {
          console.error(error);
          setErrorMessage(`ERROR: could not remove favorite ${oldKey}`, error);
        } else {
          if (newKey[0] === '/') {
            newKey = newKey.slice(1);
          }

          callback(newKey);
        }
      },
    );
  }

  /**
  *  @param {object, function}
  *  remove file or folder from directory
  */
  deleteLabbookFile(data, callback) {
    const {
        folderKey,
        edge,
        favorites,
      } = data,
      edgeId = edge.node.id;

    const {
        connection,
        owner,
        labbookName,
        section,
      } = this.state;

    DeleteLabbookFileMutation(
      connection,
      owner,
      labbookName,
      parentId,
      edgeId,
      folderKey,
      section,
      edge,
      (response, error) => {
        if (error) {
          console.error(error);
          setErrorMessage(`ERROR: could not delete folder ${folderKey}`, error);
        }
      },
    );
  }
  /**
  *  @param {object, function}
  *  remove file from favorite section
  */
  completeBatchUploadTransaction(data, callback) {
    const {
        connection,
        owner,
        labbookName,
        section,
      } = this.state;
    const { transactionId } = store.getState().fileBrowser;

    CompleteBatchUploadTransactionMutation(
      connection,
      owner,
      labbookName,
      true,
      false,
      transactionId,
      (response, error) => {

      },
    );
  }
}

export default FileBrowserMutations;
