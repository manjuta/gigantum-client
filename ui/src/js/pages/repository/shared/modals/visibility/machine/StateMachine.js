// @flow
import { Machine } from 'xstate';
// container states
import {
  CONTENT,
  PUBLISHING,
  ERROR,
  COMPLETE,
} from './MachineConstants';

const stateMachine = Machine({
  initial: CONTENT,
  states: {
    [CONTENT]: {
      meta: { message: 'Checking for Docker' },
      on: {
        CONTENT,
        ERROR,
        PUBLISHING,
      },
    },
    [PUBLISHING]: {
      meta: { message: 'Click to Start', additionalInfo: '' },
      on: {
        ERROR,
        COMPLETE,
      },
    },
    [ERROR]: {
      on: {},
    },
    [COMPLETE]: {
      on: {},
    },
  },
});

export default stateMachine;
