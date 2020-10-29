// @flow
import { Machine } from 'xstate';
// container states
import {
  LOADING,
  LOGGED_IN,
  LOGGED_OUT,
  ERROR,
  BACK,
} from './AuthMachineConstants';

const stateMachine = Machine({
  initial: LOADING,
  states: {
    [LOADING]: {
      meta: { message: '' },
      on: {
        LOGGED_IN,
        ERROR,
        LOGGED_OUT,
      },
    },
    [LOGGED_IN]: {
      meta: { message: '' },
      on: {
        ERROR,
      },
    },
    [LOGGED_OUT]: {
      meta: { message: '' },
      on: {
        ERROR,
      },
    },
    [ERROR]: {
      meta: { message: '' },
      on: {
        [BACK]: LOGGED_OUT,
      },
    },
  },
});

export default stateMachine;
