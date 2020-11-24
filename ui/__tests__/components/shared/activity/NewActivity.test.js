
// components
import NewActivity from 'Pages/repository/shared/activity/utils/NewActivity';

describe('NewActivity', () => {
  it('Returns a promise', () => {
    const promise = NewActivity.getNewActivity('uitest', 'ui-test-project');

    promise.then((e) => { expect(e).toBeTruthy() });
  });
});
