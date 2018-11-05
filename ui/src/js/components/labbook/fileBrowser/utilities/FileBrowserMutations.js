// mutations
import DeleteLabbookFilesMutation from 'Mutations/fileBrowser/DeleteLabbookFilesMutation';
import MakeLabbookDirectoryMutation from 'Mutations/fileBrowser/MakeLabbookDirectoryMutation';
import MoveLabbookFileMutation from 'Mutations/fileBrowser/MoveLabbookFileMutation';
import AddFavoriteMutation from 'Mutations/fileBrowser/AddFavoriteMutation';
import RemoveFavoriteMutation from 'Mutations/fileBrowser/RemoveFavoriteMutation';
import CompleteBatchUploadTransactionMutation from 'Mutations/fileBrowser/CompleteBatchUploadTransactionMutation';
// store
import store from 'JS/redux/store';
import { setErrorMessage } from 'JS/redux/reducers/footer';

class FileBrowserMutations {
   /**
    * @param {props = {owner, labbookName, section, connection, favoriteConnection, parentId}}
    * pass above props to state
    */
   constructor(props) {
    this.state = props;
   }

   /**
   *  @param {object, function}
   *  creates a dirctory using MakeLabbookDirectoryMutation
   */
   makeLabbookDirectory(data, callback) {
     const {
       key,
     } = data;

     const {
       connection,
       owner,
       labbookName,
       parentId,
       section,
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

         callback(response, error);
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
        newKey,
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
        newKey,
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
      key,
      edge,
    } = data;

    const {
      connection,
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
      key,
      '',
      false,
      edge,
      section,
      (response, error) => {
        if (error) {
          console.error(error);
          setErrorMessage(`ERROR: could not add favorite ${key}`, error);
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
        key,
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

    RemoveFavoriteMutation(
      favoriteConnection,
      parentId,
      owner,
      labbookName,
      section,
      key,
      edgeId,
      edge,
      favorites,
      (response, error) => {
        if (error) {
          console.error(error);
          setErrorMessage(`ERROR: could not remove favorite ${key}`, error);
        } else {
          let tempKey = key;
          if (tempKey[0] === '/') {
            tempKey = tempKey.slice(1);
          }

          callback(tempKey);
        }
      },
    );
  }

  /**
  *  @param {object, function}
  *  remove file or folder from directory
  */
  deleteLabbookFiles(data, callback) {
    const {
          filePaths,
          edges,
        } = data;
    const {
        connection,
        owner,
        labbookName,
        parentId,
        section,
      } = this.state;

    DeleteLabbookFilesMutation(
      connection,
      owner,
      labbookName,
      parentId,
      filePaths,
      section,
      edges,
      (response, error) => {
        if (error) {
          console.error(error);
          let keys = filePaths.join(' ');
          setErrorMessage(`ERROR: could not delete folders ${keys}`, error);
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
