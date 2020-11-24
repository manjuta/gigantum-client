// @flow
// vendor
import React, { Component } from 'react';
import queryString from 'querystring';
import classNames from 'classnames';
import { connect } from 'react-redux';
// components
import CreateModal from 'Pages/repository/shared/modals/create/CreateModal';
import Loader from 'Components/loader/Loader';
import LocalLabbooksContainer, { LocalLabbooks } from 'Pages/dashboard/labbooks/localLabbooks/LocalLabbooks';
import RemoteLabbooks from 'Pages/dashboard/labbooks/remoteLabbooks/RemoteLabbooks';
import LoginPrompt from 'Pages/repository/shared/modals/LoginPrompt';
import Tooltip from 'Components/tooltip/Tooltip';
import FilterByDropdown from 'Pages/dashboard/shared/filters/FilterByDropdown';
import SortByDropdown from 'Pages/dashboard/shared/filters/SortByDropdown';
// utils
import Validation from 'JS/utils/Validation';
// queries
import UserIdentity from 'JS/Auth/UserIdentity';
// context
import ServerContext from 'Pages/ServerContext';
// store
import { setErrorMessage } from 'JS/redux/actions/footer';
import { setFilterText } from 'JS/redux/actions/labbookListing/labbookListing';
// assets
import './Labbooks.scss';

type Props = {
  diskLow: boolean,
  filterText: string,
  history: {
    location: {
      hash: string,
      pathname: string,
      search: string,
    },
    replace: Function,
  },
  labbookList: Array<Object>,
  loading: boolean,
  orderBy: string,
  refetchSort: Function,
  section: string,
  serverName: string,
  sort: boolean,
  sortBy: string,
}

class Labbooks extends Component<Props> {
  constructor(props) {
    super(props);

    const {
      filter,
      orderBy,
      sort,
    } = queryString.parse(props.history.location.hash.slice(1));
    let { section } = props;
    if ((section !== 'cloud') && (section !== 'local')) {
      section = 'local';
    }

    this.state = {
      labbookModalVisible: false,
      newLabbookName: '',
      renameError: '',
      showNamingError: false,
      filter: filter || 'all',
      sortMenuOpen: false,
      refetchLoading: false,
      selectedSection: section,
      showLoginPrompt: false,
      orderBy: orderBy || props.orderBy,
      sort: sort || props.sort,
      filterMenuOpen: false,
    };
  }

  /**
    * @param {}
    * fires when a componet mounts
    * adds a scoll listener to trigger pagination
  */
  componentDidMount() {
    const { props } = this;
    document.title = 'Gigantum';

    window.addEventListener('scroll', this._captureScroll);
    window.addEventListener('click', this._hideSearchClear);
    window.addEventListener('click', this._closeSortMenu);
    window.addEventListener('click', this._closeFilterMenu);

    if ((props.labbookList === null) && !props.loading) {
      UserIdentity.getUserIdentity().then((response) => {
        if (response.data && response.data.userIdentity.isSessionValid) {
          setErrorMessage(null, null, 'Failed to fetch Projects.', [{ message: 'There was an error while fetching Projects. This likely means you have a corrupted Project directory.' }]);
          return;
        }
        this.setState({ showLoginPrompt: true });
      });
    }
  }

  /**
    * @param {}
    * fires when component unmounts
    * removes added event listeners
  */
  componentWillUnmount() {
    window.removeEventListener('click', this._closeSortMenu);
    window.removeEventListener('click', this._closeFilterMenu);
    window.removeEventListener('scroll', this._captureScroll);
    window.removeEventListener('click', this._hideSearchClear);
  }

  static getDerivedStateFromProps(props, state) {
    const { history, section } = props;

    if ((section !== 'cloud') && (section !== 'local')) {
      history.replace('/projects/local');
    }

    return {
      ...state,
      selectedSection: section,
    };
  }

  /**
    * @param {}
    * fires when user identity returns invalid session
    * prompts user to revalidate their session
  */
  _closeLoginPromptModal = () => {
    this.setState({
      showLoginPrompt: false,
    });
  }

  /**
    * @param {event} evt
    * fires when sort menu is open and the user clicks elsewhere
    * hides the sort menu dropdown from the view
  */
  _closeSortMenu = (evt) => {
    const { sortMenuOpen } = this.state;
    const isSortMenu = evt && evt.target
      && evt.target.className
      && (evt.target.className.indexOf('Dropdown__sort-selector') > -1);

    if (!isSortMenu && sortMenuOpen) {
      this.setState({ sortMenuOpen: false });
    }
  }

  /**
    * @param {event} evt
    * fires when filter menu is open and the user clicks elsewhere
    * hides the filter menu dropdown from the view
  */
  _closeFilterMenu = (evt) => {
    const { filterMenuOpen } = this.state;
    const isFilterMenu = evt.target.className.indexOf('Dropdown__filter-selector') > -1;

    if (!isFilterMenu && filterMenuOpen) {
      this.setState({ filterMenuOpen: false });
    }
  }

  /**
    * @param {}
    * fires on window clock
    * hides search cancel button when clicked off
  */
  _hideSearchClear = (evt) => {
    const { showSearchCancel } = this.state;
    if (
      showSearchCancel
      && (evt.target.className !== 'Labbooks__search-cancel')
      && (evt.target.className !== 'Labbooks__search no--margin')
    ) {
      this.setState({ showSearchCancel: false });
    }
  }

  /**
    *  @param {string} name - inputs a labbook name
    *  routes to that labbook
  */
  _goToLabbook = (name, owner) => {
    this.setState({ name, owner });
  }

  /**
    *  @param {} -
    *  closes labbook modal and resets state to initial state
  */
  _closeLabbook = () => {
    this.setState({
      labbookModalVisible: false,
      showNamingError: false,
    });
  }

  /**
    *  @param {event} evt
    *  sets new labbook title to state
  */
  _setLabbookTitle = (evt) => {
    const isValid = Validation.labbookName(evt.target.value);
    if (isValid) {
      this.setState({
        showNamingError: false,
      });
    } else {
      this.setState({ showNamingError: true });
    }
  }

  /**
   * @param {string} filter
   sets state updates filter
  */
  _setFilter = (filter) => {
    this.setState({ filterMenuOpen: false, filter });
    this._changeSearchParam({ filter });
  }

  /**
   sets state for filter menu
  */
  _toggleFilterMenu = () => {
    this.setState(state => ({ filterMenuOpen: !state.filterMenuOpen }));
  }

  /**
   sets state for sort menu
  */
  _toggleSortMenu = () => {
    this.setState(state => ({ sortMenuOpen: !state.sortMenuOpen }));
  }

  /**
   * @param {string} section
   replaces history and checks session
  */
  _setSection = (section) => {
    const { history } = this.props;
    if (section === 'cloud') {
      this._viewRemote();
    } else {
      history.replace(`../projects/${section}${history.location.search}`);
    }
  }

  /**
   * @param {object} labbook
   * returns true if labbook's name or description exists in filtervalue, else returns false
  */
  _filterSearch = (labbook) => {
    const { filterText } = this.props;
    const hasNoFileText = (filterText === '');
    const nameMatches = labbook.node
      && labbook.node.name
      && (labbook.node.name.toLowerCase().indexOf(filterText.toLowerCase()) > -1);
    const descriptionMatches = labbook.node
      && labbook.node.description
      && (labbook.node.description.toLowerCase().indexOf(filterText.toLowerCase()) > -1);

    if (hasNoFileText
      || nameMatches
      || descriptionMatches) {
      return true;
    }
    return false;
  }

  /**
   * @param {array, string} localLabbooks.edges,filter
   * @return {array} filteredLabbooks
  */
  _filterLabbooks = (labbooks, filter) => {
    const username = localStorage.getItem('username');
    const self = this;
    let filteredLabbooks = [];


    if (filter === 'owner') {
      filteredLabbooks = labbooks.filter(
        labbook => ((labbook.node.owner === username)
        && self._filterSearch(labbook)),
      );
    } else if (filter === 'others') {
      filteredLabbooks = labbooks.filter(
        labbook => (labbook.node.owner !== username
          && self._filterSearch(labbook)),
      );
    } else {
      filteredLabbooks = labbooks.filter(labbook => self._filterSearch(labbook));
    }

    return filteredLabbooks;
  }

  /**
    * @param {}
    * fires when handleSortFilter triggers refetch
    * references child components and triggers their refetch functions
  */
  _showModal = () => {
    // TODO remove refs this is deprecated
    this.createModal._showModal();
  }

  /**
    *  @param {string} selected
    * fires when setSortFilter validates user can sort
    * triggers a refetch with new sort parameters
  */
  _handleSortFilter = (orderBy, sort) => {
    const { refetchSort } = this.props;
    this.setState({ sortMenuOpen: false, orderBy, sort });
    this._changeSearchParam({ orderBy, sort });
    refetchSort(orderBy, sort);
  }

  /**
    *  @param {string, boolean} orderBy sort
    * fires when user selects a sort option
    * checks session and selectedSection state before handing off to handleSortFilter
  */
  _setSortFilter = (orderBy, sort) => {
    const {
      selectedSection,
      showLoginPrompt,
    } = this.state;

    if (selectedSection === 'remoteLabbooks') {
      UserIdentity.getUserIdentity().then((response) => {
        if (navigator.onLine) {
          if (response.data) {
            if (response.data.userIdentity.isSessionValid) {
              this._handleSortFilter(orderBy, sort);
            } else {
              this.setState({ showLoginPrompt: true });
            }
          }
        } else if (!showLoginPrompt) {
          this.setState({ showLoginPrompt: true });
        }
      });
    } else {
      this._handleSortFilter(orderBy, sort);
    }
  }

  /**
    * @param {}
    * fires when user selects remote labbook view
    * checks user auth before changing selectedSection state
  */
  _viewRemote = () => {
    const { history } = this.props;
    const { showLoginPrompt } = this.state;

    UserIdentity.getUserIdentity().then((response) => {
      if (navigator.onLine) {
        if (response.data && response.data.userIdentity.isSessionValid) {
          history.replace(`../projects/cloud${history.location.search}`);
          this.setState({ selectedSection: 'cloud' });
        } else {
          this.setState({ showLoginPrompt: true });
        }
      } else if (!showLoginPrompt) {
        this.setState({ showLoginPrompt: true });
      }
    });
  }

  /**
  *  @param {evt}
  *  sets the filterValue in state
  */
  _setFilterValue = (evt) => {
    setFilterText(evt.target.value);
    // TODO remove refs
    if (this.labbookSearch.value !== evt.target.value) {
      this.labbookSearch.value = evt.target.value;
    }
  }

  /**
    *  @param {object} newValues
    *  changes the query params to new sort and filter values
  */
  _changeSearchParam = (newValues) => {
    const { history } = this.props;
    const searchObj = Object.assign(
      {},
      queryString.parse(history.location.hash.slice(1)),
      newValues,
    );
    const urlParameters = queryString.stringify(searchObj);

    history.replace(`..${history.location.pathname}#${urlParameters}`);
  }

  /**
    *  @param {} -
    *  forces state update ad sets to local view
  */
  _forceLocalView = () => {
    this.setState({
      selectedSection: 'local',
      showLoginPrompt: true,
    });
  }

  static contextType = ServerContext;

  render() {
    const {
      diskLow,
      filterText,
      labbookList,
      loading,
      serverName,
    } = this.props;
    const {
      filter,
      filterMenuOpen,
      selectedSection,
      showLoginPrompt,
    } = this.state;
    const { currentServer } = this.context;
    const currentServerName = currentServer && currentServer.name ? currentServer.name : 'gigantum'
    // declare css
    const labbooksCSS = classNames({
      Labbooks: true,
      'Labbooks--disk-low': diskLow,
    });

    if ((labbookList !== null) || loading) {
      const localNavItemCSS = classNames({
        Tab: true,
        'Tab--local': true,
        'Tab--selected': selectedSection === 'local',
      });
      const cloudNavItemCSS = classNames({
        Tab: true,
        'Tab--cloud': true,
        'Tab--selected': selectedSection === 'cloud',
      });

      return (

        <div className={labbooksCSS}>

          <CreateModal
            {...this.props}
            ref={(modal) => { this.createModal = modal; }}
            handler={this.handler}
          />

          <div className="Labbooks__panel-bar">
            <h6 className="Labbooks__username">{localStorage.getItem('username')}</h6>
            <h1>Projects</h1>

          </div>
          <div className="Labbooks__menu  mui-container flex-0-0-auto">
            <ul className="Tabs">
              <li className={localNavItemCSS}>
                <button
                  className="Btn--noStyle"
                  type="button"
                  onClick={() => this._setSection('local')}
                >
                  Local
                </button>
              </li>
              <li className={cloudNavItemCSS}>
                <button
                  className="Btn--noStyle"
                  type="button"
                  onClick={() => this._setSection('cloud')}
                >
                  {currentServerName}
                </button>
              </li>

              <Tooltip section="cloudLocal" />
            </ul>

          </div>
          <div className="Labbooks__subheader grid">
            <div className="Labbooks__search-container column-2-span-6 padding--0">
              <div className="Input Input--clear">
                { (filterText.length !== 0)
                    && (
                      <button
                        type="button"
                        className="Btn Btn--flat"
                        onClick={() => this._setFilterValue({ target: { value: '' } })}
                      >
                        Clear
                      </button>
                    )
                  }
                <input
                  type="text"
                  ref={(modal) => { this.labbookSearch = modal; }}
                  className="margin--0"
                  placeholder="Filter Projects by name or description"
                  defaultValue={filterText}
                  onKeyUp={evt => this._setFilterValue(evt)}
                  onFocus={() => this.setState({ showSearchCancel: true })}
                />
              </div>
            </div>

            <FilterByDropdown
              {...this.state}
              type="Project"
              toggleFilterMenu={() => this.setState({ filterMenuOpen: !filterMenuOpen })}
              setFilter={this._setFilter}
            />
            <SortByDropdown
              {...this.state}
              toggleSortMenu={this._toggleSortMenu}
              setSortFilter={this._setSortFilter}
            />

          </div>
          { (!loading) && (selectedSection === 'local')
            && (
              <LocalLabbooksContainer
                {...this.props}
                labbookListId={labbookList.id}
                localLabbooks={labbookList.labbookList}
                showModal={this._showModal}
                goToLabbook={this._goToLabbook}
                filterLabbooks={this._filterLabbooks}
                filterState={filter}
                setFilterValue={this._setFilterValue}
                changeRefetchState={bool => this.setState({ refetchLoading: bool })}
              />
            )
          }
          { (!loading) && (selectedSection === 'cloud')
            && (
              <RemoteLabbooks
                {...this.props}
                labbookListId={labbookList.labbookList.id}
                remoteLabbooks={labbookList.labbookList}
                showModal={this._showModal}
                goToLabbook={this._goToLabbook}
                filterLabbooks={this._filterLabbooks}
                filterState={filter}
                setFilterValue={this._setFilterValue}
                forceLocalView={() => { this._forceLocalView(); }}
                changeRefetchState={bool => this.setState({ refetchLoading: bool })}
              />
            )
          }
          { loading
            && (
              <LocalLabbooks
                {...this.props}
                loading
                showModal={this._showModal}
              />
            )
          }

          <LoginPrompt
            closeModal={this._closeLoginPromptModal}
            showLoginPrompt={showLoginPrompt}
          />

        </div>
      );
    }
    if ((labbookList === null) && !loading) {
      return (
        <div className="Labbooks__fetch-error">
          There was an error attempting to fetch Projects.
          <br />
          Try restarting Gigantum and refresh the page.
          <br />
          If the problem persists
          <a
            target="_blank"
            href="https://spectrum.chat/gigantum"
            rel="noopener noreferrer"
          >
            request assistance here.
          </a>
        </div>
      );
    }

    return (<Loader />);
  }
}

const mapStateToProps = state => ({
  filterText: state.labbookListing.filterText,
});

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(Labbooks);
